import styles from "../styles/codoodle.module.css.ts";
import type { Disposable } from "./Disposable";
import type { GridColumn } from "./GridColumn";
import type { GridPart } from "./GridPart";
import type { GridRow } from "./GridRow";
import type { Rect } from "./Rect";

/**
 * 그리드의 셀을 나타냅니다.
 */
export class GridCell implements Disposable {
  protected _element: HTMLDivElement;
  protected _elementContent: HTMLDivElement;
  protected _inPart: GridPart;
  protected _rowBegin: number;
  protected _rowEnd: number;
  protected _columnBegin: number;
  protected _columnEnd: number;
  protected _isSelected: boolean;

  /**
   * 셀을 표시하는 HTML 요소를 가져옵니다.
   */
  get element(): HTMLDivElement {
    return this._element;
  }

  /**
   * 셀의 내용을 표시하는 행 입니다.
   */
  get row(): GridRow {
    return this._inPart?.rows[this._rowBegin];
  }

  /**
   * 셀이 차지하는 행의 시작 인덱스를 가져옵니다.
   */
  get rowBegin(): number {
    return this._rowBegin;
  }

  /**
   * 셀이 차지하는 행의 마지막 인덱스를 가져옵니다.
   */
  get rowEnd(): number {
    return this._rowEnd;
  }

  /**
   * 셀이 차지하는 행의 수를 가져옵니다.
   */
  get rowSpan(): number {
    return this._rowEnd - this._rowBegin + 1 || 0;
  }

  /**
   * 셀의 내용을 표시하는 열 입니다.
   */
  get column(): GridColumn {
    return this._inPart?.columns[this._columnBegin];
  }

  /**
   * 셀이 차지하는 열의 시작 인덱스를 가져옵니다.
   */
  get columnBegin(): number {
    return this._columnBegin;
  }

  /**
   * 셀이 차지하는 열의 마지막 인덱스를 가져옵니다.
   */
  get columnEnd(): number {
    return this._columnEnd;
  }

  /**
   * 셀이 차지하는 열의 수를 가져옵니다.
   */
  get columnSpan(): number {
    return this._columnEnd - this._columnBegin + 1 || 0;
  }

  /**
   * 셀이 병합되었는지 여부를 가져옵니다.
   */
  get isMerged(): boolean {
    return this.rowSpan > 1 || this.columnSpan > 1;
  }

  /**
   * 셀이 화면에 표시되었는지 여부를 가져옵니다.
   */
  get isDisplayed(): boolean {
    return !!this._element?.parentNode;
  }

  /**
   * 셀이 선택되었는지 여부를 가져오거나 설정합니다.
   */
  get isSelected(): boolean {
    return this._isSelected;
  }

  set isSelected(value: boolean) {
    this._isSelected = value;
    if (value) {
      this._element.classList.add(styles.gridCellSelected);
    } else {
      this._element.classList.remove(styles.gridCellSelected);
    }
  }

  /**
   * 생성자
   * @param element 셀을 표시하는 HTML 요소입니다.
   * @param inPart 셀이 위치하는 그리드의 일부입니다.
   * @param rowIndex 셀이 위치하는 행 인덱스 입니다.
   * @param columnIndex 셀이 위치하는 열 인덱스 입니다.
   * @param rowSpan 셀이 차지하는 행의 수를 가져옵니다.
   * @param columnSpan 셀이 차지하는 열의 수를 가져옵니다.
   * @param isSelected 셀이 선택되었는지 여부입니다.
   */
  constructor(
    element: HTMLDivElement,
    inPart: GridPart,
    rowIndex: number,
    columnIndex: number,
    rowSpan = 1,
    columnSpan = 1,
  ) {
    this._element = element;
    this._element.dataset.row = String(rowIndex);
    this._element.dataset.column = String(columnIndex);
    this._element.classList.add(styles.gridCell);
    if (rowIndex + 1 === inPart.rows.length) {
      this._element.classList.add(styles.gridCellLastRow);
    }
    if (columnIndex + 1 === inPart.columns.length) {
      this._element.classList.add(styles.gridCellLastColumn);
    }
    this._elementContent = document.createElement("div");
    this._elementContent.classList.add(styles.gridCellContent);
    this._element.appendChild(this._elementContent);
    this._inPart = inPart;
    this._rowBegin = rowIndex;
    this._rowEnd = rowIndex + rowSpan - 1;
    this._columnBegin = columnIndex;
    this._columnEnd = columnIndex + columnSpan - 1;
    this._isSelected = false;
    if (this.isMerged) {
      this._element.dataset.merged = "";
      this._element.dataset.rowBegin = String(this._rowBegin);
      this._element.dataset.rowEnd = String(this._rowEnd);
      this._element.dataset.columnBegin = String(this._columnBegin);
      this._element.dataset.columnEnd = String(this._columnEnd);
    }
  }

  dispose(): void {
    if (this._element) {
      this._element.remove();
    }
  }

  /**
   * 셀의 위치 및 크기를 갱신합니다.
   * @param bounds
   * @param rowIndex 셀이 위치하는 행 인덱스 입니다.
   * @param columnIndex 셀이 위치하는 열 인덱스 입니다.
   */
  updateBounds(
    { left, top, width, height }: Rect,
    rowIndex: number,
    columnIndex: number,
  ): void {
    if (this.columnSpan > 1) {
      left +=
        this._inPart.columns[this._columnBegin].left -
        this._inPart.columns[columnIndex].left;
      width =
        this._inPart.columns[this._columnEnd].right -
        this._inPart.columns[this._columnBegin].left;
    }
    if (this.rowSpan > 1) {
      top +=
        this._inPart.rows[this._rowBegin].top - this._inPart.rows[rowIndex].top;
      height =
        this._inPart.rows[this._rowEnd].bottom -
        this._inPart.rows[this._rowBegin].top;
    }
    this._element.style.left = left + "px";
    this._element.style.top = top + "px";
    this._element.style.width = width + "px";
    this._element.style.height = height + "px";
    this._element.dataset.row = String(rowIndex);
    this._element.dataset.column = String(columnIndex);
  }
}
