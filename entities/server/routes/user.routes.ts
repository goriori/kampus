import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';

export class UserRoutes {
  public router: Router;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Все роуты требуют аутентификации
    this.router.use(AuthMiddleware.authenticate);

    // Получение списка пользователей (только админ)
    this.router.get('/', AuthMiddleware.requireAdmin, (req, res) =>
      this.userController.getUsers(req, res),
    );

    // Получение пользователя по ID (админ или сам пользователь)
    this.router.get('/:id', AuthMiddleware.requireOwnership, (req, res) =>
      this.userController.getUserById(req, res),
    );

    // Обновление пользователя (админ или сам пользователь) с валидацией
    this.router.put(
      '/:id',
      AuthMiddleware.requireOwnership,
      ValidationMiddleware.validateUpdateUser,
      (req, res) => this.userController.updateUser(req, res),
    );

    // Блокировка/разблокировка (админ или сам пользователь) с валидацией
    this.router.patch(
      '/:id/block',
      AuthMiddleware.requireOwnership,
      ValidationMiddleware.validateBlockAction,
      (req, res) => this.userController.toggleUserBlock(req, res),
    );

    // Удаление пользователя (только админ)
    this.router.delete('/:id', AuthMiddleware.requireAdmin, (req, res) =>
      this.userController.deleteUser(req, res),
    );
  }
}
