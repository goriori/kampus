import { type Request, type Response } from 'express';
import { Op } from 'sequelize';
import { Task } from '../../models/task.model';
import { User } from '../../models/user.model';
import { TaskStatus } from '../../types';
import { BaseController } from './base.controller';

export class TaskController extends BaseController {
  private checkTaskAccess(
    task: Task,
    userId: string | null,
    userRole: string,
    requireWrite: boolean = false,
  ): boolean {
    if (userRole === 'admin') return true;

    if (!userId) {
      if (requireWrite) return false;
      return task.userId === null;
    }

    if (!requireWrite) {
      return task.userId === userId || task.userId === null;
    }
    return task.userId === userId;
  }

  public getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit, offset } = this.getPaginationParams(req.query);
      const { status, dueDate, search } = req.query;
      const currentUserId = req.user?.userId || null;
      const userRole = req.user?.role || 'user';

      const whereClause: any = {};

      if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
        whereClause.status = status;
      }

      if (dueDate) {
        whereClause.dueDate = dueDate;
      }

      if (search && typeof search === 'string') {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (userRole === 'admin') {
      } else {
        whereClause[Op.or] = [{ userId: currentUserId }, { userId: null }];
      }

      const { count, rows } = await Task.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] }, // можно исключить поля при необходимости
      });

      this.sendPaginatedSuccess(
        res,
        rows,
        count,
        page,
        limit,
        'Tasks retrieved successfully',
      );
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid task ID format');
        return;
      }

      const task = await Task.findByPk(id);
      if (!task) {
        this.sendNotFound(res, 'Task not found');
        return;
      }

      const currentUserId = req.user?.userId || null;
      const userRole = req.user?.role || 'user';

      if (!this.checkTaskAccess(task, currentUserId, userRole, false)) {
        this.sendForbidden(res, 'You do not have access to this task');
        return;
      }

      this.sendSuccess(res, task, 'Task retrieved successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, status, dueDate, userId } = req.body;
      const currentUserId = req.user?.userId || null;

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        this.sendValidationError(
          res,
          'Title is required and must be a non-empty string',
        );
        return;
      }

      let targetUserId: string | null = null;
      if (userId) {
        if (!this.isValidId(userId)) {
          this.sendBadRequest(res, 'Invalid userId format');
          return;
        }
        const user = await User.findByPk(userId);
        if (!user) {
          this.sendNotFound(res, 'User not found with the provided userId');
          return;
        }
        targetUserId = userId;
      } else {
        targetUserId = currentUserId;
      }

      let validatedStatus = TaskStatus.PENDING;
      if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
        validatedStatus = status as TaskStatus;
      }

      const newTask = await Task.create({
        title: title.trim(),
        description: description || null,
        status: validatedStatus,
        dueDate: dueDate || null,
        userId: targetUserId,
      });

      this.sendCreated(res, newTask, 'Task created successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, status, dueDate, userId } = req.body;
      const currentUserId = req.user?.userId || null;
      const userRole = req.user?.role || 'user';

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid task ID format');
        return;
      }

      const task = await Task.findByPk(id);
      if (!task) {
        this.sendNotFound(res, 'Task not found');
        return;
      }

      if (!this.checkTaskAccess(task, currentUserId, userRole, true)) {
        this.sendForbidden(
          res,
          'You do not have permission to modify this task',
        );
        return;
      }

      if (userId !== undefined && userRole === 'admin') {
        if (userId === null) {
          task.userId = null;
        } else if (this.isValidId(userId)) {
          const userExists = await User.findByPk(userId);
          if (!userExists) {
            this.sendNotFound(res, 'Target user not found');
            return;
          }
          task.userId = userId;
        } else {
          this.sendBadRequest(res, 'Invalid userId format');
          return;
        }
      } else if (userId !== undefined && userRole !== 'admin') {
        this.sendForbidden(
          res,
          'Only administrators can change task ownership',
        );
        return;
      }

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          this.sendValidationError(res, 'Title must be a non-empty string');
          return;
        }
        task.title = title.trim();
      }

      if (description !== undefined) {
        task.description = description || null;
      }

      if (status !== undefined) {
        if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
          this.sendValidationError(
            res,
            `Invalid status. Allowed values: ${Object.values(TaskStatus).join(', ')}`,
          );
          return;
        }

        task.status = status;
        const io = this.getIO(req);
        if (task.userId) {
          io.to(`user:${task.userId}`).emit('taskUpdated', task);
        }
        io.to('admin-all').emit('taskUpdated', task);
      }

      if (dueDate !== undefined) {
        task.dueDate = dueDate || null;
      }

      await task.save();

      this.sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId || null;
      const userRole = req.user?.role || 'user';

      if (!this.isValidId(id)) {
        this.sendBadRequest(res, 'Invalid task ID format');
        return;
      }

      const task = await Task.findByPk(id);
      if (!task) {
        this.sendNotFound(res, 'Task not found');
        return;
      }

      if (!this.checkTaskAccess(task, currentUserId, userRole, true)) {
        this.sendForbidden(
          res,
          'You do not have permission to delete this task',
        );
        return;
      }

      await task.destroy();
      this.sendNoContent(res);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public bulkUpdateStatus = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { taskIds, status } = req.body;
      const userRole = req.user?.role || 'user';

      if (userRole !== 'admin') {
        this.sendForbidden(
          res,
          'Only administrators can perform bulk status updates',
        );
        return;
      }

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        this.sendBadRequest(res, 'taskIds must be a non-empty array');
        return;
      }

      const invalidIds = taskIds.filter((id: string) => !this.isValidId(id));
      if (invalidIds.length > 0) {
        this.sendBadRequest(res, `Invalid UUID(s): ${invalidIds.join(', ')}`);
        return;
      }

      const tasks = await Task.findAll({
        where: {
          id: taskIds,
        },
      });

      const foundIds = tasks.map((t) => t.id);
      const notFoundIds = taskIds.filter(
        (id: string) => !foundIds.includes(id),
      );

      if (notFoundIds.length > 0) {
        this.sendBadRequest(res, `Tasks not found: ${notFoundIds.join(', ')}`);
        return;
      }

      const [updatedCount] = await Task.update(
        { status },
        {
          where: {
            id: taskIds,
          },
          individualHooks: false,
        },
      );

      this.sendSuccess(
        res,
        {
          updatedCount,
          status,
          taskIds: foundIds,
        },
        `Successfully updated ${updatedCount} task(s) status to ${status}`,
      );
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
