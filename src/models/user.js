const mongoose = require('mongoose');
const validators = require('validator');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validators.isEmail(value)) {
                throw new Error('Invalid email');
            }
        },
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validators.isStrongPassword(value)) {
                throw new Error('Password is not strong enough');
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    about: {
        type: String,
        default: "I'm professional Software Developer"
    },
    skills: {
        type: [String],
        default: ["HTML", "JAVASCRIPT", "CSS"]
    },
    gender: {
        type: String,
        enum: [{
            values: ["male", "female", "other"],
            message: "Invalid gender"
        }],
        lowercase: true
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    memberShipDetails: {
        type: String
    },
    photoUrl: {
        type: String,
        validate(value) {
            if (!validators.isURL(value)) {
                throw new Error('Invalid URL');
            }
        },
        default: "https://static.vecteezy.com/system/resources/previews/000/439/863/original/vector-users-icon.jpg"
    }
},
    { timestamps: true }
);

//Schema Method
userSchema.methods.validatePassword = async function (password) {
    const user = this;
    const isValidPassword = bcrypt.compare(password, user.password);

    return isValidPassword;
}

const UserModel = new mongoose.model('User', userSchema);

module.exports = { UserModel };