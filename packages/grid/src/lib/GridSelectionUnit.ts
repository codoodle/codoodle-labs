/**
 * 그리드에서 셀을 선택할 수 있는 단위입니다.
 */
export const GridSelectionUnit = {
  /**
   * 전체 행을 선택합니다.
   */
  Row: 0,
  /**
   * 전체 열을 선택합니다.
   */
  Column: 1,
  /**
   * 셀을 선택합니다.
   */
  Cell: 2,
} as const;

export type GridSelectionUnit =
  (typeof GridSelectionUnit)[keyof typeof GridSelectionUnit];

/**
 * 지정한 값이 유효한 GridSelectionUnit인지 확인합니다.
 * @param o 확인할 값입니다.
 * @returns 유효한 GridSelectionUnit이면 true를 반환합니다.
 */
export function isGridSelectionUnit(o: unknown): o is GridSelectionUnit {
  if (typeof o !== "number") {
    return false;
  }
  return (
    o === GridSelectionUnit.Row ||
    o === GridSelectionUnit.Column ||
    o === GridSelectionUnit.Cell
  );
}
