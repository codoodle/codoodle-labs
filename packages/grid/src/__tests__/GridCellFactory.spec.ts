import { describe, expect, test } from "vitest";
import { DefaultGridCellFactory } from "../lib/GridCellFactory";
import { GridColumn } from "../lib/GridColumn";
import { GridPart } from "../lib/GridPart";
import { GridRow } from "../lib/GridRow";

describe("GridCellFactory", () => {
  test("should create DefaultGridCellFactory instance", () => {
    const factory = new DefaultGridCellFactory();
    expect(factory).toBeInstanceOf(DefaultGridCellFactory);
  });

  test("should have createCell method", () => {
    const factory = new DefaultGridCellFactory();
    expect(typeof factory.createCell).toBe("function");
  });

  test("should create cell with element", () => {
    const factory = new DefaultGridCellFactory();
    const element = document.createElement("div");
    const rows = [new GridRow(30)];
    const columns = [new GridColumn(100)];
    const part = new GridPart(GridPart.TYPE_BNN, rows, columns);

    const cell = factory.createCell(element, part, 0, 0, 1, 1);
    expect(cell).toBeDefined();
  });

  test("should create cells for grid parts", () => {
    const factory = new DefaultGridCellFactory();
    const element = document.createElement("div");
    const rows = [new GridRow(30), new GridRow(30)];
    const columns = [new GridColumn(100), new GridColumn(100)];
    const part = new GridPart(GridPart.TYPE_BNN, rows, columns);

    const cell1 = factory.createCell(element, part, 0, 0, 1, 1);
    const cell2 = factory.createCell(element, part, 1, 1, 1, 1);

    expect(cell1).toBeDefined();
    expect(cell2).toBeDefined();
  });
});
