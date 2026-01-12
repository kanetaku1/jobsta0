import { afterEach, vi } from 'vitest';

// Basic atob polyfill for Node environment
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (data: string) =>
    Buffer.from(data, 'base64').toString('binary');
}

vi.mock('next/cache', () => {
  const revalidateTag = vi.fn();
  const unstable_cache = <T extends (...args: any[]) => any>(fn: T) => {
    return (...args: Parameters<T>): ReturnType<T> => fn(...args);
  };
  return { revalidateTag, unstable_cache };
});

vi.mock('next/headers', () => {
  const cookies = vi.fn().mockResolvedValue({
    get: vi.fn(),
  });
  return { cookies };
});

afterEach(() => {
  vi.clearAllMocks();
});
