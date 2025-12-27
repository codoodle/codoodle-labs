import { describe, expect, test } from "vitest";
import { GridColumn } from "../lib/GridColumn";
import type { GridOptions } from "../lib/GridOptions";
import { GridRow } from "../lib/GridRow";

describe("GridOptions", () => {
  test("should allow creating GridOptions with required properties", () => {
    const options: GridOptions = {
      rows: [new GridRow(30), new GridRow(30)],
      columns: [new GridColumn(100), new GridColumn(100)],
    };

    expect(options.rows).toHaveLength(2);
    expect(options.columns).toHaveLength(2);
  });

  test("should allow optional rowsFrozen property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30), new GridRow(30), new GridRow(30)],
      columns: [new GridColumn(100)],
      rowsFrozen: 1,
    };

    expect(options.rowsFrozen).toBe(1);
  });

  test("should allow optional columnsFrozen property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30)],
      columns: [new GridColumn(100), new GridColumn(100), new GridColumn(100)],
      columnsFrozen: 1,
    };

    expect(options.columnsFrozen).toBe(1);
  });

  test("should allow optional rowsHeader property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30)],
      columns: [new GridColumn(100)],
      // rowsHeader would be a GridRowsHeader instance
    };

    expect(options.rowsHeader).toBeUndefined();
  });

  test("should allow optional columnsHeader property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30)],
      columns: [new GridColumn(100)],
      // columnsHeader would be a GridColumnsHeader instance
    };

    expect(options.columnsHeader).toBeUndefined();
  });

  test("should allow selectionMode property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30)],
      columns: [new GridColumn(100)],
      selectionMode: 1, // GridSelectionMode.Single
    };

    expect(options.selectionMode).toBe(1);
  });

  test("should allow selectionUnit property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30)],
      columns: [new GridColumn(100)],
      selectionUnit: 2, // GridSelectionUnit.Cell
    };

    expect(options.selectionUnit).toBe(2);
  });

  test("should allow cellFactory property", () => {
    const mockFactory = {
      createCell: () => undefined,
    };

    const options: GridOptions = {
      rows: [new GridRow(30)],
      columns: [new GridColumn(100)],
      cellFactory: mockFactory as any,
    };

    expect(options.cellFactory).toBeDefined();
  });

  test("should allow merges property", () => {
    const options: GridOptions = {
      rows: [new GridRow(30), new GridRow(30)],
      columns: [new GridColumn(100), new GridColumn(100)],
      merges: [
        {
          rowIndex: 0,
          rowSpan: 2,
          columnIndex: 0,
          columnSpan: 2,
        },
      ],
    };

    expect(options.merges).toHaveLength(1);
  });

  test("should work with multiple configurations combined", () => {
    const options: GridOptions = {
      rows: [new GridRow(30), new GridRow(30), new GridRow(30)],
      rowsFrozen: 1,
      columns: [new GridColumn(100), new GridColumn(100)],
      columnsFrozen: 0,
      selectionMode: 2, // Extended
      selectionUnit: 2, // Cell
    };

    expect(options.rows).toHaveLength(3);
    expect(options.rowsFrozen).toBe(1);
    expect(options.columns).toHaveLength(2);
    expect(options.columnsFrozen).toBe(0);
    expect(options.selectionMode).toBe(2);
    expect(options.selectionUnit).toBe(2);
  });
});
