/* eslint-disable @typescript-eslint/no-require-imports */
require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.getComputedStyle for libraries that rely on it (like vaul)
const originalGetComputedStyle = window.getComputedStyle;
window.getComputedStyle = (elt, pseudo) => {
  const style = originalGetComputedStyle(elt, pseudo);
  return new Proxy(style, {
    get(target, prop) {
      if (prop === 'transform') {
        const value = target[prop];
        return value === '' || value === undefined || value === null ? 'none' : value;
      }
      const value = target[prop];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
};

// Mock PointerEvent methods for libraries that rely on them (like vaul)
if (typeof window !== 'undefined' && !window.Element.prototype.setPointerCapture) {
  window.Element.prototype.setPointerCapture = jest.fn();
  window.Element.prototype.releasePointerCapture = jest.fn();
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Next.js public env vars for tests
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'your-google-client-id',
  },
  writable: true,
});
