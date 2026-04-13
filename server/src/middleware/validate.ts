import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                res.status(400).json({
                    data: null,
                    error: err.issues.map((e) => e.message).join(' ')
                })
                return;
            }
            next(err);
        }
    };
};