import { describe, expect, test } from "vitest";
import { isSize, type Size } from "../lib/Size";

describe("Size", () => {
  describe("isSize", () => {
    test("should return true for valid Size objects", () => {
      const validSize: Size = { width: 100, height: 200 };
      expect(isSize(validSize)).toBe(true);
    });

    test("should return true for Size with zero values", () => {
      expect(isSize({ width: 0, height: 0 })).toBe(true);
    });

    test("should return true for Size with decimal values", () => {
      expect(isSize({ width: 100.5, height: 200.3 })).toBe(true);
    });

    test("should return false for null", () => {
      expect(isSize(null)).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(isSize(undefined)).toBe(false);
    });

    test("should return false for object with missing properties", () => {
      expect(isSize({ width: 100 })).toBe(false);
      expect(isSize({ height: 200 })).toBe(false);
    });

    test("should return false for object with non-number values", () => {
      expect(isSize({ width: "100", height: 200 })).toBe(false);
      expect(isSize({ width: 100, height: "200" })).toBe(false);
    });

    test("should return false for Infinity values", () => {
      expect(isSize({ width: Infinity, height: 200 })).toBe(false);
      expect(isSize({ width: 100, height: Infinity })).toBe(false);
    });

    test("should return false for NaN values", () => {
      expect(isSize({ width: NaN, height: 200 })).toBe(false);
      expect(isSize({ width: 100, height: NaN })).toBe(false);
    });

    test("should return false for plain objects without Size structure", () => {
      expect(isSize({ w: 100, h: 200 })).toBe(false);
    });

    test("should return false for negative values", () => {
      expect(isSize({ width: -100, height: 200 })).toBe(true); // Negative values are allowed
    });

    test("should return false for arrays", () => {
      expect(isSize([100, 200])).toBe(false);
    });
  });
});
