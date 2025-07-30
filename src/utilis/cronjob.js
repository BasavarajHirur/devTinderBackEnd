const cron = require('node-cron');
const { ConnectRequestModel } = require('../models/connectionRequest');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const sendEmail = require('./sendemail.js');

cron.schedule('27 18 * * *', async () => {
    try {
        const yesterdayRequests = subDays(new Date(), 1);
        const yestrdayStart = startOfDay(yesterdayRequests);
        const yestrdayEnd = endOfDay(yesterdayRequests);

        const newRequests = await ConnectRequestModel.find({
            status: 'interested',
            createdAt: {
                $gte: yestrdayStart,
                $lt: yestrdayEnd
            }
        }).populate('fromUserId', 'toUserId');

        const emails = [...new Set(newRequests.map(req => req.toUserId.email))];

        console.log('Emails to notify:', emails);

        for (const email of emails) {
            try {
                await sendEmail.run(`New connection request from ${email}`, 'Please accept or reject the request.');
            } catch (emailError) {
                console.error(`Failed to send email to ${email}:`, emailError);
            }
        }
    } catch (error) {
        console.error('Error clearing old connection requests:', error);
    }
}
)