/**
 * 그리드의 인덱스 범위를 나타냅니다.
 */
export interface GridBounds {
  /**
   * 시작 행 인덱스입니다.
   */
  rowBegin: number;
  /**
   * 끝 행 인덱스입니다.
   */
  rowEnd: number;
  /**
   * 시작 열 인덱스입니다.
   */
  columnBegin: number;
  /**
   * 끝 열 인덱스입니다.
   */
  columnEnd: number;
}
