// routes/index.js
// Rutas REST para todas las entidades del restaurante

const router = require('express').Router();
const {
  Empleado, Mesa, Platillo, Orden,
  Presupuesto, Ingreso, Proveedor, Ingrediente, Egreso,
} = require('../models');

/* ════════════════════════════════════════════════
   PLATILLOS — CRUD completo
════════════════════════════════════════════════ */
router.get('/platillos', async (req, res) => {
  const platillos = await Platillo.find().sort({ categoria: 1, nombre: 1 });
  res.json(platillos);
});

router.post('/platillos', async (req, res) => {
  const { nombre, descripcion, categoria, frecuencia, precio } = req.body;
  if (!nombre || precio == null) return res.status(400).json({ error: 'nombre y precio requeridos' });
  const p = await Platillo.create({ nombre, descripcion, categoria, frecuencia, precio });
  res.status(201).json(p);
});

router.patch('/platillos/:id', async (req, res) => {
  const p = await Platillo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!p) return res.status(404).json({ error: 'Platillo no encontrado' });
  res.json(p);
});

router.delete('/platillos/:id', async (req, res) => {
  await Platillo.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ════════════════════════════════════════════════
   EMPLEADOS — CRUD completo
════════════════════════════════════════════════ */
router.get('/empleados', async (req, res) => {
  const empleados = await Empleado.find({ fecha_egreso: null }).sort({ nombre: 1 });
  res.json(empleados);
});

router.post('/empleados', async (req, res) => {
  const { nombre, apellido_materno, apellido_paterno, puesto, telefono } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre requerido' });
  const e = await Empleado.create({ nombre, apellido_materno, apellido_paterno, puesto, telefono });
  res.status(201).json(e);
});

router.patch('/empleados/:id', async (req, res) => {
  const e = await Empleado.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!e) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.json(e);
});

// Dar de baja (egreso) en lugar de eliminar físicamente
router.delete('/empleados/:id', async (req, res) => {
  await Empleado.findByIdAndUpdate(req.params.id, { fecha_egreso: new Date() });
  res.json({ ok: true });
});

/* ════════════════════════════════════════════════
   MESAS — CRUD completo
════════════════════════════════════════════════ */
router.get('/mesas', async (req, res) => {
  const mesas = await Mesa.find().populate('empleado_id', 'nombre puesto').sort({ numero_mesa: 1 });
  res.json(mesas);
});

router.post('/mesas', async (req, res) => {
  const { numero_mesa, posicion, empleado_id } = req.body;
  if (!numero_mesa) return res.status(400).json({ error: 'numero_mesa requerido' });
  const m = await Mesa.create({ numero_mesa, posicion, empleado_id });
  res.status(201).json(m);
});

router.patch('/mesas/:id', async (req, res) => {
  const m = await Mesa.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!m) return res.status(404).json({ error: 'Mesa no encontrada' });
  res.json(m);
});

/* ════════════════════════════════════════════════
   ÓRDENES — CRUD + lógica de negocio
════════════════════════════════════════════════ */
router.get('/ordenes', async (req, res) => {
  const ordenes = await Orden.find()
    .populate('empleado_id', 'nombre')
    .populate('platillos.platillo_id', 'nombre precio')
    .sort({ createdAt: -1 });
  res.json(ordenes);
});

router.post('/ordenes', async (req, res) => {
  const { mesa_numero, empleado_id, platillos: platIds } = req.body;
  if (!platIds?.length) return res.status(400).json({ error: 'Selecciona al menos un platillo' });

  // Obtener precios actuales de los platillos seleccionados
  const platDocs = await Platillo.find({ _id: { $in: platIds } });
  const platillos = platDocs.map(p => ({
    platillo_id: p._id,
    cantidad:    1,
    precio_unit: p.precio,
  }));

  const cuenta_total = platillos.reduce((s, p) => s + p.precio_unit * p.cantidad, 0);

  const orden = await Orden.create({ mesa_numero, empleado_id, platillos, cuenta_total });

  // Actualizar frecuencia de cada platillo
  await Promise.all(platDocs.map(p =>
    Platillo.findByIdAndUpdate(p._id, { $inc: { frecuencia: 1 } })
  ));

  // Registrar ingreso automáticamente
  await Ingreso.create({ fuente: `Orden mesa ${mesa_numero || '—'}`, monto: cuenta_total, orden_id: orden._id });

  res.status(201).json(orden);
});

