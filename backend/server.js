import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import dotenv from 'dotenv';
import loginRoute from './routes/login.js';
import testRoute from './routes/testRoute.js';
import salesNotesRoute from './routes/salesNotes.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors({
    origin: [
        'https://6000-firebase-studio-1753986861394.cluster-duylic2g3fbzerqpzxxbw6helm.cloudworkstations.dev',
    ],
    credentials: true,


}));

app.use(express.json({ extended: false }));

// Define Routes
app.get('/', (req, res) => res.send('API Running')); // Rota de teste existente
app.use('/api/auth', loginRoute);
// app.use('/api/users', require('./routes/register')); // Rota de usuários (registro) - Comentado
app.use('/api/users', testRoute);
app.use('/api/sales-notes', salesNotesRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));