import { Request, Response,NextFunction } from "express";
import jwt  from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;


async function auth (req:Request,res:Response,next:NextFunction){
    try{ 
         const token = req.headers.token;
         
           const decoded = jwt.verify(token as string, JWT_SECRET);
          if(decoded){
            //@ts-expect-error
            req.userId= decoded.userId;
            //@ts-expect-error
            req.username = decoded.username;
            next();
          }
          else{
            res.json({
                msg:"You are not logged In"
            })
          }
        }
       
      catch(err){
            res.json({
                err:"invalid token"
            })
      } 

}

// override the types of the express request object

export{auth,JWT_SECRET};

