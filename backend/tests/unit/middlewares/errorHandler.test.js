import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { errorHandler, notFoundHandler } from '../../../src/middlewares/errorHandler.js';

describe('errorHandler middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let originalEnv;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test',
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('errorHandler', () => {
    it('should handle Prisma P2002 (duplicate) error', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['email'] },
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate record. This value already exists in the database.',
        field: 'email',
      });
    });

    it('should handle Prisma P2002 error with unknown field', () => {
      const error = {
        code: 'P2002',
        meta: {},
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate record. This value already exists in the database.',
        field: 'unknown',
      });
    });

    it('should handle Prisma P2025 (not found) error', () => {
      const error = {
        code: 'P2025',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Record not found',
      });
    });

    it('should handle ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: { field1: 'Invalid value' },
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: { field1: 'Invalid value' },
      });
    });

    it('should handle error with custom statusCode', () => {
      const error = {
        statusCode: 422,
        message: 'Unprocessable Entity',
      };

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unprocessable Entity',
      });
    });

    it('should default to 500 status and generic message for unknown errors', () => {
      const error = new Error();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });

    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Test error',
          stack: expect.any(String),
        })
      );
    });

    it('should not include stack trace in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      const jsonCall = mockRes.json.mock.calls[0][0];
      expect(jsonCall.stack).toBeUndefined();
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 with route info', () => {
      mockReq.method = 'POST';
      mockReq.path = '/api/unknown';

      notFoundHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route POST /api/unknown not found',
      });
    });

    it('should handle GET requests', () => {
      mockReq.method = 'GET';
      mockReq.path = '/missing';

      notFoundHandler(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route GET /missing not found',
      });
    });
  });
});
