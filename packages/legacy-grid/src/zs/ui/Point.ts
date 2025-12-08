/**
 * 점을 정의하는 X, Y 좌표를 나타냅니다.
 */
export interface Point {
  /**
   * X좌표입니다.
   */
  x: number;
  /**
   * Y좌표입니다.
   */
  y: number;
}

/**
 * 지정한 객체가 점을 정의하는 X, Y 좌표를 나타내는지 확인합니다.
 * @param o 확인할 객체입니다.
 */
export function isPoint(o: unknown): o is Point {
  return !!o && (o as Point).x !== undefined && (o as Point).y !== undefined;
}
