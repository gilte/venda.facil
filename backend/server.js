const express = require('express');
const connectDB = require('./config/db'); // Assumindo que você tem um arquivo de conexão com o BD
const app = express();

// Conectar ao Banco de Dados (Certifique-se de que esta função esteja implementada)
connectDB();

// Middleware para parsear JSON (para ler o corpo da requisição)
app.use(express.json({ extended: false }));

// Rota de teste simples
app.get('/', (req, res) => res.send('API Rodando'));

// Definir Rotas

// Montar a rota de registro no caminho /api/users
app.use('/api/users', require('./routes/register'));

// ** Precisaremos adicionar a rota de login aqui depois **
// app.use('/api/auth', require('./routes/login'));

// Adicione outras rotas aqui, por exemplo:
// app.use('/api/sales-notes', require('./routes/salesNotes'));

// A porta que o servidor vai escutar. Usando 5000 como no seu erro,
// mas pode ser 9002 ou outra porta definida nas variáveis de ambiente.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));