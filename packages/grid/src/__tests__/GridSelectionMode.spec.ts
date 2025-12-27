import { describe, expect, test } from "vitest";
import {
  GridSelectionMode,
  isGridSelectionMode,
} from "../lib/GridSelectionMode";

describe("GridSelectionMode", () => {
  describe("constants", () => {
    test("should have None constant", () => {
      expect(GridSelectionMode.None).toBe(0);
    });

    test("should have Single constant", () => {
      expect(GridSelectionMode.Single).toBe(1);
    });

    test("should have Extended constant", () => {
      expect(GridSelectionMode.Extended).toBe(2);
    });

    test("should have distinct values", () => {
      const values = [
        GridSelectionMode.None,
        GridSelectionMode.Single,
        GridSelectionMode.Extended,
      ];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(3);
    });

    test("should have correct order of constants", () => {
      expect(GridSelectionMode.None).toBeLessThan(GridSelectionMode.Single);
      expect(GridSelectionMode.Single).toBeLessThan(GridSelectionMode.Extended);
    });
  });

  describe("isGridSelectionMode type guard", () => {
    test("should return true for None", () => {
      expect(isGridSelectionMode(GridSelectionMode.None)).toBe(true);
    });

    test("should return true for Single", () => {
      expect(isGridSelectionMode(GridSelectionMode.Single)).toBe(true);
    });

    test("should return true for Extended", () => {
      expect(isGridSelectionMode(GridSelectionMode.Extended)).toBe(true);
    });

    test("should return true for valid numeric values", () => {
      expect(isGridSelectionMode(0)).toBe(true);
      expect(isGridSelectionMode(1)).toBe(true);
      expect(isGridSelectionMode(2)).toBe(true);
    });

    test("should return false for invalid numeric values", () => {
      expect(isGridSelectionMode(3)).toBe(false);
      expect(isGridSelectionMode(-1)).toBe(false);
      expect(isGridSelectionMode(999)).toBe(false);
    });

    test("should return false for non-numeric values", () => {
      expect(isGridSelectionMode("None")).toBe(false);
      expect(isGridSelectionMode("0")).toBe(false);
      expect(isGridSelectionMode(null)).toBe(false);
      expect(isGridSelectionMode(undefined)).toBe(false);
      expect(isGridSelectionMode({})).toBe(false);
      expect(isGridSelectionMode([])).toBe(false);
    });

    test("should return false for floating point numbers outside valid range", () => {
      expect(isGridSelectionMode(2.5)).toBe(false);
      expect(isGridSelectionMode(3.5)).toBe(false);
      expect(isGridSelectionMode(-0.5)).toBe(false);
    });

    test("should return false for floating point numbers", () => {
      // Floating point numbers are not valid GridSelectionMode enums
      expect(isGridSelectionMode(0.5)).toBe(false);
      expect(isGridSelectionMode(1.5)).toBe(false);
    });
  });
});
