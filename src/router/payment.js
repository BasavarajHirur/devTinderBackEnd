const express = require('express');
const paymentRouter = express.Router();
const { jwtAuth } = require('../middleware/jwtAuth');
const razorpayInstance = require('../utilis/razorpay');
const { membershipAmounts } = require('../utilis/constant');

paymentRouter.post('payment/order', jwtAuth, async (req, res) => {

    const { membershipType } = req.body;
    const { firstName, lastName, email } = req.user;
    try {
        const options = {
            "amount": membershipAmounts[membershipType] * 100, // amount in the smallest currency unit (e.g., paise for INR)
            "currency": "INR",
            "receipt": "receipt#1",
            "partial_payment": false, //Optional, set to true if you want to allow partial payments
            "notes": {
                firstName,
                lastName,
                email,
                membershipType
            }
        };

        const order = await razorpayInstance.orders.create(options);

        //Save it in database
        const payment = new PaymentModel({
            userId: req.user._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            status: order.status
        });

        const savedPayment = await payment.save();


        //send the order details to the client
        res.json({ ...savedPayment.toJSON() });
    }
    catch (error) {
        res.status(400).json({ message: error.message, error: true });
    }
})

module.exports = paymentRouter;