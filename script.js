const cardapio = document.getElementById('cardapio');

const produtos = [
    {
        imagem: '4-queijos.jpeg',
        nome: 'Pizza 4 Queijos Magnífica (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, mozzarella, gorgonzola, parmesão e requeijão cremoso.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'calabresa.jpeg',
        nome: 'Pizza Calabresa (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, mozzarella, calabresa e cebola.',
        preco: 'R$ 32,00'
    },
    {
        imagem: 'frangoporo.jpeg',
        nome: 'Pizza Frango Poró (25cm)',
        descricao: 'Massa de arroz, molho artesanal, mozzarella, frango temperado, alho-poró, creme de queijo e castanha.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'portuguesa.jpeg',
        nome: 'Pizza Portuguesa (25cm)',
        descricao: 'Massa de arroz, molho artesanal, calabresa, presunto, queijo, pimentão colorido, azeitona, ovo e orégano.',
        preco: 'R$ 35,00'
    },
    {
        imagem: 'presunto.png',
        nome: 'Pizza Presunto (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, mozzarella e presunto.',
        preco: 'R$ 32,00'
    },
    {
        imagem: 'marguerita.png',
        nome: 'Pizza Marguerita (25cm)',
        descricao: 'Massa de arroz, molho artesanal, mozzarella, tomate cereja e manjericão.',
        preco: 'R$ 30,00'
    },
    {
        imagem: 'mandala.png',
        nome: 'Pizza Vegana Mandala de Pesto (25cm)',
        descricao: 'Massa de arroz, molho pomodoro, berinjela, molho pesto artesanal e tomate seco.',
        preco: 'R$ 32,00'
    },
    {
        imagem: 'nhoque.png',
        nome: 'Nhoque à Bolonhesa',
        descricao: 'Massa de arroz e batata com provolone, recheada com queijo, molho artesanal e temperos naturais.',
        preco: 'R$ 35,00'
    }
];

produtos.forEach(produto => {
    const div = document.createElement('div');
    div.classList.add('produto');
    div.innerHTML = `
        <img src="./assets/${produto.imagem}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
        <p>${produto.descricao}</p>
        <p><strong>${produto.preco}</strong></p>
    `;
    cardapio.appendChild(div);
});
