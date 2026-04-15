import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodType } from 'zod'; 

export const validate = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = error as ZodError<any>;

        res.status(400).json({
          message: 'Erro de Validação',
          errors: validationError.issues.map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message
          }))
        });
        return;
      }
      res.status(500).json({ message: 'Erro interno no servidor' });
    }
  };