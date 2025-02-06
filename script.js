const cardapio = document.getElementById('cardapio');
const carrinho = [];
let produtos = [];

// Botão do carrinho
const carrinhoBotao = document.createElement('button');
carrinhoBotao.classList.add('botao-carrinho');
carrinhoBotao.innerHTML = '🛒 Ver Carrinho';
carrinhoBotao.onclick = () => {
    carrinhoContainer.classList.toggle('mostrar');
};
document.body.appendChild(carrinhoBotao);

// Contêiner do carrinho
const carrinhoContainer = document.createElement('div');
carrinhoContainer.classList.add('carrinho-flutuante');
document.body.appendChild(carrinhoContainer);

// Contador do carrinho
const contadorCarrinho = document.createElement('div');
contadorCarrinho.classList.add('contador-externo-carrinho');
contadorCarrinho.textContent = '0';
carrinhoBotao.appendChild(contadorCarrinho);

// Função para limpar o carrinho
const limparCarrinho = () => {
    // Atualiza o contador de todos os produtos antes de esvaziar o carrinho
    carrinho.forEach(item => {
        const contadorDiv = document.getElementById(`contador-${item.nome}`);
        if (contadorDiv) {
            contadorDiv.innerHTML = `
                <button class="contador-mais unico" onclick="adicionarAoCarrinho(this)" 
                    data-nome="${item.nome}">
                    + Adicionar
                </button>
            `;
        }
    });

    carrinho.length = 0; // Esvazia o array do carrinho
    atualizarCarrinho();
    atualizarContadorCarrinho();
};

// Atualiza o contador externo do carrinho
const atualizarContadorCarrinho = () => {
    const quantidadeTotal = carrinho.reduce((total, item) => total + item.quantidade, 0);
    contadorCarrinho.textContent = quantidadeTotal;
    contadorCarrinho.style.display = quantidadeTotal > 0 ? 'flex' : 'none';
};

