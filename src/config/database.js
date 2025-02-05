const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        'mongodb+srv://basavarajhirur746:Bassu%407760@devtinder.g5ldi.mongodb.net/DevStack?retryWrites=true&w=majority', {
        tls: true,
        tlsAllowInvalidCertificates:false
    }
    )
}

module.exports = connectDB;