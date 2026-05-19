import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, approve } from '../controllers/saleDelivery.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/approve/:id/:finYearId', approve);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;