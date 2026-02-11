import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JwtPayload } from '../interfaces/jwt-payload';
import { filterUser } from './utils/filter-user';
import { validateIsAdvisor } from './utils/validate-role';

import { saveHistory } from '../repositories/history.repository'

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
    let token: any | string | undefined;
    // Verificar si el token existe en los headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[ 1 ];
    }
    // Verificar si no hay token
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'No autorizado para acceder a esta ruta'
        });
        return;
    }

    try { // Verificar token
        const decoded: any = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        const user = filterUser( decoded, req );
        const assignedTo = validateIsAdvisor( decoded, req )
        if( assignedTo )
            req.body.assignedTo = assignedTo;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }

        req.user = user;
        next();
    } catch (error: any ) {
        await saveHistory({
            log: JSON.stringify({
                file: 'middleware.auth.protect',
                case: 'catch',
                message: error.message,
            }),
            createdBy: req.user.id || 0
        });
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Middleware para autorizar roles específicos
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
            success: false,
            message: `El rol ${req.user?.role} no está autorizado para acceder a esta ruta`
            });
            return;
        }
        next();
    };
};