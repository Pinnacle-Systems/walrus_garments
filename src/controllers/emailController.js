import { sendEmail } from '../services/emailService.js';

export const sendKycEmail = async (req, res) => {
    console.log(res.statusCode,"res")
       try {
        res.json(await sendEmail(req));
        console.log(res.statusCode);
    } catch (err) {
        console.error(`Error `, err.message);
    }
};
