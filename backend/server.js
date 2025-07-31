const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv'); // Importar dotenv

dotenv.config(); // Carregar variáveis de ambiente do .env

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.get('/', (req, res) => res.send('API Running')); // Rota de teste existente
app.use('/api/auth', require('./routes/login')); // Rota de autenticação (login)
app.use('/api/users', require('./routes/register')); // Rota de usuários (registro)
app.use('/api/sales-notes', require('./routes/salesNotes')); // Rota de notas de venda

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));