const express = require('express');
const { jwtAuth } = require('../middleware/jwtAuth');
const { ConnectRequestModel } = require('../models/connectionRequest');
const { UserModel } = require('../models/user');

const connectionRequestRouter = express.Router();

connectionRequestRouter.post('/request/send/:status/:toUserId', jwtAuth, async (req, res) => {
    try {
        const loggedUser = req.user;
        const toUserId = req.params.toUserId;
        const fromUserId = loggedUser._id;
        const status = req.params.status;

        if (toUserId.toString() === fromUserId.toString()) {
            throw new Error("Cannot sent request to yourself");
        }

        const isUserExist = await UserModel.findById(toUserId);

        if (!isUserExist) {
            throw new Error("User not Exist");
        }

        const ALLOWED_STATUS = ['interested', 'ignored'];
        if (!ALLOWED_STATUS.includes(status)) {
            throw new Error('Status not allowed');
        }

        const isExistingConnection = await ConnectRequestModel.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (isExistingConnection) {
            throw new Error('Connection already exists');
        }

        const connectionRequest = new ConnectRequestModel({ fromUserId, toUserId, status });
        await connectionRequest.save();
        res.json({ message: `${loggedUser.firstName} shows ${status} on ${isUserExist.firstName}` })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

connectionRequestRouter.post('/request/review/:status/:requestId', jwtAuth, async (req, res) => {
    try {
        const loggedUser = req.user;
        const status = req.params.status;
        const requestId = req.params.requestId;

        const ALLOWED_STATUS = ['accepted'];

        if (!ALLOWED_STATUS.includes(status)) {
            throw new Error('Status not allowed');
        }

        const connectionRequest = await ConnectRequestModel.findOne(
            {
                _id: requestId,
                toUserId: loggedUser._id,
                status: 'interested'
            }
        );

        if (!connectionRequest) {
            throw new Error("Connection not Found");
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: `${loggedUser.firstName} ${status} request.`, data })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

module.exports = connectionRequestRouter;