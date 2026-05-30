// ============================================================
//  LEVE MASSA — admin/script.js
// ============================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let produtos      = [];
let categoriaAtiva = 'todas';
let editandoId    = null;
let deletandoId   = null;
let fotoBlob      = null;   // blob da imagem cortada pronta pra upload

// ============================================================
//  LOGIN
// ============================================================
async function fazerLogin() {
  const senha = document.getElementById('senha-input').value.trim();
  const erro  = document.getElementById('login-erro');

  erro.textContent = '';

  try {
    const { data, error } = await db.rpc('check_admin', { pwd: senha });

    if (error) throw error;

    if (data === true) {
      sessionStorage.setItem('lm_admin', '1');
      document.getElementById('tela-login').classList.add('hidden');
      document.getElementById('painel').classList.remove('hidden');
      carregarProdutos();
    } else {
      erro.textContent = 'Senha incorreta.';
    }

  } catch (err) {
    erro.textContent = 'Erro no login.';
  }

  document.getElementById('senha-input').value = '';
  document.getElementById('senha-input').focus();
}

function sair() {
  sessionStorage.removeItem('lm_admin');
  location.reload();
}

// Verifica se já estava logado nesta sessão
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('lm_admin') === '1') {
    document.getElementById('tela-login').classList.add('hidden');
    document.getElementById('painel').classList.remove('hidden');
    carregarProdutos();
  }
  document.getElementById('senha-input').focus();
});

// ============================================================
//  CARREGAR PRODUTOS
// ============================================================
async function carregarProdutos() {
  document.getElementById('admin-lista').innerHTML = '<div class="admin-loading">Carregando...</div>';

  const { data, error } = await db
    .from('produtos')
    .select('*')
    .order('categoria')
    .order('ordem');

  if (error) {
    document.getElementById('admin-lista').innerHTML =
      `<div class="admin-erro">Erro ao carregar: ${error.message}</div>`;
    return;
  }

  produtos = data || [];
  renderizarAdmin();
}

// ============================================================
//  RENDERIZAR LISTA ADMIN
// ============================================================
const CATS = {
  salgadas: { label: '🍕 Pizzas Salgadas', icone: '🍕' },
  doces:    { label: '🍓 Pizzas Doces',    icone: '🍓' },
  nhoques:  { label: '🥟 Nhoques',         icone: '🥟' },
};

function renderizarAdmin() {
  const lista = document.getElementById('admin-lista');
  const filtrados = categoriaAtiva === 'todas'
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtiva);

  if (filtrados.length === 0) {
    lista.innerHTML = '<div class="admin-vazio">Nenhum produto nesta categoria ainda.</div>';
    return;
  }

  // Agrupa por categoria se mostrando todas
  if (categoriaAtiva === 'todas') {
    let html = '';
    Object.entries(CATS).forEach(([catId, cat]) => {
      const itens = filtrados.filter(p => p.categoria === catId);
      if (!itens.length) return;
      html += `<div class="admin-cat-titulo">${cat.label}</div>`;
      html += itens.map(p => cardProduto(p)).join('');
    });
    lista.innerHTML = html;
  } else {
    lista.innerHTML = filtrados.map(p => cardProduto(p)).join('');
  }
}

function cardProduto(p) {
  const fotoSrc = p.foto_url || '../assets/logo.png';
  const statusClass = p.ativo ? 'status-ativo' : 'status-inativo';
  const statusLabel = p.ativo ? 'Visível' : 'Oculto';
  const precoKit = `R$ ${(p.preco * MULTIPLO).toFixed(2).replace('.', ',')}`;

  return `
    <div class="admin-card ${!p.ativo ? 'inativo' : ''}" id="card-${p.id}">
      <img class="admin-card-img" src="${fotoSrc}" alt="${p.nome}"
           onerror="this.src='../assets/logo.png';this.style.objectFit='contain';this.style.padding='8px'">
      <div class="admin-card-body">
        <div class="admin-card-nome">${p.nome}</div>
        <div class="admin-card-desc">${p.descricao || '—'}</div>
        <div class="admin-card-meta">
          <span class="preco-tag">${precoKit} / kit</span>
          <span class="status-tag ${statusClass}">${statusLabel}</span>
        </div>
      </div>
      <div class="admin-card-acoes">
        <button class="btn-editar" onclick="abrirModal('${p.id}')">✏️ Editar</button>
        <button class="btn-excluir" onclick="abrirDelete('${p.id}', '${p.nome.replace(/'/g,"\\'")}')">🗑️</button>
      </div>
    </div>
  `;
}

function filtrarCategoria(cat, btn) {
  categoriaAtiva = cat;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderizarAdmin();
}

