"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZodAuth = ZodAuth;
const zod_1 = require("zod");
function ZodAuth(req, res, next) {
    const requiredBody = zod_1.z.object({
        username: zod_1.z.string().min(2, "Username must be at least 2 characters").max(20, "Username must not exceed 20 characters").optional(),
        password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(20, "password must not exceed 20 characters"),
        email: zod_1.z.string().email()
    });
    const result = requiredBody.safeParse(req.body);
    if (!result.success) {
        console.log(result.error);
        res.status(411).json({
            msg: "invalid credentials",
            error: result.error
        });
    }
    else {
        console.log("into Zod Auth");
        next();
    }
}
