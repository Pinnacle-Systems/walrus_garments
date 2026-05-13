import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, cancel, checkReferenceNumber, getPartyCreditBalance } from '../controllers/pointOfSales.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/check-ref', checkReferenceNumber);
router.get('/credit-balance', getPartyCreditBalance);

router.get('/:id', getOne);


router.put('/:id', update);
router.put('/cancel/:id', cancel);

router.delete('/:id', remove);

export default router;
