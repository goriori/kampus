import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '../../configs';
import { Database } from '../../configs/database';
import { initializeModels } from '../../models';
import { AppRoutes } from './routes';
import type { IJwtPayload } from '../../types';

export class Server {
  private app: Application;
  private port: number;
  private database: Database;
  private httpServer: http.Server;
  public io: SocketServer;

  constructor() {
    this.app = express();
    this.port = Number(config.port);
    this.database = Database.getInstance();

    this.httpServer = http.createServer(this.app);

    this.io = new SocketServer(this.httpServer, {
      cors: {
        origin: config.cors.origin,
        credentials: true,
      },
      maxHttpBufferSize: 1e6, // 1 MB
    });

    this.app.set('io', this.getIO());

    this.initializeMiddlewares();
    this.initializeModels();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeWebSocket();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());

    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Слишком много запросов с вашего IP, попробуйте позже.',
        standardHeaders: true,
        legacyHeaders: false,
      }),
    );

    this.app.use(cors(config.cors));

    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    }

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeModels(): void {
    initializeModels();
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      });
    });

    const appRoutes = new AppRoutes();
    this.app.use('/api', appRoutes.router);

    this.app.use('/404', (req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error('Error:', err.message);

        const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

        res.status(statusCode).json({
          status: 'error',
          message: err.message || 'Internal Server Error',
          ...(config.nodeEnv === 'development' && { stack: err.stack }),
        });
      },
    );
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();

      this.app.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(
          `📚 Swagger documentation: http://localhost:${this.port}/api/docs`,
        );
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private initializeWebSocket(): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;
        socket.data.userId = decoded.userId;
        socket.data.userRole = decoded.role;
        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return next(new Error('Token expired'));
        }
        if (error instanceof jwt.JsonWebTokenError) {
          return next(new Error('Invalid token'));
        }
        return next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      const userRole = socket.data.userRole;

      console.log(`🔌 User ${userId} connected (role: ${userRole})`);

      if (userId) {
        socket.join(`user:${userId}`);
      }

      if (userRole === 'admin') {
        socket.join('admin-all');
      }

      socket.on('disconnect', () => {
        console.log(`🔌 User ${userId} disconnected`);
      });
    });
  }

  public async shutdown(): Promise<void> {
    await this.database.disconnect();
    process.exit(0);
  }

  public getApp(): Application {
    return this.app;
  }

  public getIO(): SocketServer {
    return this.io;
  }
}
