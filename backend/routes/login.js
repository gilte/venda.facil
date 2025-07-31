const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

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
          // Incluir outras propriedades do usuário se o frontend precisar
        },
         // Data de expiração do JWT em segundos (Ex: 24 horas)
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
      };

      // Gerar o JWT
      jwt.sign(
        payload,
        config.get('jwtSecret'),
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

module.exports = router;
