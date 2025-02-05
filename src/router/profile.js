const express = require('express');
const { jwtAuth } = require('../middleware/jwtAuth');
const { UserModel } = require('../models/user');
const { isValidProfileData } = require('../utilis/validation');

const profileRouter = express.Router();

profileRouter.get("/profile/view", jwtAuth, async (req, res) => {
    try {
        const user = req.user;
        res.json({ data: user })
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

profileRouter.patch("/profile/edit", jwtAuth, async (req, res) => {
    try {
        const userData = req.body;
        const loggedInUser = req.user;
        const isAllowed = isValidProfileData(userData);

        if (!isAllowed) {
            throw new Error("Update is not allowed! Please fill in all fields with correct information.");
        }

        //const user = await UserModel.findByIdAndUpdate({ _id: req.user._id }, userData, { runValidators: true, returnDocument: "after" });
        //or
        Object.keys(userData).forEach(key => (loggedInUser[key] = userData[key]));
        await loggedInUser.save();

        res.json({ message: "User Updated Successfully", data: loggedInUser });
    } catch (error) {
        res.status(400).send({ message: error.message })
    }
})

module.exports = profileRouter;