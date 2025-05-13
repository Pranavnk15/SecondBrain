declare const JWT_SECRET: string;
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            username?: string;
        }
    }
}
declare function auth(req: any, res: any, next: any): Promise<any>;
export { auth, JWT_SECRET };
