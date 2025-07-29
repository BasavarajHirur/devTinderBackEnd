const express = require('express');
const bcrypt = require('bcrypt');
const { UserModel } = require('../models/user');
const jwt = require('jsonwebtoken');
const { isValidData } = require('../utilis/validation');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        const passwordHash = await bcrypt.hash(userData.password, 10);
        const user = new UserModel({ ...userData, password: passwordHash });

        const savedUser = await user.save();
        const token = jwt.sign({ _id: savedUser._id }, process.env.SECRET_KEY);
        
        res.cookie('token', token);
        res.json({ message: "User Added Successfully!", data: savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message, error: true });
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        isValidData(req.body);
        const user = await UserModel.findOne({ email });

        if (!user) {
            throw new Error("Incorrect Information, Please try again..!")
        }

        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            throw new Error("Incorrect Information, Please try again..!")
        }

        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
        res.cookie('token', token);
        res.json({ message: "User logged in successfully!", data: user })
    } catch (error) {
        res.status(400).json({ message: error.message, error: true });
    }
})

authRouter.post('/logout', async (req, res) => {
    res.cookie('token', null, { expires: new Date(Date.now()) });
    res.json({ message: "Logged out Successfully..!" })
})

module.exports = authRouter;