import { expect, test, vi } from "vitest";
import { Control, initialization, initializationRequired } from "../Control";

class SubControl extends Control {
  @initialization
  initialize() {
    super.initialize();
    console.log("initialize SubControl");
  }
}

class TestControl extends SubControl {
  @initialization
  initialize() {
    super.initialize();
    console.log("initialize TestControl");
  }

  @initializationRequired
  test() {
    console.log("test");
  }
}

const mockOnInitialized = vi.fn();
const mockOnDisposed = vi.fn();

test("control event", async () => {
  const element = document.createElement("div");
  const control = new TestControl(element);
  control.on("initialized", mockOnInitialized);
  control.on("initialized", mockOnInitialized);
  control.on("disposed", mockOnDisposed);
  control.on("disposed", mockOnDisposed);
  control.on("disposed", mockOnDisposed);

  expect(control.isInitialized).toBeFalsy();
  expect(control.isDisposed).toBeFalsy();
  expect(mockOnInitialized).not.toHaveBeenCalled();
  expect(mockOnDisposed).not.toHaveBeenCalled();

  try {
    control.test();
  } catch (error) {
    expect((error as Error).message).toBe(
      '"test" can be executed after initialization.',
    );
  }

  control.initialize();
  expect(control.isInitialized).toBeTruthy();
  expect(control.isDisposed).toBeFalsy();
  expect(mockOnInitialized).toBeCalledTimes(1);
  expect(mockOnInitialized).toHaveBeenCalledWith({
    name: "initialized",
    source: control,
  });

  control.test();
  control.dispose();
  expect(control.isInitialized).toBeFalsy();
  expect(control.isDisposed).toBeTruthy();
  expect(mockOnDisposed).toBeCalledTimes(1);
  expect(mockOnDisposed).toHaveBeenCalledWith({
    name: "disposed",
    source: control,
  });
});
