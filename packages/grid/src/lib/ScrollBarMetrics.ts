/**
 * 전역 UI 환경 정보로서 스크롤바 너비를 계산하고 캐싱합니다.
 */
export class ScrollBarMetrics {
  private static width?: number;
  private static initialized = false;

  /**
   * 스크롤바 너비를 반환합니다.
   * @param forceRefresh true일 경우 캐시를 무시하고 다시 계산합니다.
   */
  static get(forceRefresh = false): number {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return 0;
    }

    if (!this.initialized) {
      this.initialized = true;
      window.addEventListener("resize", () => {
        ScrollBarMetrics.invalidate();
      });
    }

    if (this.width === undefined || forceRefresh) {
      this.width = this.compute();
    }

    return this.width;
  }

  /**
   * 캐시된 스크롤바 너비를 무효화합니다.
   */
  static invalidate(): void {
    this.width = undefined;
  }

  /**
   * 실제 DOM을 사용해 스크롤바 너비를 계산합니다.
   */
  private static compute(): number {
    const outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.height = "100px";
    outer.style.overflow = "scroll";
    outer.style.position = "absolute";
    outer.style.top = "-9999px";

    document.body.appendChild(outer);

    const inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    outer.appendChild(inner);

    const width = outer.offsetWidth - inner.offsetWidth;

    document.body.removeChild(outer);

    return width;
  }
}
