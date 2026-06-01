import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { BaseController } from './base.controller';
import { User } from '../../models';
import { type IUpdateUserDTO, UserStatus } from '../../types';

export class UserController extends BaseController {
  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid user ID format');
        return;
      }

      const user = await User.findOne({ where: { id } });

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

  public async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, offset } = this.getPaginationParams(req.query);

      const where: any = {};

      if (req.query.role) {
        where.role = req.query.role;
      }

      if (req.query.status) {
        where.status = req.query.status;
      }

      if (req.query.search) {
        where.fullName = {
          [Op.iLike]: `%${req.query.search}%`,
        };
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] },
      });

      this.sendPaginatedSuccess(
        res,
        rows,
        count,
        page,
        limit,
        'Users retrieved successfully',
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: IUpdateUserDTO = req.body;

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid user ID format');
        return;
      }

      const user = await User.scope('withPassword').findByPk(id);

      if (!user) {
        this.sendNotFound(res, 'User not found');
        return;
      }

      if (req.user?.role !== 'admin' && req.user?.userId !== id) {
        this.sendForbidden(res, 'You can only update your own profile');
        return;
      }

      if (req.user?.role !== 'admin' && updateData.role) {
        delete updateData.role;
      }

      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: updateData.email.toLowerCase() },
        });

        if (existingUser) {
          this.sendConflict(res, 'Email already in use');
          return;
        }

        updateData.email = updateData.email.toLowerCase();
      }

      await user.update(updateData);

      this.sendSuccess(
        res,
        {
          user: user.toSafeUser(),
        },
        'User updated successfully',
      );
    } catch (error) {
      console.log(error);

      this.handleError(res, error);
    }
  }

  public async toggleUserBlock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action } = req.body;

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid user ID format');
        return;
      }

      if (!action || !['block', 'unblock'].includes(action)) {
        this.sendBadRequest(res, 'Action must be either "block" or "unblock"');
        return;
      }

      const user = await User.findByPk(id);

      if (!user) {
        this.sendNotFound(res, 'User not found');
        return;
      }

      const newStatus =
        action === 'block' ? UserStatus.BLOCKED : UserStatus.ACTIVE;

      await user.update({ status: newStatus });

      const message =
        action === 'block'
          ? 'User blocked successfully'
          : 'User unblocked successfully';

      this.sendSuccess(
        res,
        {
          user: user.toSafeUser(),
        },
        message,
      );
    } catch (error) {
      this.handleError(res, error);
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid user ID format');
        return;
      }

      const user = await User.findByPk(id);

      if (!user) {
        this.sendNotFound(res, 'User not found');
        return;
      }

      if (req.user?.userId === id) {
        this.sendBadRequest(res, 'You cannot delete yourself');
        return;
      }

      await user.destroy();

      this.sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  }
}
