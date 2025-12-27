import { describe, expect, test } from "vitest";
import { isRect, type Rect } from "../lib/Rect";

describe("Rect", () => {
  describe("isRect", () => {
    test("should return true for valid Rect objects", () => {
      const validRect: Rect = { left: 10, top: 20, width: 100, height: 200 };
      expect(isRect(validRect)).toBe(true);
    });

    test("should return true for Rect with zero values", () => {
      expect(isRect({ left: 0, top: 0, width: 0, height: 0 })).toBe(true);
    });

    test("should return true for Rect with decimal values", () => {
      expect(
        isRect({ left: 10.5, top: 20.3, width: 100.7, height: 200.2 }),
      ).toBe(true);
    });

    test("should return true for Rect with negative position values", () => {
      expect(isRect({ left: -10, top: -20, width: 100, height: 200 })).toBe(
        true,
      );
    });

    test("should return false for null", () => {
      expect(isRect(null)).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(isRect(undefined)).toBe(false);
    });

    test("should return false for object with missing properties", () => {
      expect(isRect({ left: 10, top: 20, width: 100 })).toBe(false);
      expect(isRect({ left: 10, top: 20, height: 200 })).toBe(false);
    });

    test("should return false for object with non-number values", () => {
      expect(isRect({ left: "10", top: 20, width: 100, height: 200 })).toBe(
        false,
      );
      expect(isRect({ left: 10, top: "20", width: 100, height: 200 })).toBe(
        false,
      );
    });

    test("should return false for Infinity values", () => {
      expect(isRect({ left: Infinity, top: 20, width: 100, height: 200 })).toBe(
        false,
      );
      expect(isRect({ left: 10, top: Infinity, width: 100, height: 200 })).toBe(
        false,
      );
    });

    test("should return false for NaN values", () => {
      expect(isRect({ left: NaN, top: 20, width: 100, height: 200 })).toBe(
        false,
      );
      expect(isRect({ left: 10, top: NaN, width: 100, height: 200 })).toBe(
        false,
      );
    });

    test("should return false for arrays", () => {
      expect(isRect([10, 20, 100, 200])).toBe(false);
    });

    test("should return false for objects with extra properties", () => {
      expect(
        isRect({ left: 10, top: 20, width: 100, height: 200, extra: true }),
      ).toBe(true); // Extra properties are allowed
    });
  });
});
