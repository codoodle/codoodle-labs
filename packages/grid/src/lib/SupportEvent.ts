import { __DEV__ } from "./dev";
import type { Disposable } from "./Disposable";
import type { EventArgs } from "./EventArgs";

/**
 * 이벤트를 지원합니다.
 */
export class SupportEvent implements Disposable {
  private _events?: Map<
    string,
    ((this: this, args: EventArgs<string, this>) => void)[]
  >;

  dispose(): void {
    if (this._events) {
      this._events.forEach((handlers) => (handlers.length = 0));
      this._events.clear();
      this._events = undefined;
    }
    if (__DEV__) {
      console.log(`${this.constructor.name}#dispose() called.`);
    }
  }

  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   * @return 등록 해제 함수입니다.
   */
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
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
    return () => this.off(name, handler);
  }

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   * @return 등록 해제 함수입니다.
   */
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    let disposed = false;
    const disposer = this.on(name, (args) => {
      if (disposed) {
        return;
      }
      disposed = true;
      try {
        handler.call(this, args);
      } finally {
        disposer();
      }
    });
    return disposer;
  }

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
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
  protected emit(args: EventArgs<string, this>): boolean {
    let emitted = false;
    if (this._events) {
      const handlers = this._events.get(args.name);
      if (handlers) {
        const fn = [...handlers];
        while (fn.length > 0) {
          const handler = fn.shift();
          if (!handler) {
            continue;
          }
          try {
            handler.call(this, args);
            emitted = true;
          } catch (error) {
            if (__DEV__) {
              console.error(`${this.constructor.name} emit error`, error);
            }
          }
        }
      }
    }
    return emitted;
  }

  /**
   * 등록된 이벤트 처리기들의 스냅샷을 가져옵니다.
   * @param name 이벤트 이름입니다.
   * @returns 읽기 전용 처리기 배열 스냅샷입니다.
   */
  protected getHandlers(
    name: string,
  ): ReadonlyArray<(this: this, args: EventArgs<string, this>) => void> {
    if (!this._events) {
      return [];
    }
    const handlers = this._events.get(name);
    return handlers ? [...handlers] : [];
  }
}
