import { describe, expect, test } from "vitest";
import {
  GridSelectionUnit,
  isGridSelectionUnit,
} from "../lib/GridSelectionUnit";

describe("GridSelectionUnit", () => {
  describe("constants", () => {
    test("should have Row constant", () => {
      expect(GridSelectionUnit.Row).toBe(0);
    });

    test("should have Column constant", () => {
      expect(GridSelectionUnit.Column).toBe(1);
    });

    test("should have Cell constant", () => {
      expect(GridSelectionUnit.Cell).toBe(2);
    });

    test("should have distinct values", () => {
      const values = [
        GridSelectionUnit.Row,
        GridSelectionUnit.Column,
        GridSelectionUnit.Cell,
      ];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(3);
    });

    test("should have correct order of constants", () => {
      expect(GridSelectionUnit.Row).toBe(0);
      expect(GridSelectionUnit.Column).toBe(1);
      expect(GridSelectionUnit.Cell).toBe(2);
    });
  });

  describe("isGridSelectionUnit type guard", () => {
    test("should return true for Row", () => {
      expect(isGridSelectionUnit(GridSelectionUnit.Row)).toBe(true);
    });

    test("should return true for Column", () => {
      expect(isGridSelectionUnit(GridSelectionUnit.Column)).toBe(true);
    });

    test("should return true for Cell", () => {
      expect(isGridSelectionUnit(GridSelectionUnit.Cell)).toBe(true);
    });

    test("should return true for valid numeric values", () => {
      expect(isGridSelectionUnit(0)).toBe(true);
      expect(isGridSelectionUnit(1)).toBe(true);
      expect(isGridSelectionUnit(2)).toBe(true);
    });

    test("should return false for invalid numeric values", () => {
      expect(isGridSelectionUnit(3)).toBe(false);
      expect(isGridSelectionUnit(-1)).toBe(false);
      expect(isGridSelectionUnit(999)).toBe(false);
    });

    test("should return false for non-numeric values", () => {
      expect(isGridSelectionUnit("Row")).toBe(false);
      expect(isGridSelectionUnit("0")).toBe(false);
      expect(isGridSelectionUnit(null)).toBe(false);
      expect(isGridSelectionUnit(undefined)).toBe(false);
      expect(isGridSelectionUnit({})).toBe(false);
      expect(isGridSelectionUnit([])).toBe(false);
    });

    test("should return false for floating point numbers outside valid range", () => {
      expect(isGridSelectionUnit(2.5)).toBe(false);
      expect(isGridSelectionUnit(3.5)).toBe(false);
      expect(isGridSelectionUnit(-0.5)).toBe(false);
    });

    test("should return false for floating point numbers", () => {
      // Floating point numbers are not valid GridSelectionUnit enums
      expect(isGridSelectionUnit(0.5)).toBe(false);
      expect(isGridSelectionUnit(1.5)).toBe(false);
    });
  });
});
