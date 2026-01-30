import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the dependencies before importing the module
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
};

const mockJwt = {
  verify: jest.fn(),
};

jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: mockJwt,
}));

jest.unstable_mockModule('../../../src/config/env.js', () => ({
  default: {
    jwtSecret: 'test-secret',
  },
}));

// Import after mocking
const { authenticateToken, requireAdmin, optionalAuth } = await import(
  '../../../src/middlewares/auth.js'
);

describe('auth middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Reset mocks
    mockJwt.verify.mockReset();
    mockPrisma.user.findUnique.mockReset();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token provided', async () => {
      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication token missing',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 for invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
    });

    it('should return 403 for expired token', async () => {
      mockReq.headers.authorization = 'Bearer expired-token';
      mockJwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired',
      });
    });

    it('should return 401 if user not found in database', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      mockJwt.verify.mockReturnValue({ userId: 'user-123' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid user',
      });
    });

    it('should attach user to request and call next on valid token', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        rol: 'operator',
      };

      mockReq.headers.authorization = 'Bearer valid-token';
      mockJwt.verify.mockReturnValue({ userId: 'user-123' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 500 on unexpected error', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication error',
      });
    });
  });

  describe('requireAdmin', () => {
    it('should return 403 for non-admin users', () => {
      mockReq.user = { rol: 'operator' };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access allowed only for administrators',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next for admin users', () => {
      mockReq.user = { rol: 'admin' };

      requireAdmin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should continue without user if no token', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should attach user if valid token', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        rol: 'operator',
      };

      mockReq.headers.authorization = 'Bearer valid-token';
      mockJwt.verify.mockReturnValue({ userId: 'user-123' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue silently on invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not attach user if not found in database', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      mockJwt.verify.mockReturnValue({ userId: 'user-123' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
