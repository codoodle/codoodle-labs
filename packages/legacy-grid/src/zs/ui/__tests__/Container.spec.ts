import { afterAll, expect, test, vi } from "vitest";
import { Container, initializationWithMeasure } from "../Container";

class SubControl extends Container {
  initialize(): void {
    super.initialize();
    console.log("initialize SubControl");
  }

  arrange(): void {
    throw new Error("Method not implemented.");
  }
}

class TestControl extends SubControl {
  @initializationWithMeasure
  initialize() {
    super.initialize();
    console.log("initialize TestControl");
  }
}

const mockOnInitialized = vi.fn();
const mockOnDisposed = vi.fn();
const mockOnPropertyChanged = vi.fn();
const mockArrange = vi.fn();
TestControl.prototype.arrange = mockArrange;

const originalClientWidth = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "clientWidth",
);
const originalClientHeight = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "clientHeight",
);

test("control event", async () => {
  const element = document.createElement("div");
  const control = new TestControl(element);
  control.on("initialized", mockOnInitialized);
  control.on("initialized", mockOnInitialized);
  control.on("disposed", mockOnDisposed);
  control.on("disposed", mockOnDisposed);
  control.on("disposed", mockOnDisposed);
  control.on("widthChanged", mockOnPropertyChanged);
  control.on("heightChanged", mockOnPropertyChanged);

  expect(control.isInitialized).toBeFalsy();
  expect(control.isDisposed).toBeFalsy();
  expect(mockOnInitialized).not.toHaveBeenCalled();
  expect(mockOnDisposed).not.toHaveBeenCalled();

  control.initialize();
  expect(control.isInitialized).toBeTruthy();
  expect(control.isDisposed).toBeFalsy();
  expect(mockOnInitialized).toBeCalledTimes(1);
  expect(mockOnInitialized).toHaveBeenCalledWith({
    name: "initialized",
    source: control,
  });

  expect(mockArrange).toBeCalledTimes(1);
  expect(mockArrange).toHaveBeenCalledWith({ width: 0, height: 0 });

  control.measure(false);
  expect(mockArrange).toBeCalledTimes(1);

  control.measure(true);
  expect(mockArrange).toBeCalledTimes(2);

  control.measure(false);
  expect(mockArrange).toBeCalledTimes(2);

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    value: 101,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: 102,
  });
  control.measure(false);
  expect(mockArrange).toBeCalledTimes(3);
  expect(mockArrange).toHaveBeenCalledWith({ width: 101, height: 102 });
  expect(mockOnPropertyChanged).toBeCalledTimes(2);
  expect(mockOnPropertyChanged).toHaveBeenNthCalledWith(1, {
    name: "widthChanged",
    source: control,
    propertyName: "width",
    value: 101,
    valuePrevious: 0,
  });
  expect(mockOnPropertyChanged).toHaveBeenNthCalledWith(2, {
    name: "heightChanged",
    source: control,
    propertyName: "height",
    value: 102,
    valuePrevious: 0,
  });

  control.dispose();
  expect(control.isInitialized).toBeFalsy();
  expect(control.isDisposed).toBeTruthy();
  expect(mockOnDisposed).toBeCalledTimes(1);
  expect(mockOnDisposed).toHaveBeenCalledWith({
    name: "disposed",
    source: control,
  });
});

afterAll(() => {
  if (originalClientWidth) {
    Object.defineProperty(
      Element.prototype,
      "clientWidth",
      originalClientWidth,
    );
  }
  if (originalClientHeight) {
    Object.defineProperty(
      Element.prototype,
      "clientHeight",
      originalClientHeight,
    );
  }
});
