/**
 * UI 플랫폼 / 환경 정보를 제공하는 전역 유틸입니다.
 */
export class PlatformInfo {
  private static _isMac?: boolean;

  /**
   * macOS 환경 여부를 반환합니다.
   */
  static get isMac(): boolean {
    if (this._isMac === undefined) {
      if (typeof navigator === "undefined") {
        this._isMac = false;
      } else {
        const ua = navigator.userAgent ?? "";
        this._isMac = /Mac|iPhone|iPad/.test(ua);
      }
    }

    return this._isMac;
  }
}
