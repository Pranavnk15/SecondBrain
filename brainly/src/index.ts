import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { ZodAuth } from "./middlewares/zodValidation";
import { auth } from "./middlewares/auth";
import { LinkModel, UserModel, ContentModel, TagsModel } from "./db";
import { random } from "./utils";
import { storeCard, deleteCardFromQdrant, queryRelatedCard } from "./embedding";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET!;
console.log("JWT SECRET --> " + JWT_SECRET);
const app = express();



// app.use(cors({
//   origin: "https://second-brain-chi-seven.vercel.app",
//   credentials: true // if you need cookies or headers sent
// }));

app.use(cors({
  origin: "https://second-brain-chi-seven.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
}));


app.options("*", cors({
  origin: "https://second-brain-chi-seven.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"]
}));


app.use(express.json());

app.post("/api/v1/signup", ZodAuth, async (req: any, res: any) => {
  const { username, password, email } = req.body;
  const hashPassword = await bcrypt.hash(password, 2);

  try {
    const newUser = await UserModel.create({ username, password: hashPassword, email });
    const token = jwt.sign({ userId: newUser._id, username }, JWT_SECRET);

    res.status(201).json({
      msg: "Signup successful",
      data: newUser,
      token: token,
    });
  } 
  catch (error: any) {
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
});

app.post("/api/v1/signin", ZodAuth, async (req: any, res: any) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(404).json({ msg: "User doesn't exist" });
    return;
  }

  try {
    if (!user.password) {
      res.status(500).json({ msg: "Password is missing for this user" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.json({ msg: "Invalid credentials, failed to sign in" });
      return;
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
    res.json({ msg: "Signed in successfully", token });
  } catch (error) {
    res.json({ error });
  }
});

app.get("/api/v1/username", auth, async (req: any, res: any) => {

  res.json({ username:req.username , userId: req.userId});
});

app.post("/api/v1/content", auth, async (req: any, res: any) => {
  const { link, type, title, description } = req.body;
  const userId = req.userId;

  try {
    const uuid = uuidv4(); // ✅ generate UUID for Qdrant ID
    
    console.time("Mongo Save");
    const content = await ContentModel.create({
      link,
      type,
      title,
      description:title+ " " +description ,
      userId,
      qdrantId: uuid, 
      tags: [],
    });

    console.timeEnd("Mongo Save");

console.time("Qdrant Save");
    await storeCard({
      id: uuid, // ✅ use UUID here
      title,
      description,
      type,
      link,
      userId,
    });
    console.timeEnd("Qdrant Save");

    res.json({ msg: "Content created and indexed", data: content });
  } catch (err) {
    console.error("Content creation error:", err);
    res.status(500).json({ msg: "Failed to save content" });
  }
});


app.get("/api/v1/content", auth, async (req: any, res: any) => {
  const userId = req.userId;
  const content = await ContentModel.find({ userId }).populate("userId");
  res.json({ msg: "Get Content", data: content });
});

app.delete("/api/v1/content", auth, async (req: any, res: any) => {
  const contentId = req.body.contentId;
     console.log(contentId);
     
  try {
    const content = await ContentModel.findOne({ _id: contentId, userId: req.userId });

    if (!content) {
      return res.status(404).json({ msg: "Content not found" });
    }

    await ContentModel.deleteOne({ _id: contentId });
    await deleteCardFromQdrant(content.qdrantId); // ✅ Use stored UUID

    res.json({ msg: "Content deleted" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ msg: "Error deleting content" });
  }
});


app.post("/api/v1/brain/share", auth, async (req: any, res: any) => {
  try {
    const share = req.body.share;
    if (share) {
      const link = await LinkModel.create({ userId: req.userId, hash: random(10) });
      res.json({ msg: "Updated shareable link", link: link.hash });
    } else {
      await LinkModel.deleteOne({ userId: req.userId });
      res.json({ msg: "Link deleted" });
    }
  } catch (err) {
    res.json({ msg: "Duplicate link or link already exists", err });
  }
});

app.get("/api/v1/brain/:shareLink", async (req: any, res: any) => {
  const hash = req.params.shareLink;
  const link = await LinkModel.findOne({ hash });

  if (!link) {
    res.status(411).json({ msg: "Invalid link" });
    return;
  }

  const content = await ContentModel.find({ userId: link.userId });
  const user = await UserModel.findOne({ _id: link.userId });

  if (!user) {
    res.status(411).json({ message: "User not found (unexpected error)" });
    return;
  }

  res.json({ msg: "Share Link", username: user.username, content });
});

app.post("/api/v1/search", auth, async (req: any, res: any) => {
  const { query } = req.body;

  try {
    console.log("Querying with userId:", req.userId);

    const results = await queryRelatedCard(query, req.userId);
    res.json({ msg: "Search results", results });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ msg: "Error during semantic search" });
  }
});

const MONGO_URL = process.env.MONGO_URL;
console.log("aniket " + process.env.MONGO_URL);

const port = Number(process.env.PORT) || 4000;


async function main() {
  try {
    // Attempt to connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL ?? (() => { throw new Error("MONGO_URL is not defined"); })());
    
    // Once the connection is successful, log the success message
    console.log("Successfully connected to MongoDB");

    // Start the server
    app.listen(port,'0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    // Log any error that occurs during the connection process
    console.error("Error connecting to MongoDB:", err);
  }
}

main();

