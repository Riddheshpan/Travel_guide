const mongoose = require('mongoose')

const url = process.env.db;

mongoose.connect(url)
    .then(() => {
        console.log("mongo connected")
    })
    .catch((err) => {
        console.log(err)
    })