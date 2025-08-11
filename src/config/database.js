const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://basavarajhirur746:Bassu%4090711@devtinder.g5ldi.mongodb.net/DevStack", {
        tls: true,
        tlsAllowInvalidCertificates: false
    }
    )
}

module.exports = connectDB;