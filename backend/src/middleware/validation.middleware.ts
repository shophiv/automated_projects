import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          code: 400,
          message: 'Validation failed',
          errors: error.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(500).json({
        status: 'error',
        code: 500,
        message: 'Internal server validation error'
      });
    }
  };