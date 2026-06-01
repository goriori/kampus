import { type Response } from 'express';

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any;
  timestamp?: string;
}

export abstract class BaseController {
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: HttpStatus = HttpStatus.OK,
  ): void {
    const response: ApiResponse<T> = {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  protected sendCreated<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
  ): void {
    this.sendSuccess(res, data, message, HttpStatus.CREATED);
  }

  protected sendNoContent(res: Response): void {
    res.status(HttpStatus.NO_CONTENT).send();
  }

  protected sendError(
    res: Response,
    message: string,
    statusCode: HttpStatus,
    errors?: any,
  ): void {
    const response: ApiResponse = {
      status: 'error',
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  protected sendBadRequest(
    res: Response,
    message: string = 'Bad request',
    errors?: any,
  ): void {
    this.sendError(res, message, HttpStatus.BAD_REQUEST, errors);
  }

  protected sendUnauthorized(
    res: Response,
    message: string = 'Unauthorized',
  ): void {
    this.sendError(res, message, HttpStatus.UNAUTHORIZED);
  }

  protected sendForbidden(
    res: Response,
    message: string = 'Access denied',
  ): void {
    this.sendError(res, message, HttpStatus.FORBIDDEN);
  }

  protected sendNotFound(
    res: Response,
    message: string = 'Resource not found',
  ): void {
    this.sendError(res, message, HttpStatus.NOT_FOUND);
  }

  protected sendConflict(
    res: Response,
    message: string = 'Resource already exists',
  ): void {
    this.sendError(res, message, HttpStatus.CONFLICT);
  }

  protected sendValidationError(res: Response, errors: any): void {
    this.sendError(
      res,
      'Validation error',
      HttpStatus.UNPROCESSABLE_ENTITY,
      errors,
    );
  }

  protected sendServerError(res: Response, error?: Error | string): void {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    this.sendError(res, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  protected handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
      console.error('Controller error:', error.message);

      if (error.name === 'SequelizeValidationError') {
        this.sendValidationError(res, error.message);
        return;
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        this.sendConflict(res, 'Resource with this data already exists');
        return;
      }

      if (error.name === 'SequelizeForeignKeyConstraintError') {
        this.sendBadRequest(res, 'Invalid reference to related resource');
        return;
      }

      this.sendServerError(res, error);
    } else {
      console.error('Unknown controller error:', error);
      this.sendServerError(res, 'An unexpected error occurred');
    }
  }

  protected getPaginationParams(query: any): {
    page: number;
    limit: number;
    offset: number;
  } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  protected sendPaginatedSuccess<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
  ): void {
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse = {
      status: 'success',
      message,
      data: {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(HttpStatus.OK).json(response);
  }

  protected isValidId(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  protected sanitizeUser(user: any): any {
    if (!user) return null;

    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
  }
}
