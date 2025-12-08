import style from "../../../styles/ui.module.scss";
import { Container } from "../Container";
import { initialization } from "../Control";
import { Point } from "../Point";
import { Rect } from "../Rect";
import { Size } from "../Size";
import { Visibility } from "../Visibility";
import { GridBounds } from "./GridBounds";
import { GridCell } from "./GridCell";
import { GridColumn } from "./GridColumn";
import { GridMerge } from "./GridMerge";
import { GridRow } from "./GridRow";

const cellKey = (rowIndex: number, columnIndex: number) =>
  `${rowIndex}:${columnIndex}`;

/**
 * 그리드의 일부를 나타내는 컨트롤입니다.
 *
 * |     |     |     |
 * |:---:|:---:|:---:|
 * |     | HCF | HCN |
 * | HRF | BFF | BNF |
 * | HRN | BFN | BNN |
 */
export class GridPart extends Container {
  static TYPE_HCF = Symbol("HCF");
  static TYPE_HCN = Symbol("HCN");
  static TYPE_HRF = Symbol("HRF");
  static TYPE_HRN = Symbol("HRN");
  static TYPE_BFF = Symbol("BFF");
  static TYPE_BNF = Symbol("BNF");
  static TYPE_BFN = Symbol("BFN");
  static TYPE_BNN = Symbol("BNN");

  _zIndex: number;
  _type: symbol;
  _rows: readonly GridRow[];
  _columns: readonly GridColumn[];
  _location: Point;
  _scroll: Point;
  _cells: Map<string, GridCell>;
  _cellsIndex: GridBounds;
  _selected: Map<string, GridBounds>;

  /**
   * 표시할 행 목록을 가져옵니다.
   */
  get rows(): readonly GridRow[] {
    return this._rows;
  }

  /**
   * 표시할 행 목록의 전체 높이를 가져옵니다.
   */
  get rowsHeight(): number {
    if (this._rows) {
      return this._rows[this._rows.length - 1].bottom;
    }
    return 0;
  }

  /**
   * 표시할 열 목록을 가져옵니다.
   */
  get columns(): readonly GridColumn[] {
    return this._columns;
  }

  /**
   * 표시할 열 목록의 전체 너비를 가져옵니다.
   */
  get columnsWidth(): number {
    if (this._columns) {
      return this._columns[this._columns.length - 1].right;
    }
    return 0;
  }

  get hasSelected(): boolean {
    return this._selected.size > 0;
  }

  /**
   * 생성자
   * @param type 그리드의 일부를 나타내는 컨트롤의 유형입니다.
   *
   * |     |     |     |
   * |:---:|:---:|:---:|
   * |     | HCF | HCN |
   * | HRF | BFF | BNF |
   * | HRN | BFN | BNN |
   * @param rows 표시할 행 목록입니다.
   * @param columns 표시할 열 목록입니다.
   */
  constructor(type: symbol, rows: GridRow[], columns: GridColumn[]) {
    super(document.createElement("div"));
    this._element.classList.add(style.zsGridIn);
    this._elementWrapper.classList.add(style.zsGridInWrapper);
    this._type = type;
    switch (this._type) {
      case GridPart.TYPE_BNN:
        this._zIndex = 10;
        break;
      case GridPart.TYPE_BNF:
      case GridPart.TYPE_BFN:
        this._zIndex = 20;
        break;
      case GridPart.TYPE_BFF:
        this._zIndex = 30;
        break;
      case GridPart.TYPE_HCN:
      case GridPart.TYPE_HRN:
        this._zIndex = 40;
        break;
      case GridPart.TYPE_HCF:
      case GridPart.TYPE_HRF:
      default:
        this._zIndex = 50;
        break;
    }
    this._rows = rows;
    this._columns = columns;
    this._location = { x: 0, y: 0 };
    this._scroll = { x: 0, y: 0 };
    this._cells = new Map();
    this._cellsIndex = {
      rowBegin: -1,
      rowEnd: -1,
      columnBegin: -1,
      columnEnd: -1,
    };
    this._selected = new Map();
  }

