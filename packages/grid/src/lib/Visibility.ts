/**
 * 표시 상태를 나타냅니다.
 */
export const Visibility = {
  /**
   * 표시합니다.
   */
  Visible: "Visible",
  /**
   * 표시하지 않고 레이아웃의 공간을 사용합니다.
   */
  Hidden: "Hidden",
  /**
   * 표시하지 않고 레이아웃의 공간을 사용하지 않습니다.
   */
  Collapsed: "Collapsed",
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];

/**
 * 지정한 값이 유효한 Visibility인지 확인합니다.
 * @param o 확인할 값입니다.
 * @returns 유효한 Visibility이면 true를 반환합니다.
 */
export function isVisibility(o: unknown): o is Visibility {
  return typeof o === "string" && o in Visibility;
}
