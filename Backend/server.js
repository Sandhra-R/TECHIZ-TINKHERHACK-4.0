const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Session = require("./models/Session");

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/stressMonitorDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ROUTE: Save Session
app.post("/api/session", async (req, res) => {
    try {
        const { blinkCount, stressScore, stressLevel } = req.body;

        const newSession = new Session({
            blinkCount,
            stressScore,
            stressLevel
        });

        await newSession.save();

        res.status(201).json({
            message: "Session saved successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ROUTE: Get All Sessions
app.get("/api/sessions", async (req, res) => {
    try {
        const sessions = await Session.find().sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});