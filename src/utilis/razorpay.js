const Razorpay = require('razorpay');

var instance = new Razorpay({
    key_id: 'YOUR_KEY_ID',// Temporarily replace with your Razorpay key ID
    key_secret: 'YOUR_KEY_SECRET',//temporarily replace with your Razorpay key secret
});

module.exports = instance;