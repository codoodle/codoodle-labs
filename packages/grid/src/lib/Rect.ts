/**
 * 사각형의 위치와 크기를 나타냅니다.
 */
export interface Rect {
  /**
   *  왼쪽 좌표입니다.
   */
  left: number;
  /**
   *  위쪽 좌표입니다.
   */
  top: number;
  /**
   *  너비입니다.
   */
  width: number;
  /**
   *  높이입니다.
   */
  height: number;
}

/**
 * 지정한 객체가 사각형의 위치와 크기를 나타내는지 확인합니다.
 * @param o 확인할 객체입니다.
 * @returns 유효한 Rect이면 true를 반환합니다.
 */
export function isRect(o: unknown): boolean {
  if (!o) {
    return false;
  }
  const candidate = o as Partial<Rect>;
  return (
    typeof candidate.left === "number" &&
    Number.isFinite(candidate.left) &&
    typeof candidate.top === "number" &&
    Number.isFinite(candidate.top) &&
    typeof candidate.width === "number" &&
    Number.isFinite(candidate.width) &&
    typeof candidate.height === "number" &&
    Number.isFinite(candidate.height)
  );
}
