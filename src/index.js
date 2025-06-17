const express = require('express');
const app = express();
const port = 3000;
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./router/auth');
const profileRouter = require('./router/profile');
const connectionRequestRouter = require('./router/connectionRequest');
const userRouter = require('./router/user');

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin:"http://localhost:4200",
        credentials: true
    }
));

app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', connectionRequestRouter);
app.use('/', userRouter);

connectDB().then(() => {
    console.log('connected to db');
    app.listen(port, () => {
        console.log('listening to server');
    })
}).catch((error) => {
    console.log('connection to db failed', error.message);
});