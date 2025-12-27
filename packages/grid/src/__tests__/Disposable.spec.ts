import { describe, expect, test } from "vitest";
import { isDisposable, type Disposable } from "../lib/Disposable";

describe("Disposable", () => {
  describe("isDisposable", () => {
    test("should return true for objects with dispose method", () => {
      const disposable: Disposable = {
        dispose: () => {
          // No-op
        },
      };
      expect(isDisposable(disposable)).toBe(true);
    });

    test("should return true for objects with dispose method and other properties", () => {
      const disposable = {
        name: "test",
        dispose: () => {
          // No-op
        },
      };
      expect(isDisposable(disposable)).toBe(true);
    });

    test("should return false for null", () => {
      expect(isDisposable(null)).toBe(false);
    });

    test("should return false for undefined", () => {
      expect(isDisposable(undefined)).toBe(false);
    });

    test("should return false for object without dispose method", () => {
      expect(isDisposable({ name: "test" })).toBe(false);
    });

    test("should return false for object with dispose as non-function property", () => {
      expect(isDisposable({ dispose: "not a function" })).toBe(false);
    });

    test("should return false for strings", () => {
      expect(isDisposable("not disposable")).toBe(false);
    });

    test("should return false for numbers", () => {
      expect(isDisposable(42)).toBe(false);
    });

    test("should return false for arrays", () => {
      expect(isDisposable([])).toBe(false);
    });

    test("should return false for empty objects", () => {
      expect(isDisposable({})).toBe(false);
    });
  });
});
