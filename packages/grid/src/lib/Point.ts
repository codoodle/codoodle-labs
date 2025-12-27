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
 * @returns 유효한 Point이면 true를 반환합니다.
 */
export function isPoint(o: unknown): o is Point {
  if (!o) {
    return false;
  }
  const candidate = o as Partial<Point>;
  return (
    typeof candidate.x === "number" &&
    Number.isFinite(candidate.x) &&
    typeof candidate.y === "number" &&
    Number.isFinite(candidate.y)
  );
}
