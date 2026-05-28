import { Router } from 'express';
const router = Router();
import multerUpload, { multerUploadForGrid } from '../utils/multerUpload.js';

import { get, getOne, getSearch, create, update, remove, upload, kycFormController, removePartyBranch ,removePartyMaterial , getMaterialOne ,
updateMaterial
,getContactOne , updateContact ,  removePartyContact  , getPartyBranchOne, getPartyOutstandingBalance, getPartyCreditBalance, getPartyCreditAdjustment

 } from '../controllers/partyMaster.controller.js';

router.patch('/upload/:id', multerUpload.single('image'), upload);

router.post('/',multerUploadForGrid.array('image'), create, );

router.post('/kycform', multerUpload.single('image'), kycFormController);

router.get('/', get);

router.get('/:id', getOne);

router.get('/:id/outstanding-balance', getPartyOutstandingBalance);

router.get('/:id/credit-balance', getPartyCreditBalance);
router.get('/:id/credit-adjustment', getPartyCreditAdjustment);
router.get('/:id/credit-adjustment', getPartyCreditAdjustment);

router.get('/search/:searchKey', getSearch);

router.put('/:id' ,multerUploadForGrid.array('image'), update);


router.delete('/:id', remove);


router.get('/:id/partybranch', getPartyBranchOne);

router.delete('/:id/partybranch', removePartyBranch);




router.get('/:id/materialId', getMaterialOne);

router.put('/:id/materialId', updateMaterial);

router.delete('/:id/material' , removePartyMaterial);




router.get('/:id/contactId', getContactOne);

router.put('/:id/contactId', updateContact);

router.delete('/:id/contactId' , removePartyContact);




export default router;