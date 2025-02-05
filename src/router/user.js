const express = require('express');
const { jwtAuth } = require('../middleware/jwtAuth');
const { ConnectRequestModel } = require('../models/connectionRequest');
const { UserModel } = require('../models/user');

const userRouter = express.Router();
const SHOW_INFO = ['firstName', 'lastName', 'age', 'skills', 'photoUrl', 'about', 'gender'];

userRouter.get('/users/connection', jwtAuth, async (req, res) => {
    const loggedInUser = req.user;
    const requests = await ConnectRequestModel.find({
        $or: [
            {
                status: 'accepted',
                toUserId: loggedInUser._id
            },
            {
                status: 'accepted',
                fromUserId: loggedInUser._id
            }
        ]
    }).populate('fromUserId', SHOW_INFO).populate('toUserId', SHOW_INFO);

    const data = requests.map(row => {
        if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
            return row.toUserId;
        }

        return row.fromUserId
    })

    res.json({ data });
})

userRouter.get('/users/request/received', jwtAuth, async (req, res) => {
    const loggedInUser = req.user;
    const requests = await ConnectRequestModel.find(
        {
            status: 'interested',
            toUserId: loggedInUser._id
        },
    ).populate('fromUserId', SHOW_INFO);

    res.json({ data: requests });
})

userRouter.get('/users/feed', jwtAuth, async (req, res) => {
    try {
        //Pagination
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = Math.min(limit, 50);
        const skip = (page - 1) * limit;
        //1.should not show his own profile
        //2.should not show profile which is already matched or already sent request or already ignored
        const loggedInUser = req.user;

        const connections = await ConnectRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ]
        }).select('fromUserId toUserId');

        const hiddenConnections = new Set();
        connections.forEach((connection) => {
            hiddenConnections.add(connection.fromUserId.toString());
            hiddenConnections.add(connection.toUserId.toString());
        });

        const feedUser = await UserModel.find({
            $and: [
                { _id: { $nin: Array.from(hiddenConnections) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select(SHOW_INFO) //select only neccessary fields from DB
            .skip(skip).limit(limit); // Pagination


        res.json({ data: feedUser });

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

module.exports = userRouter;