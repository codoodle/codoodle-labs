import { describe, expect, test, vi } from "vitest";
import { GridRow } from "../lib/GridRow";
import { Visibility } from "../lib/Visibility";

describe("GridRow", () => {
  describe("creation and basic properties", () => {
    test("should create GridRow with specified height", () => {
      const row = new GridRow(30);
      expect(row.height).toBe(30);
    });

    test("should accept visibility parameter", () => {
      const row = new GridRow(30, Visibility.Visible);
      expect(row.visibility).toBe(Visibility.Visible);
    });

    test("should default to Visible visibility", () => {
      const row = new GridRow(25);
      expect(row.visibility).toBe(Visibility.Visible);
    });
  });

  describe("positioning", () => {
    test("should have default index of -1", () => {
      const row = new GridRow(30);
      expect(row.index).toBe(-1);
    });

    test("should have default top position of 0", () => {
      const row = new GridRow(30);
      expect(row.top).toBe(0);
    });

    test("should calculate bottom position correctly", () => {
      const row = new GridRow(30);
      // bottom = top + height = 0 + 30 = 30
      expect(row.bottom).toBe(30);
    });

    test("should calculate bottom with non-zero top position", () => {
      const row = new GridRow(40);
      (row as any)._top = 100; // Set top to 100
      // bottom = top + height = 100 + 40 = 140
      expect(row.bottom).toBe(140);
    });
  });

  describe("height management", () => {
    test("should allow setting height", () => {
      const row = new GridRow(30);
      row.height = 50;
      expect(row.height).toBe(50);
    });

    test("should return 0 width when visibility is Collapsed", () => {
      const row = new GridRow(30);
      row.visibility = Visibility.Collapsed;
      expect(row.height).toBe(0);
    });

    test("should return actual height when visibility is Hidden", () => {
      const row = new GridRow(30);
      row.visibility = Visibility.Hidden;
      expect(row.height).toBe(30);
    });
  });

  describe("visibility", () => {
    test("should support Visible visibility", () => {
      const row = new GridRow(30);
      row.visibility = Visibility.Visible;
      expect(row.visibility).toBe(Visibility.Visible);
      expect(row.height).toBeGreaterThan(0);
    });

    test("should support Hidden visibility", () => {
      const row = new GridRow(30);
      row.visibility = Visibility.Hidden;
      expect(row.visibility).toBe(Visibility.Hidden);
      expect(row.height).toBeGreaterThan(0);
    });

    test("should support Collapsed visibility", () => {
      const row = new GridRow(30);
      row.visibility = Visibility.Collapsed;
      expect(row.visibility).toBe(Visibility.Collapsed);
      expect(row.height).toBe(0);
    });
  });

  describe("batching", () => {
    test("should support batch operations", () => {
      const row = new GridRow(30);

      expect(typeof row.beginBatch).toBe("function");
      expect(typeof row.endBatch).toBe("function");
    });
  });

  describe("events", () => {
    test("should support property change subscription", () => {
      const row = new GridRow(30);
      const handler = vi.fn();
      const unsubscribe = row.on("heightChanged", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });

    test("should support height change event", () => {
      const row = new GridRow(30);
      const handler = vi.fn();
      const unsubscribe = row.on("heightChanged", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });
  });

  describe("disposal", () => {
    test("should support disposal", () => {
      const row = new GridRow(30);

      expect(typeof row.dispose).toBe("function");
      expect(() => row.dispose()).not.toThrow();
    });
  });
});
