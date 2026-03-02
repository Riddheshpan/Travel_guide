const joi = require('joi');

const signupValidation = (req, res, next) => {
    const schema = joi.object({
        fName: joi.string().max(100).min(2).required(),
        lName: joi.string().max(100).min(2).required(),
        userId: joi.string().max(100).min(2).required(),
        email: joi.string().email().required(),
        password: joi.string().max(100).min(4).required()
    })
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message
        });
    }
    next();
};

const loginValidation = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().max(100).min(4).required()
    })
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.details[0].message
        });
    }
    next()
};

module.exports = {
    signupValidation,
    loginValidation
}