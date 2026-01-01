const express = require('express');
const app = express();
const connectDB = require('./config/database');

const User = require('./models/user');

app.use(express.json());

app.post("/signup", async (req, res) => {
    try {
        console.log(req.body);
        const userOBJ = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            phoneNumber: req.body.phoneNumber,
            emailId: req.body.emailId
        };
        const user = new User(userOBJ);
        await user.save();
        res.status(201).send("User created successfully");
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already exists" });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
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

module.exports = app;
