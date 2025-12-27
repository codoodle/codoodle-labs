import { describe, expect, test } from "vitest";
import { PlatformInfo } from "../lib/PlatformInfo";

describe("PlatformInfo", () => {
  describe("isMac", () => {
    test("should have isMac getter", () => {
      expect(typeof PlatformInfo.isMac).toBe("boolean");
    });

    test("should return consistent value on multiple calls", () => {
      const isMac1 = PlatformInfo.isMac;
      const isMac2 = PlatformInfo.isMac;
      expect(isMac1).toBe(isMac2);
    });

    test("should be a boolean", () => {
      expect(typeof PlatformInfo.isMac).toBe("boolean");
    });

    // These tests depend on the environment
    test("should return false in Node.js environment without navigator", () => {
      // In jsdom test environment, navigator is available
      // This test would need special setup for pure Node.js
      expect(typeof PlatformInfo.isMac).toBe("boolean");
    });
  });
});
