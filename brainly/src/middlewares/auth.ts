import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// Extend the Express Request type to include custom fields
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      username?: string;
    }
  }
}

async function auth(req: any, res: any, next:any) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Authorization token missing or malformed" });
    }

    const token = authHeader.split(" ")[1]; // Get the token after 'Bearer'

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };

    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  } catch (err) {
    return res.status(401).json({ err: "Invalid or expired token" });
  }
}

export { auth, JWT_SECRET };
