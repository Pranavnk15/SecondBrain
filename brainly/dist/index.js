"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const zodValidation_1 = require("./middlewares/zodValidation");
const auth_1 = require("./middlewares/auth");
const db_1 = require("./db");
const utils_1 = require("./utils");
const embedding_1 = require("./embedding");
const p_queue_1 = __importDefault(require("p-queue"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
// MongoDB connection
mongoose_1.default
    .connect(MONGO_URL)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));
// Middleware
const allowedOrigin = "https://second-brain-chi-seven.vercel.app";
app.use((0, cors_1.default)({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
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
app.use(express_1.default.json());
// User-specific queues
const userQueues = new Map();
function getUserQueue(userId) {
    if (!userQueues.has(userId)) {
        userQueues.set(userId, new p_queue_1.default({ concurrency: 1 }));
    }
    return userQueues.get(userId);
}
// Routes
// Signup
app.post("/api/v1/signup", zodValidation_1.ZodAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 2);
    try {
        const newUser = yield db_1.UserModel.create({ username, password: hashedPassword, email });
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id, username }, JWT_SECRET);
        res.status(201).json({ msg: "Signup successful", data: newUser, token });
    }
    catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
        }
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
}));
// Signin
app.post("/api/v1/signin", zodValidation_1.ZodAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield db_1.UserModel.findOne({ email });
    if (!user)
        return res.status(404).json({ msg: "User doesn't exist" });
    const match = yield bcrypt_1.default.compare(password, user.password);
    if (!match)
        return res.status(401).json({ msg: "Invalid credentials" });
    const token = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    res.json({ msg: "Signed in successfully", token });
}));
// Get username
app.get("/api/v1/username", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ username: req.username, userId: req.userId });
}));
// Add content (queued)
app.post("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title, description } = req.body;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue.add(() => __awaiter(void 0, void 0, void 0, function* () {
        const qdrantId = (0, uuid_1.v4)();
        const content = yield db_1.ContentModel.create({ link, type, title, description, userId, qdrantId, tags: [] });
        yield (0, embedding_1.storeCard)({ id: qdrantId, title, description, type, link, userId });
        res.json({ msg: "Content created", data: content });
    })).catch(err => {
        console.error("Add content error:", err);
        res.status(500).json({ msg: "Failed to add content" });
    });
}));
// Get content
app.get("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield db_1.ContentModel.find({ userId: req.userId }).populate("userId");
    res.json({ msg: "Get Content", data: content });
}));
// Delete content (queued)
app.delete("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue.add(() => __awaiter(void 0, void 0, void 0, function* () {
        const content = yield db_1.ContentModel.findOne({ _id: contentId, userId });
        if (!content)
            return res.status(404).json({ msg: "Content not found" });
        yield db_1.ContentModel.deleteOne({ _id: contentId });
        yield (0, embedding_1.deleteCardFromQdrant)(content.qdrantId);
        res.json({ msg: "Content deleted" });
    })).catch(err => {
        console.error("Delete content error:", err);
        res.status(500).json({ msg: "Failed to delete content" });
    });
}));
// Share logic (queued)
app.post("/api/v1/brain/share", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue.add(() => __awaiter(void 0, void 0, void 0, function* () {
        if (share === 1) {
            const link = yield db_1.LinkModel.create({ userId, hash: (0, utils_1.random)(10) });
            return res.json({ msg: "Link created", link: link.hash });
        }
        else if (share === 0) {
            yield db_1.LinkModel.deleteOne({ userId });
            return res.json({ msg: "Link removed" });
        }
        else if (share === 2) {
            const link = yield db_1.LinkModel.findOne({ userId });
            return res.json({ isSharing: link ? 1 : 0 });
        }
        else {
            return res.status(400).json({ msg: "Invalid share value." });
        }
    })).catch(err => {
        console.error("Share logic error:", err);
        res.status(500).json({ msg: "Error managing share status" });
    });
}));
// Share access by hash
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { shareLink } = req.params;
    const link = yield db_1.LinkModel.findOne({ hash: shareLink });
    if (!link)
        return res.status(404).json({ msg: "Invalid link" });
    const content = yield db_1.ContentModel.find({ userId: link.userId });
    const user = yield db_1.UserModel.findById(link.userId);
    if (!user)
        return res.status(500).json({ msg: "User not found" });
    res.json({ msg: "Share Link Data", username: user.username, content });
}));
// Semantic Search (queued)
app.post("/api/v1/search", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.body;
    const userId = req.userId;
    const queue = getUserQueue(userId);
    queue.add(() => __awaiter(void 0, void 0, void 0, function* () {
        const results = yield (0, embedding_1.queryRelatedCard)(query, userId);
        res.json({ msg: "Search results", results });
    })).catch(err => {
        console.error("Search Error:", err);
        res.status(500).json({ msg: "Search failed" });
    });
}));
// Debug Qdrant
app.get("/debug-qdrant", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`${process.env.QDRANT_URL}/collections`, {
            headers: { 'Authorization': `Bearer ${process.env.QDRANT_API_KEY}` },
        });
        res.json(response.data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Qdrant test failed" });
    }
}));
// Export the app as a serverless handler
exports.handler = (0, serverless_http_1.default)(app);
