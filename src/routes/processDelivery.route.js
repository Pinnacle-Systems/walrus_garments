import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, getProcessDeliveryProgramItems } from '../controllers/processDelivery.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/getProcessDeliveryProgramItems', getProcessDeliveryProgramItems);

router.get('/:id/:processInwardId/:processDeliveryReturnId', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;