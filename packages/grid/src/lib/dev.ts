/**
 * Development 모드 여부
 */
export const __DEV__ =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";
