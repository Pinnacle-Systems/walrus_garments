import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, cancel, checkReferenceNumber, getPartyCreditBalance, requestDiscount, approveDiscount } from '../controllers/pointOfSales.controller.js';


router.post('/', create);

router.post('/request-discount', requestDiscount);

router.get('/', get);

router.get('/check-ref', checkReferenceNumber);

router.get('/credit-balance', getPartyCreditBalance);

router.get('/:id', getOne);

router.put('/:id', update);

router.put('/approve-discount/:id', approveDiscount);

router.put('/cancel/:id', cancel);

router.delete('/:id', remove);

export default router;
