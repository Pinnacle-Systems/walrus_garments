import { Router } from 'express';
const router = Router();
import multerUpload from '../utils/multerUpload.js';

import { get, getOne, getSearch, create, update, remove, upload, kycFormController, removePartyBranch ,removePartyMaterial , getMaterialOne ,
updateMaterial

 } from '../controllers/partyMaster.controller.js';

router.patch('/upload/:id', multerUpload.single('image'), upload);

router.post('/', create);

router.post('/kycform', multerUpload.single('image'), kycFormController);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);


router.delete('/:id', remove);

router.delete('/:id/partybranch', removePartyBranch);

router.delete('/:id/material' , removePartyMaterial);

router.get('/:id/materialId', getMaterialOne);

router.put('/:id/materialId', updateMaterial);


export default router;