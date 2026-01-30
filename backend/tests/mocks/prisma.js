import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Create a deep mock of Prisma client
const prismaMock = mockDeep();

// Reset mock before each test
beforeEach(() => {
  mockReset(prismaMock);
});

export default prismaMock;
