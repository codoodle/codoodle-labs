import { describe, expect, test } from "vitest";
import type { EventArgs, PropertyChangeEventArgs } from "../lib/EventArgs";

describe("EventArgs", () => {
  test("should create basic EventArgs", () => {
    const args: EventArgs<"test", unknown> = {
      name: "test",
      source: {},
    };

    expect(args.name).toBe("test");
    expect(args.source).toBeDefined();
  });

  test("should create PropertyChangeEventArgs", () => {
    const source = { prop: 42 };
    const args: PropertyChangeEventArgs<typeof source, "prop"> = {
      name: "propChanged",
      source,
      propertyName: "prop",
      value: 42,
      valuePrevious: 0,
    };

    expect(args.name).toBe("propChanged");
    expect(args.propertyName).toBe("prop");
    expect(args.value).toBe(42);
    expect(args.valuePrevious).toBe(0);
  });

  test("should support different value types", () => {
    const source = { name: "test", count: 10 };

    const stringArgs: PropertyChangeEventArgs<typeof source, "name"> = {
      name: "nameChanged",
      source,
      propertyName: "name",
      value: "test",
      valuePrevious: "old",
    };

    const numberArgs: PropertyChangeEventArgs<typeof source, "count"> = {
      name: "countChanged",
      source,
      propertyName: "count",
      value: 10,
      valuePrevious: 5,
    };

    expect(stringArgs.value).toBe("test");
    expect(numberArgs.value).toBe(10);
  });
});
