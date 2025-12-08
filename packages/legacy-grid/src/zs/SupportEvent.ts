import { Disposable } from "./Disposable";

/**
 * 이벤트 데이터입니다.
 */
interface EventArgs {
  /**
   * 이벤트 이름입니다.
   */
  name: string;
  /**
   * 이벤트를 발생시킨 개체입니다.
   */
  source: unknown;
}

/**
 * 이벤트를 지원합니다.
 */
export class SupportEvent implements Disposable {
  private _events?: Map<
    string,
    ((this: SupportEvent, args: EventArgs) => void)[]
  >;

  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on(
    name: string,
    handler: (this: SupportEvent, args: EventArgs) => void,
  ): void {
    if (this._events) {
      const handlers = this._events.get(name);
      if (handlers) {
        const indexOf = handlers.indexOf(handler);
        if (indexOf === -1) {
          handlers.push(handler);
        }
      } else {
        this._events.set(name, [handler]);
      }
    } else {
      this._events = new Map([[name, [handler]]]);
    }
  }

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once(
    name: string,
    handler: (this: SupportEvent, args: EventArgs) => void,
  ): void {
    const handlerWrap = (args: EventArgs) => {
      handler.call(this, args);
      this.off(name, handlerWrap);
    };
    this.on(name, handlerWrap);
  }

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off(
    name: string,
    handler?: (this: SupportEvent, args: EventArgs) => void,
  ): void {
    if (this._events) {
      if (this._events.has(name)) {
        const handlers = this._events.get(name);
        if (handlers) {
          if (handler) {
            const indexOf = handlers.indexOf(handler);
            if (indexOf !== -1) {
              handlers.splice(indexOf, 1);
            }
          } else {
            handlers.length = 0;
          }
          if (handlers.length === 0) {
            this._events.delete(name);
          }
        } else {
          this._events.delete(name);
        }
      }
      if (this._events.size === 0) {
        this._events = undefined;
      }
    }
  }

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: EventArgs): boolean {
    let emitted = false;
    if (this._events) {
      const handlers = this._events.get(args.name);
      if (handlers) {
        const fn = [...handlers];
        while (fn.length > 0) {
          fn.shift()?.call(this, args);
          emitted = true;
        }
      }
    }
    return emitted;
  }

  dispose(destroy = true): void {
    if (this._events) {
      this._events.forEach((handlers) => (handlers.length = 0));
      this._events.clear();
    }
    if (destroy) {
      const disposable = this as unknown as { [index: string]: unknown };
      const propertyNames = Object.keys(disposable);
      for (const propertyName of propertyNames) {
        disposable[propertyName] = undefined;
      }
    }
    if (import.meta.env.DEV) {
      console.log(`${this.constructor.name}#dispose(${destroy})`);
    }
  }
}
