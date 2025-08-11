const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        process.env.DB_CONNECTION_SECRET, {
        tls: true,
        tlsAllowInvalidCertificates: false
    }
    )
}

module.exports = connectDB;