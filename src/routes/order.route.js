import { Router } from 'express';
import { multerUploadForGrid } from '../utils/multerUpload.js';
const router = Router();
import { get, getOne, create, update, remove, getOrderItemsById, getOrderItemsByIdNew  , getOrderItems  ,getStockvalidationById, getOneNew  } from '../controllers/order.controller.js';

import multer from 'multer';

const upload = multer()


router.post('/', multerUploadForGrid.array('images'), create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/orderItems', getOrderItems);

router.get('/:id/getOrderNew/:requirement/:packingCategory/:packingType', getOneNew);


router.get('/getOrderItems/:id/:prevProcessId/:packingCategory/:packingType', getOrderItemsById);

router.get('/getOrderItemsNew/:id/:stockValidation', getOrderItemsByIdNew);

router.get('/stockValidation/:id', getStockvalidationById);

// router.put('/:id', update);
router.put('/:id', multerUploadForGrid.array('images'), update);

router.delete('/:id', remove);

export default router;