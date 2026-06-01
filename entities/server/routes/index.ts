import { Router } from 'express';
import { SwaggerRoutes } from './swagger.routes';
import { AuthRoutes } from './auth.routes';
import { UserRoutes } from './user.routes';
import { TaskRoutes } from './task.routes';
export class AppRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const swagger = new SwaggerRoutes();
    const auth = new AuthRoutes();
    const users = new UserRoutes();
    const tasks = new TaskRoutes();

    this.router.use('/auth', auth.router);
    this.router.use('/users', users.router);
    this.router.use('/tasks', tasks.router);
    this.router.use('/docs', swagger.router);
  }
}
