import style from "../../styles/ui.module.scss";
import { EventArgs } from "../EventArgs";
import { SupportPropertyChange } from "../SupportPropertyChange";

export interface ControlEventMap {
  /**
   * 초기화 이벤트입니다.
   */
  initialized: EventArgs<"initialized", Control>;

  /**
   * 제거 이벤트입니다.
   */
  disposed: EventArgs<"disposed", Control>;
}

export interface Control {
  /**
   * MAC 여부입니다.
   */
  isMac: boolean;

  /**
   * 스크롤바의 너비를 가져옵니다.
   */
  getScrollBarWidth: () => number;

  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof ControlEventMap>(
    name: K,
    handler: (this: Control, args: ControlEventMap[K]) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof ControlEventMap>(
    name: K,
    handler: (this: Control, args: ControlEventMap[K]) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof ControlEventMap>(
    name: K,
    handler?: (this: Control, args: ControlEventMap[K]) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: EventArgs<"initialized" | "disposed", Control>): boolean;
}

/**
 * 컨트롤의 기본 클래스입니다.
 */
export abstract class Control extends SupportPropertyChange {
  protected _isInitialized: boolean;
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
    return this._isInitialized === undefined;
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
    this._element = element;
    this._width = this._element.clientWidth;
    this._height = this._element.clientHeight;
  }

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @param event 컨트롤에 사용하는 HTML 요소에 전달할 이벤트입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: EventArgs<string, Control>, event?: Event): boolean {
    const emitted = super.emit(args);
    if (event) {
      (event as unknown as { args: EventArgs<string, Control> }).args = args;
      this._element.dispatchEvent(event);
    }
    return emitted;
  }

  /**
   * 컨트롤을 초기화합니다.
   */
  initialize(...args: any[]): void {
    if (!this._isInitialized) {
      this._element.classList.add(style.zsControl);
    }
  }

  /**
   * 컨트롤을 더 이상 사용할 수 없도록 제거합니다.
   * @param destroy 컨트롤을 더 이상 사용할 수 없도록 처리하는지 여부입니다. 이 값이 false 이면 객체를 계속 사용 가능합니다. 기본 값은 true입니다.
   */
  dispose(destroy = true): void {
    if (destroy) {
      if (this._isInitialized) {
        this._element.classList.remove(style.zsControl);
      }
      const disposedListeners = [];
      const events = (
        this as unknown as {
          _events: Map<string, Function[]> | undefined;
        }
      )._events;
      if (events) {
        const listeners = events.get("disposed");
        if (listeners) {
          disposedListeners.push(...listeners);
        }
      }
      super.dispose(destroy);
      while (disposedListeners.length > 0) {
        disposedListeners.shift()?.call(this, {
          name: "disposed",
          source: this,
        });
      }
    }
  }
}
Control.prototype.isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
Control.prototype.getScrollBarWidth = function (): number {
  const elHidden = document.createElement("div");
  elHidden.style.width = "100px";
  elHidden.style.height = "100px";
  elHidden.style.visibility = "hidden";
  document.body.appendChild(elHidden);
  const widthHidden = elHidden.clientWidth;
  document.body.removeChild(elHidden);
  const elScroll = document.createElement("div");
  elScroll.style.width = "100px";
  elScroll.style.height = "100px";
  elScroll.style.visibility = "hidden";
  elScroll.style.overflowY = "scroll";
  document.body.appendChild(elScroll);
  const widthScroll = elScroll.clientWidth;
  document.body.removeChild(elScroll);
  return widthHidden - widthScroll;
};

/**
 * 컨트롤의 초기화를 처리하는 장식입니다.
 * @param target
 * @param _propertyName
 * @param descriptor
 */
export function initialization<T extends Control>(
  target: T,
  _propertyName: "initialize" | string,
  descriptor: PropertyDescriptor,
): void {
  const fn = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    fn.apply(this, args);
    if (this.constructor === target.constructor) {
      (this as { _isInitialized: boolean })._isInitialized = true;
      (this as T).emit({
        name: "initialized",
        source: this as T,
      });
    }
  };
}

/**
 * 반드시 컨트롤을 초기화한 후 실행되어야 합니다. 이를 처리하는 장식입니다.
 * @param _target
 * @param propertyName
 * @param descriptor
 */
export function initializationRequired(
  _target: Control,
  propertyName: string,
  descriptor: PropertyDescriptor,
): void {
  const fn = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    if (!(this as { _isInitialized: boolean })._isInitialized) {
      throw new Error(
        `"${propertyName}" can be executed after initialization.`,
      );
    }
    fn.apply(this, args);
  };
}
