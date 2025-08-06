const express = require('express');
const { jwtAuth } = require('../middleware/jwtAuth');
const razorpayInstance = require('../utilis/razorpay');
const { membershipAmounts } = require('../utilis/constant');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')

const paymentRouter = express.Router();

paymentRouter.post('/payment/order', jwtAuth, async (req, res) => {

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
});

paymentRouter.post('/payment/webhook', async (req, res) => {
    try {
        //Refer code from razorpay docs for webhook validation (https://razorpay.com/docs/webhooks/validate-test/)
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const webhookSignature = req.get('x-razorpay-signature');
        const isValidWebHook = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, webhookSecret);

        if (!isValidWebHook) {
            return res.status(400).json({ message: 'Invalid webhook signature', error: true });
        }

        const { event, payload } = req.body;  // Refer https://razorpay.com/docs/webhooks/payloads/payments/
        const paymentDetails = payload.payment.entity

        //Update payment status in your database
        const payment = await PaymentModel.findOne({ orderId: paymentDetails.order_id });
        payment.status = paymentDetails.status;
        await payment.save();

        //Make user preimum
        const user = await UserModel.findOne({ _id: payment.userId });
        user.isPremium = true;
        user.memberShipDetails = payment.notes.membershipType;
        await user.save();

        // if (event === 'payment.captured') {}
        // if (event === 'payment.failed') {}

        //Return Success response to Razorpay
        return res.status(200).json({ message: 'Webhook received and processed successfully' });

    } catch (error) {
        res.status(400).json({ message: error.message, error: true });
    }
})

paymentRouter.get('/payment/premium/verify', jwtAuth, async (req, res) => {
    try {
        const user = req.user.toJSON();
        if (user.isPremium) {
            return res.status(200).json({ message: 'User is a premium member', isPremium: true });
        } else {
            return res.status(200).json({ message: 'User is not a premium member', isPremium: false });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message, error: true });
    }
})

module.exports = paymentRouter;