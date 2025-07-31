import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import registerRoute from './routes/register.js';
import loginRoute from './routes/login.js';
import salesNotesRoute from './routes/salesNotes.js';


const app = express();

// Enable CORS
app.use(cors());

// Conectar ao Banco de Dados
connectDB();

// Middleware para parsear JSON
app.use(express.json({ extended: false }));

// Rota de teste simples
app.get('/', (req, res) => res.send('API Rodando'));

// Definir Rotas
app.use('/api/users', registerRoute);
app.use('/api/auth', loginRoute);
app.use('/api/sales-notes', salesNotesRoute);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
