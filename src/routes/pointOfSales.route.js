import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, checkReferenceNumber } from '../controllers/pointOfSales.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/check-ref', checkReferenceNumber);

router.get('/:id', getOne);


router.put('/:id', update);

router.delete('/:id', remove);

export default router;