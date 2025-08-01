import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, '../config/default.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));


// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('password', 'A senha é obrigatória').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }

      // Comparar a senha fornecida com a senha hasheada no banco de dados
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }

      // Payload do JWT (igual ao do cadastro)
      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };

      // Gerar o JWT
      jwt.sign(
        payload,
        config.jwtSecret,
        { expiresIn: '1h' }, // Opcional: tempo de expiração no lado do servidor também
        (err, token) => {
          if (err) throw err;
          res.json({ token }); // Retornar o token na resposta
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro do Servidor');
    }
  }
);

export default router;
