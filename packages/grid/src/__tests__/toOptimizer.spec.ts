import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { toOptimizer } from "../lib/toOptimizer";

describe("toOptimizer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should create an optimized function", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);
    expect(typeof optimized).toBe("function");
  });

  test("should have cancel method", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);
    expect(typeof optimized.cancel).toBe("function");
  });

  test("should not call function immediately on first call", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized();
    expect(mockFunc).not.toHaveBeenCalled();
  });

  test("should call function on next animation frame", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized();
    vi.runAllTimers();
    expect(mockFunc).toHaveBeenCalledOnce();
  });

  test("should pass arguments to the function", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized("arg1", "arg2", 42);
    vi.runAllTimers();
    expect(mockFunc).toHaveBeenCalledWith("arg1", "arg2", 42);
  });

  test("should use latest arguments when called multiple times", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized("first");
    optimized("second");
    optimized("third");
    vi.runAllTimers();

    expect(mockFunc).toHaveBeenCalledOnce();
    expect(mockFunc).toHaveBeenCalledWith("third");
  });

  test("should respect this context", () => {
    const context = { value: 42 };
    const mockFunc = vi.fn(function (this: typeof context) {
      return this.value;
    });

    const optimized = toOptimizer(context, mockFunc);
    optimized();
    vi.runAllTimers();

    expect(mockFunc).toHaveBeenCalled();
  });

  test("should allow multiple sequential calls", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized("call1");
    vi.runAllTimers();
    expect(mockFunc).toHaveBeenCalledOnce();

    optimized("call2");
    vi.runAllTimers();
    expect(mockFunc).toHaveBeenCalledTimes(2);
  });

  test("should cancel pending animation frame", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized();
    optimized.cancel();
    vi.runAllTimers();

    expect(mockFunc).not.toHaveBeenCalled();
  });

  test("should reset state after cancel", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized();
    optimized.cancel();
    optimized();
    vi.runAllTimers();

    expect(mockFunc).toHaveBeenCalledOnce();
  });

  test("should batch multiple calls into single function invocation", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized(1);
    optimized(2);
    optimized(3);
    optimized(4);

    expect(mockFunc).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(mockFunc).toHaveBeenCalledOnce();
    expect(mockFunc).toHaveBeenCalledWith(4);
  });

  test("should work with no arguments", () => {
    const mockFunc = vi.fn();
    const optimized = toOptimizer({}, mockFunc);

    optimized();
    vi.runAllTimers();

    expect(mockFunc).toHaveBeenCalledOnce();
    expect(mockFunc).toHaveBeenCalledWith();
  });

  test("should handle function that throws", () => {
    const mockFunc = vi.fn(() => {
      throw new Error("Test error");
    });
    const optimized = toOptimizer({}, mockFunc);

    optimized();

    expect(() => {
      vi.runAllTimers();
    }).toThrow("Test error");
  });
});
