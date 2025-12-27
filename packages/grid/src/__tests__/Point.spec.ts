import { describe, expect, test } from "vitest";
import { isPoint, type Point } from "../lib/Point";

describe("Point", () => {
  describe("isPoint", () => {
    test("should return true for valid Point objects", () => {
      const validPoint: Point = { x: 10, y: 20 };
      expect(isPoint(validPoint)).toBe(true);
    });

    test("should return true for Point with zero values", () => {
      expect(isPoint({ x: 0, y: 0 })).toBe(true);
    });

    test("should return true for Point with negative values", () => {
      expect(isPoint({ x: -10, y: -20 })).toBe(true);
    });

    test("should return true for Point with decimal values", () => {
      expect(isPoint({ x: 10.5, y: 20.3 })).toBe(true);
    });

    test("should return false for null", () => {
      expect(isPoint(null)).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(isPoint(undefined)).toBe(false);
    });

    test("should return false for object with missing properties", () => {
      expect(isPoint({ x: 10 })).toBe(false);
      expect(isPoint({ y: 20 })).toBe(false);
    });

    test("should return false for object with non-number values", () => {
      expect(isPoint({ x: "10", y: 20 })).toBe(false);
      expect(isPoint({ x: 10, y: "20" })).toBe(false);
    });

    test("should return false for Infinity values", () => {
      expect(isPoint({ x: Infinity, y: 20 })).toBe(false);
      expect(isPoint({ x: 10, y: Infinity })).toBe(false);
    });

    test("should return false for NaN values", () => {
      expect(isPoint({ x: NaN, y: 20 })).toBe(false);
      expect(isPoint({ x: 10, y: NaN })).toBe(false);
    });

    test("should return false for plain objects without Point structure", () => {
      expect(isPoint({ a: 10, b: 20 })).toBe(false);
    });

    test("should return false for arrays", () => {
      expect(isPoint([10, 20])).toBe(false);
    });

    test("should return false for strings", () => {
      expect(isPoint("10,20")).toBe(false);
    });

    test("should return false for numbers", () => {
      expect(isPoint(42)).toBe(false);
    });
  });
});
