document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('index')) {
        configurarPaginaPrincipal();
    }
    if (document.body.classList.contains('addprod')) {
        configurarPaginaAdicionarProduto();
    }
});

function configurarPaginaPrincipal() {
    // Adicionando botões de filtros antes dos produtos
    const cardapio = document.getElementById('cardapio');
    const carrinho = [];
    let produtos = [];

    const filtrosContainer = document.createElement('div');
    filtrosContainer.classList.add('filtros-container');
    filtrosContainer.style.display = 'flex';
    filtrosContainer.style.justifyContent = 'center';
    filtrosContainer.style.gap = '10px';
    filtrosContainer.style.marginTop = '20px';

    // Verifica se o elemento cardapio existe antes de inserir os filtros
    if (cardapio && cardapio.parentNode) {
        cardapio.parentNode.insertBefore(filtrosContainer, cardapio);
    } else {
        console.error('O elemento com ID "cardapio" não foi encontrado no DOM.');
    }

    // Contêiner do carrinho
    const carrinhoContainer = document.createElement('div');
    carrinhoContainer.classList.add('carrinho-flutuante');
    document.body.appendChild(carrinhoContainer);

    // Botão do carrinho
    const carrinhoBotao = document.createElement('button');
    carrinhoBotao.classList.add('botao-carrinho');
    carrinhoBotao.innerHTML = '🛒 Ver Carrinho';
    carrinhoBotao.onclick = () => {
        carrinhoContainer.classList.toggle('mostrar');
        atualizarCarrinho();
    };    
    document.body.appendChild(carrinhoBotao);

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
            mensagemVazio.style.textAlign = 'center';
            mensagemVazio.style.marginTop = '20px';
            mensagemVazio.style.color = '#333';
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
    
        // Adiciona o botão "Pedir" ao final do carrinho
        const botaoPedir = document.createElement('button');
        botaoPedir.textContent = 'Pedir';
        botaoPedir.classList.add('botao-pedir');
    
        // Define o estado do botão baseado no carrinho
        if (carrinho.length === 0) {
            botaoPedir.disabled = true;
            botaoPedir.style.backgroundColor = '#ccc';
            botaoPedir.style.cursor = 'not-allowed';
        } else {
            botaoPedir.disabled = false;
            botaoPedir.style.backgroundColor = '#25d366';
            botaoPedir.style.cursor = 'pointer';
    
            botaoPedir.onclick = () => {
                const numeroWhatsApp = '5527995263903';
                const mensagem = gerarMensagemWhatsApp();
                window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
            };
        }
    
        carrinhoContainer.appendChild(botaoPedir);
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

    // Gerar os filtros com base na primeira palavra do nome dos produtos
    const gerarFiltros = () => {
        const categorias = [...new Set(produtos.map(produto => produto.nome.split(' ')[0]))];

        categorias.forEach(categoria => {
            const botaoFiltro = document.createElement('button');
            botaoFiltro.classList.add('contador-mais', 'unico');
            botaoFiltro.textContent = categoria;
            botaoFiltro.onclick = (e) => selecionarFiltro(e, categoria);
            filtrosContainer.appendChild(botaoFiltro);
        });

        const botaoTodos = document.createElement('button');
        botaoTodos.classList.add('contador-mais', 'unico');
        botaoTodos.textContent = 'Todos';
        botaoTodos.onclick = (e) => selecionarFiltro(e, 'Todos');
        filtrosContainer.insertBefore(botaoTodos, filtrosContainer.firstChild);
    };

    // Seleciona e destaca o filtro ativo
    const selecionarFiltro = (event, categoria) => {
        const botoes = filtrosContainer.querySelectorAll('button');
        botoes.forEach(botao => botao.classList.remove('ativo'));
        event.target.classList.add('ativo');

        if (categoria === 'Todos') {
            exibirTodosProdutos();
        } else {
            filtrarProdutos(categoria);
        }
    };

    // Filtrar produtos pela primeira palavra do nome
    const filtrarProdutos = (categoria) => {
        cardapio.innerHTML = '';
        const produtosFiltrados = produtos.filter(produto => produto.nome.startsWith(categoria));
        exibirProdutos(produtosFiltrados);
    };

    // Exibir todos os produtos
    const exibirTodosProdutos = () => {
        cardapio.innerHTML = '';
        exibirProdutos(produtos);
    };

    // Renderiza os produtos na tela
    const exibirProdutos = (listaProdutos) => {
        listaProdutos.forEach(produto => {
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
    };

    // Carrega produtos do JSON e gera os filtros
    fetch('produtos.json')
        .then(response => response.json())
        .then(data => {
            produtos = data;
            gerarFiltros();
            exibirProdutos(produtos);
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
                // Remove "R$ " e substitui "," por "."
                let precoLimpo = String(item.preco).replace("R$", "").trim().replace(",", ".");
                let precoUnitario = parseFloat(precoLimpo) || 0; // Converte para número
                let precoTotalItem = precoUnitario * item.quantidade;

                mensagem += `    - ${item.quantidade}x ${item.nome} - R$${precoTotalItem.toFixed(2)}\n`;
                total += precoTotalItem;
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

    // Funções para manipular o carrinho
    window.adicionarAoCarrinho = adicionarAoCarrinho;
    window.removerItem = removerItem;
    window.alterarQuantidade = alterarQuantidade;
    window.limparCarrinho = limparCarrinho;
}


//Add Produto
function configurarPaginaAdicionarProduto() {
    // Senha aqui
    const senhaCorreta = "logan275";

    document.querySelector('#password-section button').addEventListener('click', checkPassword);
    document.querySelector('#form-section button').addEventListener('click', adicionarProduto);

    function checkPassword() {
        const senha = document.getElementById('password').value;
        if (senha === senhaCorreta) {
            document.getElementById('password-section').classList.add('hidden');
            document.getElementById('form-section').classList.remove('hidden');
        } else {
            alert('Senha incorreta!');
        }
    }

    function adicionarProduto() {
        const nome = document.getElementById('nome').value;
        const descricao = document.getElementById('descricao').value;
        const preco = document.getElementById('preco').value;
        const imagemInput = document.getElementById('imagem');

        if (!nome || !descricao || !preco || imagemInput.files.length === 0) {
            alert('Todos os campos devem ser preenchidos!');
            return;
        }

        const imagemFile = imagemInput.files[0];
        const imagemNome = imagemFile.name;

        const imagemPath = `assets/${imagemNome}`;

        const novoProduto = {
            imagem: imagemPath,
            nome: nome,
            descricao: descricao,
            preco: preco
        };

        let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        produtos.push(novoProduto);
        localStorage.setItem('produtos', JSON.stringify(produtos));

        alert('Produto adicionado com sucesso! Agora mova a imagem manualmente para a pasta assets.');
        window.location.reload();
    }
}
