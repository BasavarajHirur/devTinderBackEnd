const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
        enum: ['INR', 'USD', 'EUR'], // Add more currencies as needed
    },
    status: {
        type: String
    }
}, { timestamps: true });

const PaymentModel = mongoose.model('payments', paymentSchema);

module.exports = { PaymentModel };