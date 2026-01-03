const jwt = require('jsonwebtoken');
const User = require('../models/user');
const userAuth  = async (req, res, next) => {
    // read the token from the request cookies
try {
    const {token} = req.cookies;
    if (!token) {
        return res.status(401).json({ message: "Token is not valid" });
    }
    const decodedToken = await jwt.verify(token, "DEVCONNECT@999");
    const { userId } = decodedToken;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
    } catch (error) {
        return res.status(500).json({ message: "Error verifying token", error: error.message });
    }
};

module.exports = {
    userAuth
};