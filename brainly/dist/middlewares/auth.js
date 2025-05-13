import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
async function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ msg: "Authorization token missing or malformed" });
        }
        const token = authHeader.split(" ")[1]; // Get the token after 'Bearer'
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    }
    catch (err) {
        return res.status(401).json({ err: "Invalid or expired token" });
    }
}
export { auth, JWT_SECRET };
