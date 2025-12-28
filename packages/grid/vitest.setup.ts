import { vi } from "vitest";

class ResizeObserverMock {
  constructor(private cb: ResizeObserverCallback) {}
  observe(target: Element) {
    this.cb(
      [
        {
          target,
          contentRect: {
            width: target.clientWidth,
            height: target.clientHeight,
          },
        } as ResizeObserverEntry,
      ],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
