import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Size, toOptimizer } from "../lib";
import { Container } from "../lib/Container";

class TestContainer extends Container {
  private arrangeSize: Size | undefined;

  protected arrange(availableSize: Size): void {
    this.arrangeSize = availableSize;
  }

  getArrangeSize(): Size | undefined {
    return this.arrangeSize;
  }
}

describe("Container", () => {
  let container: TestContainer;
  let element: HTMLElement;

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
        } = container as any;
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
        } = container as any;
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
    container = new TestContainer(element);
    element.style.width = "200px";
    element.style.height = "100px";
  });

  afterEach(() => {
    if (!container.isDisposed) {
      container.dispose();
    }
    if (element.parentNode) {
      document.body.removeChild(element);
    }
  });

  describe("initialization", () => {
    test("should initialize and setup internal wrapper", () => {
      container.initialize();

      expect(container.isInitialized).toBe(true);
      expect(element.children.length).toBeGreaterThan(0);
    });

    test("should setup ResizeObserver on initialization", () => {
      const initSpy = vi.spyOn(container, "onInitialize" as any);
      container.initialize();

      expect(initSpy).toHaveBeenCalled();
      expect(container.isInitialized).toBe(true);
    });

    test("should not throw when initializing twice", () => {
      container.initialize();
      expect(() => container.initialize()).not.toThrow();
    });
  });

  describe("focus trap", () => {
    test("should create and register focus trap when focusTrappable is true", () => {
      const focusTrappableContainer = new TestContainer(element, true);
      focusTrappableContainer.initialize();

      expect(
        element.classList.contains("codoodle-control__focus-trappable"),
      ).toBe(true);
      const focusTrap = element.querySelector("[role='application']");
      expect(focusTrap).not.toBeNull();
      expect((focusTrap as HTMLElement).tabIndex).toBe(0);

      focusTrappableContainer.dispose();
    });

    test("should not create focus trap when focusTrappable is false", () => {
      container.initialize();

      const focusTrap = element.querySelector("[role='application']");
      expect(focusTrap).toBeNull();
      expect(
        element.classList.contains("codoodle-control__focus-trappable"),
      ).toBe(false);
    });

    test("should cleanup focus trap on dispose", () => {
      const focusTrappableContainer = new TestContainer(element, true);
      focusTrappableContainer.initialize();
      expect(
        element.classList.contains("codoodle-control__focus-trappable"),
      ).toBe(true);

      focusTrappableContainer.dispose();

      expect(
        element.classList.contains("codoodle-control__focus-trappable"),
      ).toBe(false);
      expect(element.querySelector("[role='application']")).toBeNull();
    });
  });

  describe("layout and measurement", () => {
    test("should call arrange during initialization", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      expect(container.getArrangeSize()).toBeDefined();
      expect(container.getArrangeSize()?.width).toBe(200);
      expect(container.getArrangeSize()?.height).toBe(100);
    });

    test("should track width and height changes", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      expect(container.getArrangeSize()?.width).toBe(200);
      expect(container.getArrangeSize()?.height).toBe(100);

      element.style.width = "300px";
      element.style.height = "150px";
      vi.advanceTimersToNextFrame();

      expect(container.getArrangeSize()?.width).toBe(300);
      expect(container.getArrangeSize()?.height).toBe(150);
    });

    test("should update arrange size on element resize", () => {
      container.initialize();

      element.style.width = "400px";
      element.style.height = "250px";
      vi.advanceTimersToNextFrame();

      const arrangeSize = container.getArrangeSize();
      expect(arrangeSize?.width).toBe(400);
      expect(arrangeSize?.height).toBe(250);
    });

    test("should invalidate layout when explicitly called", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      const initialSize = container.getArrangeSize();
      expect(initialSize).toBeDefined();

      container.invalidateLayout();

      const newSize = container.getArrangeSize();
      expect(newSize).toBeDefined();
      expect(newSize?.width).toBe(200);
      expect(newSize?.height).toBe(100);
    });
  });

  describe("events", () => {
    test("should support on subscription", () => {
      const handler = vi.fn();
      const unsubscribe = container.on("propertyChanges", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });

    test("should support once subscription", () => {
      const handler = vi.fn();
      const unsubscribe = container.once("propertyChanges", handler);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();
    });

    test("should support off unsubscription", () => {
      const handler = vi.fn();
      container.on("propertyChanges", handler);
      container.off("propertyChanges", handler);

      expect(typeof handler).toBe("function");
    });

    test("should support off all handlers", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      container.on("propertyChanges", handler1);
      container.on("propertyChanges", handler2);
      container.off("propertyChanges");

      // Both handlers should be unregistered
      expect(typeof handler1).toBe("function");
      expect(typeof handler2).toBe("function");
    });
  });

  describe("disposal", () => {
    test("should properly dispose and cleanup resources", () => {
      container.initialize();
      expect(container.isInitialized).toBe(true);
      expect(container.isDisposed).toBe(false);

      container.dispose();

      expect(container.isDisposed).toBe(true);
      expect(element.children.length).toBe(0);
    });

    test("should not throw when disposing already disposed container", () => {
      container.initialize();
      container.dispose();

      expect(() => container.dispose()).not.toThrow();
    });

    test("should clear focus elements on dispose", () => {
      const focusTrappableContainer = new TestContainer(element, true);
      focusTrappableContainer.initialize();

      focusTrappableContainer.dispose();

      expect(focusTrappableContainer.isDisposed).toBe(true);
    });

    test("should disconnect ResizeObserver on dispose", () => {
      container.initialize();

      container.dispose();

      expect(container.isDisposed).toBe(true);
    });
  });

  describe("element property", () => {
    test("should have correct element reference", () => {
      expect(container.element).toBe(element);
    });

    test("should not lose element reference after initialization", () => {
      container.initialize();
      expect(container.element).toBe(element);
    });
  });

  describe("resize handling", () => {
    test("should automatically handle element size changes", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      element.style.width = "400px";
      element.style.height = "200px";
      vi.advanceTimersToNextFrame();

      const arrangeSize = container.getArrangeSize();
      expect(arrangeSize?.width).toBe(400);
      expect(arrangeSize?.height).toBe(200);
    });

    test("should respond to very small element size", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      element.style.width = "50px";
      element.style.height = "25px";
      vi.advanceTimersToNextFrame();

      const arrangeSize = container.getArrangeSize();
      expect(arrangeSize?.width).toBe(50);
      expect(arrangeSize?.height).toBe(25);
    });

    test("should handle large element size", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      element.style.width = "1000px";
      element.style.height = "800px";
      vi.advanceTimersToNextFrame();

      const arrangeSize = container.getArrangeSize();
      expect(arrangeSize?.width).toBe(1000);
      expect(arrangeSize?.height).toBe(800);
    });

    test("should handle multiple consecutive size changes", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      element.style.width = "100px";
      element.style.height = "100px";
      vi.advanceTimersToNextFrame();
      expect(container.getArrangeSize()?.width).toBe(100);

      element.style.width = "200px";
      element.style.height = "200px";
      vi.advanceTimersToNextFrame();
      expect(container.getArrangeSize()?.width).toBe(200);

      element.style.width = "300px";
      element.style.height = "300px";
      vi.advanceTimersToNextFrame();
      expect(container.getArrangeSize()?.width).toBe(300);
    });
  });

  describe("state transitions", () => {
    test("should track initialization state correctly", () => {
      expect(container.isInitialized).toBe(false);
      expect(container.isDisposed).toBe(false);

      container.initialize();
      expect(container.isInitialized).toBe(true);
      expect(container.isDisposed).toBe(false);
    });

    test("should track disposal state correctly", () => {
      container.initialize();
      expect(container.isDisposed).toBe(false);

      container.dispose();
      expect(container.isDisposed).toBe(true);
      expect(container.isInitialized).toBe(true); // Remains initialized even after disposal
    });

    test("should handle multiple consecutive operations", () => {
      container.initialize();
      vi.advanceTimersToNextFrame();

      element.style.width = "300px";
      vi.advanceTimersToNextFrame();
      expect(container.getArrangeSize()?.width).toBe(300);

      element.style.width = "400px";
      vi.advanceTimersToNextFrame();
      expect(container.getArrangeSize()?.width).toBe(400);

      expect(container.isInitialized).toBe(true);
      expect(container.isDisposed).toBe(false);

      container.dispose();
      expect(container.isDisposed).toBe(true);
    });
  });
});
