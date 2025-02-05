const cardapio = document.getElementById('cardapio');
const carrinho = [];
const carrinhoBotao = document.createElement('button');
const carrinhoContainer = document.createElement('div');
const fecharCarrinhoBotao = document.createElement('button');

carrinhoBotao.classList.add('botao-carrinho');
carrinhoBotao.innerHTML = '🛒 Ver Carrinho';
carrinhoBotao.onclick = () => {
    carrinhoContainer.classList.toggle('mostrar');
};
document.body.appendChild(carrinhoBotao);

carrinhoContainer.classList.add('carrinho-flutuante');
document.body.appendChild(carrinhoContainer);

fecharCarrinhoBotao.classList.add('fechar-carrinho');
fecharCarrinhoBotao.innerHTML = '✖ Fechar';
fecharCarrinhoBotao.onclick = () => {
    carrinhoContainer.classList.remove('mostrar');
};

const whatsappBotao = document.createElement('a');
whatsappBotao.classList.add('botao-whatsapp-flutuante');
whatsappBotao.href = "#";
whatsappBotao.target = "_blank";
whatsappBotao.innerHTML = `
    <img src="assets/whatsapp-icon.png" alt="WhatsApp">
    Peça já pelo WhatsApp!
`;
document.body.appendChild(whatsappBotao);

const atualizarCarrinho = () => {
    carrinhoContainer.innerHTML = `<h3>🛒 Seu Carrinho</h3>`;
    carrinhoContainer.appendChild(fecharCarrinhoBotao);

    if (carrinho.length === 0) {
        carrinhoContainer.innerHTML += '<p>O carrinho está vazio.</p>';
    } else {
        carrinho.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-carrinho');
            itemDiv.innerHTML = `
                <span>${item.nome} <strong>(x${item.quantidade})</strong></span>
                <button class="botao-remover" onclick="removerItem('${item.nome}')">🗑️</button>
            `;
            carrinhoContainer.appendChild(itemDiv);
        });
    }

    let mensagem = 'Olá! Quero fazer um pedido:\n\n';
    let totalDoPedido = 0;

    carrinho.forEach(item => {
        const precoItem = parseFloat(item.preco.replace('R$', '').replace(',', '.'));
        const subtotalItem = precoItem * item.quantidade;
        mensagem += `- ${item.nome} (x${item.quantidade}) - R$ ${subtotalItem.toFixed(2)}\n`;
        totalDoPedido += subtotalItem;
    });

    mensagem += `\n*Total do pedido: R$ ${totalDoPedido.toFixed(2)}*\n`;

    const url = `https://wa.me/5527995263903?text=${encodeURIComponent(mensagem)}`;
    whatsappBotao.href = url;
};

const adicionarAoCarrinho = (produto) => {
    const existe = carrinho.find(item => item.nome === produto.nome);
    if (existe) {
        existe.quantidade += 1;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }
    atualizarCarrinho();
    atualizarContador(produto.nome);
};

const removerItem = (nomeProduto) => {
    const index = carrinho.findIndex(item => item.nome === nomeProduto);
    if (index !== -1) {
        if (carrinho[index].quantidade > 1) {
            carrinho[index].quantidade -= 1;
        } else {
            carrinho.splice(index, 1);
        }
    }
    atualizarCarrinho();
    atualizarContador(nomeProduto);
};

const atualizarContador = (nomeProduto) => {
    const produto = carrinho.find(item => item.nome === nomeProduto);
    const contadorDiv = document.getElementById(`contador-${nomeProduto}`);

    if (produto) {
        contadorDiv.innerHTML = `
            <button class="contador-menos" onclick="removerItem('${nomeProduto}')">-</button>
            <span class="contador-quantidade">${produto.quantidade}</span>
            <button class="contador-mais" onclick="adicionarAoCarrinho(produtos.find(p => p.nome === '${nomeProduto}'))">+</button>
        `;
    } else {
        contadorDiv.innerHTML = `<button class="contador-mais unico" onclick="adicionarAoCarrinho(produtos.find(p => p.nome === '${nomeProduto}'))">+ Adicionar</button>`;
    }
};

const produtos = [
    {
        imagem: 'nhoque.png',
        nome: 'Nhoque à Bolonhesa Sem Glúten (500g)',
        descricao: 'Massa de arroz e batata com provolone e gorgonzola, molho artesanal e temperos naturais.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'brasileirinha.png',
        nome: 'Lasanha Brasileirinha Sem Glúten Low Carb (500g)',
        descricao: 'Lasanha com base de abobrinha, molho pomodoro artesanal, lombo canadense, creme branco e queijo mozzarella.',
        preco: 'R$ 32,00'
    },
    {
        imagem: '4-queijos.jpeg',
        nome: 'Pizza 4 Queijos Magnífica Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, mozzarella, gorgonzola, parmesão e requeijão cremoso.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'calabresa.jpeg',
        nome: 'Pizza Calabresa Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, mozzarella, calabresa e cebola.',
        preco: 'R$ 32,00'
    },
    {
        imagem: 'frangoporo.jpeg',
        nome: 'Pizza Frango Poró Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho artesanal, mozzarella, frango temperado, alho-poró, creme de queijo e castanha.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'portuguesa.jpeg',
        nome: 'Pizza Portuguesa Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho artesanal, calabresa, presunto, queijo, pimentão colorido, azeitona, ovo e orégano.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'presunto.png',
        nome: 'Pizza Presunto Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, mozzarella e presunto.',
        preco: 'R$ 32,00'
    },
    {
        imagem: 'marguerita.png',
        nome: 'Pizza Marguerita Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho artesanal, mozzarella, tomate cereja e manjericão.',
        preco: 'R$ 30,00'
    },
    {
        imagem: 'mandala.png',
        nome: 'Pizza Vegana Mandala de Pesto Sem Glúten (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, berinjela, molho pesto artesanal e tomate seco.',
        preco: 'R$ 32,00'
    },
    {
        imagem: 'monte.png',
        nome: 'Monte seu combo Sem Glúten!',
        descricao: 'Clique em faça seu pedido e monte seu combo personalizado.',
        preco: ''
    }
];

produtos.forEach(produto => {
    const div = document.createElement('div');
    div.classList.add('produto');
    div.innerHTML = `
        <img src="assets/${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <p><strong>${produto.preco}</strong></p>
        <div class="contador" id="contador-${produto.nome}">
            <button class="contador-mais unico" onclick="adicionarAoCarrinho(produtos.find(p => p.nome === '${produto.nome}'))">+ Adicionar</button>
        </div>
    `;
    cardapio.appendChild(div);
});

document.addEventListener("DOMContentLoaded", atualizarCarrinho);