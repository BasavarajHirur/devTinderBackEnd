const express = require('express');
const { jwtAuth } = require('../middleware/jwtAuth');
const chatRouter = express.Router();
const { chatModel } = require('../models/chat');

//All chats for respective user
chatRouter.get('/chatList', jwtAuth, async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await chatModel.aggregate([
            // Step 1: Only chats where user is a participant
            {
                $match: {
                    participants: { $all: [userId] }
                }
            },
            //Remove loggedIn user from participant
            {
                $addFields: {
                    participants: { $setDifference: ["$participants", [userId]] }
                }
            },
            // Step 2: Only send participants + last message
            {
                $project: {
                    participants: 1,
                    lastMessage: { $arrayElemAt: ["$messages", -1] }
                }
            },
            // Step 3: Sort by latest message
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        await chatModel.populate(chats, [
            { path: "participants", select: "firstName lastName" },
            { path: "lastMessage.senderId", select: "firstName lastName" }
        ]);

        res.status(200).json({ chatList: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

//Individual chats
chatRouter.get('/chat/:targetUserId', jwtAuth, async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const userId = req.user._id;

        let chat = await chatModel.findOne({
            participants: { $all: [userId, targetUserId] }
        }).populate({
            path: 'messages.senderId',
            select: 'firstName lastName'
        })

        if (!chat) {
            chat = new chatModel({
                participants: [userId, targetUserId],
                messages: []
            })

            await chat.save();
        }

        res.status(200).json({ chat });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = chatRouter;