import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '../../configs';
import { Database } from '../../configs/database';
import { initializeModels } from '../../models';
import { AppRoutes } from './routes';

export class Server {
  private app: Application;
  private port: number;
  private database: Database;

  constructor() {
    this.app = express();
    this.port = Number(config.port);
    this.database = Database.getInstance();

    this.initializeMiddlewares();
    this.initializeModels();
    this.initializeRoutes();
    this.initializeErrorHandling();
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

  public async shutdown(): Promise<void> {
    await this.database.disconnect();
    process.exit(0);
  }

  public getApp(): Application {
    return this.app;
  }
}
