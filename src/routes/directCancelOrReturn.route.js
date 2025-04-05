import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, getDirectReturnItems, getPoItemsandDirectReturnItems, getDirectReturnItemById } from '../controllers/directCancelOrReturn.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/getDirectReturnItems', getDirectReturnItems);

router.get('/getDirectReturnItems/:id/:billEntryId', getDirectReturnItemById);

router.get('/getPoItemsandDirectReturnItems', getPoItemsandDirectReturnItems);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;