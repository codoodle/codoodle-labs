import { describe, expect, test, vi } from "vitest";
import { GridColumn } from "../lib/GridColumn";
import { Visibility } from "../lib/Visibility";

describe("GridColumn", () => {
  describe("creation and basic properties", () => {
    test("should create GridColumn with specified width", () => {
      const column = new GridColumn(100);
      expect(column.width).toBe(100);
    });

    test("should accept visibility parameter", () => {
      const column = new GridColumn(100, Visibility.Visible);
      expect(column.visibility).toBe(Visibility.Visible);
    });

    test("should default to Visible visibility", () => {
      const column = new GridColumn(80);
      expect(column.visibility).toBe(Visibility.Visible);
    });
  });

  describe("positioning", () => {
    test("should have default index of -1", () => {
      const column = new GridColumn(100);
      expect(column.index).toBe(-1);
    });

    test("should have default left position of 0", () => {
      const column = new GridColumn(100);
      expect(column.left).toBe(0);
    });

    test("should calculate right position correctly", () => {
      const column = new GridColumn(100);
      // right = left + width = 0 + 100 = 100
      expect(column.right).toBe(100);
    });

    test("should calculate right with non-zero left position", () => {
      const column = new GridColumn(100);
      (column as any)._left = 200; // Set left to 200
      // right = left + width = 200 + 100 = 300
      expect(column.right).toBe(300);
    });
  });

  describe("width management", () => {
    test("should allow setting width", () => {
      const column = new GridColumn(100);
      column.width = 150;
      expect(column.width).toBe(150);
    });

    test("should return 0 width when visibility is Collapsed", () => {
      const column = new GridColumn(100);
      column.visibility = Visibility.Collapsed;
      expect(column.width).toBe(0);
    });

    test("should return actual width when visibility is Hidden", () => {
      const column = new GridColumn(100);
      column.visibility = Visibility.Hidden;
      expect(column.width).toBe(100);
    });
  });

  describe("visibility", () => {
    test("should support Visible visibility", () => {
      const column = new GridColumn(100);
      column.visibility = Visibility.Visible;
      expect(column.visibility).toBe(Visibility.Visible);
      expect(column.width).toBeGreaterThan(0);
    });

    test("should support Hidden visibility", () => {
      const column = new GridColumn(100);
      column.visibility = Visibility.Hidden;
      expect(column.visibility).toBe(Visibility.Hidden);
      expect(column.width).toBeGreaterThan(0);
    });

    test("should support Collapsed visibility", () => {
      const column = new GridColumn(100);
      column.visibility = Visibility.Collapsed;
      expect(column.visibility).toBe(Visibility.Collapsed);
      expect(column.width).toBe(0);
    });
  });

  describe("batching", () => {
    test("should support batch operations", () => {
      const column = new GridColumn(100);

      expect(typeof column.beginBatch).toBe("function");
      expect(typeof column.endBatch).toBe("function");
    });
  });

  describe("events", () => {
    test("should support property change subscription", () => {
      const column = new GridColumn(100);
      const handler = vi.fn();
      const unsubscribe = column.on("widthChanged", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });

    test("should support width change event", () => {
      const column = new GridColumn(100);
      const handler = vi.fn();
      const unsubscribe = column.on("widthChanged", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });
  });

  describe("disposal", () => {
    test("should support disposal", () => {
      const column = new GridColumn(100);

      expect(typeof column.dispose).toBe("function");
      expect(() => column.dispose()).not.toThrow();
    });
  });
});
