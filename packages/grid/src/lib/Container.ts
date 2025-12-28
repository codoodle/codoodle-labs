import { styles } from "../styles";
import { Control, type ControlEventMap } from "./Control";
import { ControlKey } from "./ControlKey";
import { __DEV__ } from "./dev";
import type {
  ContainerFocusChangeEventArgs,
  ContainerFocusEnterEventArgs,
  ContainerFocusLeaveEventArgs,
  EventArgs,
} from "./EventArgs";
import { PlatformInfo } from "./PlatformInfo";
import type { Size } from "./Size";
import { toOptimizer } from "./toOptimizer";

export type ContainerEventMap<TSource extends Container> =
  ControlEventMap<Control> & {
    focusEnter: ContainerFocusEnterEventArgs<TSource>;
    focusLeave: ContainerFocusLeaveEventArgs<TSource>;
    focusChange: ContainerFocusChangeEventArgs<TSource>;
  };

/**
 * 여러 HTML 요소의 컨테이너로 동작하는 컨트롤입니다. 각 HTML 요소에 대한 레이아웃을 처리합니다.
 */
export abstract class Container extends Control {
  protected _elementWrapper: HTMLDivElement;
  protected _elementTrap: HTMLDivElement | undefined;
  protected _focusTrappable: boolean;
  protected _focusElement: HTMLElement | undefined;
  protected _focusElementPrevious: HTMLElement | undefined;
  protected _resizeObserver: ResizeObserver | undefined;
  protected _measureOptimized: ReturnType<typeof toOptimizer> | undefined;

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
      this._elementTrap.classList.add(styles.controlFocusTrap);
      this._elementTrap.tabIndex = 0;
      this._elementTrap.setAttribute("role", "application");
      this._elementTrap.setAttribute("aria-label", "Focus trap");
    }
  }

  protected onInitialize(): void {
    if (this._focusTrappable && this._elementTrap) {
      this._element.classList.add(styles.controlFocusTrappable);
      this._element.appendChild(this._elementTrap);
    }
    this._element.appendChild(this._elementWrapper);
    this._measureOptimized = toOptimizer(this, () => this.measure(true));
    this._resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) {
        return;
      }
      this._measureOptimized?.();
    });
    this._resizeObserver.observe(this._element);
  }

  dispose(): void {
    if (this._isDisposed) {
      return;
    }
    if (this._isInitialized) {
      if (this._focusTrappable && this._elementTrap) {
        this._element.classList.remove(styles.controlFocusTrappable);
        this._element.removeChild(this._elementTrap);
      }
      this._element.removeChild(this._elementWrapper);
    }
    this._elementTrap = undefined;
    this._focusElement = undefined;
    this._focusElementPrevious = undefined;
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
    this._measureOptimized?.cancel();
    this._measureOptimized = undefined;
    super.dispose();
  }

  on<K extends keyof ContainerEventMap<this>>(
    name: K,
    handler: (this: this, args: ContainerEventMap<this>[K]) => void,
  ): () => void;
  on<K extends keyof ControlEventMap<Control>>(
    name: K,
    handler: (this: this, args: ControlEventMap<Control>[K]) => void,
  ): () => void;
  on(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: any,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof ContainerEventMap<this>>(
    name: K,
    handler: (this: this, args: ContainerEventMap<this>[K]) => void,
  ): () => void;
  once<K extends keyof ControlEventMap<Control>>(
    name: K,
    handler: (this: this, args: ControlEventMap<Control>[K]) => void,
  ): () => void;
  once(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: any,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof ContainerEventMap<this>>(
    name: K,
    handler?: (this: this, args: ContainerEventMap<this>[K]) => void,
  ): void;
  off<K extends keyof ControlEventMap<Control>>(
    name: K,
    handler?: (this: this, args: ControlEventMap<Control>[K]) => void,
  ): void;
  off(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: any,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }

  protected emit<TName extends keyof ContainerEventMap<this>>(
    args: ContainerEventMap<this>[TName],
    event?: Event,
  ): boolean;
  protected emit<TName extends keyof ControlEventMap<Control>>(
    args: ControlEventMap<Control>[TName],
    event?: Event,
  ): boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected emit(args: any, event?: Event): boolean {
    return super.emit(args, event);
  }

  /**
   * 레이아웃을 무효화하고 다시 측정합니다.
   */
  invalidateLayout(): void {
    this.measure(true);
  }

  /**
   * 컨트롤이 사용가능한 크기를 확인하고 레이아웃 업데이트를 시작합니다.
   * @param force 크기 변경 여부와 관계없이 레이아웃을 강제로 업데이트할지 여부입니다.
   */
  protected measure(force = false): void {
    if (this._isDisposed) {
      return;
    }
    const width = this._element.clientWidth;
    const height = this._element.clientHeight;
    if (force || this._width !== width || this._height !== height) {
      this.beginBatch();
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
      this.endBatch();
    }
  }

  /**
   * 컨트롤의 레이아웃을 업데이트합니다.
   * @param availableSize 사용가능한 크기입니다.
   */
  protected abstract arrange(availableSize: Size): void;

  /**
   * 포커스 시작합니다.
   * @param element 포커스된 HTML 요소입니다.
   */
  protected focusBegin(element: HTMLElement): void {
    if (this._isDisposed) {
      return;
    }
    if (this._elementTrap) {
      this._elementTrap.tabIndex = -1;
    }
    this.focusIn(element, true);
  }

  /**
   * 포커스 마칩니다.
   */
  protected focusEnd(): void {
    if (this._isDisposed) {
      return;
    }
    if (this._elementTrap) {
      this._elementTrap.tabIndex = 0;
    }
    const previousTarget = this._focusElement;
    this._focusElement = undefined;
    this._focusElementPrevious = undefined;
    this.emit({
      name: "focusLeave",
      source: this,
      previousTarget,
    });
  }

  /**
   * 포커스 됐을때 필요한 작업을 수행합니다.
   * @param element 포커스된 HTML 요소입니다.
   * @param focusBeginning 포커스 덫을 처음 시작하는지 여부입니다.
   */
  protected focusIn(element: HTMLElement, focusBeginning = false): void {
    if (this._isDisposed) {
      return;
    }
    if (focusBeginning) {
      this._focusElement = element;
      this._focusElementPrevious = undefined;
      this.emit({
        name: "focusEnter",
        source: this,
        target: this._focusElement,
      });
      return;
    }
    this._focusElementPrevious = this._focusElement;
    this._focusElement = element;
    this.emit({
      name: "focusChange",
      source: this,
      target: this._focusElement,
      previousTarget: this._focusElementPrevious,
    });
  }

  /**
   * 포커스 이동합니다.
   * @param key 컨트롤의 키 입력 값입니다.
   * @param event 원본 키보드 이벤트입니다.
   */
  protected focusMove(key: ControlKey, event: KeyboardEvent): boolean {
    void key;
    void event;
    return false;
  }

  static focusTrap = (function () {
    const FOCUS_TRAPPABLE_SELECTOR = "." + styles.controlFocusTrappable;
    let controls: WeakMap<HTMLElement, Container> | undefined;
    let current: Container | undefined;
    let controlCount = 0;

    /**
     * 포커스 트랩 컨트롤을 등록합니다.
     * @param control 등록할 컨트롤입니다.
     */
    function register(control: Container) {
      let disposed = false;

      if (!controls) {
        controls = new WeakMap();
        document.addEventListener("focusin", focusIn, true);
        document.addEventListener("focusout", focusOut, true);
        document.addEventListener("keydown", keyDown, true);
      }
      controls.set(control.element, control);
      controlCount++;
      if (__DEV__) {
        console.log(
          `[focusTrap.register] controlCount: ${controlCount}, control: ${control.constructor.name}`,
        );
      }

      control.on("disposed", (args) => {
        if (disposed) {
          return;
        }
        disposed = true;

        if (controls) {
          controlCount--;
          if (__DEV__) {
            console.log(
              `[focusTrap.disposed] controlCount: ${controlCount}, control: ${args.source.constructor.name}`,
            );
          }

          if (controlCount === 0) {
            controls = undefined;
            if (current) {
              current.focusEnd();
              current = undefined;
            }
            document.removeEventListener("focusin", focusIn, true);
            document.removeEventListener("focusout", focusOut, true);
            document.removeEventListener("keydown", keyDown, true);
            if (__DEV__) {
              console.log("[focusTrap] All event listeners removed");
            }
          }
        }
      });
    }

    /**
     * focusin 이벤트 핸들러입니다.
     */
    function focusIn(e: FocusEvent) {
      if (!(e.target instanceof HTMLElement) || !controls) {
        return;
      }

      const element = e.target.closest<HTMLElement>(FOCUS_TRAPPABLE_SELECTOR);
      if (!element) {
        current?.focusEnd();
        current = undefined;
        return;
      }

      const control = controls.get(element);
      if (!control) {
        current?.focusEnd();
        current = undefined;
        if (__DEV__) {
          console.warn(
            "[focusTrap] Control was garbage collected without dispose",
          );
        }
        return;
      }

      if (control !== current) {
        current?.focusEnd();
        current = control;
        current.focusBegin(e.target);
      } else if (current) {
        current.focusIn(e.target);
      }
    }

    /**
     * focusout 이벤트 핸들러입니다.
     */
    function focusOut(e: FocusEvent) {
      if (!e.relatedTarget || !(e.relatedTarget instanceof HTMLElement)) {
        current?.focusEnd();
        current = undefined;
        return;
      }

      const element = e.relatedTarget.closest(FOCUS_TRAPPABLE_SELECTOR);
      if (!element) {
        current?.focusEnd();
        current = undefined;
      }
    }

    /**
     * keydown 이벤트 핸들러입니다.
     */
    function keyDown(e: KeyboardEvent) {
      if (!(e.target instanceof HTMLElement) || !controls) {
        return;
      }

      const element = e.target.closest<HTMLElement>(FOCUS_TRAPPABLE_SELECTOR);
      if (!element) {
        return;
      }

      const control = controls.get(element);
      if (!control) {
        if (__DEV__) {
          console.warn(
            "[focusTrap] Control was garbage collected without dispose",
          );
        }
        return;
      }

      let key: ControlKey = ControlKey.None;
      switch (e.key) {
        case "PageUp":
          key = ControlKey.PageUp;
          break;
        case "PageDown":
          key = ControlKey.PageDown;
          break;
        case "Home":
          if (!PlatformInfo.isMac && e.ctrlKey) {
            key = ControlKey.HomeFirst;
          } else {
            key = ControlKey.Home;
          }
          break;
        case "End":
          if (!PlatformInfo.isMac && e.ctrlKey) {
            key = ControlKey.EndLast;
          } else {
            key = ControlKey.End;
          }
          break;
        case "Up":
        case "ArrowUp":
          if (
            (PlatformInfo.isMac && e.metaKey) ||
            (!PlatformInfo.isMac && e.ctrlKey)
          ) {
            key = ControlKey.First;
          } else {
            key = ControlKey.ArrowUp;
          }
          break;
        case "Down":
        case "ArrowDown":
          if (
            (PlatformInfo.isMac && e.metaKey) ||
            (!PlatformInfo.isMac && e.ctrlKey)
          ) {
            key = ControlKey.Last;
          } else {
            key = ControlKey.ArrowDown;
          }
          break;
        case "Left":
        case "ArrowLeft":
          if (
            (PlatformInfo.isMac && e.metaKey) ||
            (!PlatformInfo.isMac && e.ctrlKey)
          ) {
            key = ControlKey.Home;
          } else {
            key = ControlKey.ArrowLeft;
          }
          break;
        case "Right":
        case "ArrowRight":
          if (
            (PlatformInfo.isMac && e.metaKey) ||
            (!PlatformInfo.isMac && e.ctrlKey)
          ) {
            key = ControlKey.End;
          } else {
            key = ControlKey.ArrowRight;
          }
          break;
        default:
          return;
      }
      if (__DEV__) {
        console.log(
          `${control.constructor.name}#focusMove(${ControlKey[key]})`,
        );
      }
      if (control.focusMove(key, e)) {
        e.preventDefault();
      }
    }

    /**
     * 포커스 트랩의 모든 리소스를 정리합니다. 테스트나 긴급 상황에서 사용됩니다.
     */
    function cleanup(): void {
      if (controls) {
        controls = undefined;
      }
      if (current) {
        current.focusEnd();
        current = undefined;
      }
      document.removeEventListener("focusin", focusIn, true);
      document.removeEventListener("focusout", focusOut, true);
      document.removeEventListener("keydown", keyDown, true);
      controlCount = 0;
      if (__DEV__) {
        console.log("[focusTrap.cleanup] All resources cleaned up");
      }
    }

    return {
      register,
      cleanup,
    };
  })();
}
