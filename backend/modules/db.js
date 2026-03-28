const mongoose = require('mongoose');

const url = process.env.db;

mongoose.connect(url, {
    serverSelectionTimeoutMS: 30000,  // 30s to pick a server
    heartbeatFrequencyMS: 10000,      // check server every 10s
    socketTimeoutMS: 45000,           // close sockets after 45s of inactivity
})
    .then(() => {
        console.log('✅ MongoDB connected');
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
    });

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect…');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});