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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;
// Dynamic CORS configuration
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        return callback(null, origin); // Reflect the request origin
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
}));
// Optional: Handle preflight requests
app.options("*", (0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        return callback(null, origin);
    },
    credentials: true,
}));
// Optional: Manually set headers (redundant but okay for extra control)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});
app.use(express_1.default.json());
// Auth Routes
app.post("/api/v1/signup", zodValidation_1.ZodAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 2);
    try {
        const newUser = yield db_1.UserModel.create({
            username,
            password: hashedPassword,
            email,
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id, username }, JWT_SECRET);
        res.status(201).json({ msg: "Signup successful", data: newUser, token });
    }
    catch (error) {
        console.error("Signup Error:", error);
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                msg: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`,
            });
        }
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
}));
app.post("/api/v1/signin", zodValidation_1.ZodAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield db_1.UserModel.findOne({ email });
    if (!user)
        return res.status(404).json({ msg: "User doesn't exist" });
    try {
        if (!user.password)
            return res.status(500).json({ msg: "Password missing" });
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(401).json({ msg: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username }, JWT_SECRET);
        res.json({ msg: "Signed in successfully", token });
    }
    catch (error) {
        res.status(500).json({ msg: "Login failed", error });
    }
}));
// User Info
app.get("/api/v1/username", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ username: req.username, userId: req.userId });
}));
// Content Management
app.post("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title, description } = req.body;
    const userId = req.userId;
    const qdrantId = (0, uuid_1.v4)();
    try {
        const content = yield db_1.ContentModel.create({
            link,
            type,
            title,
            description,
            userId,
            qdrantId,
            tags: [],
        });
        yield (0, embedding_1.storeCard)({
            id: qdrantId,
            title,
            description,
            type,
            link,
            userId,
        });
        res.json({ msg: "Content created", data: content });
    }
    catch (err) {
        console.error("Create Error:", err);
        res.status(500).json({ msg: "Failed to save content" });
    }
}));
app.get("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const content = yield db_1.ContentModel.find({ userId }).populate("userId");
    res.json({ msg: "Get Content", data: content });
}));
app.delete("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    try {
        const content = yield db_1.ContentModel.findOne({ _id: contentId, userId: req.userId });
        if (!content)
            return res.status(404).json({ msg: "Content not found" });
        yield db_1.ContentModel.deleteOne({ _id: contentId });
        yield (0, embedding_1.deleteCardFromQdrant)(content.qdrantId);
        res.json({ msg: "Content deleted" });
    }
    catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ msg: "Error deleting content" });
    }
}));
// Share Link
app.post("/api/v1/brain/share", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { share } = req.body;
    try {
        if (share) {
            const link = yield db_1.LinkModel.create({ userId: req.userId, hash: (0, utils_1.random)(10) });
            res.json({ msg: "Link created", link: link.hash });
        }
        else {
            yield db_1.LinkModel.deleteOne({ userId: req.userId });
            res.json({ msg: "Link removed" });
        }
    }
    catch (err) {
        res.status(500).json({ msg: "Error sharing link", err });
    }
}));
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
// Semantic Search
app.post("/api/v1/search", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.body;
    try {
        const results = yield (0, embedding_1.queryRelatedCard)(query, req.userId);
        res.json({ msg: "Search results", results });
    }
    catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ msg: "Search failed" });
    }
}));
app.get("/debug-qdrant", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`${process.env.QDRANT_URL}/collections`, {
            headers: {
                'Authorization': `Bearer ${process.env.QDRANT_API_KEY}`,
            },
        });
        res.json(response.data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Qdrant test failed" });
    }
}));
// Connect to MongoDB and start server
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGO_URL);
            console.log("✅ Connected to MongoDB");
            app.listen(PORT, "0.0.0.0", () => {
                console.log(`🚀 Server running on port ${PORT}`);
            });
        }
        catch (err) {
            console.error("❌ MongoDB connection error:", err);
        }
    });
}
main();
