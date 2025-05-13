import { Request,Response,NextFunction } from "express";
import {z} from 'zod'


function ZodAuth (req:Request,res:Response,next:NextFunction){
    const requiredBody = z.object({
        username: z.string().min(2, "Username must be at least 2 characters").max(20, "Username must not exceed 20 characters").optional(),
        password: z.string().min(6, "Password must be at least 6 characters").max(20,"password must not exceed 20 characters"),
        email: z.string().email() 
        })
    
        const result = requiredBody.safeParse(req.body);

            if(!result.success){
                console.log(result.error)
                res.status(411).json({
                    msg: "invalid credentials",
                    error: result.error
                  });

            } 
            else{ 
                console.log("into Zod Auth")
                next();
            }
}
export {ZodAuth};