import express from 'express';
import auth from '../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import SalesNote from '../models/SalesNote.js';

const router = express.Router();

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
  [
    auth,
    [
      check('customerName', 'O nome do cliente é obrigatório').not().isEmpty(),
      check('customerAge', 'A idade deve ser um número').isNumeric(),
      check('customerGender', 'Gênero inválido').isIn(['Masculino', 'Feminino', 'Outro']),
      check('productPurchased', 'O nome do produto é obrigatório').not().isEmpty(),
      check('purchaseAmount', 'O valor deve ser um número positivo').isFloat({ gt: 0 }),
      check('paymentMethod', 'Método de pagamento inválido').isIn(['Cartão de Crédito', 'Espécie']),
      check('paymentStatus', 'Status de pagamento inválido').isIn(['À vista', 'A prazo']),
      check('installments').optional().custom((value, { req }) => {
        if (req.body.paymentStatus === 'A prazo' && (value === undefined || value === null || value <= 0)) {
          throw new Error('A quantidade de vezes é obrigatória para pagamento a prazo');
        }
        return true;
      }),
    ],
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customerName,
      customerAge,
      customerGender,
      productPurchased,
      purchaseAmount,
      paymentMethod,
      paymentStatus,
      installments,
    } = req.body;

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
        installments: paymentStatus === 'A prazo' ? installments : undefined,
      });

      const note = await newNote.save();
      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  })
);

// @route    PUT api/sales-notes/:id
// @desc     Update a sales note
// @access   Private
router.put('/:id', auth, asyncHandler(async (req, res) => {
    const note = await SalesNote.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ msg: 'Nota não encontrada' });
    }

    // Certifique-se de que o usuário possui a nota
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    const { customerName, customerAge, customerGender, productPurchased, purchaseAmount, paymentMethod, paymentStatus, installments } = req.body;

    const updatedNote = await SalesNote.findByIdAndUpdate(
        req.params.id,
        { $set: { customerName, customerAge, customerGender, productPurchased, purchaseAmount, paymentMethod, paymentStatus, installments } },
        { new: true }
    );

    res.json(updatedNote);
}));


// @route    DELETE api/sales-notes/:id
// @desc     Delete a sales note
// @access   Private
router.delete('/:id', auth, asyncHandler(async (req, res) => {
    const note = await SalesNote.findById(req.params.id);

    if (!note) {
        return res.status(404).json({ msg: 'Nota não encontrada' });
    }

    if (note.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Não autorizado' });
    }

    await SalesNote.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Nota removida' });
}));


export default router;
