import style from "../../styles/ui.module.scss";
import { EventArgs, PropertyChangeEventArgs } from "../EventArgs";
import { Control, ControlEventMap } from "./Control";
import { ControlKey } from "./ControlKey";
import { Size } from "./Size";

export interface ContainerEventMap extends ControlEventMap {
  /**
   * 너비 속성 변경 이벤트입니다.
   */
  widthChanged: PropertyChangeEventArgs<Container, "width">;

  /**
   * 높이 속성 변경 이벤트입니다.
   */
  heightChanged: PropertyChangeEventArgs<Container, "height">;
}

export interface Container {
  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof ContainerEventMap>(
    name: K,
    handler: (this: Container, args: ContainerEventMap[K]) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof ContainerEventMap>(
    name: K,
    handler: (this: Container, args: ContainerEventMap[K]) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof ContainerEventMap>(
    name: K,
    handler?: (this: Container, args: ContainerEventMap[K]) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: EventArgs<"initialized" | "disposed", Container>): boolean;
  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: PropertyChangeEventArgs<Container, "width" | "height">): boolean;
}

/**
 * 여러 HTML 요소의 컨테이너로 동작하는 컨트롤입니다. 각 HTML 요소에 대한 레이아웃을 처리합니다.
 */
export abstract class Container extends Control {
  protected _elementWrapper: HTMLDivElement;
  protected _elementTrap: HTMLDivElement | undefined;
  protected _focusTrappable: boolean;
  protected _focusElement: HTMLElement | undefined;
  protected _focusElementPrevious: HTMLElement | undefined;

  /**
   * 생성자
   * @param element 컨트롤에 사용할 HTML 요소입니다.
   * @param focusTrappable 포커스 덫을 사용할지 여부입니다.
   */
  constructor(element: HTMLElement, focusTrappable = false) {
    super(element);
    this._elementWrapper = document.createElement("div");
    this._focusTrappable = focusTrappable;
    if (this._focusTrappable) {
      Container.focusTrap.register(this);
      this._elementTrap = document.createElement("div");
      this._elementTrap.classList.add(style.zsFocusTrappableTrap);
      this._elementTrap.tabIndex = 0;
    }
  }

  /**
   * 컨트롤을 초기화합니다.
   */
  initialize(...args: any[]): void {
    super.initialize();
    if (!this._isInitialized) {
      if (this._focusTrappable && this._elementTrap) {
        this._element.classList.add(style.zsFocusTrappable);
        this._element.appendChild(this._elementTrap);
      }
      this._element.appendChild(this._elementWrapper);
    }
  }

  /**
   * 컨트롤을 더 이상 사용할 수 없도록 제거합니다.
   * @param destroy 컨트롤을 더 이상 사용할 수 없도록 처리하는지 여부입니다. 이 값이 false 이면 객체를 계속 사용 가능합니다. 기본 값은 true입니다.
   */
  dispose(destroy = true): void {
    if (destroy) {
      if (this._isInitialized) {
        if (this._focusTrappable && this._elementTrap) {
          this._element.classList.remove(style.zsFocusTrappable);
          this._element.removeChild(this._elementTrap);
        }
        this._element.removeChild(this._elementWrapper);
      }
    }
    super.dispose(destroy);
  }

  /**
   * 컨트롤이 사용가능한 크기를 확인하고 레이아웃 업데이트를 시작합니다.
   * @param initializing 컨트롤을 초기화 하는 중인지 여부입니다.
   */
  measure(initializing = false): void {
    const width = this._element.clientWidth;
    const height = this._element.clientHeight;
    if (initializing || this._width !== width || this._height !== height) {
      const innerWidth = this._elementWrapper.clientWidth;
      const innerHeight = this._elementWrapper.clientHeight;
      this.arrange({ width: innerWidth, height: innerHeight });
      if (this._width !== width) {
        const valuePrevious = this._width;
        this._width = width;
        this.notifyPropertyChanged("width", this._width, valuePrevious);
      }
      if (this._height !== height) {
        const valuePrevious = this._height;
        this._height = height;
        this.notifyPropertyChanged("height", this._height, valuePrevious);
      }
    }
  }

  /**
   * 컨트롤의 레이아웃을 업데이트합니다.
   * @param availableSize 사용가능한 크기입니다.
   */
  abstract arrange(availableSize: Size): void;

  /**
   * 포커스 시작합니다.
   * @param element 포커스된 HTML 요소입니다.
   */
  focusBegin(element: HTMLElement): void {
    if (this._elementTrap) {
      this._elementTrap.tabIndex = -1;
    }
    this.focusIn(element, true);
  }

  /**
   * 포커스 마칩니다.
   */
  focusEnd(): void {
    if (this._elementTrap) {
      this._elementTrap.tabIndex = 0;
    }
    this._focusElement?.classList.remove(style.zsFocus);
  }

  /**
   * 포커스를 이동합니다.
   * @param key 컨트롤의 키 입력 값입니다.
   * @param event 원본 키보드 이벤트입니다.
   */
  focusMove(key: ControlKey, event: KeyboardEvent): boolean {
    if (import.meta.env.DEV) {
      console.log(`${this.constructor.name}#focusMove(${ControlKey[key]})`);
    }
    return false;
  }

