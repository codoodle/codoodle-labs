import { describe, expect, test } from "vitest";
import { Direction, hasDirection, isDirection } from "../lib/Direction";

describe("Direction", () => {
  describe("constants", () => {
    test("should have None constant", () => {
      expect(Direction.None).toBe(0);
    });

    test("should have Left constant", () => {
      expect(Direction.Left).toBe(1);
    });

    test("should have Up constant", () => {
      expect(Direction.Up).toBe(2);
    });

    test("should have Right constant", () => {
      expect(Direction.Right).toBe(4);
    });

    test("should have Down constant", () => {
      expect(Direction.Down).toBe(8);
    });

    test("should have distinct values for each direction", () => {
      const values = [
        Direction.Left,
        Direction.Up,
        Direction.Right,
        Direction.Down,
      ];
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(4);
    });
  });

  describe("isDirection", () => {
    test("should return true for Direction.None", () => {
      expect(isDirection(Direction.None)).toBe(true);
    });

    test("should return true for Direction.Left", () => {
      expect(isDirection(Direction.Left)).toBe(true);
    });

    test("should return true for Direction.Up", () => {
      expect(isDirection(Direction.Up)).toBe(true);
    });

    test("should return true for Direction.Right", () => {
      expect(isDirection(Direction.Right)).toBe(true);
    });

    test("should return true for Direction.Down", () => {
      expect(isDirection(Direction.Down)).toBe(true);
    });

    test("should return true for valid combination (Left | Up)", () => {
      expect(isDirection(Direction.Left | Direction.Up)).toBe(true);
    });

    test("should return true for valid combination (Right | Down)", () => {
      expect(isDirection(Direction.Right | Direction.Down)).toBe(true);
    });

    test("should return false for all directions combined", () => {
      const allDirections =
        Direction.Left | Direction.Up | Direction.Right | Direction.Down;
      expect(isDirection(allDirections)).toBe(false); // All four directions combined is not a defined Direction value
    });

    test("should return false for negative numbers", () => {
      expect(isDirection(-1)).toBe(false);
    });

    test("should return false for numbers greater than max combination", () => {
      const maxDirection =
        Direction.Left | Direction.Up | Direction.Right | Direction.Down;
      expect(isDirection(maxDirection + 1)).toBe(false);
    });

    test("should return false for non-numbers", () => {
      expect(isDirection("left")).toBe(false);
      expect(isDirection(null)).toBe(false);
      expect(isDirection(undefined)).toBe(false);
    });

    test("should return false for decimal numbers", () => {
      expect(isDirection(1.5)).toBe(false); // Decimal numbers are not valid Direction enums
    });
  });

  describe("hasDirection", () => {
    test("should return true when flag is present", () => {
      expect(hasDirection(Direction.Left, Direction.Left)).toBe(true);
    });

    test("should return true for combined directions containing flag", () => {
      const combined = Direction.Left | Direction.Up;
      expect(hasDirection(combined, Direction.Left)).toBe(true);
      expect(hasDirection(combined, Direction.Up)).toBe(true);
    });

    test("should return false when flag is not present", () => {
      expect(hasDirection(Direction.Left, Direction.Right)).toBe(false);
    });

    test("should return false for empty direction", () => {
      expect(hasDirection(Direction.None, Direction.Left)).toBe(false);
    });

    test("should return false when checking None flag against non-zero direction", () => {
      expect(hasDirection(Direction.Left, Direction.None)).toBe(false);
    });

    test("should return true for all directions combination", () => {
      const allDirections =
        Direction.Left | Direction.Up | Direction.Right | Direction.Down;
      expect(hasDirection(allDirections, Direction.Left)).toBe(true);
      expect(hasDirection(allDirections, Direction.Up)).toBe(true);
      expect(hasDirection(allDirections, Direction.Right)).toBe(true);
      expect(hasDirection(allDirections, Direction.Down)).toBe(true);
    });

    test("should support bitwise operations", () => {
      const horizontal = Direction.Left | Direction.Right;
      const vertical = Direction.Up | Direction.Down;

      expect(hasDirection(horizontal, Direction.Left)).toBe(true);
      expect(hasDirection(horizontal, Direction.Up)).toBe(false);
      expect(hasDirection(vertical, Direction.Up)).toBe(true);
      expect(hasDirection(vertical, Direction.Left)).toBe(false);
    });
  });
});
