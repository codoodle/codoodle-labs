/**
 * 셀 편집 모드
 */
export type CellEditMode = "replace" | "append";

/**
 * 셀 편집기 인터페이스
 */
export interface CellEditor {
  /**
   * 편집을 시작합니다.
   * @param cell 편집할 셀 요소
   * @param value 현재 값
   * @param mode 편집 모드 (replace: 내용 교체, append: 내용 유지)
   */
  start(cell: HTMLElement, value: any, mode: CellEditMode): void;

  /**
   * 편집을 저장하고 값을 반환합니다.
   */
  save(): any;

  /**
   * 편집을 취소합니다.
   */
  cancel(): void;

  /**
   * 현재 편집 중인지 확인합니다.
   */
  isEditing(): boolean;
}

/**
 * 기본 셀 편집기 구현 (input 요소 사용)
 */
export class DefaultCellEditor implements CellEditor {
  private input: HTMLInputElement | null = null;
  private currentCell: HTMLElement | null = null;
  private originalValue: any = null;

  start(cell: HTMLElement, value: any, mode: CellEditMode): void {
    if (this.isEditing()) {
      this.save();
    }

    this.currentCell = cell;
    this.originalValue = value;

    // input 요소 생성
    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.value = mode === "replace" ? "" : String(value ?? "");
    this.input.className = "cell-editor-input";

    // 셀 크기에 맞춤
    const rect = cell.getBoundingClientRect();
    this.input.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #217346;
      padding: 2px 4px;
      margin: 0;
      outline: none;
      box-sizing: border-box;
      font: inherit;
      background: white;
      z-index: 10;
    `;

    // 셀 내용 숨기고 input 추가
    cell.style.position = "relative";
    cell.textContent = "";
    cell.appendChild(this.input);

    // 포커스 및 선택
    this.input.focus();
    if (mode === "append") {
      this.input.setSelectionRange(
        this.input.value.length,
        this.input.value.length,
      );
    } else {
      this.input.select();
    }

    // 이벤트 리스너
    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));
    this.input.addEventListener("blur", () => this.handleBlur());
  }

  save(): any {
    if (!this.input || !this.currentCell) return null;

    const newValue = this.input.value;
    this.cleanup();

    return newValue;
  }

  cancel(): void {
    if (!this.currentCell) return;

    this.cleanup();
    if (this.currentCell) {
      this.currentCell.textContent = String(this.originalValue ?? "");
    }
  }

  isEditing(): boolean {
    return this.input !== null;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      this.save();
      this.dispatchSaveEvent("enter");
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.save();
      this.dispatchSaveEvent(e.shiftKey ? "tab-reverse" : "tab");
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.cancel();
      this.dispatchCancelEvent();
    }
  }

  private handleBlur(): void {
    // blur 시 자동 저장
    setTimeout(() => {
      if (this.isEditing()) {
        this.save();
        this.dispatchSaveEvent("blur");
      }
    }, 100);
  }

  private cleanup(): void {
    if (this.input) {
      this.input.remove();
      this.input = null;
    }

    if (this.currentCell) {
      this.currentCell = null;
    }

    this.originalValue = null;
  }

  private dispatchSaveEvent(reason: string): void {
    if (this.currentCell) {
      this.currentCell.dispatchEvent(
        new CustomEvent("celleditorsave", {
          detail: { reason },
          bubbles: true,
        }),
      );
    }
  }

  private dispatchCancelEvent(): void {
    if (this.currentCell) {
      this.currentCell.dispatchEvent(
        new CustomEvent("celleditorcancel", {
          bubbles: true,
        }),
      );
    }
  }
}
