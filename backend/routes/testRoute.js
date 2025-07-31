import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Router de teste funcionando!');
});

export default router;