import { expect, test, vi } from "vitest";
import { SupportEvent } from "../SupportEvent";

class TestSupportEvent extends SupportEvent {
  fn1() {
    this.emit({ name: "event1", source: this });
  }

  fn2() {
    this.emit({ name: "event1", source: this });
  }

  fn3() {
    this.emit({ name: "event2", source: this });
  }
}

const mockOnEvent1 = vi.fn();
const mockOnEvent2 = vi.fn();
test("SupportEvent", () => {
  const supportEvent = new TestSupportEvent();
  supportEvent.on("event1", mockOnEvent1);
  supportEvent.on("event1", mockOnEvent1);
  supportEvent.on("event2", mockOnEvent2);
  supportEvent.on("event2", mockOnEvent2);
  supportEvent.on("event2", mockOnEvent2);

  expect(mockOnEvent1).not.toHaveBeenCalled();
  expect(mockOnEvent2).not.toHaveBeenCalled();

  supportEvent.fn1();
  expect(mockOnEvent1).toBeCalledTimes(1);
  expect(mockOnEvent2).toBeCalledTimes(0);

  supportEvent.fn2();
  expect(mockOnEvent1).toBeCalledTimes(2);
  expect(mockOnEvent2).toBeCalledTimes(0);

  supportEvent.fn3();
  expect(mockOnEvent1).toBeCalledTimes(2);
  expect(mockOnEvent2).toBeCalledTimes(1);

  expect(mockOnEvent1).toHaveBeenCalledWith({
    name: "event1",
    source: supportEvent,
  });
  expect(mockOnEvent2).toHaveBeenCalledWith({
    name: "event2",
    source: supportEvent,
  });
});
