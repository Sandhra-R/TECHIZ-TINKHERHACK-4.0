const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    blinkCount: Number,
    stressScore: Number,
    stressLevel: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Session", SessionSchema);