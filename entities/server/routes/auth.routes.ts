import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { ValidationMiddleware } from '../../middlewares/validation.middleware';

export class AuthRoutes {
  public router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Регистрация с валидацией
    this.router.post(
      '/register',
      ValidationMiddleware.validateRegister,
      (req, res) => this.authController.register(req, res),
    );

    // Авторизация с валидацией
    this.router.post('/login', ValidationMiddleware.validateLogin, (req, res) =>
      this.authController.login(req, res),
    );

    // Выход (требует аутентификации)
    this.router.post('/logout', AuthMiddleware.authenticate, (req, res) =>
      this.authController.logout(req, res),
    );

    // Текущий пользователь (требует аутентификации)
    this.router.get('/me', AuthMiddleware.authenticate, (req, res) =>
      this.authController.getCurrentUser(req, res),
    );
  }
}
