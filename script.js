// ============================================================
//  LEVE MASSA — script.js
//  Base: lógica do usuário (unidades + 10% OFF a partir de 5)
//  Adições: cache sessionStorage, FABs, gaveta melhorada
// ============================================================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORIAS = {
  salgadas: { titulo: 'Pizzas Salgadas', icone: '' },
  doces:    { titulo: 'Pizzas Doces',    icone: '' },
  nhoques:  { titulo: 'Nhoques',         icone: '' },
};

// ============================================================
//  CACHE — sessionStorage, expira em 2h
//  Armazena apenas { id, q } — NUNCA preços ou nomes.
//  Cálculo sempre refeito a partir do Supabase.
//  sessionStorage não persiste entre abas nem após fechar browser.
// ============================================================
const CACHE_KEY    = 'lm_cart_v1';
const CACHE_TTL    = 2 * 60 * 60 * 1000; // 2 horas

function salvarCache() {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      ts: Date.now(),
      items: qtds.map((q, i) => ({ id: todosProdutos[i]?.id, q }))
    }));
  } catch(e) {}
}

function lerCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.ts > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return obj.items;
  } catch(e) { return null; }
}

let todosProdutos = [];
let qtds = [];

// ============================================================
//  INIT
// ============================================================
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

  // Restaurar carrinho salvo (sem abrir gaveta)
  const cache = lerCache();
  if (cache) {
    cache.forEach(({ id, q }) => {
      const idx = todosProdutos.findIndex(p => p.id === id);
      if (idx !== -1 && q > 0) qtds[idx] = q;
    });
  }

  renderizarLista();

  // Atualiza UI se havia itens no cache
  if (qtds.some(q => q > 0)) atualizarCarrinho();
}

// ============================================================
//  SKELETON
// ============================================================
function mostrarSkeleton() {
  const lista = document.getElementById('produto-lista');
  lista.innerHTML = Array(5).fill(`
    <li class="produto-item skeleton">
      <div class="sk-img"></div>
      <div class="sk-body">
        <div class="sk-line sk-titulo"></div>
        <div class="sk-line sk-desc"></div>
        <div class="sk-line sk-preco"></div>
      </div>
    </li>
  `).join('');
}

// ============================================================
//  RENDERIZAR — mantém a lógica e HTML que o usuário definiu
// ============================================================
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
      const precoUnitario = fmt(p.preco);
      const fotoSrc = p.foto_url || 'assets/logo.png';

      const li = document.createElement('li');
      li.className = 'produto-item';
      li.id = `item-${i}`;
      li.dataset.categoria = p.categoria;
      li.innerHTML = `
        <div class="produto-img-wrap">
          <img class="produto-img" src="${fotoSrc}" alt="${p.nome}" loading="lazy"
               onerror="this.src='assets/logo.png';this.style.objectFit='contain';this.style.padding='10px';this.style.background='var(--bege-md)'">
        </div>
        <div class="produto-body">
          <div class="produto-nome">${p.nome}</div>
          <div class="produto-desc">${p.descricao || ''}</div>
          <div class="produto-preco-row">
            <span class="produto-preco">${precoUnitario}</span>
            <span class="produto-preco-unit">cada</span>
          </div>
          <div class="produto-kit-info">
             Compre 5 ou mais do mesmo sabor e ganhe 10% OFF
          </div>
        </div>
        <div class="produto-acao">
          <div>
            <span class="produto-acao-preco">${precoUnitario}</span>
            <span class="produto-acao-preco-unit">cada</span>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
            <button class="btn-add" id="add-${i}" onclick="adicionar(${i})" aria-label="Adicionar">+</button>
            <div class="controles" id="ctrl-${i}">
              <button class="btn-menos" onclick="remover(${i})" aria-label="Remover">−</button>
              <span class="qtd-num" id="qtd-${i}">0</span>
              <button class="btn-mais" onclick="adicionar(${i})" aria-label="Adicionar">+</button>
            </div>
            <span class="qtd-kits" id="kits-${i}"></span>
          </div>
        </div>
      `;
      lista.appendChild(li);

      // Restaura visual se havia cache
      if (qtds[i] > 0) atualizar(i);
    });
  });
}

// ============================================================
//  CÁLCULO — lógica original do usuário, intacta
// ============================================================
function fmt(v) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }

function calcularSubtotal(produto, quantidade) {
  const precoUnitario = Number(produto.preco);
  const kits    = Math.floor(quantidade / 5);
  const avulsas = quantidade % 5;
  const precoKit = precoUnitario * 5 * 0.90; // 10% desconto por kit completo
  return (kits * precoKit) + (avulsas * precoUnitario);
}

