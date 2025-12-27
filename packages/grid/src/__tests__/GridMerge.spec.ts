import { describe, expect, test } from "vitest";
import type { GridMerge } from "../lib/GridMerge";

describe("GridMerge", () => {
  test("should create valid GridMerge object", () => {
    const merge: GridMerge = {
      rowIndex: 0,
      rowSpan: 2,
      columnIndex: 0,
      columnSpan: 3,
    };

    expect(merge.rowIndex).toBe(0);
    expect(merge.rowSpan).toBe(2);
    expect(merge.columnIndex).toBe(0);
    expect(merge.columnSpan).toBe(3);
  });

  test("should support single cell merge (1x1)", () => {
    const merge: GridMerge = {
      rowIndex: 5,
      rowSpan: 1,
      columnIndex: 5,
      columnSpan: 1,
    };

    expect(merge.rowSpan).toBe(1);
    expect(merge.columnSpan).toBe(1);
  });

  test("should support large merges", () => {
    const merge: GridMerge = {
      rowIndex: 0,
      rowSpan: 100,
      columnIndex: 0,
      columnSpan: 100,
    };

    expect(merge.rowSpan).toBe(100);
    expect(merge.columnSpan).toBe(100);
  });

  test("should support row merges only", () => {
    const merge: GridMerge = {
      rowIndex: 10,
      rowSpan: 5,
      columnIndex: 20,
      columnSpan: 1,
    };

    expect(merge.rowSpan).toBe(5);
    expect(merge.columnSpan).toBe(1);
  });

  test("should support column merges only", () => {
    const merge: GridMerge = {
      rowIndex: 10,
      rowSpan: 1,
      columnIndex: 20,
      columnSpan: 5,
    };

    expect(merge.rowSpan).toBe(1);
    expect(merge.columnSpan).toBe(5);
  });

  test("should allow zero indices", () => {
    const merge: GridMerge = {
      rowIndex: 0,
      rowSpan: 3,
      columnIndex: 0,
      columnSpan: 3,
    };

    expect(merge.rowIndex).toBe(0);
    expect(merge.columnIndex).toBe(0);
  });

  test("should work with multiple merge definitions", () => {
    const merges: GridMerge[] = [
      {
        rowIndex: 0,
        rowSpan: 2,
        columnIndex: 0,
        columnSpan: 2,
      },
      {
        rowIndex: 2,
        rowSpan: 2,
        columnIndex: 2,
        columnSpan: 2,
      },
    ];

    expect(merges.length).toBe(2);
    expect(merges[0].rowIndex).toBe(0);
    expect(merges[1].rowIndex).toBe(2);
  });
});
