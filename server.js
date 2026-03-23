// server.js — Sabor & Fuego Restaurante · Backend principal
// Stack: Node.js + Express + MongoDB Atlas (Mongoose)
// Plataforma de despliegue: Render.com (gratuito)

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

/* ─── Middleware ─────────────────────────────────────────── */
app.use(cors());             // Permite peticiones desde GitHub Pages
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sirve el frontend estático (carpeta public/)
app.use(express.static(path.join(__dirname, 'public')));

/* ─── Conexión a MongoDB Atlas ───────────────────────────── */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    seedDemoData();          // Inserta datos de ejemplo si la BD está vacía
  })
  .catch(err => {
    console.error('❌ Error MongoDB:', err.message);
    process.exit(1);
  });

/* ─── Rutas API ──────────────────────────────────────────── */
app.use('/api', require('./routes'));

/* ─── Fallback SPA (sirve index.html para rutas no API) ──── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─── Manejo global de errores ───────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

/* ─── Iniciar servidor ───────────────────────────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Sabor & Fuego API corriendo en puerto ${PORT}`));

/* ═══════════════════════════════════════════════════════════
   SEED — datos de demostración (solo si la BD está vacía)
═══════════════════════════════════════════════════════════ */
async function seedDemoData() {
  const { Platillo, Empleado, Ingrediente, Proveedor } = require('./models');

  // Solo siembra si no hay platillos
  const count = await Platillo.countDocuments();
  if (count > 0) return;

  console.log('🌱 Insertando datos de demostración…');

  // Proveedores
  const [provMercado, provBodega] = await Proveedor.insertMany([
    { nombre: 'Mercado de San Juan', telefono: '5512345678' },
    { nombre: 'Bodega Central Abasto', telefono: '5587654321' },
  ]);

  // Ingredientes
  await Ingrediente.insertMany([
    { nombre: 'Chile ancho',       existencia: 20,  minimo: 10, unidad: 'kg',     proveedor_id: provMercado._id },
    { nombre: 'Masa de maíz',      existencia: 50,  minimo: 20, unidad: 'kg',     proveedor_id: provBodega._id  },
    { nombre: 'Epazote',           existencia: 5,   minimo: 8,  unidad: 'manojos', proveedor_id: provMercado._id },
    { nombre: 'Jitomate',          existencia: 30,  minimo: 15, unidad: 'kg',     proveedor_id: provMercado._id },
    { nombre: 'Crema de rancho',   existencia: 0,   minimo: 5,  unidad: 'litros', proveedor_id: provBodega._id  },
    { nombre: 'Chocolate Oaxaca',  existencia: 10,  minimo: 4,  unidad: 'tablillas', proveedor_id: provMercado._id },
  ]);

  // Platillos
  await Platillo.insertMany([
    { nombre: 'Caldo de piedra',       descripcion: 'Caldo ancestral de camarón cocido con piedras volcánicas calientes.',  categoria: 'entrada',   precio: 280, frecuencia: 14 },
    { nombre: 'Mixiote de borrego',     descripcion: 'Borrego marinado en adobo rojo, envuelto en mixiote y cocido a vapor.', categoria: 'principal', precio: 420, frecuencia: 31 },
    { nombre: 'Enchiladas de mole negro', descripcion: 'Tortillas bañadas en mole negro oaxaqueño, pollo deshebrado y queso fresco.', categoria: 'principal', precio: 360, frecuencia: 22 },
    { nombre: 'Tlayuda de chapulines', descripcion: 'Tlayuda crujiente con asiento, tasajo, chapulines y quesillo.',          categoria: 'entrada',   precio: 310, frecuencia: 18 },
    { nombre: 'Chiles en nogada',       descripcion: 'Chile poblano relleno de picadillo, cubierto de nogada y granadas.',    categoria: 'principal', precio: 490, frecuencia: 9  },
    { nombre: 'Buñuelos de viento',     descripcion: 'Buñuelos fritos con miel de piloncillo y anís.',                        categoria: 'postre',    precio: 180, frecuencia: 25 },
    { nombre: 'Agua de Jamaica',        descripcion: 'Agua fresca de flor de jamaica, ligeramente dulce.',                    categoria: 'bebida',    precio:  80, frecuencia: 40 },
  ]);

  // Empleados
  await Empleado.insertMany([
    { nombre: 'Valentina', apellido_paterno: 'Ruiz',    apellido_materno: 'Torres',  puesto: 'Chef ejecutiva', telefono: '5511223344' },
    { nombre: 'Diego',     apellido_paterno: 'Morales', apellido_materno: 'Herrera', puesto: 'Mesero',         telefono: '5544332211' },
    { nombre: 'Sofía',     apellido_paterno: 'Luna',    apellido_materno: 'Pérez',   puesto: 'Hostess',        telefono: '5566778899' },
    { nombre: 'Marco',     apellido_paterno: 'Castro',  apellido_materno: 'Ávila',   puesto: 'Bartender',      telefono: '5599887766' },
  ]);

  console.log('✅ Datos de demostración insertados');
}
