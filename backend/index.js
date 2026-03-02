const express = require('express');
const app = express();
const body_p = require('body-parser');
const cors = require('cors');
require('dotenv').config({ override: true }); // override: true ensures .env beats any system env vars
require('./modules/db');

const authRoute = require('./route/authRoute');
const postRoute = require('./route/postRoute'); // ✅ Added
const userRoute = require('./route/userRoute'); // ✅ Added

const PORT = process.env.PORT || 8080;

app.use(body_p.json());
app.use(cors());

app.use('/auth', authRoute);
app.use('/api/posts', postRoute); // ✅ Registered post route
app.use('/api/user', userRoute); // ✅ Registered user route

app.get('/ping', (req, res) => {
    res.send("Pong");
});

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`);
});
