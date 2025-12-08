/**
 * 그리드의 셀을 병합합니다.
 */
export interface GridMerge {
  /**
   * 병합할 시작 행 인덱스입니다.
   */
  rowIndex: number;

  /**
   * 병합할 행의 수입니다.
   */
  rowSpan: number;

  /**
   * 병합할 시작 열 인덱스입니다.
   */
  columnIndex: number;

  /**
   * 병합할 열의 수입니다.
   */
  columnSpan: number;
}
