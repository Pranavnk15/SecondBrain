import { Request, Response, NextFunction } from "express";
declare function ZodAuth(req: Request, res: Response, next: NextFunction): void;
export { ZodAuth };