  /**
   * 컨트롤을 시작합니다.
   * @param location 컨트롤의 위치입니다.
   * @param scroll 스크롤의 위치입니다.
   * @param merges 병합할 셀에 대한 정보입니다.
   */
  @initialization
  initialize(location?: Point, scroll?: Point, merges?: GridMerge[]): void {
    super.initialize();
    this._cells.forEach((cell) => this._disposeCell(cell));
    this._cells.clear();
    this._cellsIndex = {
      rowBegin: -1,
      rowEnd: -1,
      columnBegin: -1,
      columnEnd: -1,
    };
    if (location) {
      this._location = { x: location.x, y: location.y };
    }
    if (scroll) {
      this._scroll = { x: scroll.x, y: scroll.y };
    }
    if (merges) {
      for (const { rowIndex, rowSpan, columnIndex, columnSpan } of merges) {
        const cell = this._createCell(
          rowIndex,
          columnIndex,
          rowSpan,
          columnSpan,
        );
        if (cell) {
          for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
            for (let j = columnIndex; j < columnIndex + columnSpan; j++) {
              this._cells.set(cellKey(i, j), cell);
            }
          }
        }
      }
    }
  }

  /**
   * 컨트롤을 더 이상 사용할 수 없도록 제거합니다.
   */
  dispose(): void {
    this._element.parentNode?.removeChild(this._element);
    this._cells.forEach((cell) => this._disposeCell(cell));
    this._cells.clear();
    this._selected.clear();
    super.dispose();
  }

  /**
   * 컨트롤이 사용가능한 크기를 확인하고 레이아웃 업데이트를 시작합니다.
   * @param initializing 컨트롤을 초기화 하는 중인지 여부입니다.
   */
  measure(initializing = false): void {
    const width = this._element.clientWidth;
    const height = this._element.clientHeight;
    if (initializing || this._width !== width || this._height !== height) {
      this.arrange({ width, height });
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
    }
  }

  /**
   * 컨트롤의 레이아웃을 업데이트합니다.
   * @param availableSize 사용가능한 크기입니다.
   */
  arrange(availableSize: Size): void {
    const bounds = {
      left: this._scroll.x + this._location.x,
      top: this._scroll.y + this._location.y,
      width: availableSize.width - this._location.x,
      height: availableSize.height - this._location.y,
    };
    const { rowBegin, rowEnd, columnBegin, columnEnd } =
      this._getIndexBounds(bounds);
    const left = bounds.left - this._columns[columnBegin].left;
    const top = bounds.top - this._rows[rowBegin].top;
    this._elementWrapper.style.left = left * -1 + "px";
    this._elementWrapper.style.top = top * -1 + "px";
    if (
      rowBegin !== this._cellsIndex.rowBegin ||
      rowEnd !== this._cellsIndex.rowEnd ||
      columnBegin !== this._cellsIndex.columnBegin ||
      columnEnd !== this._cellsIndex.columnEnd
    ) {
      this._render({ rowBegin, rowEnd, columnBegin, columnEnd });
    }
  }

  /**
   * 컨트롤의 내용을 지정한 값만큼 스크롤합니다.
   * @param value 스크롤 값입니다.
   */
  scrollTo({ x, y }: Point): void {
    if (this._scroll && (this._scroll.x !== x || this._scroll.y !== y)) {
      this._scroll = { x, y };
      this.measure(true);
    }
  }

  /**
   * 지정한 행과 열의 인덱스에 표시되는 셀이 화면에 보이도록 스크롤합니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   */
  scrollInto(rowIndex: number, columnIndex: number): void {
    const cell = this._cells.get(cellKey(rowIndex, columnIndex));
    const { rowBegin, rowEnd, columnBegin, columnEnd } = cell ?? {
      rowBegin: rowIndex,
      rowEnd: rowIndex,
      columnBegin: columnIndex,
      columnEnd: columnIndex,
    };

    let { x, y } = this._scroll;
    if (this._cellsIndex.columnBegin >= columnBegin) {
      x = this._columns[columnBegin].left - this._location.x;
    } else if (this._cellsIndex.columnEnd <= columnBegin) {
      x = Math.max(0, this._columns[columnEnd].right - this.width);
    } else if (x + this._location.x > this._columns[columnBegin].left) {
      x -= x + this._location.x - this._columns[columnBegin].left;
    }
    if (this._cellsIndex.rowBegin >= rowBegin) {
      y = this._rows[rowBegin].top - this._location.y;
    } else if (this._cellsIndex.rowEnd <= rowEnd) {
      y = Math.max(0, this._rows[rowEnd].bottom - this.height);
    } else if (y + this._location.y > this._rows[rowBegin].top) {
      y -= y + this._location.y - this._rows[rowBegin].top;
    }
    this.scrollTo({ x, y });
  }

  /**
   * 지정한 행과 열의 인덱스에 표시되는 셀로 포커스를 이동합니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   */
  focus(rowIndex: number, columnIndex: number): void {
    this.scrollInto(rowIndex, columnIndex);
    const cell = this._cells.get(cellKey(rowIndex, columnIndex));
    if (cell && cell.element !== document.activeElement) {
      cell.element.focus();
    }
  }

  /**
   * 지정한 행과 열의 인덱스에 표시되는 셀에 포커스된 내용을 제거합니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   */
  focusClear(rowIndex: number, columnIndex: number): void {
    const key = cellKey(rowIndex, columnIndex);
    const cell = this._cells.get(key);
    if (cell && cell.isDisplayed) {
      const { rowBegin, rowEnd, columnBegin, columnEnd } = this._cellsIndex;
      if (
        !(
          rowBegin > cell.rowEnd ||
          rowEnd < cell.rowBegin ||
          columnBegin > cell.columnEnd ||
          columnEnd < cell.columnBegin
        )
      ) {
        return;
      }
      if (this._disposeCell(cell, false)) {
        this._cells.delete(key);
      }
    }
  }

  /**
   * 셀을 선택합니다.
   * @param bounds 선택할 행과 열의 인덱스 범위입니다.
   */
  select({ rowBegin, rowEnd, columnBegin, columnEnd }: GridBounds): void {
    if (this._type === GridPart.TYPE_HCF) {
      columnEnd = Math.min(columnEnd, this.columns.length - 1);
    } else if (this._type === GridPart.TYPE_HRF) {
      rowEnd = Math.min(rowEnd, this.rows.length - 1);
    } else if (this._type === GridPart.TYPE_BFF) {
      rowEnd = Math.min(rowEnd, this.rows.length - 1);
      columnEnd = Math.min(columnEnd, this.columns.length - 1);
    } else if (this._type === GridPart.TYPE_BNF) {
      rowEnd = Math.min(rowEnd, this.rows.length - 1);
    } else if (this._type === GridPart.TYPE_BFN) {
      columnEnd = Math.min(columnEnd, this.columns.length - 1);
    }
    for (let rowIndex = rowBegin; rowIndex <= rowEnd; rowIndex++) {
      for (
        let columnIndex = columnBegin;
        columnIndex <= columnEnd;
        columnIndex++
      ) {
        const key = cellKey(rowIndex, columnIndex);
        const cell = this._cells.get(key);
        if (cell) {
          cell.isSelected = true;
          this._selected.set(key, {
            rowBegin: cell.rowBegin,
            rowEnd: cell.rowEnd,
            columnBegin: cell.columnBegin,
            columnEnd: cell.columnEnd,
          });
        } else {
          this._selected.set(key, {
            rowBegin: rowIndex,
            rowEnd: rowIndex,
            columnBegin: columnIndex,
            columnEnd: columnIndex,
          });
        }
      }
    }
  }

  /**
   * 셀 선택을 취소합니다.
   * @param bounds 선택을 취소할 행과 열의 인덱스 범위입니다.
   */
  unselect(bounds?: GridBounds): void {
    if (bounds) {
      const { rowBegin, rowEnd, columnBegin, columnEnd } = bounds;
      const keys = [];
      for (const [key, value] of this._selected) {
        if (
          value.rowBegin <= rowEnd &&
          rowBegin <= value.rowEnd &&
          value.columnBegin <= columnEnd &&
          columnBegin <= value.columnEnd
        ) {
          keys.push(key);
          const cell = this._cells.get(key);
          if (cell) {
            cell.isSelected = false;
          }
        }
      }
      for (const key of keys) {
        this._selected.delete(key);
      }
    } else {
      for (const [key] of this._selected) {
        const cell = this._cells.get(key);
        if (cell) {
          cell.isSelected = false;
        }
      }
      this._selected.clear();
    }
  }

  /**
   * 셀을 병합합니다. 이전에 병합된 셀은 초기화 됩니다.
   * @param merges 병합할 셀에 대한 정보입니다.
   */
  merge(merges: GridMerge[]): void {
    this._cells.forEach((cell) => this._disposeCell(cell));
    this._cells.clear();
    this._cellsIndex = {
      rowBegin: -1,
      rowEnd: -1,
      columnBegin: -1,
      columnEnd: -1,
    };
    for (const { rowIndex, rowSpan, columnIndex, columnSpan } of merges) {
      const cell = this._createCell(rowIndex, columnIndex, rowSpan, columnSpan);
      if (cell) {
        for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
          for (let j = columnIndex; j < columnIndex + columnSpan; j++) {
            this._cells.set(cellKey(i, j), cell);
          }
        }
      }
    }
    this.measure(true);
  }

  /**
   * 지정한 위치의 셀이 선택되었는지 확인합니다.
   * @param location 위치입니다.
   */
  isSelected(location: Point): boolean {
    const boundsWrapper = this._elementWrapper.getBoundingClientRect();
    const left =
      location.x -
      boundsWrapper.left +
      this._columns[this._cellsIndex.columnBegin].left -
      this._location.x;
    const top =
      location.y -
      boundsWrapper.top +
      this._rows[this._cellsIndex.rowBegin].top -
      this._location.y;
    const index = this._getIndexBounds({ left, top, width: 0, height: 0 });
    return this._selected.has(cellKey(index.rowBegin, index.columnBegin));
  }

  /**
   * 지정한 위치에 표시된 행과 열의 인덱스를 가져옵니다.
   * @param location 인덱스를 확인할 위치입니다.
   */
  getIndex(location: Point): GridBounds {
    const boundsWrapper = this._elementWrapper.getBoundingClientRect();
    const left =
      location.x -
      boundsWrapper.left +
      this._columns[this._cellsIndex.columnBegin].left -
      this._location.x;
    const top =
      location.y -
      boundsWrapper.top +
      this._rows[this._cellsIndex.rowBegin].top -
      this._location.y;
    const index = this._getIndexBounds({ left, top, width: 0, height: 0 });
    const cell = this._cells.get(cellKey(index.rowBegin, index.columnBegin));
    if (cell && cell.isMerged) {
      return {
        rowBegin: cell.rowBegin,
        rowEnd: cell.rowEnd,
        columnBegin: cell.columnBegin,
        columnEnd: cell.columnEnd,
      };
    }
    return index;
  }

  /**
   * 지정한 인덱스에 해당되는 셀을 화면에 표시합니다.
   * @param indexBounds
   */
  _render({ rowBegin, rowEnd, columnBegin, columnEnd }: GridBounds): void {
    const boundsTop = this._rows[rowBegin].top - this._location.y;
    const boundsLeft = this._columns[columnBegin].left - this._location.x;
    if (
      rowBegin > this._cellsIndex.rowEnd ||
      rowEnd < this._cellsIndex.rowBegin ||
      columnBegin > this._cellsIndex.columnEnd ||
      columnEnd < this._cellsIndex.columnBegin
    ) {
      for (
        let rowIndex = this._cellsIndex.rowBegin;
        rowIndex <= this._cellsIndex.rowEnd;
        rowIndex++
      ) {
        const row = this._rows[rowIndex];
        for (
          let columnIndex = this._cellsIndex.columnBegin;
          columnIndex <= this._cellsIndex.columnEnd;
          columnIndex++
        ) {
          const column = this._columns[columnIndex];
          const key = cellKey(rowIndex, columnIndex);
          const cell = this._cells.get(key);
          if (cell && cell.isDisplayed) {
            if (
              cell.isMerged &&
              !(
                rowBegin > cell.rowEnd ||
                rowEnd < cell.rowBegin ||
                columnBegin > cell.columnEnd ||
                columnEnd < cell.columnBegin
              )
            ) {
              continue;
            }
            if (this._disposeCell(cell, false)) {
              this._cells.delete(key);
            } else {
              cell.updateBounds(
                {
                  left: column.left - boundsLeft,
                  top: row.top - boundsTop,
                  width: column.width,
                  height: row.height,
                },
                rowIndex,
                columnIndex,
              );
            }
          }
        }
      }
    } else {
      const minRowIndex = Math.min(rowBegin, this._cellsIndex.rowBegin);
      const maxRowIndex = Math.max(rowEnd, this._cellsIndex.rowEnd);
      const minColumnIndex = Math.min(
        columnBegin,
        this._cellsIndex.columnBegin,
      );
      const maxColumnIndex = Math.max(columnEnd, this._cellsIndex.columnEnd);
      for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; rowIndex++) {
        const row = this._rows[rowIndex];
        for (
          let columnIndex = minColumnIndex;
          columnIndex <= maxColumnIndex;
          columnIndex++
        ) {
          if (
            rowIndex >= rowBegin &&
            rowIndex <= rowEnd &&
            columnIndex >= columnBegin &&
            columnIndex <= columnEnd
          ) {
            continue;
          }
          const column = this._columns[columnIndex];
          const key = cellKey(rowIndex, columnIndex);
          const cell = this._cells.get(key);
          if (cell && cell.isDisplayed) {
            if (
              cell.isMerged &&
              !(
                rowBegin > cell.rowEnd ||
                rowEnd < cell.rowBegin ||
                columnBegin > cell.columnEnd ||
                columnEnd < cell.columnBegin
              )
            ) {
              continue;
            }
            if (this._disposeCell(cell, false)) {
              this._cells.delete(key);
            } else {
              cell.updateBounds(
                {
                  left: column.left - boundsLeft,
                  top: row.top - boundsTop,
                  width: column.width,
                  height: row.height,
                },
                rowIndex,
                columnIndex,
              );
            }
          }
        }
      }
    }

    for (let rowIndex = rowBegin; rowIndex <= rowEnd; rowIndex++) {
      const row = this._rows[rowIndex];
      for (
        let columnIndex = columnBegin;
        columnIndex <= columnEnd;
        columnIndex++
      ) {
        const column = this._columns[columnIndex];
        const key = cellKey(rowIndex, columnIndex);
        if (this._cells.has(key)) {
          const cell = this._cells.get(key);
          if (cell) {
            // if (cell.isMerged) {
            //   cell.element.style.zIndex = this.zindex + 1 + ''
            // } else {
            //   cell.element.style.zIndex = this.zindex + ''
            // }
            cell.updateBounds(
              {
                left: column.left - boundsLeft,
                top: row.top - boundsTop,
                width: column.width,
                height: row.height,
              },
              rowIndex,
              columnIndex,
            );
            if (cell.isDisplayed) continue;
            this._elementWrapper.appendChild(cell.element);
          }
        } else {
          const cell = this._createCell(rowIndex, columnIndex);
          if (cell) {
            cell.updateBounds(
              {
                left: column.left - boundsLeft,
                top: row.top - boundsTop,
                width: column.width,
                height: row.height,
              },
              rowIndex,
              columnIndex,
            );
            this._elementWrapper.appendChild(cell.element);
            this._cells.set(key, cell);
          }
        }
      }
    }
    this._cellsIndex.rowBegin = rowBegin;
    this._cellsIndex.rowEnd = rowEnd;
    this._cellsIndex.columnBegin = columnBegin;
    this._cellsIndex.columnEnd = columnEnd;
  }

  /**
   * 지정한 사각형에 표시 가능한 행과 열의 인덱스를 가져옵니다.
   * @param bounds 확인할 사각형 범위입니다.
   */
  _getIndexBounds(bounds: Rect): GridBounds {
    const { left, top, width, height } = bounds;
    const right = left + width;
    const bottom = top + height;
    const isPoint = width === 0 && height === 0;
    const avgWidth = this.columnsWidth / this._columns.length;
    const avgHeight = this.rowsHeight / this._rows.length;
    let rowIndex = Math.min(
      this._rows.length - 1,
      Math.max(0, Math.floor(top / avgHeight)),
    );
    let rowBegin = this._rows.length - 1;
    let rowEnd = 0;
    let row = this._rows[rowIndex];
    if (row.top < bottom || (isPoint && row.top <= bottom)) {
      do {
        if (row.top < bottom || (isPoint && row.top <= bottom)) {
          rowEnd = rowIndex;
          row = this._rows[++rowIndex];
          continue;
        }
        break;
      } while (row);
      row = this._rows[rowEnd];
      do {
        if (top < row.bottom) {
          rowBegin = rowIndex;
          row = this._rows[--rowIndex];
          continue;
        }
        break;
      } while (row);
    } else {
      do {
        if (top < row.bottom) {
          rowBegin = rowIndex;
          row = this._rows[--rowIndex];
          continue;
        }
        break;
      } while (row);
      row = this._rows[rowBegin];
      do {
        if (row.top < bottom || (isPoint && row.top <= bottom)) {
          rowEnd = rowIndex;
          row = this._rows[++rowIndex];
          continue;
        }
        break;
      } while (row);
    }
    let columnIndex = Math.min(
      this._columns.length - 1,
      Math.max(0, Math.floor(left / avgWidth)),
    );
    let columnBegin = this._columns.length - 1;
    let columnEnd = 0;
    let column = this._columns[columnIndex];
    if (column.left < right || (isPoint && column.left <= right)) {
      do {
        if (column.left < right || (isPoint && column.left <= right)) {
          columnEnd = columnIndex;
          column = this._columns[++columnIndex];
          continue;
        }
        break;
      } while (column);
      column = this._columns[columnEnd];
      do {
        if (left < column.right) {
          columnBegin = columnIndex;
          column = this._columns[--columnIndex];
          continue;
        }
        break;
      } while (column);
    } else {
      do {
        if (left < column.right) {
          columnBegin = columnIndex;
          column = this._columns[--columnIndex];
          continue;
        }
        break;
      } while (column);
      column = this._columns[columnBegin];
      do {
        if (column.left < right || (isPoint && column.left <= right)) {
          columnEnd = columnIndex;
          column = this._columns[++columnIndex];
          continue;
        }
        break;
      } while (column);
    }
    return { rowBegin, rowEnd, columnBegin, columnEnd };
  }

  /**
   * 화면에 표시할 그리드 셀 객체를 생성합니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   * @param rowSpan 병합된 셀일 때, 병합된 행의 수 입니다.
   * @param columnSpan 병합된 셀일 때, 병합된 열의 수 입니다.
   */
  _createCell(
    rowIndex: number,
    columnIndex: number,
    rowSpan = 1,
    columnSpan = 1,
  ): GridCell | undefined {
    let rowCollapsed = true;
    for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
      const row = this._rows[i];
      if (row.visibility !== Visibility.collapsed) {
        rowCollapsed = false;
        break;
      }
    }
    if (rowCollapsed) {
      return;
    }
    let columnCollapsed = true;
    for (let i = columnIndex; i < columnIndex + columnSpan; i++) {
      const column = this._columns[i];
      if (column.visibility !== Visibility.collapsed) {
        columnCollapsed = false;
        break;
      }
    }
    if (columnCollapsed) {
      return;
    }
    const element = document.createElement("div");
    if (
      this._type === GridPart.TYPE_BFF ||
      this._type === GridPart.TYPE_BFN ||
      this._type === GridPart.TYPE_BNF ||
      this._type === GridPart.TYPE_BNN
    ) {
      element.tabIndex = -1;
    }
    element.style.zIndex = this._zIndex + "";
    return new GridCell(
      element,
      this,
      rowIndex,
      columnIndex,
      rowSpan,
      columnSpan,
      this._selected.has(cellKey(rowIndex, columnIndex)),
    );
  }

  /**
   * 화면에 표시된 그리드 셀 객체를 제거합니다.
   * @param cell 그리드 셀 객체입니다.
   * @param destroy 그리드 셀을 더 이상 사용할 수 없도록 처리하는지 여부입니다. 이 값이 false 이면 객체를 계속 사용 가능합니다. 기본 값은 true입니다.
   * @returns 셀을 제거되었는지 여부입니다.
   */
  _disposeCell(cell: GridCell, destroy = true): boolean {
    if (!destroy) {
      if (cell.element === document.activeElement) {
        return false;
      }
      if (cell.isMerged) {
        cell.dispose(false);
        return false;
      }
    }
    cell.dispose();
    return true;
  }
}
