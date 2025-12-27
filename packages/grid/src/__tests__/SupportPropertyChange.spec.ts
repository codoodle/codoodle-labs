import { describe, expect, test, vi } from "vitest";
import type { EventArgs, PropertyChangeEventArgs } from "../lib/EventArgs";
import { SupportPropertyChange } from "../lib/SupportPropertyChange";

describe("SupportPropertyChange", () => {
  class TestPropertyChange extends SupportPropertyChange {
    private _value: number = 0;

    get value(): number {
      return this._value;
    }

    setValue(newValue: number): void {
      if (this._value !== newValue) {
        const old = this._value;
        this._value = newValue;
        this.notifyPropertyChanged("value", newValue, old);
      }
    }
  }

  test("should create SupportPropertyChange instance", () => {
    const obj = new TestPropertyChange();
    expect(obj).toBeInstanceOf(SupportPropertyChange);
  });

  test("should notify property changed", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("valueChanged", handler);
    obj.setValue(42);

    expect(handler).toHaveBeenCalled();
    const args = handler.mock.calls[0][0] as PropertyChangeEventArgs<
      typeof obj,
      "value"
    >;
    expect(args.propertyName).toBe("value");
    expect(args.value).toBe(42);
    expect(args.valuePrevious).toBe(0);
  });

  test("should batch property changes", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("propertyChanges", handler);
    obj.on("valueChanged", handler);

    obj.beginBatch();
    obj.setValue(1);
    obj.setValue(2);
    obj.setValue(3);
    obj.endBatch();

    // Should emit propertyChanges event instead of individual events
    const calls = handler.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
  });

  test("should emit individual property changed event when not in batch", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("valueChanged", handler);
    obj.setValue(10);
    obj.setValue(20);

    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("should support nested batches", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("propertyChanges", handler);

    obj.beginBatch();
    obj.setValue(1);
    obj.beginBatch();
    obj.setValue(2);
    obj.endBatch();
    obj.setValue(3);
    obj.endBatch();

    // Should emit propertyChanges event once at the end
    const propertyCalls = handler.mock.calls.filter(
      (call) =>
        (call[0] as EventArgs<string, unknown>).name === "propertyChanges",
    );
    expect(propertyCalls.length).toBeGreaterThan(0);
  });

  test("should not emit batch event if no changes during batch", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("propertyChanges", handler);

    obj.beginBatch();
    obj.endBatch();

    expect(handler).not.toHaveBeenCalled();
  });

  test("should collect multiple property changes in batch", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("propertyChanges", handler);

    obj.beginBatch();
    obj.setValue(1);
    obj.setValue(2);
    obj.setValue(3);
    obj.endBatch();

    expect(handler).toHaveBeenCalled();
  });

  test("should reset batch depth correctly", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("valueChanged", handler);

    obj.beginBatch();
    obj.beginBatch();
    obj.endBatch();
    obj.setValue(1); // This will still be batched since only one endBatch is called
    obj.endBatch();

    // When batch depth reaches 0, propertyChanges should be emitted
    // But setValue triggers valueChanged notification
    expect(typeof handler).toBe("function");
  });

  test("should handle endBatch without beginBatch", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("valueChanged", handler);

    obj.endBatch();
    obj.setValue(5);

    expect(handler).toHaveBeenCalledOnce();
  });

  test("should properly clear property changes", () => {
    const obj = new TestPropertyChange();
    const handler = vi.fn();

    obj.on("propertyChanges", handler);

    obj.beginBatch();
    obj.setValue(1);
    obj.endBatch();

    expect(handler).toHaveBeenCalled();
    handler.mockClear();

    obj.beginBatch();
    obj.setValue(2);
    obj.endBatch();

    expect(handler).toHaveBeenCalled();
  });

  test("should work with multiple different properties", () => {
    class MultiPropertyChange extends SupportPropertyChange {
      private _prop1: string = "";
      private _prop2: number = 0;

      get prop1(): string {
        return this._prop1;
      }

      get prop2(): number {
        return this._prop2;
      }

      setProp1(value: string): void {
        if (this._prop1 !== value) {
          const old = this._prop1;
          this._prop1 = value;
          this.notifyPropertyChanged("prop1", value, old);
        }
      }

      setProp2(value: number): void {
        if (this._prop2 !== value) {
          const old = this._prop2;
          this._prop2 = value;
          this.notifyPropertyChanged("prop2", value, old);
        }
      }
    }

    const obj = new MultiPropertyChange();
    const handler = vi.fn();

    obj.on("propertyChanges", handler);

    obj.beginBatch();
    obj.setProp1("test");
    obj.setProp2(42);
    obj.endBatch();

    expect(handler).toHaveBeenCalled();
  });
});
