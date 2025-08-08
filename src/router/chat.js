const express = require('express');
const { jwtAuth } = require('../middleware/jwtAuth');
const chatRouter = express.Router();
const { chatModel } = require('../models/chat');

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

        console.log('Chat fetched successfully:', chat);
        res.status(200).json({ chat });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = chatRouter;