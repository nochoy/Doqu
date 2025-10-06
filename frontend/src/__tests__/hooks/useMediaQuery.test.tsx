import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  const originalWidth = window.innerWidth;

  afterEach(() => {
    // Restore the original value after each test
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalWidth,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });  
  });

  it('should return false when the window width is greater than or equal to the specified width', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 700,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useMediaQuery(640));
    expect(result.current).toBe(false);
  });

  it('should return true when the window width is less than the specified width', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 500,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useMediaQuery(640));
    expect(result.current).toBe(true);
  });

  it('should update when the window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 700,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    const { result } = renderHook(() => useMediaQuery(640));
    expect(result.current).toBe(false);
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 500 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(true);
  });
});