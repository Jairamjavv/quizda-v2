import { vi } from 'vitest';

// Mock Cloudflare D1 Database
const mockD1Database = {
    prepare: vi.fn(() => ({
        bind: vi.fn(() => ({
            all: vi.fn(),
            run: vi.fn(),
            first: vi.fn(),
        })),
        all: vi.fn(),
        run: vi.fn(),
        first: vi.fn(),
    })),
    batch: vi.fn(),
    exec: vi.fn(),
};

// Mock Cloudflare R2 Bucket
const mockR2Bucket = {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
};

// Global mocks
global.env = {
    DB: mockD1Database,
    MY_BUCKET: mockR2Bucket,
};

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});
