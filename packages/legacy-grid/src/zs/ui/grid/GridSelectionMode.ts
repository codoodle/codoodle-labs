/**
 * 그리드에서 셀을 선택하는 방법입니다.
 */
export enum GridSelectionMode {
  /**
   * 선택할 수 없습니다.
   */
  None,
  /**
   * 한 번에 한 항목만 선택할 수 있습니다.
   */
  Single,
  /**
   * 한 번에 여러 개의 항목을 선택할 수 있습니다.
   */
  Extended,
}
