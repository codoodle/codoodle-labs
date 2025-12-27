import { styles } from "../styles";
import { __DEV__ } from "./dev";
import {
  type EventArgs,
  type PropertyChangeEventArgs,
  type PropertyChangesEventArgs,
} from "./EventArgs";
import { SupportPropertyChange } from "./SupportPropertyChange";

export type ControlEventMap<TSource extends Control> = {
  /**
   * 초기화 이벤트입니다.
   */
  initialized: EventArgs<"initialized", TSource>;
  /**
   * 제거 이벤트입니다.
   */
  disposed: EventArgs<"disposed", TSource>;
} & {
  /**
   * 너비 속성 변경 이벤트입니다.
   */
  widthChanged: PropertyChangeEventArgs<TSource, "width">;
  /**
   * 높이 속성 변경 이벤트입니다.
   */
  heightChanged: PropertyChangeEventArgs<TSource, "height">;
} & {
  propertyChanges: PropertyChangesEventArgs<TSource, "width" | "height">;
};

/**
 * 컨트롤의 기본 클래스입니다.
 * 이 클래스는 UI 컴포넌트의 기본 동작을 정의합니다.
 */
export abstract class Control extends SupportPropertyChange {
  protected _isInitialized: boolean;
  protected _isDisposed: boolean;
  protected _element: HTMLElement;
  protected _width: number;
  protected _height: number;

  /**
   * 컨트롤의 초기화 여부를 가져옵니다.
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * 컨트롤의 제거 여부를 가져옵니다.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * 컨트롤에 사용된 HTML 요소를 가져옵니다.
   */
  get element(): HTMLElement {
    return this._element;
  }

  /**
   * 컨트롤의 너비를 가져옵니다.
   */
  get width(): number {
    return this._width;
  }

  /**
   * 컨트롤의 높이를 가져옵니다.
   */
  get height(): number {
    return this._height;
  }

  /**
   * 생성자
   * @param element 컨트롤에 사용할 HTML 요소입니다.
   */
  constructor(element: HTMLElement) {
    super();
    this._isInitialized = false;
    this._isDisposed = false;
    this._element = element;
    this._width = this._element.clientWidth;
    this._height = this._element.clientHeight;
  }

  /**
   * 컨트롤을 초기화합니다.
   * @param args 초기화에 필요한 인수들입니다.
   */
  initialize(...args: unknown[]): void {
    this.ensureNotOverridden("initialize");
    if (this._isInitialized) {
      if (__DEV__) {
        console.warn("Initialize called again on already initialized control.");
      }
      return;
    }
    if (this._isDisposed) {
      throw new Error("Cannot initialize a disposed control.");
    }
    this._element.classList.add(styles.control);
    this.onInitialize(...args);
    this._isInitialized = true;
    this.emit({ name: "initialized", source: this });
  }

  /**
   * 컨트롤을 더 이상 사용할 수 없도록 제거합니다.
   */
  dispose(): void {
    if (this._isDisposed) {
      if (__DEV__) {
        console.warn("Dispose called again on already disposed control.");
      }
      return;
    }
    if (this._isInitialized) {
      this._element.classList.remove(styles.control);
    }

    const disposedHandlers = this.getHandlers("disposed");
    super.dispose();
    for (const handler of disposedHandlers) {
      handler.call(this, { name: "disposed", source: this });
    }
    this._isDisposed = true;
  }

  on<K extends keyof ControlEventMap<this>>(
    name: K,
    handler: (this: this, args: ControlEventMap<this>[K]) => void,
  ): () => void;
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof ControlEventMap<this>>(
    name: K,
    handler: (this: this, args: ControlEventMap<this>[K]) => void,
  ): () => void;
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof ControlEventMap<this>>(
    name: K,
    handler?: (this: this, args: ControlEventMap<this>[K]) => void,
  ): void;
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @param event 컨트롤에 사용하는 HTML 요소에 전달할 이벤트입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  protected emit<TName extends keyof ControlEventMap<this>>(
    args: ControlEventMap<this>[TName],
    event?: Event,
  ): boolean {
    if (this._isDisposed) {
      if (__DEV__) {
        console.warn("emit called on disposed control.");
      }
      return false;
    }

    const emitted = super.emit(args);
    if (event) {
      this._element.dispatchEvent(event);
    }
    if (__DEV__ && !emitted) {
      console.warn(`No handlers for event: ${args.name}`);
    }
    return emitted;
  }

  /**
   * 너비 속성이 변경되었음을 알립니다.
   * @param propertyName 너비 속성 이름입니다.
   * @param value 너비 속성의 현재 값입니다.
   * @param valuePrevious 너비 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged(
    propertyName: "width",
    value: number,
    valuePrevious: number,
  ): void;
  /**
   * 높이 속성이 변경되었음을 알립니다.
   * @param propertyName 높이 속성 이름입니다.
   * @param value 높이 속성의 현재 값입니다.
   * @param valuePrevious 높이 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged(
    propertyName: "height",
    value: number,
    valuePrevious: number,
  ): void;
  protected notifyPropertyChanged<K extends string & keyof this>(
    propertyName: K,
    value: this[K],
    valuePrevious: this[K],
  ): void;
  protected notifyPropertyChanged<
    K extends string & keyof SupportPropertyChange,
  >(propertyName: K, value: this[K], valuePrevious: this[K]): void {
    super.notifyPropertyChanged(propertyName, value, valuePrevious);
  }

  /**
   * 컨트롤 초기화 로직을 구현합니다.
   */
  protected abstract onInitialize(...args: unknown[]): void;

  /**
   * 템플릿 메서드 오버라이드를 방지하기 위한 런타임 가드입니다.
   * @param method 오버라이드가 허용되지 않는 메서드 이름입니다.
   */
  protected ensureNotOverridden(method: "initialize" | string): void {
    const base = (Control.prototype as unknown as Record<string, unknown>)[
      method
    ];
    const current = (this as unknown as Record<string, unknown>)[method];
    if (current !== base) {
      throw new Error(
        `Do not override ${method}; override on${method.charAt(0).toUpperCase() + method.slice(1)} instead.`,
      );
    }
  }

  /**
   * 컨트롤의 크기를 업데이트합니다.
   */
  protected updateSize(): void {
    if (this._isDisposed) {
      return;
    }
    const previousWidth = this._width;
    const previousHeight = this._height;
    this._width = this._element.clientWidth;
    this._height = this._element.clientHeight;
    if (this._width !== previousWidth) {
      this.notifyPropertyChanged("width", this._width, previousWidth);
    }
    if (this._height !== previousHeight) {
      this.notifyPropertyChanged("height", this._height, previousHeight);
    }
  }
}

/**
 * 반드시 컨트롤을 초기화한 후 실행되어야 합니다. 이를 처리하는 장식입니다.
 * @param _target
 * @param propertyName
 * @param descriptor
 */
export const initializationRequired: MethodDecorator = (
  _target,
  propertyName,
  descriptor,
) => {
  const typed = descriptor as PropertyDescriptor & {
    value?: (...args: unknown[]) => unknown;
  };
  if (typeof typed.value !== "function") return descriptor;
  const fn = typed.value;
  typed.value = function (...args: unknown[]) {
    if (!(this instanceof Control) || !this.isInitialized) {
      throw new Error(
        `"${String(propertyName)}" can be executed after initialization.`,
      );
    }
    return fn.apply(this, args);
  };
  return typed;
};
