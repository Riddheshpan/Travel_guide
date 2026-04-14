const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

const sendOTP = async (email, otp) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`[WARNING] EMAIL_USER or EMAIL_PASS not set in .env. Falling back to local logging. OTP for ${email} is: ${otp}`);
        return true;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Password Reset OTP',
        html: `<p>Your OTP for password reset is: <b>${otp}</b>. It will expire in 5 minutes.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendOTP };
