import type { Request, Response, NextFunction } from 'express';
import { BaseController, HttpStatus } from '../controllers/base.controller';
import { TaskStatus } from '../../types';

export class ValidationMiddleware extends BaseController {
  public static validateRegister(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { fullName, birthDate, email, password } = req.body;
    const errors: string[] = [];

    if (!fullName || fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (!birthDate) {
      errors.push('Birth date is required');
    } else {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid birth date format');
      } else if (date > new Date()) {
        errors.push('Birth date cannot be in the future');
      }
    }

    if (!email) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }

  public static validateLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { email, password } = req.body;
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    }

    if (!password) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }

  public static validateUpdateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { fullName, birthDate, email, password } = req.body;
    const errors: string[] = [];

    if (fullName !== undefined && fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (birthDate !== undefined) {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        errors.push('Invalid birth date format');
      }
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
      }
    }

    if (password !== undefined && password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }

  public static validateBlockAction(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { action } = req.body;
    const errors: string[] = [];

    if (!action) {
      errors.push('Action is required');
    } else if (!['block', 'unblock'].includes(action)) {
      errors.push('Action must be either "block" or "unblock"');
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }

  public static validateCreateTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { title, description, status, dueDate, userId } = req.body;
    const errors: string[] = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    } else if (title.trim().length > 200) {
      errors.push('Title must be no more than 200 characters');
    }

    if (description !== undefined && typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description && description.length > 2000) {
      errors.push('Description must be no more than 2000 characters');
    }

    if (status !== undefined) {
      const allowedStatuses = Object.values(TaskStatus);
      if (!allowedStatuses.includes(status)) {
        errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
      }
    }

    if (dueDate !== undefined && dueDate !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate)) {
        errors.push('Due date must be in YYYY-MM-DD format');
      } else {
        const parsedDate = new Date(dueDate);
        if (isNaN(parsedDate.getTime())) {
          errors.push('Invalid due date value');
        }
      }
    }

    if (userId !== undefined && userId !== null) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        errors.push('User ID must be a valid UUID');
      }
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }

  public static validateUpdateTask(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { title, description, status, dueDate, userId } = req.body;
    const errors: string[] = [];

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title must be a non-empty string if provided');
      } else if (title.trim().length > 200) {
        errors.push('Title must be no more than 200 characters');
      }
    }

    if (description !== undefined && typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description && description.length > 2000) {
      errors.push('Description must be no more than 2000 characters');
    }

    if (status !== undefined) {
      const allowedStatuses = Object.values(TaskStatus);
      if (!allowedStatuses.includes(status)) {
        errors.push(`Status must be one of: ${allowedStatuses.join(', ')}`);
      }
    }

    if (dueDate !== undefined && dueDate !== null) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate)) {
        errors.push('Due date must be in YYYY-MM-DD format');
      } else {
        const parsedDate = new Date(dueDate);
        if (isNaN(parsedDate.getTime())) {
          errors.push('Invalid due date value');
        }
      }
    }

    if (userId !== undefined && userId !== null) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        errors.push('User ID must be a valid UUID');
      }
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }

  public static validateBulkStatusUpdate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { taskIds, status } = req.body;
    const errors: string[] = [];

    if (!taskIds) {
      errors.push('taskIds is required');
    } else if (!Array.isArray(taskIds)) {
      errors.push('taskIds must be an array');
    } else if (taskIds.length === 0) {
      errors.push('taskIds cannot be empty');
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const invalidIds: string[] = [];

      for (const id of taskIds) {
        if (typeof id !== 'string' || !uuidRegex.test(id)) {
          invalidIds.push(String(id));
        }
      }

      if (invalidIds.length > 0) {
        errors.push(
          `Invalid UUID format in taskIds: [${invalidIds.join(', ')}]. Each ID must be a valid UUID.`,
        );
      }

      if (taskIds.length > 100) {
        errors.push('Cannot update more than 100 tasks at once');
      }
    }

    if (!status) {
      errors.push('status is required');
    } else {
      const allowedStatuses = Object.values(TaskStatus);
      if (!allowedStatuses.includes(status)) {
        errors.push(`status must be one of: ${allowedStatuses.join(', ')}`);
      }
    }

    if (errors.length > 0) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  }
}
