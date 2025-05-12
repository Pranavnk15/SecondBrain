import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { ZodAuth } from "./middlewares/zodValidation";
import { auth } from "./middlewares/auth";
import { LinkModel, UserModel, ContentModel } from "./db";
import { random } from "./utils";
import {
  storeCard,
  deleteCardFromQdrant,
  queryRelatedCard,
  
} from "./embedding";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const MONGO_URL = process.env.MONGO_URL!;
const JWT_SECRET = process.env.JWT_SECRET!;



// Dynamic CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    return callback(null, origin); // Reflect the request origin
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
}));

// Optional: Handle preflight requests
app.options("*", cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
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



app.use(express.json());

// Auth Routes
app.post("/api/v1/signup", ZodAuth, async (req:any, res:any) => {
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
  } catch (error: any) {
    console.error("Signup Error:", error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        msg: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`,
      });
    }
    res.status(500).json({ msg: "Internal server error", error: error.message });
  }
});

app.post("/api/v1/signin", ZodAuth, async (req:any, res:any) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) return res.status(404).json({ msg: "User doesn't exist" });

  try {
    if (!user.password) return res.status(500).json({ msg: "Password missing" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    res.json({ msg: "Signed in successfully", token });
  } catch (error) {
    res.status(500).json({ msg: "Login failed", error });
  }
});

// User Info
app.get("/api/v1/username", auth, async (req: any, res) => {
  res.json({ username: req.username, userId: req.userId });
});

// Content Management
app.post("/api/v1/content", auth, async (req: any, res) => {
  const { link, type, title, description } = req.body;
  const userId = req.userId;
  const qdrantId = uuidv4();

  try {
    const content = await ContentModel.create({
      link,
      type,
      title,
      description,
      userId,
      qdrantId,
      tags: [],
    });

    await storeCard({
      id: qdrantId,
      title,
      description,
      type,
      link,
      userId,
    });

    res.json({ msg: "Content created", data: content });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({ msg: "Failed to save content" });
  }
});

app.get("/api/v1/content", auth, async (req: any, res) => {
  const userId = req.userId;
  const content = await ContentModel.find({ userId }).populate("userId");
  res.json({ msg: "Get Content", data: content });
});

app.delete("/api/v1/content", auth, async (req: any, res:any) => {
  const contentId = req.body.contentId;

  try {
    const content = await ContentModel.findOne({ _id: contentId, userId: req.userId });
    if (!content) return res.status(404).json({ msg: "Content not found" });

    await ContentModel.deleteOne({ _id: contentId });
    await deleteCardFromQdrant(content.qdrantId);

    res.json({ msg: "Content deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ msg: "Error deleting content" });
  }
});

// Share Link
app.post("/api/v1/brain/share", auth, async (req: any, res) => {
  const { share } = req.body;

  try {
    if (share) {
      const link = await LinkModel.create({ userId: req.userId, hash: random(10) });
      res.json({ msg: "Link created", link: link.hash });
    } else {
      await LinkModel.deleteOne({ userId: req.userId });
      res.json({ msg: "Link removed" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Error sharing link", err });
  }
});

app.get("/api/v1/brain/:shareLink", async (req: any, res:any) => {
  const { shareLink } = req.params;
  const link = await LinkModel.findOne({ hash: shareLink });

  if (!link) return res.status(404).json({ msg: "Invalid link" });

  const content = await ContentModel.find({ userId: link.userId });
  const user = await UserModel.findById(link.userId);

  if (!user) return res.status(500).json({ msg: "User not found" });

  res.json({ msg: "Share Link Data", username: user.username, content });
});

// Semantic Search
app.post("/api/v1/search", auth, async (req: any, res) => {
  const { query } = req.body;

  try {
    const results = await queryRelatedCard(query, req.userId);
    res.json({ msg: "Search results", results });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ msg: "Search failed" });
  }
});

app.get("/debug-qdrant", async (req, res) => {
  try {
    const response = await axios.get(`${process.env.QDRANT_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${process.env.QDRANT_API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (err:any) {
    console.error(err);
    res.status(500).json({ msg: "Qdrant test failed" });
  }
})

// Connect to MongoDB and start server
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

   
      
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}



main();