// ============================================================
//  ADICIONAR / REMOVER — lógica original + cache
// ============================================================
function adicionar(i) {
  const eraVazio = qtds.reduce((a, b) => a + b, 0) === 0;
  qtds[i] += 1;
  atualizar(i);
  atualizarCarrinho();
  bumpCount();
  salvarCache();
  if (eraVazio) abrirGaveta();
}

function remover(i) {
  if (qtds[i] <= 0) return;
  qtds[i] -= 1;
  atualizar(i);
  atualizarCarrinho();
  salvarCache();
}

function atualizar(i) {
  const q     = qtds[i];
  const add   = document.getElementById(`add-${i}`);
  const ctrl  = document.getElementById(`ctrl-${i}`);
  const qtdEl = document.getElementById(`qtd-${i}`);
  const kitsEl = document.getElementById(`kits-${i}`);
  if (!add || !ctrl || !qtdEl) return;

  qtdEl.textContent = q;

  if (q > 0) {
    add.style.display = 'none';
    ctrl.classList.add('visible');
    kitsEl.textContent = q >= 5
      ? '✓ 10% OFF ativo neste sabor'
      : `Faltam ${5 - q} para 10% OFF`;
  } else {
    add.style.display = 'flex';
    ctrl.classList.remove('visible');
    kitsEl.textContent = '';
  }
}

// ============================================================
//  CARRINHO
// ============================================================
function atualizarCarrinho() {
  let totalUnid = 0, totalVal = 0;
  qtds.forEach((q, i) => {
    totalUnid += q;
    totalVal  += calcularSubtotal(todosProdutos[i], q);
  });

  // Desktop cart bar
  const cartBar = document.getElementById('cart-bar');
  if (cartBar) {
    document.getElementById('cart-bar-qtd').textContent   = `${totalUnid} unidade${totalUnid !== 1 ? 's' : ''}`;
    document.getElementById('cart-bar-total').textContent = fmt(totalVal);
    cartBar.classList.toggle('visible', totalUnid > 0);
  }

  // Botão header desktop
  const cc      = document.getElementById('cart-count');
  const cartBtn = document.getElementById('cart-btn');
  if (cc) cc.textContent = totalUnid;
  if (cartBtn) cartBtn.style.background = totalUnid > 0 ? 'var(--terra)' : 'var(--navy)';

  // FAB carrinho — só aparece com itens e gaveta fechada
  const fabCart  = document.getElementById('fab-cart');
  const fabBadge = document.getElementById('fab-cart-badge');
  if (fabCart) {
    fabCart.classList.toggle('has-items', totalUnid > 0);
    if (fabBadge) fabBadge.textContent = totalUnid;
  }

  // Gaveta
  const gavTotal = document.getElementById('gaveta-total');
  if (gavTotal) gavTotal.textContent = fmt(totalVal);
  atualizarGaveta();
}

