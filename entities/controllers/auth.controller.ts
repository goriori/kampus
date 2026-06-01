import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BaseController } from './base.controller';
import { User } from '../../models';
import { config } from '../../configs';
import {
  type ICreateUserDTO,
  type ILoginDTO,
  UserRole,
  UserStatus,
} from '../../types';

export class AuthController extends BaseController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, birthDate, email, password }: ICreateUserDTO = req.body;

      if (!fullName || !birthDate || !email || !password) {
        this.sendBadRequest(
          res,
          'All fields are required: fullName, birthDate, email, password',
        );
        return;
      }

      const existingUser = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        this.sendConflict(res, 'User with this email already exists');
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        fullName,
        birthDate: new Date(birthDate),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
      });

      const token = this.generateToken(user);

      const safeUser = user.toSafeUser();

      this.sendCreated(
        res,
        {
          token,
          user: safeUser,
        },
        'User registered successfully',
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: ILoginDTO = req.body;

      if (!email || !password) {
        this.sendBadRequest(res, 'Email and password are required');
        return;
      }

      const user = await User.scope('withPassword').findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        this.sendUnauthorized(res, 'Invalid email or password');
        return;
      }

      if (user.status === UserStatus.BLOCKED) {
        this.sendForbidden(
          res,
          'Your account has been blocked. Please contact administrator.',
        );
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.get('password'),
      );

      if (!isPasswordValid) {
        this.sendUnauthorized(res, 'Invalid email or password');
        return;
      }

      const token = this.generateToken(user);

      const safeUser = user.toSafeUser();

      this.sendSuccess(
        res,
        {
          token,
          user: safeUser,
        },
        'Login successful',
      );
    } catch (error) {
      console.log(error);
      this.handleError(res, error);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      this.sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        this.sendUnauthorized(res);
        return;
      }

      const user = await User.findByPk(req.user.userId);

      if (!user) {
        this.sendNotFound(res, 'User not found');
        return;
      }

      this.sendSuccess(res, {
        user: user.toSafeUser(),
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.get('id'),
      email: user.get('email'),
      role: user.get('role'),
    };
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}
