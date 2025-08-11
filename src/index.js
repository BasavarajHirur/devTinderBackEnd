const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('./utilis/cronjob');

const authRouter = require('./router/auth');
const profileRouter = require('./router/profile');
const connectionRequestRouter = require('./router/connectionRequest');
const userRouter = require('./router/user');
const paymentRouter = require('./router/payment');
const chatRouter = require('./router/chat');

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: "http://localhost:4200",
        credentials: true
    }
));

app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', connectionRequestRouter);
app.use('/', userRouter);
app.use('/', paymentRouter);
app.use('/', chatRouter);


//Sockets setup
const http = require('http');
const initializeSocket = require('./utilis/socket');

const server = http.createServer(app);

initializeSocket(server);

connectDB().then(() => {
    console.log('connected to db')
    server.listen(port, () => {
        console.log('listening to server');  // With sockets
    })

    // app.listen(port, () => {
    //     console.log('listening to server');  // Normal way without sockets
    // })
}).catch((error) => {
    console.log('connection to db failed', error.message);
});