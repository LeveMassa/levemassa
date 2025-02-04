const cardapio = document.getElementById('cardapio');

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
        descricao: 'Lasanha com base de abobrinha, molho pomodoro artesanal, lombo canadense, creme branco (requeijão com creme de leite e noz moscada) e queijo mozzarella.',
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
    `;
    cardapio.appendChild(div);
});

