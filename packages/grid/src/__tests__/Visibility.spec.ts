import { describe, expect, test } from "vitest";
import { Visibility, isVisibility } from "../lib/Visibility";

describe("Visibility", () => {
  describe("constants", () => {
    test("should have Visible constant", () => {
      expect(Visibility.Visible).toBe("Visible");
    });

    test("should have Hidden constant", () => {
      expect(Visibility.Hidden).toBe("Hidden");
    });

    test("should have Collapsed constant", () => {
      expect(Visibility.Collapsed).toBe("Collapsed");
    });

    test("should have distinct values for each visibility state", () => {
      const values = [
        Visibility.Visible,
        Visibility.Hidden,
        Visibility.Collapsed,
      ];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(3);
    });

    test("should have correct property keys", () => {
      expect(Object.keys(Visibility).sort()).toEqual([
        "Collapsed",
        "Hidden",
        "Visible",
      ]);
    });
  });

  describe("isVisibility type guard", () => {
    test("should return true for Visible", () => {
      expect(isVisibility(Visibility.Visible)).toBe(true);
    });

    test("should return true for Hidden", () => {
      expect(isVisibility(Visibility.Hidden)).toBe(true);
    });

    test("should return true for Collapsed", () => {
      expect(isVisibility(Visibility.Collapsed)).toBe(true);
    });

    test("should return true for string values matching constants", () => {
      expect(isVisibility("Visible")).toBe(true);
      expect(isVisibility("Hidden")).toBe(true);
      expect(isVisibility("Collapsed")).toBe(true);
    });

    test("should return false for invalid string values", () => {
      expect(isVisibility("visible")).toBe(false); // case-sensitive
      expect(isVisibility("hidden")).toBe(false);
      expect(isVisibility("collapsed")).toBe(false);
      expect(isVisibility("Invalid")).toBe(false);
      expect(isVisibility("")).toBe(false);
    });

    test("should return false for non-string values", () => {
      expect(isVisibility(0)).toBe(false);
      expect(isVisibility(1)).toBe(false);
      expect(isVisibility(null)).toBe(false);
      expect(isVisibility(undefined)).toBe(false);
      expect(isVisibility({})).toBe(false);
      expect(isVisibility([])).toBe(false);
    });

    test("should return false for objects that are not visibility values", () => {
      expect(isVisibility({ Visible: true })).toBe(false);
      expect(isVisibility(Visibility)).toBe(false);
    });
  });
});
