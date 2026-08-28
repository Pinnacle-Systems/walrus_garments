import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, saleOrderIscompleted } from '../controllers/saleOrder.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.put('/iscompleted/:id/:iscompleted/:action', saleOrderIscompleted);


router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;