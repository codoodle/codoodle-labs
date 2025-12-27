/* eslint @typescript-eslint/no-explicit-any: off */
/**
 * 전달된 함수를 requestAnimationFrame을 사용하여 성능 최적화합니다.
 *
 * @param thisArgs 함수를 호출할 때의 this 컨텍스트
 * @param func 최적화할 함수
 * @returns 최적화된 함수 (rAF throttle) 및 cancel 메서드
 */
export function toOptimizer<T extends (...args: any[]) => any>(
  thisArgs: any,
  func: T,
): T & { cancel(): void } {
  let ticking = false;
  let frameId: number | undefined;
  let cachedArgs: any[] = [];

  const optimized = (...args: any[]) => {
    cachedArgs = args; // 최신 인자 캐싱
    if (!ticking) {
      ticking = true;
      frameId = requestAnimationFrame(() => {
        func.apply(thisArgs, cachedArgs);
        ticking = false;
        frameId = undefined;
      });
    }
  };

  optimized.cancel = () => {
    if (frameId !== undefined) {
      cancelAnimationFrame(frameId);
      frameId = undefined;
    }
    ticking = false;
  };

  return optimized as T & { cancel(): void };
}
