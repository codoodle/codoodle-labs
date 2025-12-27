import { describe, expect, test, vi } from "vitest";
import type { EventArgs } from "../lib/EventArgs";
import { SupportEvent } from "../lib/SupportEvent";

class TestEvent extends SupportEvent {
  trigger(args: EventArgs<string, this>): boolean {
    return this.emit(args);
  }
}

describe("SupportEvent", () => {
  test("should create SupportEvent instance", () => {
    const event = new TestEvent();
    expect(event).toBeInstanceOf(SupportEvent);
  });

  test("should register event handler with on", () => {
    const event = new TestEvent();
    const handler = vi.fn();
    event.on("test", handler);
    expect(handler).not.toHaveBeenCalled();
  });

  test("should return unsubscribe function from on", () => {
    const event = new TestEvent();
    const handler = vi.fn();
    const unsubscribe = event.on("test", handler);
    expect(typeof unsubscribe).toBe("function");
  });

  test("should emit events", () => {
    const event = new TestEvent();
    const handler = vi.fn();
    event.on("test", handler);

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    const result = event.trigger(args);

    expect(handler).toHaveBeenCalledWith(args);
    expect(result).toBe(true);
  });

  test("should return false when no handlers for event", () => {
    const event = new TestEvent();
    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    const result = event.trigger(args);
    expect(result).toBe(false);
  });

  test("should support multiple handlers for same event", () => {
    const event = new TestEvent();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    event.on("test", handler1);
    event.on("test", handler2);

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    event.trigger(args);

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  test("should not duplicate handlers for same event", () => {
    const event = new TestEvent();
    const handler = vi.fn();

    event.on("test", handler);
    event.on("test", handler);

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    event.trigger(args);

    expect(handler).toHaveBeenCalledOnce();
  });

  test("should unsubscribe handler", () => {
    const event = new TestEvent();
    const handler = vi.fn();

    event.on("test", handler);
    event.off("test", handler);

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    event.trigger(args);

    expect(handler).not.toHaveBeenCalled();
  });

  test("should unsubscribe handler with return function", () => {
    const event = new TestEvent();
    const handler = vi.fn();

    const unsubscribe = event.on("test", handler);
    unsubscribe();

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    event.trigger(args);

    expect(handler).not.toHaveBeenCalled();
  });

  test("should clear all handlers for event when no handler specified", () => {
    const event = new TestEvent();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    event.on("test", handler1);
    event.on("test", handler2);
    event.off("test");

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    event.trigger(args);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  test("should register one-time event handler with once", () => {
    const event = new TestEvent();
    const handler = vi.fn();

    event.once("test", handler);

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };

    event.trigger(args);
    expect(handler).toHaveBeenCalledOnce();

    event.trigger(args);
    expect(handler).toHaveBeenCalledOnce(); // Still only called once
  });

  test("should return unsubscribe function from once", () => {
    const event = new TestEvent();
    const handler = vi.fn();

    const unsubscribe = event.once("test", handler);
    unsubscribe();

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    event.trigger(args);

    expect(handler).not.toHaveBeenCalled();
  });

  test("should support multiple different events", () => {
    const event = new TestEvent();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    event.on("event1", handler1);
    event.on("event2", handler2);

    const args1: EventArgs<"event1", typeof event> = {
      name: "event1",
      source: event,
    };
    const args2: EventArgs<"event2", typeof event> = {
      name: "event2",
      source: event,
    };

    event.trigger(args1);
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).not.toHaveBeenCalled();

    event.trigger(args2);
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  test("should dispose event", () => {
    const event = new TestEvent();
    const handler = vi.fn();

    event.on("test", handler);
    event.dispose();

    const args: EventArgs<"test", typeof event> = {
      name: "test",
      source: event,
    };
    const result = event.trigger(args);

    expect(handler).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  test("should clear all events on dispose", () => {
    const event = new TestEvent();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    event.on("event1", handler1);
    event.on("event2", handler2);
    event.dispose();

    const args1: EventArgs<"event1", typeof event> = {
      name: "event1",
      source: event,
    };
    const args2: EventArgs<"event2", typeof event> = {
      name: "event2",
      source: event,
    };

    event.trigger(args1);
    event.trigger(args2);

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });
});
