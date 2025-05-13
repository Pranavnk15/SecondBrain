import express from "express";
import axios from "axios";
import serverless from "serverless-http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { ZodAuth } from "./middlewares/zodValidation.js";
import { auth } from "./middlewares/auth.js";
import { LinkModel, UserModel, ContentModel } from "./db.js";
import { random } from "./utils.js";
import { storeCard, deleteCardFromQdrant, queryRelatedCard, } from "./embedding.js";
import PQueue from "p-queue";
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
// User-specific queues
const userQueues = new Map();
function getUserQueue(userId) {
    if (!userQueues.has(userId)) {
        userQueues.set(userId, new PQueue({ concurrency: 1 }));
    }
    return userQueues.get(userId);
}
// CORS config
const allowedOrigin = "https://second-brain-chi-seven.vercel.app";
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
}));
app.options("*", cors({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        return callback(null, origin);
    },
    credentials: true,
}));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin)
        res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(express.json());
// Signup
app.post("/api/v1/signup", ZodAuth, async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 2);
    try {
        const newUser = await UserModel.create({
            username,
            password: hashedPassword,
            email,
        });
        const token = jwt.sign({ userId: newUser._id, username }, JWT_SECRET);
        res.status(201).json({ msg: "Signup successful", data: newUser, token });
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            });
        }
        res
            .status(500)
            .json({ msg: "Internal server error", error: error.message });
    }
});
// Signin
app.post("/api/v1/signin", ZodAuth, async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user)
        return res.status(404).json({ msg: "User doesn't exist" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.status(401).json({ msg: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    res.json({ msg: "Signed in successfully", token });
});
// Get username
app.get("/api/v1/username", auth, async (req, res) => {
    res.json({ username: req.username, userId: req.userId });
});
// Add content (queued)
app.post("/api/v1/content", auth, async (req, res) => {
    const { link, type, title, description } = req.body;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue
        .add(async () => {
        const qdrantId = uuidv4();
        const content = await ContentModel.create({
            link,
            type,
            title,
            description,
            userId,
            qdrantId,
            tags: [],
        });
        await storeCard({ id: qdrantId, title, description, type, link, userId });
        res.json({ msg: "Content created", data: content });
    })
        .catch((err) => {
        console.error("Add content error:", err);
        res.status(500).json({ msg: "Failed to add content" });
    });
});
// Get content
app.get("/api/v1/content", auth, async (req, res) => {
    const content = await ContentModel.find({ userId: req.userId }).populate("userId");
    res.json({ msg: "Get Content", data: content });
});
// Delete content (queued)
app.delete("/api/v1/content", auth, async (req, res) => {
    const contentId = req.body.contentId;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue
        .add(async () => {
        const content = await ContentModel.findOne({ _id: contentId, userId });
        if (!content)
            return res.status(404).json({ msg: "Content not found" });
        await ContentModel.deleteOne({ _id: contentId });
        await deleteCardFromQdrant(content.qdrantId);
        res.json({ msg: "Content deleted" });
    })
        .catch((err) => {
        console.error("Delete content error:", err);
        res.status(500).json({ msg: "Failed to delete content" });
    });
});
// Share logic (queued)
app.post("/api/v1/brain/share", auth, async (req, res) => {
    const { share } = req.body;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue
        .add(async () => {
        if (share === 1) {
            const link = await LinkModel.create({ userId, hash: random(10) });
            return res.json({ msg: "Link created", link: link.hash });
        }
        else if (share === 0) {
            await LinkModel.deleteOne({ userId });
            return res.json({ msg: "Link removed" });
        }
        else if (share === 2) {
            const link = await LinkModel.findOne({ userId });
            return res.json({ isSharing: link ? 1 : 0 });
        }
        else {
            return res.status(400).json({ msg: "Invalid share value." });
        }
    })
        .catch((err) => {
        console.error("Share logic error:", err);
        res.status(500).json({ msg: "Error managing share status" });
    });
});
// Share access by hash
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const { shareLink } = req.params;
    const link = await LinkModel.findOne({ hash: shareLink });
    if (!link)
        return res.status(404).json({ msg: "Invalid link" });
    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findById(link.userId);
    if (!user)
        return res.status(500).json({ msg: "User not found" });
    res.json({ msg: "Share Link Data", username: user.username, content });
});
// Semantic Search (queued)
app.post("/api/v1/search", auth, async (req, res) => {
    const { query } = req.body;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue
        .add(async () => {
        const results = await queryRelatedCard(query, userId);
        res.json({ msg: "Search results", results });
    })
        .catch((err) => {
        console.error("Search Error:", err);
        res.status(500).json({ msg: "Search failed" });
    });
});
// Debug Qdrant
app.get("/debug-qdrant", async (req, res) => {
    try {
        const response = await axios.get(`${process.env.QDRANT_URL}/collections`, {
            headers: { Authorization: `Bearer ${process.env.QDRANT_API_KEY}` },
        });
        res.json(response.data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Qdrant test failed" });
    }
});
// MongoDB connection for serverless
let cachedDb = null;
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    cachedDb = await mongoose.connect(MONGO_URL);
    return cachedDb;
}
// For local development
if (process.env.NODE_ENV !== "production") {
    (async () => {
        try {
            await connectToDatabase();
            console.log("✅ Connected to MongoDB");
            app.listen(PORT, "0.0.0.0", () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        }
        catch (err) {
            console.error("❌ MongoDB connection error:", err);
        }
    })();
}
// Export for Vercel serverless
export const handler = serverless(app);
