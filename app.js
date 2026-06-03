// ═══════════════════════════════════════════════
// ENJOY ROOFTOP BISTRÔ — app.js
// ═══════════════════════════════════════════════

// ── CONFIG JSONBIN ─────────────────────────────
const JSONBIN_KEY = '$2a$10$yNIbcGYE9no92zdz1pID5OVpWxUc3DyjkKHrIPrR1j9LKIUYxPd1a';
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b';
const JSONBIN_BIN_ID = '6a205af7f5f4af5e29b37d05';

async function ensureBin() {
  return JSONBIN_BIN_ID;
}

async function fetchPedidosCloud() {
  try {
    const binId = await ensureBin();
    const res = await fetch(`${JSONBIN_URL}/${binId}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const data = await res.json();
    return data.record.pedidos || [];
  } catch (e) {
    console.error('Erro ao buscar pedidos:', e);
    return getPedidosLocal();
  }
}

async function savePedidosCloud(pedidos) {
  try {
    const binId = await ensureBin();
    await fetch(`${JSONBIN_URL}/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_KEY
      },
      body: JSON.stringify({ pedidos })
    });
    savePedidosLocal(pedidos);
  } catch (e) {
    console.error('Erro ao salvar pedidos:', e);
    savePedidosLocal(pedidos);
  }
}

async function addPedido(pedido) {
  const pedidos = await fetchPedidosCloud();
  pedido.id = Date.now();
  pedido.timestamp = new Date().toISOString();
  pedido.status = 'pendente';
  pedidos.push(pedido);
  await savePedidosCloud(pedidos);
  return pedido;
}

async function updatePedidoStatus(id, status) {
  const pedidos = await fetchPedidosCloud();
  const idx = pedidos.findIndex(p => p.id === id);
  if (idx !== -1) {
    pedidos[idx].status = status;
    await savePedidosCloud(pedidos);
    return true;
  }
  return false;
}

async function clearPedidos() {
  await savePedidosCloud([]);
  localStorage.removeItem('enjoy_pedidos');
}

// ── LOCAL FALLBACK ─────────────────────────────
const STORAGE_KEY = 'enjoy_pedidos';
function getPedidosLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function savePedidosLocal(pedidos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
}
// Keep sync alias for legacy calls
function getPedidos() { return getPedidosLocal(); }
function savePedidos(p) { savePedidosLocal(p); }

// ── DADOS DO CARDÁPIO ──────────────────────────
const MENU = {
  pratos: [
    {
      id: 'risoto-funghi',
      categoria: 'Prato Principal',
      nome: 'Risoto de Funghi com Filé Mignon',
      desc: 'Cremoso risoto ao perfume de trufas, finalizado com tiras de filé mignon grelhado na hora',
      preco: 118.00
    },
    {
      id: 'carpaccio',
      categoria: 'Entrada',
      nome: 'Carpaccio',
      desc: 'Finas fatias de carne curada, servidas com rúcula, lascas de parmesão e 2 torradinhas crocantes',
      preco: 35.00
    },
    {
      id: 'steak-tartar',
      categoria: 'Entrada',
      nome: 'Steak Tartar',
      desc: 'Carne bovina picada na faca, temperada com alcaparra, mostarda e gema, acompanhada de canapés',
      preco: 69.00
    },
    {
      id: 'tabua-frios',
      categoria: 'Para Compartilhar',
      nome: 'Tábua de Frios & Queijos',
      desc: 'Seleção de salaminhos artesanais, Grana Padano envelhecido e azeitonas temperadas',
      preco: null
    }
  ],
  vinhos: [
    { id: 'taca-tinto', categoria: 'Taça', nome: 'Taça de Vinho Tinto', desc: 'Seleção da casa', pais: '', tipo: 'Tinto', preco_taca: 25.00, preco_garrafa: null },
    { id: 'qpa-family', categoria: 'Chile — Tinto', nome: 'QPA Family Vintage', desc: 'Vinho tinto chileno encorpado e elegante', pais: 'Chile', tipo: 'Tinto', preco_taca: null, preco_garrafa: 249.00 },
    { id: 'qpa-gran-cab', categoria: 'Chile — Tinto', nome: 'QPA Gran Reserva Cabernet', desc: 'Cabernet Sauvignon chileno de longa maturação', pais: 'Chile', tipo: 'Tinto', preco_taca: null, preco_garrafa: 169.00 },
    { id: 'qpa-carmenere', categoria: 'Chile — Tinto', nome: 'QPA Reserva Carmenère', desc: 'Uva símbolo do Chile, notas de especiarias e frutas negras', pais: 'Chile', tipo: 'Tinto', preco_taca: null, preco_garrafa: 129.00 },
    { id: 'qpa-gran-sauv', categoria: 'Chile — Branco', nome: 'QPA Gran Reserva Sauvignon Blanc', desc: 'Branco fresco e mineral com notas cítricas', pais: 'Chile', tipo: 'Branco', preco_taca: null, preco_garrafa: 169.00 },
    { id: 'torre-galasso', categoria: 'Itália — Tinto', nome: 'Torre Galasso Premium', desc: 'Tinto italiano Premium de sabor encorpado e persistente', pais: 'Itália', tipo: 'Tinto', preco_taca: null, preco_garrafa: 169.00 },
    { id: 'chateau-haut', categoria: 'França — Tinto', nome: 'Château Haut Riot', desc: 'Clássico francês com taninos sedosos e final longo', pais: 'França', tipo: 'Tinto', preco_taca: null, preco_garrafa: 175.00 },
    { id: 'dona-julieta', categoria: 'Portugal — Tinto', nome: 'Dona Julieta Reserva', desc: 'Reserva português com caráter robusto e notas de frutos vermelhos', pais: 'Portugal', tipo: 'Tinto', preco_taca: null, preco_garrafa: 175.00 },
    { id: 'qpa-verde', categoria: 'Portugal — Branco', nome: 'QPA Verde', desc: 'Vinho Verde português leve, fresco e levemente efervescente', pais: 'Portugal', tipo: 'Branco', preco_taca: null, preco_garrafa: 119.00 },
    { id: 'agua-com-gas', categoria: 'Água', nome: 'Água com Gás', desc: 'Água mineral gaseificada gelada', pais: '', tipo: 'Água', preco_taca: 5.00, preco_garrafa: null },
    { id: 'agua-sem-gas', categoria: 'Água', nome: 'Água sem Gás', desc: 'Água mineral natural gelada', pais: '', tipo: 'Água', preco_taca: 5.00, preco_garrafa: null }
  ]
};

// ── AMBIENTES ──────────────────────────────────
const AMBIENTES = [
  'Sala Master', 'Lounge VIP', 'Lounge Disruption',
  'Sala Âncora', 'Rooftop', 'Varanda Disruption'
];

// ── UTILS ──────────────────────────────────────
function formatMoney(v) {
  if (v === null || v === undefined) return 'A definir';
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + formatTime(iso);
}
function showToast(msg, duration = 3000) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}
function getAllItems() {
  const pratos = MENU.pratos.map(p => ({ ...p, tipo_item: 'prato', preco_display: p.preco, subtipo: null }));
  const vinhos = MENU.vinhos.map(v => ({ ...v, tipo_item: 'vinho', preco_display: v.preco_taca || v.preco_garrafa, subtipo: v.preco_taca ? 'Taça' : 'Garrafa' }));
  return [...pratos, ...vinhos];
}