// ============================================================
//  MODAL — CRIAR / EDITAR
// ============================================================
function abrirModal(id = null) {
  editandoId = id;
  fotoBlob   = null;

  // Reset do form
  document.getElementById('campo-nome').value      = '';
  document.getElementById('campo-desc').value      = '';
  document.getElementById('campo-preco').value     = '';
  document.getElementById('campo-categoria').value = 'salgadas';
  document.getElementById('campo-ordem').value     = '';
  document.getElementById('campo-ativo').checked   = true;
  document.getElementById('foto-input').value      = '';
  document.getElementById('foto-preview-img').style.display  = 'none';
  document.getElementById('foto-placeholder').style.display  = 'flex';
  document.getElementById('foto-preview-img').src  = '';

  if (id) {
    const p = produtos.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modal-titulo').textContent    = 'Editar produto';
    document.getElementById('campo-nome').value      = p.nome;
    document.getElementById('campo-desc').value      = p.descricao || '';
    document.getElementById('campo-preco').value     = p.preco;
    document.getElementById('campo-categoria').value = p.categoria;
    document.getElementById('campo-ordem').value     = p.ordem || 0;
    document.getElementById('campo-ativo').checked   = p.ativo;

    if (p.foto_url) {
      document.getElementById('foto-preview-img').src           = p.foto_url;
      document.getElementById('foto-preview-img').style.display = 'block';
      document.getElementById('foto-placeholder').style.display = 'none';
    }
  } else {
    document.getElementById('modal-titulo').textContent = 'Novo produto';
  }

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('campo-nome').focus();
}

function fecharModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editandoId = null; fotoBlob = null;
}
function fecharModalClick(e) { if (e.target.id === 'modal-overlay') fecharModal(); }

// ============================================================
//  UPLOAD E CORTE DE FOTO
// ============================================================
function carregarFoto(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => cortarImagem(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function cortarImagem(img) {
  const canvas = document.getElementById('canvas-corte');
  const SIZE   = 600; // px — quadrado final

  // Corte centralizado (crop to square)
  const min = Math.min(img.width, img.height);
  const sx  = (img.width  - min) / 2;
  const sy  = (img.height - min) / 2;

  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);

  // Atualizar preview
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
  document.getElementById('foto-preview-img').src           = dataUrl;
  document.getElementById('foto-preview-img').style.display = 'block';
  document.getElementById('foto-placeholder').style.display = 'none';

  // Guardar blob pra upload
  canvas.toBlob(blob => { fotoBlob = blob; }, 'image/jpeg', 0.88);
}

// ============================================================
//  SALVAR PRODUTO
// ============================================================
async function salvarProduto() {
  const nome      = document.getElementById('campo-nome').value.trim();
  const descricao = document.getElementById('campo-desc').value.trim();
  const preco     = parseFloat(document.getElementById('campo-preco').value);
  const categoria = document.getElementById('campo-categoria').value;
  const ordem     = parseInt(document.getElementById('campo-ordem').value) || 0;
  const ativo     = document.getElementById('campo-ativo').checked;

  if (!nome)        { alert('Nome é obrigatório.'); return; }
  if (isNaN(preco)) { alert('Informe o preço.'); return; }

  const btn = document.getElementById('btn-salvar');
  btn.disabled    = true;
  btn.textContent = 'Salvando...';

  try {
    let foto_url = null;

    // Se tiver foto nova, faz upload
    if (fotoBlob) {
      const nomeArq = `produto-${Date.now()}.jpg`;
      const { data: upData, error: upErr } = await db.storage
        .from('produtos')
        .upload(nomeArq, fotoBlob, { contentType: 'image/jpeg', upsert: true });

      if (upErr) throw new Error('Erro no upload: ' + upErr.message);

      const { data: urlData } = db.storage.from('produtos').getPublicUrl(nomeArq);
      foto_url = urlData.publicUrl;
    } else if (editandoId) {
      // Mantém foto existente
      const prod = produtos.find(p => p.id === editandoId);
      foto_url = prod?.foto_url || null;
    }

    const payload = { nome, descricao, preco, categoria, ordem, ativo, foto_url };

    let error;
    if (editandoId) {
      ({ error } = await db.from('produtos').update(payload).eq('id', editandoId));
    } else {
      ({ error } = await db.from('produtos').insert(payload));
    }

    if (error) throw new Error(error.message);

    fecharModal();
    await carregarProdutos();

  } catch (err) {
    alert('Erro ao salvar: ' + err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Salvar produto';
  }
}

// ============================================================
//  EXCLUIR
// ============================================================
function abrirDelete(id, nome) {
  deletandoId = id;
  document.getElementById('delete-nome').textContent = nome;
  document.getElementById('modal-delete').classList.remove('hidden');
}
function fecharDelete() {
  document.getElementById('modal-delete').classList.add('hidden');
  deletandoId = null;
}
function fecharDeleteClick(e) { if (e.target.id === 'modal-delete') fecharDelete(); }

async function confirmarDelete() {
  if (!deletandoId) return;
  const btn = document.getElementById('btn-confirmar-delete');
  btn.disabled = true; btn.textContent = 'Excluindo...';

  const { error } = await db.from('produtos').delete().eq('id', deletandoId);
  if (error) { alert('Erro: ' + error.message); btn.disabled = false; btn.textContent = 'Excluir'; return; }

  fecharDelete();
  await carregarProdutos();
}