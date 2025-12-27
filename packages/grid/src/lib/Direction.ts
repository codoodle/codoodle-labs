/**
 * 방향을 나타냅니다.
 */
export const Direction = {
  None: 0,
  /**
   * 왼쪽입니다.
   */
  Left: 1,
  /**
   * 위쪽입니다.
   */
  Up: 2,
  /**
   * 오른쪽입니다.
   */
  Right: 4,
  /**
   * 아래쪽입니다.
   */
  Down: 8,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

/**
 * 지정한 값이 유효한 Direction인지 확인합니다.
 * @param o 확인할 값입니다.
 * @returns 유효한 Direction이면 true를 반환합니다.
 */
export function isDirection(o: unknown): o is Direction {
  if (typeof o !== "number") {
    return false;
  }
  return (
    o === Direction.None ||
    o === Direction.Left ||
    o === Direction.Up ||
    o === Direction.Right ||
    o === Direction.Down ||
    o === (Direction.Left | Direction.Up) ||
    o === (Direction.Left | Direction.Down) ||
    o === (Direction.Right | Direction.Up) ||
    o === (Direction.Right | Direction.Down)
  );
}

/**
 * 주어진 방향에 특정 방향이 포함되어 있는지 확인합니다 (비트마스킹).
 * @param direction 확인할 방향입니다.
 * @param flag 확인할 플래그입니다.
 * @returns 포함되어 있으면 true를 반환합니다.
 */
export function hasDirection(direction: number, flag: Direction): boolean {
  return (direction & flag) !== 0;
}