  /**
   * 포커스 됐을때 필요한 작업을 수행합니다.
   * @param element 포커스된 HTML 요소입니다.
   * @param focusBeginning 포커스 덫을 처음 시작하는지 여부입니다.
   */
  focusIn(element: HTMLElement, focusBeginning = false): void {
    this._focusElement?.classList.remove(style.zsFocus);
    if (focusBeginning) {
      this._focusElement = element;
      this._focusElementPrevious = undefined;
      return;
    }
    this._focusElementPrevious = this._focusElement;
    this._focusElement = element;
    this._focusElement.classList.add(style.zsFocus);
  }

  static focusTrap = (function () {
    let controls: Map<HTMLElement, Container> | undefined;
    let current: Container | undefined;

    /**
     * @param control
     */
    function register(control: Container) {
      if (controls) {
        controls.set(control.element, control);
      } else {
        controls = new Map([[control.element, control]]);
        document.addEventListener("focusin", focusIn, true);
        document.addEventListener("focusout", focusOut, true);
        document.addEventListener("keydown", keyDown, true);
      }
      control.on("disposed", (args) => {
        if (controls) {
          controls.delete((args.source as Control).element);
          if (controls.size === 0) {
            controls = undefined;
            document.removeEventListener("focusin", focusIn, true);
            document.removeEventListener("focusout", focusOut, true);
            document.removeEventListener("keydown", keyDown, true);
          }
        }
      });
    }

    function focusIn(e: FocusEvent) {
      const element = (e.target as HTMLElement).closest(
        "." + style.zsFocusTrappable,
      ) as HTMLElement;
      if (element && controls) {
        const control = controls.get(element);
        if (control && control !== current) {
          current?.focusEnd();
          current = control;
          current.focusBegin(e.target as HTMLElement);
        } else if (current) {
          current.focusIn(e.target as HTMLElement);
        }
      } else {
        current?.focusEnd();
        current = undefined;
      }
    }

    function focusOut(e: FocusEvent) {
      const element = (e.relatedTarget as HTMLElement)?.closest(
        "." + style.zsFocusTrappable,
      );
      if (!element) {
        current?.focusEnd();
        current = undefined;
      }
    }

    function keyDown(e: KeyboardEvent) {
      const element = (e.target as HTMLElement).closest(
        "." + style.zsFocusTrappable,
      ) as HTMLElement;
      if (element && controls) {
        const control = controls.get(element);
        if (control) {
          let key = ControlKey.none;
          switch (e.key) {
            case "PageUp":
              key = ControlKey.pageUp;
              break;
            case "PageDown":
              key = ControlKey.pageDown;
              break;
            case "Home":
              if (!control.isMac && e.ctrlKey) {
                key = ControlKey.homeFirst;
              } else {
                key = ControlKey.home;
              }
              break;
            case "End":
              if (!control.isMac && e.ctrlKey) {
                key = ControlKey.endLast;
              } else {
                key = ControlKey.end;
              }
              break;
            case "Up":
            case "ArrowUp":
              if (
                (control.isMac && e.metaKey) ||
                (!control.isMac && e.ctrlKey)
              ) {
                key = ControlKey.first;
              } else {
                key = ControlKey.arrowUp;
              }
              break;
            case "Down":
            case "ArrowDown":
              if (
                (control.isMac && e.metaKey) ||
                (!control.isMac && e.ctrlKey)
              ) {
                key = ControlKey.last;
              } else {
                key = ControlKey.arrowDown;
              }
              break;
            case "Left":
            case "ArrowLeft":
              if (
                (control.isMac && e.metaKey) ||
                (!control.isMac && e.ctrlKey)
              ) {
                key = ControlKey.home;
              } else {
                key = ControlKey.arrowLeft;
              }
              break;
            case "Right":
            case "ArrowRight":
              if (
                (control.isMac && e.metaKey) ||
                (!control.isMac && e.ctrlKey)
              ) {
                key = ControlKey.end;
              } else {
                key = ControlKey.arrowRight;
              }
              break;
            default:
              return;
          }
          if (control.focusMove(key, e)) {
            e.preventDefault();
          }
        }
      }
    }

    return {
      register,
    };
  })();
}

/**
 * 컨트롤의 초기화를 처리하는 장식입니다.
 * @param target
 * @param propertyName
 * @param descriptor
 */
export function initializationWithMeasure(
  target: Container,
  propertyName: "initialize" | string,
  descriptor: PropertyDescriptor,
): void {
  const fn = descriptor.value;
  descriptor.value = function (...args: unknown[]) {
    fn.apply(this, args);
    if (this.constructor === target.constructor) {
      if (this instanceof Container) {
        this.measure(true);
      }
      (this as { _isInitialized: boolean })._isInitialized = true;
      (this as Container).emit({
        name: "initialized",
        source: this as Container,
      });
    }
  };
}
