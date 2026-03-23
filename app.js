/* ═══════════════════════════════════════════════════
   SABOR & FUEGO — app.js
   Frontend: consume la API REST del backend en Render
═══════════════════════════════════════════════════ */

// ⚠️ Cambia esta URL por la de tu servicio en Render
const API = 'https://tu-restaurante.onrender.com/api';

// Emojis por categoría de platillo
const CAT_EMOJI = {
  entrada:   '🥗',
  principal: '🍽️',
  postre:    '🍮',
  bebida:    '🥤',
  otro:      '🍴',
};

let allIngredientes = [];
let allPlatillos    = [];
let currentFilter   = 'all';

/* ════════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

/* ════════════════════════════════════════════════
   UTILIDADES
════════════════════════════════════════════════ */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = type === 'success' ? '✅  ' + msg : '❌  ' + msg;
  t.className   = `toast ${type} show`;
  setTimeout(() => t.className = 'toast', 3500);
}

async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Error ${res.status}`);
    }
    return res.json();
  } catch (e) {
    showToast(e.message || 'Error de conexión con el servidor', 'error');
    throw e;
  }
}

function fmt(val) {
  return '$' + Number(val).toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ════════════════════════════════════════════════
   MODALES
════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}
function closeModalOutside(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

/* ════════════════════════════════════════════════
   STATS
════════════════════════════════════════════════ */
async function loadStats() {
  try {
    const [platillos, ordenes, ingredientes] = await Promise.all([
      apiFetch('/platillos'),
      apiFetch('/ordenes'),
      apiFetch('/ingredientes'),
    ]);
    document.getElementById('statPlatillos').textContent    = platillos.length;
    document.getElementById('statOrdenes').textContent      = ordenes.filter(o => o.estado).length;
    document.getElementById('statIngredientes').textContent = ingredientes.length;
  } catch { /* silencioso — las stats son decorativas */ }
}

/* ════════════════════════════════════════════════
   MENÚ DE PLATILLOS
════════════════════════════════════════════════ */
async function loadMenu() {
  try {
    const platillos = await apiFetch('/platillos');
    allPlatillos = platillos;
    renderMenu(platillos);
    populatePlatillosSelect(platillos);
  } catch {
    document.getElementById('menuGrid').innerHTML =
      '<div class="menu-loading"><p>🙈 No se pudo cargar el menú. ¿Está despierto el servidor?</p></div>';
  }
}

function renderMenu(platillos) {
  const grid = document.getElementById('menuGrid');
  const list = currentFilter === 'all'
    ? platillos
    : platillos.filter(p => p.categoria === currentFilter);

  if (!list.length) {
    grid.innerHTML = '<div class="menu-loading"><p>No hay platillos en esta categoría 🍃</p></div>';
    return;
  }

  grid.innerHTML = list.map(p => {
    const emoji   = CAT_EMOJI[p.categoria] || '🍴';
    const catClass = `cat-${p.categoria || 'otro'}`;
    return `
      <div class="menu-card">
        <span class="menu-card-emoji">${emoji}</span>
        <span class="menu-card-cat ${catClass}">${p.categoria || 'platillo'}</span>
        <h3>${escHtml(p.nombre)}</h3>
        <p>${escHtml(p.descripcion || 'Preparado con ingredientes frescos de la región.')}</p>
        <div class="menu-card-footer">
          <div class="menu-price">${fmt(p.precio)}</div>
          ${p.frecuencia > 0
            ? `<span class="menu-freq-badge">⭐ ${p.frecuencia} pedidos</span>`
            : ''}
        </div>
      </div>
    `;
  }).join('');
}

function populatePlatillosSelect(platillos) {
  const sel = document.getElementById('ord-platillos');
  sel.innerHTML = platillos.map(p =>
    `<option value="${p._id}">${CAT_EMOJI[p.categoria] || '🍴'} ${escHtml(p.nombre)} — ${fmt(p.precio)}</option>`
  ).join('');
}

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderMenu(allPlatillos);
  });
});

async function crearPlatillo() {
  const nombre = document.getElementById('plat-nombre').value.trim();
  const desc   = document.getElementById('plat-desc').value.trim();
  const cat    = document.getElementById('plat-cat').value;
  const precio = parseFloat(document.getElementById('plat-precio').value);

  if (!nombre)      return showToast('El nombre es obligatorio', 'error');
  if (isNaN(precio)) return showToast('Ingresa un precio válido', 'error');

  try {
    await apiFetch('/platillos', {
      method: 'POST',
      body: JSON.stringify({ nombre, descripcion: desc, categoria: cat, precio }),
    });
    showToast('¡Platillo agregado al menú! 🎉');
    closeModal('modalPlatillo');
    ['plat-nombre', 'plat-desc', 'plat-precio'].forEach(id => document.getElementById(id).value = '');
    loadMenu();
    loadStats();
  } catch { /* toast ya mostrado */ }
}

/* ════════════════════════════════════════════════
   ÓRDENES
════════════════════════════════════════════════ */
async function loadOrdenes() {
  const grid = document.getElementById('ordenesGrid');
  grid.innerHTML = '<div class="empty-state"><div class="spinner" style="margin:0 auto"></div><p style="margin-top:1rem">Cargando órdenes…</p></div>';
  try {
    const ordenes = await apiFetch('/ordenes');
    if (!ordenes.length) {
      grid.innerHTML = '<div class="empty-state"><span class="empty-icon">🎉</span><p>Sin órdenes por ahora — ¡todo tranquilo!</p></div>';
      return;
    }
    grid.innerHTML = ordenes.map(o => {
      const activa = o.estado;
      return `
        <div class="orden-card ${activa ? '' : 'cerrada'}">
          <div class="orden-header">
            <div class="orden-mesa-num">Mesa ${o.mesa_numero || '—'}</div>
            <span class="badge ${activa ? 'badge-activa' : 'badge-cerrada'}">${activa ? '● Activa' : '✓ Cerrada'}</span>
          </div>
          <div class="orden-total">${fmt(o.cuenta_total || 0)}</div>
          <div class="orden-fecha">📅 ${new Date(o.fecha || o.createdAt).toLocaleString('es-MX')}</div>
          ${activa ? `<button class="action-btn" style="margin-top:0.75rem" onclick="cerrarOrden('${o._id}')">Cerrar orden</button>` : ''}
        </div>
      `;
    }).join('');
  } catch {
    grid.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span><p>Error al cargar las órdenes.</p></div>';
  }
}

async function crearOrden() {
  const mesa      = document.getElementById('ord-mesa').value.trim();
  const empId     = document.getElementById('ord-empleado').value.trim();
  const selEl     = document.getElementById('ord-platillos');
  const platillos = Array.from(selEl.selectedOptions).map(o => o.value);

  if (!mesa)             return showToast('Indica el número de mesa', 'error');
  if (!platillos.length) return showToast('Selecciona al menos un platillo', 'error');

  try {
    await apiFetch('/ordenes', {
      method: 'POST',
      body: JSON.stringify({ mesa_numero: Number(mesa), empleado_id: empId || null, platillos }),
    });
    showToast('¡Orden creada! 🛒');
    closeModal('modalOrden');
    document.getElementById('ord-mesa').value = '';
    document.getElementById('ord-empleado').value = '';
    Array.from(selEl.options).forEach(o => o.selected = false);
    loadOrdenes();
    loadStats();
  } catch { /* toast ya mostrado */ }
}

async function cerrarOrden(id) {
  try {
    await apiFetch(`/ordenes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: false }),
    });
    showToast('Orden cerrada ✓');
    loadOrdenes();
    loadStats();
  } catch { /* toast ya mostrado */ }
}

