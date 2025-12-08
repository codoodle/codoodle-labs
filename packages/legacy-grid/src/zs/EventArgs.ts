export interface EventArgs<E extends string, T> {
  /**
   * 이벤트 이름입니다.
   */
  name: E;
  /**
   * 이벤트를 발생시킨 개체입니다.
   */
  source: T;
}

/**
 * 속성변경 이벤트 데이터입니다.
 */
export interface PropertyChangeEventArgs<T, K extends string & keyof T> {
  /**
   * 이벤트 이름입니다.
   */
  name: `${K}Changed`;
  /**
   * 이벤트를 발생시킨 개체입니다.
   */
  source: T;
  /**
   * 변경된 속성 이름입니다.
   */
  propertyName: K;
  /**
   * 변경된 속성의 현재 값입니다.
   */
  value: T[K];
  /**
   * 변경된 속성의 이전 값입니다.
   */
  valuePrevious: T[K];
}
