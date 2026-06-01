import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../configs';
import { type IJwtPayload, UserRole } from '../../types';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export class AuthMiddleware {
  public static authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({
          status: 'error',
          message: 'Authorization header is required',
        });
        return;
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      if (!token) {
        res.status(401).json({
          status: 'error',
          message: 'Token is required',
        });
        return;
      }

      const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          status: 'error',
          message: 'Token has expired',
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          status: 'error',
          message: 'Invalid token',
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Internal server error during authentication',
      });
    }
  }

  public static requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({
        status: 'error',
        message: 'Admin access required',
      });
      return;
    }

    next();
  }

  public static requireOwnership(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const targetUserId = req.params.id;

    if (req.user.role === UserRole.ADMIN || req.user.userId === targetUserId) {
      next();
    } else {
      res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own data',
      });
    }
  }
}
