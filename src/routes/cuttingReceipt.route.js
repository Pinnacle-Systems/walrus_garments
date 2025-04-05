import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, getCuttingOrderDetailAllReadyReceivedQty, getCuttingOrderDeliveryDetailAllReadyConsumedQty } from '../controllers/cuttingReceipt.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/getCuttingOrderDetailAllReadyReceivedQty/:id/:cuttingReceiptInwardDetailsId', getCuttingOrderDetailAllReadyReceivedQty);

router.get('/getCuttingOrderDeliveryDetailAllReadyConsumedQty/:id/:fabricConsumptionDetailsId', getCuttingOrderDeliveryDetailAllReadyConsumedQty);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;