// Atualiza o carrinho
const atualizarCarrinho = () => {
    carrinhoContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>🛒 Seu Carrinho</h3>
            <button class="botao-limpar-carrinho" onclick="limparCarrinho()">🗑️ Limpar</button>
        </div>
    `;

    if (carrinho.length === 0) {
        const mensagemVazio = document.createElement('p');
        mensagemVazio.textContent = 'O carrinho está vazio.';
        carrinhoContainer.appendChild(mensagemVazio);
    } else {
        carrinho.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-carrinho');
            itemDiv.innerHTML = `
                <img src="assets/${item.imagem}" alt="${item.nome}">
                <div>
                    <div class="nome-produto" title="${item.nome}">${item.nome}</div>
                    <div class="controle-quantidade">
                        <button class="botao-quantidade" onclick="alterarQuantidade('${item.nome}', -1)">-</button>
                        <span class="quantidade-produto">${item.quantidade}</span>
                        <button class="botao-quantidade" onclick="alterarQuantidade('${item.nome}', 1)">+</button>
                    </div>
                </div>
                <button class="botao-remover" onclick="removerItem('${item.nome}', true)">🗑️</button>
            `;
            carrinhoContainer.appendChild(itemDiv);
        });
    }
    atualizarContadorCarrinho();
};

// Adiciona produto ao carrinho
const adicionarAoCarrinho = (button) => {
    const nomeProduto = button.dataset.nome;
    const produtoCompleto = produtos.find(p => p.nome === nomeProduto);

    const existe = carrinho.find(item => item.nome === nomeProduto);
    if (existe) {
        existe.quantidade += 1;
    } else if (produtoCompleto) {
        carrinho.push({ ...produtoCompleto, quantidade: 1 });
    }
    atualizarCarrinho();
    atualizarContador(nomeProduto);
};

// Remove item do carrinho
const removerItem = (nomeProduto, removerTudo = false) => {
    const produto = carrinho.find(item => item.nome === nomeProduto);
    if (produto) {
        if (removerTudo) {
            // Remove o item completamente
            const index = carrinho.findIndex(item => item.nome === nomeProduto);
            carrinho.splice(index, 1);
        } else {
            // Diminui a quantidade normalmente
            if (produto.quantidade > 1) {
                produto.quantidade -= 1;
            } else {
                const index = carrinho.findIndex(item => item.nome === nomeProduto);
                carrinho.splice(index, 1);
            }
        }
    }
    atualizarCarrinho();
    atualizarContador(nomeProduto);
    atualizarContadorCarrinho();
};

// Altera a quantidade de um item no carrinho
const alterarQuantidade = (nomeProduto, operacao) => {
    const produto = carrinho.find(item => item.nome === nomeProduto);
    if (produto) {
        produto.quantidade += operacao;
        if (produto.quantidade <= 0) {
            removerItem(nomeProduto);
        }
    }
    atualizarCarrinho();
    atualizarContador(nomeProduto);
};

// Atualiza o contador ao lado de cada produto
const atualizarContador = (nomeProduto) => {
    const produto = carrinho.find(item => item.nome === nomeProduto);
    const contadorDiv = document.getElementById(`contador-${nomeProduto}`);

    if (contadorDiv) {
        if (produto) {
            contadorDiv.innerHTML = `
                <button class="contador-menos" onclick="removerItem('${nomeProduto}')">-</button>
                <span class="contador-quantidade">${produto.quantidade}</span>
                <button class="contador-mais" onclick="adicionarAoCarrinho(this)" 
                    data-nome="${produto.nome}">+</button>
            `;
        } else {
            contadorDiv.innerHTML = `
                <button class="contador-mais unico" onclick="adicionarAoCarrinho(this)" 
                    data-nome="${nomeProduto}">
                    + Adicionar
                </button>
            `;
        }
    }
};

// Carrega produtos do JSON
fetch('produtos.json')
    .then(response => response.json())
    .then(data => {
        produtos = data;
        produtos.forEach(produto => {
            const div = document.createElement('div');
            div.classList.add('produto');
            div.innerHTML = `
                <img src="assets/${produto.imagem}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <p><strong>${produto.preco}</strong></p>
                <div class="contador" id="contador-${produto.nome}">
                    <button class="contador-mais unico" 
                        onclick="adicionarAoCarrinho(this)" 
                        data-nome="${produto.nome}">
                        + Adicionar
                    </button>
                </div>
            `;
            cardapio.appendChild(div);
        });
    })
    .catch(error => console.error('Erro ao carregar produtos:', error));

// Botão do WhatsApp com balão
// Função para gerar a mensagem do WhatsApp
const gerarMensagemWhatsApp = () => {
    let mensagem = "Olá, gostaria de fazer um pedido:\n";
    let total = 0;

    if (carrinho.length === 0) {
        mensagem += "Meu carrinho está vazio.";
    } else {
        carrinho.forEach(item => {
            mensagem += `${item.quantidade}x ${item.nome} - R$${(item.preco * item.quantidade).toFixed(2)}\n`;
            total += item.preco * item.quantidade;
        });
        mensagem += `\nTotal: R$${total.toFixed(2)}`;
    }

    return encodeURIComponent(mensagem);
};

// Criando o botão do WhatsApp
const whatsappBotao = document.createElement('a');
whatsappBotao.classList.add('botao-whatsapp-flutuante');
whatsappBotao.target = "_blank";
whatsappBotao.innerHTML = `<img src="assets/whatsapp-icon.png" alt="WhatsApp">`;
document.body.appendChild(whatsappBotao);

// Atualiza o link do WhatsApp sempre que o carrinho mudar
const atualizarBotaoWhatsApp = () => {
    const numeroWhatsApp = "5527995263903";
    const mensagem = gerarMensagemWhatsApp();
    whatsappBotao.href = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
};

// Garante que o link do WhatsApp seja atualizado sempre que o carrinho for modificado
document.addEventListener("DOMContentLoaded", atualizarBotaoWhatsApp);
whatsappBotao.addEventListener("click", atualizarBotaoWhatsApp);


document.addEventListener("DOMContentLoaded", () => {
    const botaoWhatsapp = document.querySelector('.botao-whatsapp-flutuante');
    const balaoMensagem = document.createElement('div');
    balaoMensagem.classList.add('balao-mensagem');
    balaoMensagem.textContent = 'Peça pelo WhatsApp!';
    botaoWhatsapp.appendChild(balaoMensagem);

    function exibirBalaoAleatoriamente() {
        if (Math.random() > 0.7) {
            balaoMensagem.classList.add('mostrar');
            setTimeout(() => {
                balaoMensagem.classList.remove('mostrar');
            }, 4000);
        }
    }

    setInterval(exibirBalaoAleatoriamente, 15000);
});

document.addEventListener("DOMContentLoaded", atualizarCarrinho);