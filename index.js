// models/index.js
// Todos los modelos Mongoose basados en el diagrama ER

const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ─────────────────────────────────────────────────
   EMPLEADO
   PK: numero_empleado (auto por Mongo _id)
───────────────────────────────────────────────── */
const empleadoSchema = new Schema({
  nombre:           { type: String, required: true, trim: true },
  apellido_materno: { type: String, trim: true },
  apellido_paterno: { type: String, trim: true },
  puesto:           { type: String, trim: true },
  telefono:         { type: String, trim: true },
  fecha_ingreso:    { type: Date, default: Date.now },
  fecha_egreso:     { type: Date, default: null },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   MESA
   FK: empleado_id → Empleado
───────────────────────────────────────────────── */
const mesaSchema = new Schema({
  numero_mesa:  { type: Number, required: true, unique: true },
  posicion:     { type: String, trim: true },
  empleado_id:  { type: Schema.Types.ObjectId, ref: 'Empleado' },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   PLATILLO
───────────────────────────────────────────────── */
const platilloSchema = new Schema({
  nombre:      { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  categoria:   {
    type: String,
    enum: ['entrada', 'principal', 'postre', 'bebida', 'otro'],
    default: 'principal',
  },
  frecuencia:  { type: Number, default: 0 },
  precio:      { type: Number, required: true, min: 0 },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   ORDEN
   FK: empleado_id → Empleado
   Relación N:M con Platillo vía subdocumento
───────────────────────────────────────────────── */
const ordenSchema = new Schema({
  fecha:         { type: Date, default: Date.now },
  estado:        { type: Boolean, default: true },   // true = activa, false = cerrada
  cuenta_total:  { type: Number, default: 0 },
  mesa_numero:   { type: Number },
  empleado_id:   { type: Schema.Types.ObjectId, ref: 'Empleado' },
  // Orden_Platillo — la relación contiene los platillos con cantidad
  platillos: [{
    platillo_id: { type: Schema.Types.ObjectId, ref: 'Platillo' },
    cantidad:    { type: Number, default: 1 },
    precio_unit: { type: Number },
  }],
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   PRESUPUESTO
   PK compuesta: monto + fecha (ambos requeridos)
───────────────────────────────────────────────── */
const presupuestoSchema = new Schema({
  monto: { type: Number, required: true },
  fecha: { type: Date,   required: true, default: Date.now },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   INGRESO
   FK: orden_id → Orden
   Relación: aumenta Presupuesto
───────────────────────────────────────────────── */
const ingresoSchema = new Schema({
  fuente:   { type: String, trim: true },
  monto:    { type: Number, required: true, min: 0 },
  fecha:    { type: Date, default: Date.now },
  orden_id: { type: Schema.Types.ObjectId, ref: 'Orden' },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   PROVEEDOR
───────────────────────────────────────────────── */
const proveedorSchema = new Schema({
  nombre:   { type: String, required: true, trim: true },
  telefono: { type: String, trim: true },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   INGREDIENTE (Inventario)
   FK implícita con Proveedor vía "vende (Inventario)"
   FK: proveedor_id → Proveedor
───────────────────────────────────────────────── */
const ingredienteSchema = new Schema({
  nombre:       { type: String, required: true, trim: true },
  existencia:   { type: Number, required: true, default: 0, min: 0 },
  minimo:       { type: Number, default: 0, min: 0 },
  unidad:       { type: String, required: true, trim: true },
  proveedor_id: { type: Schema.Types.ObjectId, ref: 'Proveedor' },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   EGRESO
   FK: proveedor_id → Proveedor
   Relación: disminuye Presupuesto
───────────────────────────────────────────────── */
const egresoSchema = new Schema({
  monto:        { type: Number, required: true, min: 0 },
  fecha:        { type: Date, default: Date.now },
  proveedor_id: { type: Schema.Types.ObjectId, ref: 'Proveedor' },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   EXPORTAR TODOS LOS MODELOS
───────────────────────────────────────────────── */
module.exports = {
  Empleado:    mongoose.model('Empleado',    empleadoSchema),
  Mesa:        mongoose.model('Mesa',        mesaSchema),
  Platillo:    mongoose.model('Platillo',    platilloSchema),
  Orden:       mongoose.model('Orden',       ordenSchema),
  Presupuesto: mongoose.model('Presupuesto', presupuestoSchema),
  Ingreso:     mongoose.model('Ingreso',     ingresoSchema),
  Proveedor:   mongoose.model('Proveedor',   proveedorSchema),
  Ingrediente: mongoose.model('Ingrediente', ingredienteSchema),
  Egreso:      mongoose.model('Egreso',      egresoSchema),
};
