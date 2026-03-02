const { signup, login } = require('../controller/authController');
const { signupValidation, loginValidation } = require('../middleware/autMiddleware');

const router = require('express').Router();

router.post('/login', loginValidation, login);

router.post('/signin', signupValidation, signup)

module.exports = router