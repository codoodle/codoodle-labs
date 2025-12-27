/**
 * 컨트롤의 키 입력 값입니다.
 */
export const ControlKey = {
  None: "None",
  First: "First",
  Last: "Last",
  Home: "Home",
  HomeFirst: "HomeFirst",
  End: "End",
  EndLast: "EndLast",
  PageUp: "PageUp",
  PageDown: "PageDown",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowUp",
  ArrowRight: "ArrowRight",
  ArrowDown: "ArrowDown",
} as const;

export type ControlKey = (typeof ControlKey)[keyof typeof ControlKey];

/**
 * 지정한 값이 유효한 ControlKey인지 확인합니다.
 * @param o 확인할 값입니다.
 */
export function isControlKey(o: unknown): o is ControlKey {
  return typeof o === "string" && o in ControlKey;
}
