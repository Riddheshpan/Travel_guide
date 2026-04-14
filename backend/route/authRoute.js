const { signup, login, forgotPassword, verifyOTP, resetPassword, verifyAccount } = require('../controller/authController');
const { signupValidation, loginValidation } = require('../middleware/autMiddleware');

const router = require('express').Router();

router.post('/login', loginValidation, login);

router.post('/signin', signupValidation, signup);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/verify-account', verifyAccount);

module.exports = router