router.patch('/ordenes/:id', async (req, res) => {
  const o = await Orden.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!o) return res.status(404).json({ error: 'Orden no encontrada' });
  res.json(o);
});

/* ════════════════════════════════════════════════
   INGREDIENTES (Inventario) — CRUD completo
════════════════════════════════════════════════ */
router.get('/ingredientes', async (req, res) => {
  const items = await Ingrediente.find()
    .populate('proveedor_id', 'nombre')
    .sort({ nombre: 1 });
  res.json(items);
});

router.post('/ingredientes', async (req, res) => {
  const { nombre, existencia, minimo, unidad, proveedor_id } = req.body;
  if (!nombre || !unidad) return res.status(400).json({ error: 'nombre y unidad requeridos' });
  const i = await Ingrediente.create({ nombre, existencia, minimo, unidad, proveedor_id });
  res.status(201).json(i);
});

router.patch('/ingredientes/:id', async (req, res) => {
  const i = await Ingrediente.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!i) return res.status(404).json({ error: 'Ingrediente no encontrado' });
  res.json(i);
});

router.delete('/ingredientes/:id', async (req, res) => {
  await Ingrediente.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ════════════════════════════════════════════════
   PROVEEDORES — CRUD completo
════════════════════════════════════════════════ */
router.get('/proveedores', async (req, res) => {
  const proveedores = await Proveedor.find().sort({ nombre: 1 });
  res.json(proveedores);
});

router.post('/proveedores', async (req, res) => {
  const { nombre, telefono } = req.body;
  if (!nombre) return res.status(400).json({ error: 'nombre requerido' });
  const p = await Proveedor.create({ nombre, telefono });
  res.status(201).json(p);
});

router.patch('/proveedores/:id', async (req, res) => {
  const p = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ error: 'Proveedor no encontrado' });
  res.json(p);
});

router.delete('/proveedores/:id', async (req, res) => {
  await Proveedor.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ════════════════════════════════════════════════
   EGRESOS — CRUD + afecta presupuesto
════════════════════════════════════════════════ */
router.get('/egresos', async (req, res) => {
  const egresos = await Egreso.find().populate('proveedor_id', 'nombre').sort({ fecha: -1 });
  res.json(egresos);
});

router.post('/egresos', async (req, res) => {
  const { monto, proveedor_id } = req.body;
  if (!monto) return res.status(400).json({ error: 'monto requerido' });
  const e = await Egreso.create({ monto, proveedor_id });
  res.status(201).json(e);
});

/* ════════════════════════════════════════════════
   INGRESOS — lectura y creación
════════════════════════════════════════════════ */
router.get('/ingresos', async (req, res) => {
  const ingresos = await Ingreso.find().populate('orden_id').sort({ fecha: -1 });
  res.json(ingresos);
});

/* ════════════════════════════════════════════════
   PRESUPUESTO — lectura del estado actual
════════════════════════════════════════════════ */
router.get('/presupuesto', async (req, res) => {
  const [ingresos, egresos] = await Promise.all([
    Ingreso.find(),
    Egreso.find(),
  ]);
  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0);
  const totalEgresos  = egresos.reduce((s, e)  => s + e.monto, 0);
  res.json({
    total_ingresos: totalIngresos,
    total_egresos:  totalEgresos,
    balance:        totalIngresos - totalEgresos,
    fecha:          new Date(),
  });
});

module.exports = router;
