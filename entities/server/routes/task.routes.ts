// src/routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../../controllers/task.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';

export class TaskRoutes {
  public router: Router;
  private taskController: TaskController;

  constructor() {
    this.router = Router();
    this.taskController = new TaskController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(AuthMiddleware.authenticate);

    this.router.get('/', (req, res) =>
      this.taskController.getAllTasks(req, res),
    );

    this.router.get('/:id', (req, res) =>
      this.taskController.getTaskById(req, res),
    );

    this.router.post('/', ValidationMiddleware.validateCreateTask, (req, res) =>
      this.taskController.createTask(req, res),
    );

    this.router.put(
      '/:id',
      ValidationMiddleware.validateUpdateTask,
      (req, res) => this.taskController.updateTask(req, res),
    );

    this.router.delete('/:id', (req, res) =>
      this.taskController.deleteTask(req, res),
    );

    this.router.patch(
      '/status/bulk',
      AuthMiddleware.requireAdmin,
      ValidationMiddleware.validateBulkStatusUpdate,
      (req, res) => this.taskController.bulkUpdateStatus(req, res),
    );
  }
}
