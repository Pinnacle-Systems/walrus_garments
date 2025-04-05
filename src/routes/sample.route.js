import { Router } from 'express';
const router = Router();
import multerUpload from '../utils/multerUpload.js';
import { multerUploadForGrid } from '../utils/multerUpload.js';


import { get, getOne, getSearch, create, update, remove, removeStyleImage, styleImageUpload } from '../controllers/sample.controller.js';


router.post('/', multerUploadForGrid.array('images'), create);


// router.post('/leadAttachment', multerUpload.single('file'), createAttachment);

// router.put('/leadAttachment/:id', multerUpload.single('file'), updateAttachment);

// router.delete('/leadAttachment/:id', deleteAttachment);

// router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

// router.put('/:id', update);
router.put('/:id', multerUploadForGrid.array('images'), update);


router.delete('/:id', remove);

router.patch('/styleImageUpload/:id', multerUpload.single('image'), styleImageUpload);

router.delete('/removeStyleImage/:id', removeStyleImage);


export default router;