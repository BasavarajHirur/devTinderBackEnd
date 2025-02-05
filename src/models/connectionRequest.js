const mongoose = require('mongoose');

const connectionRequestSchema = mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String,
        enum: {
            values: ['ignored', 'interested', 'accepted', 'rejected'],
            message: 'Invalid status'
        },
    }
},
    { timestamps: true }
)

const ConnectRequestModel = mongoose.model('connectRequests', connectionRequestSchema);

module.exports = { ConnectRequestModel };