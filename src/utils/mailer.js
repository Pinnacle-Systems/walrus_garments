import { createTransport } from 'nodemailer';

const MAIL_SETTINGS = {
    service: 'gmail',
    auth: {
        user: "pinnacle.systems.ps@gmail.com",
        pass: "cfim ylyo teby zdia",
    },
}

const transporter = createTransport(MAIL_SETTINGS);

export async function sendMail(params) {
    try {
        let info = await transporter.sendMail({
            from: MAIL_SETTINGS.auth.user,
            to: params.to,
            subject: 'Hello ✔',
            html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Hospital Management System</h2>
          <h4>OTP for Reset Password ✔</h4>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
     </div>
      `,
        });
        return info;
    } catch (error) {
        console.log(error);
        return false;
    }
}
export async function sendMailkycForm(params) {

        // Sending the email
        let info = await transporter.sendMail({
            from: MAIL_SETTINGS.auth.user,
            to: params.to,
            subject: 'KYC Update Form - Sangeetha Textiles',
            html: `
                <div class="container" style="max-width: 90%; margin: auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="color: #333;">Sangeetha Textiles</h2>
                    <h4 style="color: #555;">KYC Update Form Link ✔</h4>
                    <p>Dear Customer,</p>
                    <p>Please click the link below to update your KYC details:</p>
                    <a href="https://sangeetha.pinnaclesystems.co.in/#/kyc-form" 
                       style="display: inline-block; margin: 10px 0; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">
                       Update KYC Form
                    </a>
                    <p>Thank you for choosing Sangeetha Textiles.</p>
                    <p>Regards,<br>Sangeetha Textiles Team</p>
                </div>
            `,
        });

        console.log(info, "info");

        if (info && info.response && info.response.startsWith('250')) {
            console.log("Email sent successfully");
            return { success: true, message: 'Email sent successfully', info };
        } else {
            console.error("Email sending failed: ", info.response);
            return { success: false, message: 'Email sending failed', info };
        }
    
}


