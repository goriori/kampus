import { Router, type Request, type Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../../../configs/swagger';

export class SwaggerRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/', swaggerUi.serve);
    this.router.get(
      '/',
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'User Service API Documentation',
        customfavIcon: 'https://example.com/favicon.ico',
        swaggerOptions: {
          docExpansion: 'list',
          filter: true,
          showRequestDuration: true,
          syntaxHighlight: {
            activate: true,
            theme: 'monokai',
          },
        },
      }),
    );

    this.router.get('/json', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }
}
