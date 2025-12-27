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
export interface PropertyChangeEventArgs<
  T,
  K extends string & keyof T,
> extends EventArgs<`${K}Changed`, T> {
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

export type AnyPropertyChangeEventArgs<T, P extends string & keyof T> = {
  [K in P]: PropertyChangeEventArgs<T, K>;
}[P];

export interface PropertyChangesEventArgs<
  T,
  P extends string & keyof T,
> extends EventArgs<"propertyChanges", T> {
  /**
   * 변경된 속성들의 배열입니다.
   */
  changes: ReadonlyArray<AnyPropertyChangeEventArgs<T, P>>;
}

export interface ContainerFocusEnterEventArgs<T> extends EventArgs<
  "focusEnter",
  T
> {
  /**
   * 포커스가 진입한 대상 요소입니다.
   */
  target: HTMLElement;
}

export interface ContainerFocusLeaveEventArgs<T> extends EventArgs<
  "focusLeave",
  T
> {
  /**
   * 포커스가 이탈한 대상 요소입니다.
   */
  previousTarget?: HTMLElement;
}

export interface ContainerFocusChangeEventArgs<T> extends EventArgs<
  "focusChange",
  T
> {
  /**
   * 포커스가 진입한 대상 요소입니다.
   */
  target: HTMLElement;
  /**
   * 포커스가 이탈한 대상 요소입니다.
   */
  previousTarget?: HTMLElement;
}
