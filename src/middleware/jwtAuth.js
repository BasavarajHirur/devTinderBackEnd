const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/user');

const jwtAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const { token } = cookie;

        if (!token) {
            return res.status(401).send({ message: 'Please Login..!' });
        }

        const decodeMessage = await jwt.verify(token, process.env.SECRET_KEY);
        const { _id } = decodeMessage;
        const user = await UserModel.findOne({ _id });

        if (!user) {
            throw new Error("User Not Found");
        }

        req.user = user;
        next()
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}

module.exports = { jwtAuth };