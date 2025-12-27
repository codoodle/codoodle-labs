import { describe, expect, test } from "vitest";
import { ControlKey, isControlKey } from "../lib/ControlKey";

describe("ControlKey", () => {
  describe("constants", () => {
    test("should have None constant", () => {
      expect(ControlKey.None).toBe("None");
    });

    test("should have First constant", () => {
      expect(ControlKey.First).toBe("First");
    });

    test("should have Last constant", () => {
      expect(ControlKey.Last).toBe("Last");
    });

    test("should have Home constant", () => {
      expect(ControlKey.Home).toBe("Home");
    });

    test("should have HomeFirst constant", () => {
      expect(ControlKey.HomeFirst).toBe("HomeFirst");
    });

    test("should have End constant", () => {
      expect(ControlKey.End).toBe("End");
    });

    test("should have EndLast constant", () => {
      expect(ControlKey.EndLast).toBe("EndLast");
    });

    test("should have PageUp constant", () => {
      expect(ControlKey.PageUp).toBe("PageUp");
    });

    test("should have PageDown constant", () => {
      expect(ControlKey.PageDown).toBe("PageDown");
    });

    test("should have ArrowLeft constant", () => {
      expect(ControlKey.ArrowLeft).toBe("ArrowLeft");
    });

    test("should have ArrowUp constant", () => {
      expect(ControlKey.ArrowUp).toBe("ArrowUp");
    });

    test("should have ArrowRight constant", () => {
      expect(ControlKey.ArrowRight).toBe("ArrowRight");
    });

    test("should have ArrowDown constant", () => {
      expect(ControlKey.ArrowDown).toBe("ArrowDown");
    });
  });

  describe("isControlKey", () => {
    test("should return true for ControlKey.None", () => {
      expect(isControlKey(ControlKey.None)).toBe(true);
    });

    test("should return true for ControlKey.First", () => {
      expect(isControlKey(ControlKey.First)).toBe(true);
    });

    test("should return true for ControlKey.Last", () => {
      expect(isControlKey(ControlKey.Last)).toBe(true);
    });

    test("should return true for ControlKey.Home", () => {
      expect(isControlKey(ControlKey.Home)).toBe(true);
    });

    test("should return true for ControlKey.PageDown", () => {
      expect(isControlKey(ControlKey.PageDown)).toBe(true);
    });

    test("should return true for ControlKey.ArrowRight", () => {
      expect(isControlKey(ControlKey.ArrowRight)).toBe(true);
    });

    test("should return true for string value of valid control key", () => {
      expect(isControlKey("None")).toBe(true);
      expect(isControlKey("ArrowDown")).toBe(true);
    });

    test("should return false for invalid string", () => {
      expect(isControlKey("InvalidKey")).toBe(false);
    });

    test("should return false for non-string values", () => {
      expect(isControlKey(123)).toBe(false);
      expect(isControlKey(null)).toBe(false);
      expect(isControlKey(undefined)).toBe(false);
    });

    test("should return false for objects", () => {
      expect(isControlKey({ key: "None" })).toBe(false);
    });

    test("should return false for arrays", () => {
      expect(isControlKey(["None"])).toBe(false);
    });

    test("should be case-sensitive", () => {
      expect(isControlKey("none")).toBe(false);
      expect(isControlKey("NONE")).toBe(false);
      expect(isControlKey("arrowdown")).toBe(false);
    });

    test("should return false for empty string", () => {
      expect(isControlKey("")).toBe(false);
    });
  });
});
