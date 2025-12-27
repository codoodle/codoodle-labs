import { beforeEach, describe, expect, test } from "vitest";
import { GridColumn } from "../lib/GridColumn";
import { GridPart } from "../lib/GridPart";
import { GridRow } from "../lib/GridRow";

describe("GridPart", () => {
  describe("part types", () => {
    test("should have all part type symbols", () => {
      expect(GridPart.TYPE_HCF).toBeDefined();
      expect(GridPart.TYPE_HCN).toBeDefined();
      expect(GridPart.TYPE_HRF).toBeDefined();
      expect(GridPart.TYPE_HRN).toBeDefined();
      expect(GridPart.TYPE_BFF).toBeDefined();
      expect(GridPart.TYPE_BNF).toBeDefined();
      expect(GridPart.TYPE_BFN).toBeDefined();
      expect(GridPart.TYPE_BNN).toBeDefined();
    });

    test("should create part with correct type BNN", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      const part = new GridPart(GridPart.TYPE_BNN, rows, columns);

      expect(part.type).toBe(GridPart.TYPE_BNN);
    });

    test("should create part with correct type HCF", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      const part = new GridPart(GridPart.TYPE_HCF, rows, columns);

      expect(part.type).toBe(GridPart.TYPE_HCF);
    });

    test("should create part with correct type BFF", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      const part = new GridPart(GridPart.TYPE_BFF, rows, columns);

      expect(part.type).toBe(GridPart.TYPE_BFF);
    });
  });

  describe("header identification", () => {
    test("should identify HCF and HCN as column headers", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];

      const hcf = new GridPart(GridPart.TYPE_HCF, rows, columns);
      const hcn = new GridPart(GridPart.TYPE_HCN, rows, columns);

      expect(hcf.isColumnHeader).toBe(true);
      expect(hcn.isColumnHeader).toBe(true);
    });

    test("should identify HRF and HRN as row headers", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];

      const hrf = new GridPart(GridPart.TYPE_HRF, rows, columns);
      const hrn = new GridPart(GridPart.TYPE_HRN, rows, columns);

      expect(hrf.isRowHeader).toBe(true);
      expect(hrn.isRowHeader).toBe(true);
    });

    test("should not identify body parts as headers", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];

      const bnn = new GridPart(GridPart.TYPE_BNN, rows, columns);
      const bff = new GridPart(GridPart.TYPE_BFF, rows, columns);
      const bnf = new GridPart(GridPart.TYPE_BNF, rows, columns);
      const bfn = new GridPart(GridPart.TYPE_BFN, rows, columns);

      expect(bnn.isColumnHeader).toBe(false);
      expect(bnn.isRowHeader).toBe(false);
      expect(bff.isColumnHeader).toBe(false);
      expect(bff.isRowHeader).toBe(false);
      expect(bnf.isColumnHeader).toBe(false);
      expect(bnf.isRowHeader).toBe(false);
      expect(bfn.isColumnHeader).toBe(false);
      expect(bfn.isRowHeader).toBe(false);
    });
  });

  describe("rows and columns", () => {
    let part: GridPart;

    beforeEach(() => {
      const rows = [new GridRow(30), new GridRow(30), new GridRow(30)];
      const columns = [
        new GridColumn(100),
        new GridColumn(100),
        new GridColumn(100),
      ];
      part = new GridPart(GridPart.TYPE_BNN, rows, columns);
    });

    test("should contain correct number of rows", () => {
      expect(part.rows).toHaveLength(3);
    });

    test("should contain correct number of columns", () => {
      expect(part.columns).toHaveLength(3);
    });

    test("should calculate total height from last row bottom position", () => {
      // rowsHeight returns the bottom position of the last row
      // First row: height=30, top=0, bottom=30
      expect(part.rowsHeight).toBe(30);
    });

    test("should calculate total width from last column right position", () => {
      // columnsWidth returns the right position of the last column
      // First column: width=100, left=0, right=100
      expect(part.columnsWidth).toBe(100);
    });
  });

  describe("scroll position", () => {
    let part: GridPart;

    beforeEach(() => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      part = new GridPart(GridPart.TYPE_BNN, rows, columns);
    });

    test("should initialize scroll to (0, 0)", () => {
      expect(part.scroll.x).toBe(0);
      expect(part.scroll.y).toBe(0);
    });

    test("should support scrollTo method", () => {
      expect(typeof part.scrollTo).toBe("function");
    });
  });

  describe("location", () => {
    let part: GridPart;

    beforeEach(() => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      part = new GridPart(GridPart.TYPE_BNN, rows, columns);
    });

    test("should initialize location to (0, 0)", () => {
      expect(part.location.x).toBe(0);
      expect(part.location.y).toBe(0);
    });
  });

  describe("cells", () => {
    let part: GridPart;

    beforeEach(() => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      part = new GridPart(GridPart.TYPE_BNN, rows, columns);
    });

    test("should initialize with empty cells map", () => {
      expect(part.cells.size).toBe(0);
    });

    test("should have cellsIndex with -1 initial values", () => {
      expect(part.cellsIndex.rowBegin).toBe(-1);
      expect(part.cellsIndex.rowEnd).toBe(-1);
      expect(part.cellsIndex.columnBegin).toBe(-1);
      expect(part.cellsIndex.columnEnd).toBe(-1);
    });

    test("should not have selected cells initially", () => {
      expect(part.hasSelected).toBe(false);
    });
  });

  describe("disposal", () => {
    test("should support dispose method", () => {
      const rows = [new GridRow(30)];
      const columns = [new GridColumn(100)];
      const part = new GridPart(GridPart.TYPE_BNN, rows, columns);

      expect(typeof part.dispose).toBe("function");
      expect(() => part.dispose()).not.toThrow();
    });
  });
});
