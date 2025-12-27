/**
 * 사용한 자원을 해제하는 기능을 제공합니다.
 */
export interface Disposable {
  /**
   * 객체를 더 이상 사용할 수 없도록 제거합니다.
   */
  dispose(): void;
}

/**
 * 지정한 객체가 사용한 자원을 해제하는 기능을 제공하는지 확인합니다.
 * @param o 확인할 객체입니다.
 */
export function isDisposable(o: unknown): o is Disposable {
  return !!o && typeof (o as Disposable).dispose === "function";
}
