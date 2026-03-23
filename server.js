// server.js — TaskDB Backend
// Node.js + Express + MongoDB Atlas (Mongoose)
// Desplegable en Render.com de forma gratuita

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());                  // Permite peticiones desde GitHub Pages
app.use(express.json());          // Parsea body JSON

// ─── Conexión a MongoDB Atlas ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch(err => {
    console.error('❌ Error al conectar MongoDB:', err.message);
    process.exit(1);
  });

// ─── Modelo de Tarea ───────────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  done:     { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true }); // agrega createdAt y updatedAt automáticamente

const Task = mongoose.model('Task', taskSchema);

// ─── Rutas ─────────────────────────────────────────────────────────────────────

// GET /api/tasks  → todas las tareas (más recientes primero)
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks  → crear nueva tarea
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'El título es obligatorio' });

    const task = await Task.create({ title, priority });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id  → actualizar (marcar done, cambiar prioridad)
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id  → eliminar tarea
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ ok: true, deleted: task.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /  → health check (Render lo usa para detectar si el servicio vive)
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'TaskDB API', version: '1.0.0' });
});

// ─── Servidor ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
