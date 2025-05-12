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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const zodValidation_1 = require("./middlewares/zodValidation");
const auth_1 = require("./middlewares/auth");
const db_1 = require("./db");
const utils_1 = require("./utils");
const embedding_1 = require("./embedding");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
console.log(JWT_SECRET);
const app = (0, express_1.default)();
// app.use(cors({
//   origin: "https://second-brain-chi-seven.vercel.app",
//   credentials: true // if you need cookies or headers sent
// }));
app.use((0, cors_1.default)({
    origin: "https://second-brain-chi-seven.vercel.app",
    credentials: true
}));
app.options("*", (0, cors_1.default)()); // allow preflight
app.use(express_1.default.json());
app.post("/api/v1/signup", zodValidation_1.ZodAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, email } = req.body;
    const hashPassword = yield bcrypt_1.default.hash(password, 2);
    try {
        const newUser = yield db_1.UserModel.create({ username, password: hashPassword, email });
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id, username }, JWT_SECRET);
        res.status(201).json({
            msg: "Signup successful",
            data: newUser,
            token: token,
        });
    }
    catch (error) {
        console.log("Signup Error:", error);
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                msg: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`,
            });
        }
        res.status(500).json({
            msg: "Internal server error. Please try again later.",
            error: error.message,
        });
    }
}));
app.post("/api/v1/signin", zodValidation_1.ZodAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield db_1.UserModel.findOne({ email });
    if (!user) {
        res.status(404).json({ msg: "User doesn't exist" });
        return;
    }
    try {
        if (!user.password) {
            res.status(500).json({ msg: "Password is missing for this user" });
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.json({ msg: "Invalid credentials, failed to sign in" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, username: user.username }, JWT_SECRET);
        res.json({ msg: "Signed in successfully", token });
    }
    catch (error) {
        res.json({ error });
    }
}));
app.get("/api/v1/username", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ username: req.username, userId: req.userId });
}));
app.post("/api/v1/content", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { link, type, title, description } = req.body;
    const userId = req.userId;
    try {
        const uuid = (0, uuid_1.v4)(); // ✅ generate UUID for Qdrant ID
        console.time("Mongo Save");
        const content = yield db_1.ContentModel.create({
            link,
            type,
            title,
            description: title + " " + description,
            userId,
            qdrantId: uuid,
            tags: [],
        });
        console.timeEnd("Mongo Save");
        console.time("Qdrant Save");
        yield (0, embedding_1.storeCard)({
            id: uuid, // ✅ use UUID here
            title,
            description,
            type,
            link,
            userId,
        });
        console.timeEnd("Qdrant Save");
        res.json({ msg: "Content created and indexed", data: content });
    }
    catch (err) {
        console.error("Content creation error:", err);
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
    console.log(contentId);
    try {
        const content = yield db_1.ContentModel.findOne({ _id: contentId, userId: req.userId });
        if (!content) {
            return res.status(404).json({ msg: "Content not found" });
        }
        yield db_1.ContentModel.deleteOne({ _id: contentId });
        yield (0, embedding_1.deleteCardFromQdrant)(content.qdrantId); // ✅ Use stored UUID
        res.json({ msg: "Content deleted" });
    }
    catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ msg: "Error deleting content" });
    }
}));
app.post("/api/v1/brain/share", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const share = req.body.share;
        if (share) {
            const link = yield db_1.LinkModel.create({ userId: req.userId, hash: (0, utils_1.random)(10) });
            res.json({ msg: "Updated shareable link", link: link.hash });
        }
        else {
            yield db_1.LinkModel.deleteOne({ userId: req.userId });
            res.json({ msg: "Link deleted" });
        }
    }
    catch (err) {
        res.json({ msg: "Duplicate link or link already exists", err });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield db_1.LinkModel.findOne({ hash });
    if (!link) {
        res.status(411).json({ msg: "Invalid link" });
        return;
    }
    const content = yield db_1.ContentModel.find({ userId: link.userId });
    const user = yield db_1.UserModel.findOne({ _id: link.userId });
    if (!user) {
        res.status(411).json({ message: "User not found (unexpected error)" });
        return;
    }
    res.json({ msg: "Share Link", username: user.username, content });
}));
app.post("/api/v1/search", auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.body;
    try {
        console.log("Querying with userId:", req.userId);
        const results = yield (0, embedding_1.queryRelatedCard)(query, req.userId);
        res.json({ msg: "Search results", results });
    }
    catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ msg: "Error during semantic search" });
    }
}));
const MONGO_URL = process.env.MONGO_URL;
console.log("aniket " + process.env.MONGO_URL);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Attempt to connect to MongoDB
            yield mongoose_1.default.connect((_a = process.env.MONGO_URL) !== null && _a !== void 0 ? _a : (() => { throw new Error("MONGO_URL is not defined"); })());
            // Once the connection is successful, log the success message
            console.log("Successfully connected to MongoDB");
            // Start the server
            app.listen(process.env.PORT || 4000, () => {
                console.log("Listening on Port 3000");
            });
        }
        catch (err) {
            // Log any error that occurs during the connection process
            console.error("Error connecting to MongoDB:", err);
        }
    });
}
// main();
