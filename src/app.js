    
    const express = require('express');
    const bcrypt = require('bcrypt');
    const cookieParser = require('cookie-parser');
    const jwt = require('jsonwebtoken');
    const app = express();
    const connectDB = require('./config/database');
    const validateSignUpRequest = require('./utils/validation');
    const User = require('./models/user');
    const { userAuth } = require('./middleWares/auth');
    app.use(express.json());
    app.use(cookieParser());

    app.post("/signup", async (req, res, next) => {
        try {
            validateSignUpRequest(req);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;

            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: req.body.password,
                emailId: req.body.emailId,
            });
            await user.save();
            res.status(201).send("User created successfully");
        } catch (error) {
            res.status(500).json({ message: "Error creating user", error: error.message });
        }
    });

    app.post("/login", async (req, res) => {
        try {
            const {emailId, password} = req.body;
            const user = await User.findOne({ emailId: emailId });
            if (!user) {
                return res.status(404).json({ message: "Invalid Credentials" });
            }
            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid Credentials" });
            }
            // Generate a JWT token
            const token = await user.generateAuthToken();
            res.cookie("token", token,);
            res.status(200).json({ message: "Login successful", user: user });
        } catch (error) {
            res.status(500).json({ message: "Error logging in", error: error.message });
        }
    });

    app.get("/profile", userAuth, async (req, res) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.send(user);
        } catch (error) {
            res.status(500).json({ message: "Error getting profile", error: error.message });
        }
    });

    app.post("/sendConnectionRequest", userAuth, async (req, res) => {
        console.log("sending the connection requestion");
        res.send("Connection request sent successfully");
    });

    app.get("/user/:id", async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.send(user);
        } catch (error) {
            res.status(500).json({ message: "Error finding user", error: error.message });
        }
    });

    app.delete("/user/:id", async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.send(user);
        } catch (error) {
            res.status(500).json({ message: "Error deleting user", error: error.message });
        }
    });

    app.get("/user", async (req, res) => {
        try {
            const users = await User.findOne({ emailId: req.body.emailId });
            if (!users) {
                return res.status(404).json({ message: "User not found" });
            }
            res.send(users);
        } catch (error) {
            res.status(500).json({ message: "Error finding user", error: error.message });
        }
    });

    app.patch("/user/:id", async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.send(user);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    });

    app.put("/user/:id", async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.send(user);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: "Error updating user", error: error.message });
        }
    });

    connectDB().then(() => {
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    }).catch((err) => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });

