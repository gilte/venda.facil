import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

import SalesNote from '../models/SalesNote.js';

// @route    GET api/sales-notes
// @desc     Get all sales notes for a user
// @access   Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const notes = await SalesNote.find({ user: req.user.id }).sort({ date: -1 });
  res.json(notes);
}));

// @route    POST api/sales-notes
// @desc     Create a sales note
// @access   Private
router.post(
  '/',
  [auth, [
    check('customerName', 'O nome do cliente é obrigatório').not().isEmpty(),
    check('customerAge', 'A idade deve ser um número').isNumeric(),
    check('customerGender', 'Gênero inválido').isIn(['Masculino', 'Feminino', 'Outro']),
    check('productPurchased', 'O nome do produto é obrigatório').not().isEmpty(),
    check('purchaseAmount', 'O valor deve ser um número positivo').isFloat({ gt: 0 }),
    check('paymentMethod', 'Método de pagamento inválido').isIn(['Cartão de Crédito', 'Espécie']),
    check('paymentStatus', 'Status de pagamento inválido').isIn(['À vista', 'A prazo']),
    // Adicionar validação condicional para installments se paymentStatus for 'A prazo'
    check('installments', 'A quantidade de vezes é obrigatória para pagamento a prazo').optional().isInt({ gt: 0 }).custom((value, { req }) => {
      if (req.body.paymentStatus === 'A prazo' && (!value || value <= 0)) {
        throw new Error('A quantidade de vezes é obrigatória para pagamento a prazo');
      }
      return true;
    }),
  ]],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerAge, customerGender, productPurchased, purchaseAmount, paymentMethod, paymentStatus, installments } = req.body;

    try {
      const newNote = new SalesNote({
        user: req.user.id,
        customerName,
        customerAge,
        customerGender,
        productPurchased,
        purchaseAmount,
        paymentMethod,
        paymentStatus,
        installments: paymentStatus === 'A prazo' ? installments : undefined, // Salvar installments apenas se for a prazo
      });

      const note = await newNote.save();

      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  })
);

export default router;