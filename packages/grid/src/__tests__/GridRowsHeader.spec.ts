import { beforeEach, describe, expect, test, vi } from "vitest";
import { GridColumn } from "../lib/GridColumn";
import type { GridMerge } from "../lib/GridMerge";
import { GridRowsHeader } from "../lib/GridRowsHeader";

describe("GridRowsHeader", () => {
  describe("creation", () => {
    test("should create GridRowsHeader with default values", () => {
      const header = new GridRowsHeader();

      expect(header).toBeInstanceOf(GridRowsHeader);
      expect(header.isCollapsed).toBe(false);
      expect(header.merges).toBeUndefined();
    });

    test("should create GridRowsHeader with custom columnsFactory", () => {
      const factory = () => [new GridColumn(100)];
      const header = new GridRowsHeader(factory);

      expect(header.columnsFactory).toBe(factory);
      expect(header.columnsFactory()).toHaveLength(1);
    });

    test("should create GridRowsHeader with isCollapsed flag", () => {
      const header = new GridRowsHeader(() => [], true);

      expect(header.isCollapsed).toBe(true);
    });

    test("should create GridRowsHeader with merges", () => {
      const merges: GridMerge[] = [
        { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 2 },
      ];
      const header = new GridRowsHeader(() => [], false, merges);

      expect(header.merges).toBe(merges);
    });
  });

  describe("isCollapsed property", () => {
    let header: GridRowsHeader;

    beforeEach(() => {
      header = new GridRowsHeader();
    });

    test("should update isCollapsed value", () => {
      header.isCollapsed = true;
      expect(header.isCollapsed).toBe(true);

      header.isCollapsed = false;
      expect(header.isCollapsed).toBe(false);
    });

    test("should notify isCollapsed change", () => {
      const handler = { onPropertyChange: vi.fn() };
      header.on("isCollapsedChanged", (args) => {
        handler.onPropertyChange(args);
      });

      header.isCollapsed = true;

      expect(handler.onPropertyChange).toHaveBeenCalled();
      const args = (handler.onPropertyChange as any).mock.calls[0][0];
      expect(args.propertyName).toBe("isCollapsed");
      expect(args.value).toBe(true);
      expect(args.valuePrevious).toBe(false);
    });

    test("should not notify if value unchanged", () => {
      const handler = { onPropertyChange: vi.fn() };
      header.on("isCollapsedChanged", (args) => {
        handler.onPropertyChange(args);
      });

      header.isCollapsed = false; // Same as initial value

      expect(handler.onPropertyChange).not.toHaveBeenCalled();
    });
  });

  describe("merges property", () => {
    let header: GridRowsHeader;

    beforeEach(() => {
      header = new GridRowsHeader();
    });

    test("should update merges value", () => {
      const merges: GridMerge[] = [
        { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 2 },
      ];
      header.merges = merges;

      expect(header.merges).toBe(merges);
    });

    test("should notify merges change", () => {
      const handler = { onPropertyChange: vi.fn() };
      header.on("mergesChanged", (args) => {
        handler.onPropertyChange(args);
      });

      const merges: GridMerge[] = [
        { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 2 },
      ];
      header.merges = merges;

      expect(handler.onPropertyChange).toHaveBeenCalled();
      const args = (handler.onPropertyChange as any).mock.calls[0][0];
      expect(args.propertyName).toBe("merges");
      expect(args.value).toBe(merges);
      expect(args.valuePrevious).toBeUndefined();
    });

    test("should allow clearing merges", () => {
      const merges: GridMerge[] = [
        { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 2 },
      ];
      header.merges = merges;
      header.merges = undefined;

      expect(header.merges).toBeUndefined();
    });
  });

  describe("event subscription", () => {
    let header: GridRowsHeader;

    beforeEach(() => {
      header = new GridRowsHeader();
    });

    test("should support multiple event subscriptions", () => {
      const handler1 = { onPropertyChange: vi.fn() };
      const handler2 = { onPropertyChange: vi.fn() };

      header.on("isCollapsedChanged", (args) => {
        handler1.onPropertyChange(args);
      });
      header.on("isCollapsedChanged", (args) => {
        handler2.onPropertyChange(args);
      });

      header.isCollapsed = true;

      expect(handler1.onPropertyChange).toHaveBeenCalled();
      expect(handler2.onPropertyChange).toHaveBeenCalled();
    });

    test("should support event unsubscription", () => {
      const handler = { onPropertyChange: vi.fn() };
      const unsubscribe = header.on("isCollapsedChanged", (args) => {
        handler.onPropertyChange(args);
      });

      header.isCollapsed = true;
      expect(handler.onPropertyChange).toHaveBeenCalledTimes(1);

      unsubscribe();
      header.isCollapsed = false;
      expect(handler.onPropertyChange).toHaveBeenCalledTimes(1);
    });
  });
});