/* ════════════════════════════════════════════════
   INVENTARIO
════════════════════════════════════════════════ */
async function loadInventario() {
  try {
    const data = await apiFetch('/ingredientes');
    allIngredientes = data;
    renderInventario(data);
    renderStockAlerts(data);
  } catch {
    document.getElementById('invBody').innerHTML =
      '<tr><td colspan="6" class="table-empty">⚠️ Error al cargar el inventario.</td></tr>';
  }
}

function renderStockAlerts(items) {
  const wrap = document.getElementById('stockAlerts');
  const low   = items.filter(i => i.existencia > 0 && i.existencia < i.minimo);
  const empty = items.filter(i => i.existencia <= 0);

  let html = '';
  empty.forEach(i => {
    html += `<div class="alert-card danger">❌ <strong>${escHtml(i.nombre)}</strong> — AGOTADO</div>`;
  });
  low.forEach(i => {
    html += `<div class="alert-card">⚠️ <strong>${escHtml(i.nombre)}</strong> — Stock bajo (${i.existencia} ${i.unidad})</div>`;
  });
  wrap.innerHTML = html;
}

function renderInventario(items) {
  const tbody = document.getElementById('invBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">🧺 Sin ingredientes registrados.</td></tr>';
    return;
  }
  tbody.innerHTML = items.map(i => {
    let sc, sl;
    if (i.existencia <= 0)            { sc = 'empty'; sl = '❌ Agotado'; }
    else if (i.existencia < i.minimo) { sc = 'low';   sl = '⚠️ Bajo'; }
    else                               { sc = 'ok';    sl = '✅ OK'; }
    return `
      <tr>
        <td><strong>${escHtml(i.nombre)}</strong></td>
        <td>${i.existencia}</td>
        <td>${i.minimo}</td>
        <td>${escHtml(i.unidad)}</td>
        <td><span class="stock-pill ${sc}">${sl}</span></td>
        <td>
          <button class="action-btn" onclick="editarStock('${i._id}', ${i.existencia})">Editar</button>
          <button class="action-btn del" onclick="eliminarIngrediente('${i._id}')">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterInventario(q) {
  renderInventario(allIngredientes.filter(i =>
    i.nombre.toLowerCase().includes(q.toLowerCase())
  ));
}

async function crearIngrediente() {
  const nombre     = document.getElementById('ing-nombre').value.trim();
  const existencia = Number(document.getElementById('ing-existencia').value);
  const minimo     = Number(document.getElementById('ing-minimo').value);
  const unidad     = document.getElementById('ing-unidad').value.trim();

  if (!nombre || !unidad) return showToast('Nombre y unidad son obligatorios', 'error');

  try {
    await apiFetch('/ingredientes', {
      method: 'POST',
      body: JSON.stringify({ nombre, existencia, minimo, unidad }),
    });
    showToast('¡Ingrediente agregado! 🧺');
    closeModal('modalIngrediente');
    ['ing-nombre', 'ing-existencia', 'ing-minimo', 'ing-unidad'].forEach(id => {
      document.getElementById(id).value = '';
    });
    loadInventario();
    loadStats();
  } catch { /* toast ya mostrado */ }
}

async function editarStock(id, actual) {
  const nuevo = prompt(`Existencia actual: ${actual}\nNueva cantidad:`);
  if (nuevo === null || nuevo.trim() === '') return;
  try {
    await apiFetch(`/ingredientes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ existencia: Number(nuevo) }),
    });
    showToast('Stock actualizado ✓');
    loadInventario();
  } catch { /* toast ya mostrado */ }
}

async function eliminarIngrediente(id) {
  if (!confirm('¿Seguro que quieres eliminar este ingrediente?')) return;
  try {
    await apiFetch(`/ingredientes/${id}`, { method: 'DELETE' });
    showToast('Ingrediente eliminado');
    loadInventario();
    loadStats();
  } catch { /* toast ya mostrado */ }
}

/* ════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
  loadStats();
});
