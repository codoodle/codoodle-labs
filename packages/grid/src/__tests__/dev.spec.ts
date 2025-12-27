import { describe, expect, test } from "vitest";
import { __DEV__ } from "../lib/dev";

describe("dev", () => {
  test("should export __DEV__ constant", () => {
    expect(typeof __DEV__).toBe("boolean");
  });

  test("__DEV__ should be boolean", () => {
    expect(__DEV__).toBe(true); // In test environment, NODE_ENV is not 'production'
  });
});
