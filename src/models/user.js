const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
        validate(value) { 
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password is not strong enough');
            }
        },
    },
    phoneNumber: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address');
            }
        }
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        validate: {
            validator: function(v) {
                return ['male', 'female', 'other'].includes(v);
            },
            message: 'Please provide a valid gender',
        }
    },  
    profilePicture: {
        type: String,
        default: "https://sclpa.com/about-us/dummy-img-1/",
    },
    bio: {
        type: String,
    },
    skills: {
        type: Array,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

userSchema.methods.generateAuthToken = async function() {
    try {
        const user = this;
        const token = await jwt.sign({ userId: this._id }, "DEVCONNECT@999");
        return token;
    } catch (error) {
        throw new Error("Error generating auth token", error);
    }
};

userSchema.methods.validatePassword = async function(inputPassword) {
        const user = this;
        const isPasswordMatched = await bcrypt.compare(inputPassword, user.password);
        return isPasswordMatched;
};

const User = mongoose.model('User', userSchema);

module.exports = User;