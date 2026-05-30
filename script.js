// ============================================================
//  LEVE MASSA — script.js  (site público)
//  Lê produtos do Supabase em tempo real
// ============================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIAS = {
  salgadas: { titulo: 'Pizzas Salgadas', icone: '🍕' },
  doces:    { titulo: 'Pizzas Doces',    icone: '🍓' },
  nhoques:  { titulo: 'Nhoques',         icone: '🥟' },
};

let todosProdutos = [];
let qtds = [];

// ---- INICIALIZAR ----
async function init() {
  mostrarSkeleton();

  const { data, error } = await db
    .from('produtos')
    .select('*')
    .eq('ativo', true)
    .order('categoria')
    .order('ordem');

  if (error || !data) {
    document.getElementById('produto-lista').innerHTML =
      `<li class="erro-carga">Não foi possível carregar o cardápio. Tente novamente.</li>`;
    return;
  }

  todosProdutos = data;
  qtds = new Array(data.length).fill(0);
  renderizarLista();
}

// ---- SKELETON LOADING ----
function mostrarSkeleton() {
  const lista = document.getElementById('produto-lista');
  lista.innerHTML = Array(5).fill(`
    <li class="produto-item skeleton">
      <div class="sk-img"></div>
      <div class="produto-body">
        <div class="sk-line sk-titulo"></div>
        <div class="sk-line sk-desc"></div>
        <div class="sk-line sk-preco"></div>
      </div>
    </li>
  `).join('');
}

// ---- RENDERIZAR ----
function renderizarLista() {
  const lista = document.getElementById('produto-lista');
  lista.innerHTML = '';

  let globalIndex = 0;
  const porCategoria = {};
  todosProdutos.forEach(p => {
    if (!porCategoria[p.categoria]) porCategoria[p.categoria] = [];
    porCategoria[p.categoria].push({ ...p, idx: globalIndex++ });
  });

  Object.entries(CATEGORIAS).forEach(([catId, cat]) => {
    const itens = porCategoria[catId];
    if (!itens || itens.length === 0) return;

    const header = document.createElement('li');
    header.className = 'categoria-header';
    header.dataset.categoria = catId;
    header.innerHTML = `<span class="cat-icone">${cat.icone}</span> ${cat.titulo}`;
    lista.appendChild(header);

    itens.forEach(p => {
      const i = p.idx;
      const precoKit = fmt(p.preco * MULTIPLO);
      const fotoSrc  = p.foto_url || 'assets/logo.png';

      const li = document.createElement('li');
      li.className = 'produto-item';
      li.id = `item-${i}`;
      li.dataset.categoria = p.categoria;
      li.innerHTML = `
        <img class="produto-img" src="${fotoSrc}" alt="${p.nome}" loading="lazy"
             onerror="this.src='assets/logo.png';this.style.objectFit='contain';this.style.padding='12px';this.style.background='#f0e9de'">
        <div class="produto-body">
          <div class="produto-nome">${p.nome}</div>
          <div class="produto-desc">${p.descricao || ''}</div>
          <div class="produto-preco-row">
            <span class="produto-preco">${precoKit}</span>
            <span class="produto-preco-unit">/ kit com 5 unid.</span>
          </div>
        </div>
        <div class="produto-acao">
          <button class="btn-add" id="add-${i}" onclick="adicionar(${i})" aria-label="Adicionar">+</button>
          <div class="controles" id="ctrl-${i}">
            <button class="btn-menos" onclick="remover(${i})">−</button>
            <span class="qtd-num" id="qtd-${i}">0</span>
            <button class="btn-mais" onclick="adicionar(${i})">+</button>
          </div>
          <span class="qtd-kits" id="kits-${i}"></span>
        </div>
      `;
      lista.appendChild(li);
    });
  });
}

function fmt(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }

// ---- ADICIONAR / REMOVER ----
function adicionar(i) { qtds[i] += MULTIPLO; atualizar(i); atualizarCarrinho(); bumpCount(); }
function remover(i)   { if (qtds[i] <= 0) return; qtds[i] -= MULTIPLO; atualizar(i); atualizarCarrinho(); }

function atualizar(i) {
  const q = qtds[i];
  const add  = document.getElementById(`add-${i}`);
  const ctrl = document.getElementById(`ctrl-${i}`);
  const qtdEl= document.getElementById(`qtd-${i}`);
  const kits = document.getElementById(`kits-${i}`);
  qtdEl.textContent = q;
  if (q > 0) {
    add.style.display = 'none'; ctrl.classList.add('visible');
    const k = q / MULTIPLO;
    kits.textContent = `${k} kit${k>1?'s':''} · ${q} unid.`;
  } else {
    add.style.display = 'flex'; ctrl.classList.remove('visible'); kits.textContent = '';
  }
}

// ---- CARRINHO ----
function atualizarCarrinho() {
  let tu = 0, tv = 0;
  qtds.forEach((q, i) => { tu += q; tv += q * todosProdutos[i].preco; });
  document.getElementById('cart-bar-qtd').textContent   = `${tu} unidade${tu!==1?'s':''}`;
  document.getElementById('cart-bar-total').textContent = fmt(tv);
  const cc = document.getElementById('cart-count');
  if (cc) { cc.textContent = tu; }
  document.getElementById('cart-bar').classList.toggle('visible', tu > 0);
}

function bumpCount() {
  const cc = document.getElementById('cart-count');
  if (!cc) return;
  cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump');
  setTimeout(() => cc.classList.remove('bump'), 300);
}

function scrollToCart() { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }

// ---- FINALIZAR ----
function finalizarPedido() {
  const sel = qtds.map((q,i) => ({q, p: todosProdutos[i]})).filter(x => x.q > 0);
  if (!sel.length) { alert('Adicione pelo menos um kit! 😊'); return; }

  const grupos = {};
  sel.forEach(({q, p}) => { if (!grupos[p.categoria]) grupos[p.categoria]=[]; grupos[p.categoria].push({q,p}); });

  let total = 0, linhas = '';
  Object.entries(CATEGORIAS).forEach(([catId, cat]) => {
    if (!grupos[catId]) return;
    linhas += `\n*${cat.icone} ${cat.titulo}:*\n`;
    grupos[catId].forEach(({q, p}) => {
      const sub = q * p.preco; total += sub;
      const k = q / MULTIPLO;
      linhas += `• ${p.nome}: ${k} kit${k>1?'s':''} (${q} unid.) — ${fmt(sub)}\n`;
    });
  });

  const msg = `Olá! Quero fazer um pedido na *Leve Massa* 🍕\n${linhas}\n*Total: ${fmt(total)}*\n\nAguardo confirmação e dados de entrega. Obrigado(a)!`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
}

init();

// ============================================================
//  FILTRO DE CATEGORIA (página pública)
// ============================================================
let categoriaAtiva = 'todas';

function filtrarCategoria(cat, btn) {
  categoriaAtiva = cat;
  document.querySelectorAll('.filtro-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const itens = document.querySelectorAll('.produto-item');
  const headers = document.querySelectorAll('.categoria-header');

  itens.forEach(item => {
    if (cat === 'todas' || item.dataset.categoria === cat) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });

  headers.forEach(h => {
    if (cat === 'todas' || h.dataset.categoria === cat) {
      h.style.display = 'flex';
    } else {
      h.style.display = 'none';
    }
  });
}