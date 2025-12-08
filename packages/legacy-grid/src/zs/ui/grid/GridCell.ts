import style from "../../../styles/ui.module.scss";
import { Disposable } from "../../Disposable";
import { Rect } from "../Rect";
import { Visibility } from "../Visibility";
import { GridColumn } from "./GridColumn";
import { GridPart } from "./GridPart";
import { GridRow } from "./GridRow";

/**
 * 그리드의 셀을 나타냅니다.
 */
export class GridCell implements Disposable {
  _element: HTMLDivElement;
  _elementContent: HTMLDivElement;
  _inPart: GridPart;
  _rowBegin: number;
  _rowEnd: number;
  _columnBegin: number;
  _columnEnd: number;
  _isSelected: boolean;

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
    return this._columnEnd - this.columnBegin + 1 || 0;
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
    if ((this._isSelected = value)) {
      this._element.classList.add(style.zsSelected);
    } else {
      this._element.classList.remove(style.zsSelected);
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
    isSelected = false,
  ) {
    this._element = element;
    this._element.setAttribute("data-row", rowIndex + "");
    this._element.setAttribute("data-column", columnIndex + "");
    this._element.classList.add(style.zsGridCell);
    if (rowIndex + 1 === inPart.rows.length) {
      this._element.classList.add(style.zsGridCellLastRow);
    }
    if (columnIndex + 1 === inPart.columns.length) {
      this._element.classList.add(style.zsGridCellLastColumn);
    }
    this._elementContent = document.createElement("div");
    this._elementContent.classList.add(style.zsGridCellContent);
    this._element.appendChild(this._elementContent);
    this._inPart = inPart;
    this._rowBegin = rowIndex;
    this._rowEnd = rowIndex + rowSpan - 1;
    this._columnBegin = columnIndex;
    this._columnEnd = columnIndex + columnSpan - 1;
    this._isSelected = isSelected;
    if (this.isMerged) {
      this._element.setAttribute("data-merged", "");
      this._element.setAttribute("data-rowbegin", this._rowBegin + "");
      this._element.setAttribute("data-rowend", this._rowEnd + "");
      this._element.setAttribute("data-columnbegin", this._columnBegin + "");
      this._element.setAttribute("data-columnend", this._columnEnd + "");
    }
    this.isSelected = isSelected;
    const row = this.row;
    const column = this.column;
    if (
      row.visibility !== Visibility.hidden &&
      column.visibility !== Visibility.hidden
    ) {
      column.cellCreated(row, this._elementContent);
    }
  }

  dispose(destroy = true): void {
    if (this._element) {
      this._element.parentNode?.removeChild(this._element);
      if (destroy) {
        const row = this._inPart.rows[this._rowBegin];
        const column = this._inPart.columns[this._columnBegin];
        column.cellDisposed(row, this._elementContent);

        const disposable = this as unknown as { [index: string]: unknown };
        const propertyNames = Object.keys(disposable);
        for (const propertyName of propertyNames) {
          disposable[propertyName] = undefined;
        }
      }
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
        this._inPart.columns[columnIndex ?? this._columnBegin].left;
      width =
        this._inPart.columns[this._columnEnd].right -
        this._inPart.columns[this._columnBegin].left;
    }
    if (this.rowSpan > 1) {
      top +=
        this._inPart.rows[this._rowBegin].top -
        this._inPart.rows[rowIndex ?? this._rowBegin].top;
      height =
        this._inPart.rows[this._rowEnd].bottom -
        this._inPart.rows[this._rowBegin].top;
    }
    this._element.style.left = left + "px";
    this._element.style.top = top + "px";
    this._element.style.width = width + "px";
    this._element.style.height = height + "px";
    this._element.style.lineHeight = height - 1 + "px";
    this._element.setAttribute("data-row", rowIndex + "");
    this._element.setAttribute("data-column", columnIndex + "");
  }
}
