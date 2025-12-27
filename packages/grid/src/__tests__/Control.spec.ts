import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Control } from "../lib/Control";

class TestControl extends Control {
  protected onInitialize(): void {
    // Test implementation
  }
}

describe("Control", () => {
  let control: TestControl;
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
    control = new TestControl(element);
  });

  afterEach(() => {
    if (!control.isDisposed) {
      control.dispose();
    }
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  });

  describe("creation", () => {
    test("should create Control instance with element", () => {
      expect(control).toBeInstanceOf(Control);
    });

    test("should store reference to element", () => {
      expect(control.element).toBe(element);
    });

    test("should not be initialized on creation", () => {
      expect(control.isInitialized).toBe(false);
    });

    test("should not be disposed on creation", () => {
      expect(control.isDisposed).toBe(false);
    });
  });

  describe("initialization", () => {
    test("should call initialize without errors", () => {
      expect(() => control.initialize()).not.toThrow();
    });

    test("should set isInitialized to true after initialize", () => {
      control.initialize();
      expect(control.isInitialized).toBe(true);
    });

    test("should call onInitialize during initialization", () => {
      const onInitSpy = vi.spyOn(control, "onInitialize" as any);
      control.initialize();

      expect(onInitSpy).toHaveBeenCalled();
    });

    test("should not throw when initializing twice", () => {
      control.initialize();
      expect(() => control.initialize()).not.toThrow();
    });
  });

  describe("disposal", () => {
    test("should call dispose without errors", () => {
      control.initialize();
      expect(() => control.dispose()).not.toThrow();
    });

    test("should set isDisposed to true after dispose", () => {
      control.initialize();
      control.dispose();

      expect(control.isDisposed).toBe(true);
    });

    test("should not throw when disposing twice", () => {
      control.initialize();
      control.dispose();

      expect(() => control.dispose()).not.toThrow();
    });

    test("should not throw when disposing without initialization", () => {
      expect(() => control.dispose()).not.toThrow();
      expect(control.isDisposed).toBe(true);
    });
  });

  describe("batching", () => {
    test("should support beginBatch", () => {
      expect(typeof control.beginBatch).toBe("function");
      expect(() => control.beginBatch()).not.toThrow();
    });

    test("should support endBatch", () => {
      control.beginBatch();
      expect(typeof control.endBatch).toBe("function");
      expect(() => control.endBatch()).not.toThrow();
    });

    test("should support nested batching", () => {
      control.beginBatch();
      control.beginBatch();

      expect(() => control.endBatch()).not.toThrow();
      expect(() => control.endBatch()).not.toThrow();
    });
  });

  describe("events", () => {
    test("should support on subscription", () => {
      const handler = vi.fn();
      const unsubscribe = control.on("propertyChanges", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });

    test("should support once subscription", () => {
      const handler = vi.fn();
      const unsubscribe = control.once("propertyChanges", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });

    test("should support off unsubscription", () => {
      const handler = vi.fn();
      control.on("propertyChanges", handler);

      expect(() => control.off("propertyChanges", handler)).not.toThrow();
    });

    test("should fire disposed event before cleanup", () => {
      control.initialize();
      let eventFired = false;

      const unsubscribe = control.on("disposed", () => {
        eventFired = true;
      });

      control.dispose();

      expect(eventFired).toBe(true);
      unsubscribe();
    });
  });

  describe("property changes", () => {
    test("should support property change notifications", () => {
      const handler = vi.fn();
      const unsubscribe = control.on("propertyChanges", handler);

      // Verify subscription works
      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });
  });

  describe("edge cases", () => {
    test("should handle element without parent", () => {
      const orphanElement = document.createElement("div");
      const orphanControl = new TestControl(orphanElement);

      expect(() => orphanControl.initialize()).not.toThrow();
      expect(() => orphanControl.dispose()).not.toThrow();
    });

    test("should maintain element reference after operations", () => {
      control.initialize();
      const originalElement = control.element;

      control.dispose();

      expect(control.element).toBe(originalElement);
    });

    test("should handle rapid initialization cycles", () => {
      control.initialize();
      const first = control.isInitialized;
      control.dispose();

      const disposedState = control.isDisposed;

      expect(first).toBe(true);
      expect(disposedState).toBe(true);
    });

    test("should support batching across initialization", () => {
      control.beginBatch();
      control.initialize();
      control.endBatch();

      expect(control.isInitialized).toBe(true);
    });
  });

  describe("state consistency", () => {
    test("should maintain valid state after initialize", () => {
      control.initialize();

      expect(control.isInitialized).toBe(true);
      expect(control.isDisposed).toBe(false);
      expect(control.element).toBeDefined();
    });

    test("should maintain valid state after dispose", () => {
      control.initialize();
      control.dispose();

      expect(control.isDisposed).toBe(true);
      expect(control.element).toBeDefined(); // Element reference should persist
    });

    test("should handle multiple dispose calls safely", () => {
      control.initialize();
      control.dispose();
      control.dispose();
      control.dispose();

      expect(control.isDisposed).toBe(true);
    });
  });

  describe("batch operations", () => {
    test("should support multiple nested batches", () => {
      control.beginBatch();
      control.beginBatch();
      control.beginBatch();

      expect(() => {
        control.endBatch();
        control.endBatch();
        control.endBatch();
      }).not.toThrow();
    });

    test("should handle endBatch without beginBatch", () => {
      expect(() => control.endBatch()).not.toThrow();
    });

    test("should support batch during lifecycle", () => {
      control.beginBatch();
      control.initialize();
      control.beginBatch();
      control.endBatch();
      control.dispose();
      control.endBatch();

      expect(control.isDisposed).toBe(true);
    });
  });

  describe("event subscriptions", () => {
    test("should support multiple event subscriptions", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      const unsub1 = control.on("propertyChanges", handler1);
      const unsub2 = control.on("propertyChanges", handler2);
      const unsub3 = control.once("propertyChanges", handler3);

      expect(typeof unsub1).toBe("function");
      expect(typeof unsub2).toBe("function");
      expect(typeof unsub3).toBe("function");

      unsub1();
      unsub2();
      unsub3();
    });

    test("should handle event unsubscription before disposal", () => {
      const handler = vi.fn();
      const unsubscribe = control.on("propertyChanges", handler);

      control.initialize();
      unsubscribe();
      control.dispose();

      expect(control.isDisposed).toBe(true);
    });

    test("should support chained subscription and unsubscription", () => {
      const handler1 = control.on("propertyChanges", () => {});
      const handler2 = control.on("propertyChanges", () => {});

      handler1();
      handler2();

      expect(() => control.dispose()).not.toThrow();
    });
  });
});