// ============================================================
//  GAVETA
// ============================================================
function abrirGaveta() {
  document.getElementById('gaveta').classList.add('open');
  document.getElementById('gaveta-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  // FABs somem enquanto gaveta está aberta
  document.getElementById('fab-wrap').classList.add('hidden');
  atualizarGaveta();
}

function fecharGaveta() {
  document.getElementById('gaveta').classList.remove('open');
  document.getElementById('gaveta-overlay').classList.remove('open');
  document.body.style.overflow = '';
  // FABs voltam
  document.getElementById('fab-wrap').classList.remove('hidden');
}

function atualizarGaveta() {
  const body = document.getElementById('gaveta-body');
  if (!body) return;

  const itens = qtds
    .map((q, i) => ({ q, p: todosProdutos[i], i }))
    .filter(x => x.q > 0);

  const btnLimpar = document.getElementById('gaveta-limpar');

  if (!itens.length) {
    body.innerHTML = '<div class="gaveta-vazio">Nenhum item ainda.<br>Adicione sabores no cardápio!</div>';
    if (btnLimpar) btnLimpar.classList.add('hidden');
    return;
  }

  if (btnLimpar) btnLimpar.classList.remove('hidden');

  body.innerHTML = itens.map(({ q, p, i }) => {
    const fotoSrc      = p.foto_url || 'assets/logo.png';
    const subtotal     = calcularSubtotal(p, q);
    const semDesconto  = q * Number(p.preco);
    const economia     = semDesconto - subtotal;
    const temDesconto  = economia > 0.001;

    return `
      <div class="gaveta-item">
        <img class="gaveta-item-img" src="${fotoSrc}" alt="${p.nome}"
             onerror="this.src='assets/logo.png';this.style.objectFit='contain';this.style.padding='6px'">
        <div class="gaveta-item-info">
          <div class="gaveta-item-nome">${p.nome}</div>
          <div class="gaveta-item-preco">
            ${q} unid. · ${fmt(subtotal)}
            ${temDesconto ? `<span class="gaveta-economia">−${fmt(economia)}</span>` : ''}
          </div>
          ${temDesconto
            ? `<div class="gaveta-desconto-tag">✓ 10% OFF aplicado</div>`
            : (q < 5 ? `<div class="gaveta-hint-tag">+${5 - q} para ganhar 10% OFF</div>` : '')
          }
        </div>
        <div class="gaveta-item-ctrl">
          <button class="gaveta-btn-m" onclick="remover(${i})">−</button>
          <span class="gaveta-item-qtd">${q}</span>
          <button class="gaveta-btn-p" onclick="adicionar(${i})">+</button>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
//  WHATSAPP — detecta se há itens
//  Sem itens → mensagem genérica profissional
//  Com itens → pedido detalhado com cálculo correto
// ============================================================
function gerarMensagemWhatsApp() {
  const totalUnid = qtds.reduce((a, b) => a + b, 0);

  if (totalUnid === 0) {
    return 'Olá! Gostaria de saber mais sobre os produtos da *Leve Massa*. Poderia me ajudar?';
  }

  const sel = qtds
    .map((q, i) => ({ q, p: todosProdutos[i] }))
    .filter(x => x.q > 0);

  const grupos = {};
  sel.forEach(({ q, p }) => {
    if (!grupos[p.categoria]) grupos[p.categoria] = [];
    grupos[p.categoria].push({ q, p });
  });

  let total = 0, linhas = '';
  Object.entries(CATEGORIAS).forEach(([catId, cat]) => {
    if (!grupos[catId]) return;
    linhas += `\n*${cat.icone} ${cat.titulo}:*\n`;
    grupos[catId].forEach(({ q, p }) => {
      const sub     = calcularSubtotal(p, q);
      total        += sub;
      const kits    = Math.floor(q / 5);
      const avulsas = q % 5;
      let detalhe   = `${q} unidade${q > 1 ? 's' : ''}`;
      if (kits > 0 && avulsas > 0)
        detalhe += ` (${kits} kit${kits > 1 ? 's' : ''} c/ 10% OFF + ${avulsas} avulsa${avulsas > 1 ? 's' : ''})`;
      else if (kits > 0)
        detalhe += ` (${kits} kit${kits > 1 ? 's' : ''} c/ 10% OFF)`;
      linhas += `• ${p.nome}: ${detalhe} — ${fmt(sub)}\n`;
    });
  });

  return `Olá! Quero fazer um pedido na *Leve Massa* \n${linhas}\n*Total estimado: ${fmt(total)}*\n\nAguardo confirmação e dados de entrega. Obrigado!`;
}

// Chamado pelo botão da gaveta e cart bar
function finalizarPedido() {
  const totalUnid = qtds.reduce((a, b) => a + b, 0);
  if (totalUnid > 0 && totalUnid < 5) {
    alert('Pedido mínimo: 5 unidades no total.');
    return;
  }
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(gerarMensagemWhatsApp())}`, '_blank');
}

// Chamado pelo FAB do WhatsApp — funciona mesmo sem itens
function fabWhatsApp() {
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(gerarMensagemWhatsApp())}`, '_blank');
}

function bumpCount() {
  const cc = document.getElementById('cart-count');
  if (!cc) return;
  cc.classList.remove('bump'); void cc.offsetWidth;
  cc.classList.add('bump');
  setTimeout(() => cc.classList.remove('bump'), 300);
}

function scrollToCart() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// ============================================================
//  FILTRO
// ============================================================
let categoriaAtiva = 'todas';

function filtrarCategoria(cat, btn) {
  categoriaAtiva = cat;
  document.querySelectorAll('.filtro-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.produto-item').forEach(el => {
    el.style.display = (cat === 'todas' || el.dataset.categoria === cat) ? '' : 'none';
  });
  document.querySelectorAll('.categoria-header').forEach(el => {
    el.style.display = (cat === 'todas' || el.dataset.categoria === cat) ? '' : 'none';
  });
}


// ============================================================
//  LIMPAR CARRINHO
// ============================================================
function limparCarrinho() {
  qtds = new Array(todosProdutos.length).fill(0);
  todosProdutos.forEach((_, i) => atualizar(i));
  try { sessionStorage.removeItem(CACHE_KEY); } catch(e) {}
  atualizarCarrinho();
  const btn = document.getElementById('gaveta-limpar');
  if (btn) btn.classList.add('hidden');
}

init();