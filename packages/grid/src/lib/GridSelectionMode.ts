/**
 * 그리드에서 셀을 선택하는 방법입니다.
 */
export const GridSelectionMode = {
  /**
   * 선택할 수 없습니다.
   */
  None: 0,
  /**
   * 한 번에 한 항목만 선택할 수 있습니다.
   */
  Single: 1,
  /**
   * 한 번에 여러 개의 항목을 선택할 수 있습니다.
   */
  Extended: 2,
} as const;

export type GridSelectionMode =
  (typeof GridSelectionMode)[keyof typeof GridSelectionMode];

/**
 * 지정한 값이 유효한 GridSelectionMode인지 확인합니다.
 * @param o 확인할 값입니다.
 * @returns 유효한 GridSelectionMode이면 true를 반환합니다.
 */
export function isGridSelectionMode(o: unknown): o is GridSelectionMode {
  if (typeof o !== "number") {
    return false;
  }
  return (
    o === GridSelectionMode.None ||
    o === GridSelectionMode.Single ||
    o === GridSelectionMode.Extended
  );
}
