import { sendMailkycForm } from '../utils/mailer.js'; // Correct import path

export const sendEmail = async (req, res) => {
    const { to } = req.body;
    console.log("its working")

    // Validate the email address
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return res.status(400).json({ status: 'error', message: 'Invalid or missing email address.' });
    }

  
        const result = await sendMailkycForm({ to });
        console.log(result.success,"result for sendMail")

        if (result.success) {
              return { statusCode: 0 };
        } else {
            // If email sending failed
            console.error('Email sending failed:', result ? result.message : 'Unknown error');
            return res.status(500).json({ status: 'error', message: 'Failed to send KYC email. Please try again later.' });
        }
    
};
