import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config'; // Assumindo que 'config' suporta ESM ou é tratada
import User from '../models/User.js'; // Assumindo que o modelo de usuário usa ESM

const router = express.Router();

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Nome é obrigatório').not().isEmpty(),
    check('email', 'Inclua um email válido').isEmail(),
    check('password', 'Por favor, insira uma senha com 6 ou mais caracteres').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'Usuário com este email já existe' });
      }

      user = new User({
        name,
        email,
        password,
      });

      // Gerar o salt para o hashing da senha
      const salt = await bcrypt.genSalt(10);

      // Hashear a senha
      user.password = await bcrypt.hash(password, salt);

      // Salvar o usuário no banco de dados
      await user.save();

      // Payload do JWT
      const payload = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
      };

      // Gerar o JWT
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro do Servidor');
    }
  }
);

export default router;
