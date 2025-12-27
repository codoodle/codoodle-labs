import { describe, expect, test } from "vitest";
import type { GridBounds } from "../lib/GridBounds";

describe("GridBounds", () => {
  describe("GridBounds interface", () => {
    test("should allow creating valid GridBounds objects", () => {
      const bounds: GridBounds = {
        rowBegin: 0,
        rowEnd: 10,
        columnBegin: 0,
        columnEnd: 10,
      };
      expect(bounds.rowBegin).toBe(0);
      expect(bounds.rowEnd).toBe(10);
      expect(bounds.columnBegin).toBe(0);
      expect(bounds.columnEnd).toBe(10);
    });

    test("should allow negative indices", () => {
      const bounds: GridBounds = {
        rowBegin: -1,
        rowEnd: -1,
        columnBegin: -1,
        columnEnd: -1,
      };
      expect(bounds.rowBegin).toBe(-1);
    });

    test("should allow zero values", () => {
      const bounds: GridBounds = {
        rowBegin: 0,
        rowEnd: 0,
        columnBegin: 0,
        columnEnd: 0,
      };
      expect(bounds).toEqual({
        rowBegin: 0,
        rowEnd: 0,
        columnBegin: 0,
        columnEnd: 0,
      });
    });

    test("should support large indices", () => {
      const bounds: GridBounds = {
        rowBegin: 0,
        rowEnd: 1000000,
        columnBegin: 0,
        columnEnd: 1000000,
      };
      expect(bounds.rowEnd).toBe(1000000);
    });

    test("should allow rowEnd < rowBegin", () => {
      const bounds: GridBounds = {
        rowBegin: 10,
        rowEnd: 5,
        columnBegin: 10,
        columnEnd: 5,
      };
      expect(bounds.rowBegin).toBeGreaterThan(bounds.rowEnd);
    });

    test("should be a plain object structure", () => {
      const bounds: GridBounds = {
        rowBegin: 0,
        rowEnd: 5,
        columnBegin: 0,
        columnEnd: 5,
      };
      expect(Object.keys(bounds)).toEqual([
        "rowBegin",
        "rowEnd",
        "columnBegin",
        "columnEnd",
      ]);
    });
  });
});
