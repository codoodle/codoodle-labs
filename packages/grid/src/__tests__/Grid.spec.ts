import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { toOptimizer } from "../lib";
import { Grid } from "../lib/Grid";
import { GridColumn } from "../lib/GridColumn";
import { GridColumnsHeader } from "../lib/GridColumnsHeader";
import { GridRow } from "../lib/GridRow";
import { GridRowsHeader } from "../lib/GridRowsHeader";
import { GridSelectionMode } from "../lib/GridSelectionMode";

describe("Grid", () => {
  let grid: Grid;
  let element: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();

    element = document.createElement("div");
    Object.defineProperty(element.style, "width", {
      configurable: true,
      get() {
        return this._width;
      },
      set(value: string) {
        this._width = value;
        const c: {
          _element: HTMLElement;
          _elementWrapper: HTMLElement;
          _measureOptimized: ReturnType<typeof toOptimizer> | undefined;
        } = grid as any;
        Object.defineProperty(c._element, "clientWidth", {
          configurable: true,
          value: parseInt(value, 10),
        });
        c._elementWrapper.style.width = value;
        Object.defineProperty(c._elementWrapper, "clientWidth", {
          configurable: true,
          value: parseInt(value, 10),
        });
        c._measureOptimized?.();
      },
    });
    Object.defineProperty(element.style, "height", {
      configurable: true,
      get() {
        return this._height;
      },
      set(value: string) {
        this._height = value;
        const c: {
          _element: HTMLElement;
          _elementWrapper: HTMLElement;
          _measureOptimized: ReturnType<typeof toOptimizer> | undefined;
        } = grid as any;
        Object.defineProperty(c._element, "clientHeight", {
          configurable: true,
          value: parseInt(value, 10),
        });
        c._elementWrapper.style.height = value;
        Object.defineProperty(c._elementWrapper, "clientHeight", {
          configurable: true,
          value: parseInt(value, 10),
        });
        c._measureOptimized?.();
      },
    });
    document.body.appendChild(element);

    const rows = [new GridRow(30), new GridRow(30), new GridRow(30)];
    const columns = [
      new GridColumn(100),
      new GridColumn(100),
      new GridColumn(100),
    ];

    grid = new Grid(element, {
      rows,
      columns,
    });
    element.style.width = "500px";
    element.style.height = "400px";
  });

  afterEach(() => {
    if (!grid.isDisposed) {
      grid.dispose();
    }
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  });

  describe("initialization", () => {
    test("should create Grid with rows and columns", () => {
      expect(grid).toBeInstanceOf(Grid);
      expect(grid.isDisposed).toBe(false);
      expect(grid.rows.length).toBe(3);
      expect(grid.columns.length).toBe(3);
    });

    test("should initialize grid and setup DOM structure", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      expect(grid.isInitialized).toBe(true);
      expect(element.children.length).toBeGreaterThan(0);
    });

    test("should accept custom row and column dimensions", () => {
      const rows = [new GridRow(25), new GridRow(35)];
      const columns = [new GridColumn(80), new GridColumn(120)];

      const newGrid = new Grid(element, { rows, columns });

      expect(newGrid.rows.length).toBe(2);
      expect(newGrid.columns.length).toBe(2);
      expect(newGrid.rows[0].height).toBe(25);
      expect(newGrid.rows[1].height).toBe(35);
      expect(newGrid.columns[0].width).toBe(80);
      expect(newGrid.columns[1].width).toBe(120);
      newGrid.dispose();
    });
  });

  describe("row and column management", () => {
    test("should maintain rows and columns with correct dimensions", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      expect(grid.rows.length).toBe(3);
      expect(grid.columns.length).toBe(3);
      expect(grid.rows.every((row) => row.height === 30)).toBe(true);
      expect(grid.columns.every((col) => col.width === 100)).toBe(true);
    });
  });

  describe("selection and merge", () => {
    test("should support selection properties", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      expect(grid.selectionMode).toBeDefined();
      expect(grid.selectionUnit).toBeDefined();
    });

    test("should fire selectionModeChanged event", () => {
      const handler = vi.fn();
      grid.on("selectionModeChanged", handler);

      grid.initialize();
      vi.advanceTimersToNextFrame();

      grid.selectionMode = GridSelectionMode.Single;

      expect(handler).toHaveBeenCalled();
      expect(grid.selectionMode).toBe(GridSelectionMode.Single);
      grid.off("selectionModeChanged", handler);
    });

    test("should fire selectionUnitChanged event", () => {
      const handler = vi.fn();
      grid.on("selectionUnitChanged", handler);

      grid.initialize();
      vi.advanceTimersToNextFrame();

      grid.selectionUnit = 1; // GridSelectionUnit.Column

      expect(handler).toHaveBeenCalled();
      expect(grid.selectionUnit).toBe(1);
      grid.off("selectionUnitChanged", handler);
    });

    test("should fire mergesChanged event", () => {
      const handler = vi.fn();
      grid.on("mergesChanged", handler);

      grid.initialize();
      vi.advanceTimersToNextFrame();

      grid.merges = [
        { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 2 },
      ];

      expect(handler).toHaveBeenCalled();
      expect(grid.merges.length).toBe(1);
      grid.off("mergesChanged", handler);
    });

    test("should support merge operations", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      grid.merges = [
        { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 2 },
      ];

      expect(Array.isArray(grid.merges)).toBe(true);
      expect(grid.merges.length).toBe(1);
      expect(grid.merges[0].rowSpan).toBe(2);
      expect(grid.merges[0].columnSpan).toBe(2);
    });
  });

  describe("lifecycle", () => {
    test("should initialize without errors", () => {
      expect(() => grid.initialize()).not.toThrow();
      vi.advanceTimersToNextFrame();
      expect(grid.isInitialized).toBe(true);
    });

    test("should dispose without errors", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();
      expect(() => grid.dispose()).not.toThrow();
      expect(grid.isDisposed).toBe(true);
    });

    test("should not throw when disposing twice", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();
      grid.dispose();

      const newElement = document.createElement("div");
      const newGrid = new Grid(newElement, {
        rows: [new GridRow(30)],
        columns: [new GridColumn(100)],
      });

      newGrid.dispose();
      expect(() => newGrid.dispose()).not.toThrow();
      expect(newGrid.isDisposed).toBe(true);
    });

    test("should clean up element on dispose", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();
      grid.dispose();

      expect(grid.isDisposed).toBe(true);
    });
  });

  describe("row and column access", () => {
    test("should provide access to rows with correct count", () => {
      expect(grid.rows.length).toBe(3);
      expect(grid.rows.every((row) => row instanceof GridRow)).toBe(true);
    });

    test("should provide access to columns with correct count", () => {
      expect(grid.columns.length).toBe(3);
      expect(grid.columns.every((col) => col instanceof GridColumn)).toBe(true);
    });
  });

  describe("grid parts", () => {
    test("should have grid parts after initialization", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      expect(grid.rowsHeader).toBeInstanceOf(GridRowsHeader);
      expect(grid.columnsHeader).toBeInstanceOf(GridColumnsHeader);
    });
  });

  describe("edge cases", () => {
    test("should handle empty merges array", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      grid.merges = [];
      expect(grid.merges.length).toBe(0);
    });

    test("should handle multiple selection mode changes", () => {
      grid.initialize();
      vi.advanceTimersToNextFrame();

      grid.selectionMode = GridSelectionMode.Single;
      grid.selectionMode = GridSelectionMode.Extended;
      grid.selectionMode = GridSelectionMode.None;

      expect(grid.selectionMode).toBe(GridSelectionMode.None);
    });
  });
});
