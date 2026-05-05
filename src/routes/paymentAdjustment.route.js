import express from 'express';
import { get, getOne, create, update, remove } from '../controllers/paymentAdjustment.controller.js';

const router = express.Router();

router.get('/', get);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
