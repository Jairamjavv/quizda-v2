import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../../repositories/UserRepository';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Mock Drizzle database
const mockDb = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    get: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    all: vi.fn(),
};

describe('UserRepository', () => {
    let repo: UserRepository;

    beforeEach(() => {
        repo = new UserRepository(mockDb as any);
        vi.clearAllMocks();
    });

    describe('findById', () => {
        it('should return user when found', async () => {
            const mockUser = { id: 1, username: 'test', email: 'test@example.com' };
            mockDb.get.mockResolvedValue(mockUser);

            const result = await repo.findById(1);

            expect(mockDb.select).toHaveBeenCalled();
            expect(mockDb.from).toHaveBeenCalledWith(users);
            expect(mockDb.where).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should return null when not found', async () => {
            mockDb.get.mockResolvedValue(null);

            const result = await repo.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create and return new user', async () => {
            const newUser = {
                email: 'new@example.com',
                username: 'newuser',
                role: 'attempter',
            };
            const createdUser = { id: 1, ...newUser };
            mockDb.get.mockResolvedValue(createdUser);

            const result = await repo.create(newUser as any);

            expect(mockDb.insert).toHaveBeenCalledWith(users);
            expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining(newUser));
            expect(result).toEqual(createdUser);
        });
    });
});
