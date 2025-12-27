import { beforeEach, describe, expect, test } from "vitest";
import { ScrollBarMetrics } from "../lib/ScrollBarMetrics";

describe("ScrollBarMetrics", () => {
  beforeEach(() => {
    ScrollBarMetrics.invalidate();
  });

  test("should return a non-negative number within reasonable range", () => {
    const width = ScrollBarMetrics.get();
    expect(width).toBeTypeOf("number");
    expect(width).toBeGreaterThanOrEqual(0);
    expect(width).toBeLessThan(100);
  });

  test("should cache value on subsequent calls", () => {
    const width1 = ScrollBarMetrics.get();
    const width2 = ScrollBarMetrics.get();

    expect(width1).toBe(width2);
  });

  test("should recalculate after invalidation", () => {
    ScrollBarMetrics.get();

    ScrollBarMetrics.invalidate();

    const width = ScrollBarMetrics.get();
    expect(width).toBeTypeOf("number");
    expect(width).toBeGreaterThanOrEqual(0);
  });
});
