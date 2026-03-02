const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const user_Schema = new Schema({
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        unique: true
    },
    UserId: {
        type: String,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
});

const userModel = mongoose.model('user', user_Schema);
module.exports = userModel;