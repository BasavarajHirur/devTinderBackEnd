const socket = require('socket.io');
const { chatModel } = require('../models/chat');
const { ConnectRequestModel } = require('../models/connectionRequest');

const initializeSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: "http://localhost:4200",
        }
    });

    io.on('connection', (socket) => {
        //Handle Events
        socket.on('joinChat', ({ currentUserId, targetUserId }) => {
            const roomId = [currentUserId, targetUserId].sort().join("_"); // You can set a unique room ID based on user IDs
            socket.join(roomId);
            console.log(`User joined room: ${roomId}`);
        })

        socket.on('sendMessage', async ({ firstName, lastName, currentUserId, targetUserId, message }) => {
            const roomId = [currentUserId, targetUserId].sort().join("_");

            try {
                console.log('roo',roomId)
                //Check currentUserID and targetUserId both are friends before sending message
                const connection = await ConnectRequestModel.findOne({
                    $or: [
                        { fromUserId: currentUserId, toUserId: targetUserId, status: 'accepted' },
                        { fromUserId: targetUserId, toUserId: currentUserId, status: 'accepted' }
                    ]
                });

                if (connection) {
                    let chat = await chatModel.findOne({
                        participants: { $all: [currentUserId, targetUserId] }
                    });

                    if (!chat) {
                        chat = new chatModel({
                            participants: [currentUserId, targetUserId],
                            messages: []
                        });
                    }

                    chat.messages.push({
                        senderId: currentUserId,
                        text: message
                    });

                    await chat.save();

                    io.to(roomId).emit('receiveMessage', { firstName, lastName, message });
                }

            } catch (error) {
                console.error('Error sending message:', error);
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected');
        })
    })
}

module.exports = initializeSocket;