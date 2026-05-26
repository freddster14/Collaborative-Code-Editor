import { vi } from "vitest";

vi.mock('../src/redis.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    connect: vi.fn(),
  }
}))