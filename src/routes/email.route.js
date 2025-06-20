import express from 'express';
import { sendKycEmail } from '../controllers/emailController.js';

const router = express.Router();

router.post('/', sendKycEmail);

export default router;
