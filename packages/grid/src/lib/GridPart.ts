import styles from "../styles/codoodle.module.css.ts";
import { Container } from "./Container";
import type { GridBounds } from "./GridBounds";
import { GridCell } from "./GridCell";
import type { GridCellFactory } from "./GridCellFactory";
import { DefaultGridCellFactory } from "./GridCellFactory";
import type { GridColumn } from "./GridColumn";
import type { GridMerge } from "./GridMerge";
import type { GridRow } from "./GridRow";
import type { Point } from "./Point";
import type { Rect } from "./Rect";
import type { Size } from "./Size";
import { Visibility } from "./Visibility";

type CellKey = `${number}:${number}`;

const cellKey = (rowIndex: number, columnIndex: number): CellKey =>
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

  protected _zIndex: number;
  protected _type: symbol;
  protected _rows: ReadonlyArray<GridRow>;
  protected _columns: ReadonlyArray<GridColumn>;
  protected _location: Point;
  protected _scroll: Point;
  protected _cells: Map<CellKey, GridCell>;
  protected _cellsIndex: GridBounds;
  protected _selectedRanges: GridBounds[] = [];
  protected _cellFactory: GridCellFactory;
  protected _reservedFocus: CellKey | undefined;

  /**
   * 파트의 유형을 가져옵니다.
   *
   * |     |     |     |
   * |:---:|:---:|:---:|
   * |     | HCF | HCN |
   * | HRF | BFF | BNF |
   * | HRN | BFN | BNN |
   */
  get type(): symbol {
    return this._type;
  }

  /**
   * 파트가 열 머리글인지 여부를 가져옵니다.
   */
  get isColumnHeader(): boolean {
    return this._type === GridPart.TYPE_HCF || this._type === GridPart.TYPE_HCN;
  }

  /**
   * 파트가 열 머리글인지 여부를 가져옵니다.
   */
  get isRowHeader(): boolean {
    return this._type === GridPart.TYPE_HRF || this._type === GridPart.TYPE_HRN;
  }

  /**
   * 표시할 행 목록을 가져옵니다.
   */
  get rows(): ReadonlyArray<GridRow> {
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
  get columns(): ReadonlyArray<GridColumn> {
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

  /**
   * 그리드 파트의 기준 위치(offset)를 가져옵니다.
   */
  get location(): Readonly<Point> {
    return this._location;
  }

  /**
   * 현재 그리드 파트에 적용된 스크롤 위치를 가져옵니다.
   */
  get scroll(): Readonly<Point> {
    return this._scroll;
  }

  /**
   * 현재 GridPart에서 관리 중인 셀 맵을 가져옵니다.
   */
  get cells(): ReadonlyMap<CellKey, GridCell> {
    return this._cells;
  }

  /**
   * 현재 화면에 렌더링되어 있는 셀들의 인덱스 범위를 가져옵니다.
   */
  get cellsIndex(): Readonly<GridBounds> {
    return this._cellsIndex;
  }

  /**
   * 현재 GridPart 내에 선택된 셀이 존재하는지 여부를 가져옵니다.
   */
  get hasSelected(): boolean {
    return this._selectedRanges.length > 0;
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
   * @param cellFactory 그리드 셀을 생성할 팩토리입니다. 지정하지 않으면 기본 팩토리를 사용합니다.
   */
  constructor(
    type: symbol,
    rows: GridRow[],
    columns: GridColumn[],
    cellFactory?: GridCellFactory,
  ) {
    super(document.createElement("div"));
    this._element.classList.add(styles.gridInner);
    this._elementWrapper.classList.add(styles.gridInnerWrapper);
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
    this._cellFactory = cellFactory ?? new DefaultGridCellFactory();
  }

  /**
   * 컨트롤을 시작합니다.
   * @param location 컨트롤의 위치입니다.
   * @param scroll 스크롤의 위치입니다.
   * @param merges 병합할 셀에 대한 정보입니다.
   */
  protected onInitialize(
    location?: Point,
    scroll?: Point,
    merges?: GridMerge[],
  ): void {
    super.onInitialize();
    this._cells.forEach((cell) => this.disposeCell(cell));
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
        const cell = this.createCell(
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

  dispose(): void {
    this._element.parentNode?.removeChild(this._element);
    this._cells.forEach((cell) => this.disposeCell(cell));
    this._cells.clear();
    this._selectedRanges.length = 0;
    super.dispose();
  }

  protected measure(force = false): void {
    const width = this._element.clientWidth;
    const height = this._element.clientHeight;
    if (force || this._width !== width || this._height !== height) {
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

  protected arrange(availableSize: Size): void {
    const bounds = {
      left: this._scroll.x + this._location.x,
      top: this._scroll.y + this._location.y,
      width: availableSize.width - this._location.x,
      height: availableSize.height - this._location.y,
    };
    const { rowBegin, rowEnd, columnBegin, columnEnd } =
      this.getIndexBounds(bounds);
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
      this.render({ rowBegin, rowEnd, columnBegin, columnEnd });
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
   * 포커스할 셀을 예약합니다. 예약된 셀은 disposeCell에서 제거되지 않습니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   */
  reserveFocus(rowIndex: number, columnIndex: number): void {
    this._reservedFocus = cellKey(rowIndex, columnIndex);
  }

  /**
   * 예약된 포커스를 취소합니다.
   */
  clearReservedFocus(): void {
    this._reservedFocus = undefined;
  }

  /**
   * 예약된 셀로 포커스를 이동하고 예약을 클리어합니다.
   */
  applyReservedFocus(): void {
    if (this._reservedFocus) {
      const cell = this._cells.get(this._reservedFocus);
      this._reservedFocus = undefined;
      if (cell && cell.element !== document.activeElement) {
        cell.element.focus({
          preventScroll: true,
        });
      }
    } else {
      this._reservedFocus = undefined;
    }
  }

  /**
   * 지정한 행과 열의 인덱스에 표시되는 셀로 포커스를 이동합니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   * @param shouldScroll 셀이 화면에 보이도록 스크롤할지 여부입니다. 기본값은 true입니다.
   */
  focus(rowIndex: number, columnIndex: number, shouldScroll = true): void {
    let cell = this._cells.get(cellKey(rowIndex, columnIndex));
    if (cell && cell.element === document.activeElement) {
      return;
    }

    if (shouldScroll) {
      this.scrollInto(rowIndex, columnIndex);
    }
    cell = this._cells.get(cellKey(rowIndex, columnIndex));
    if (cell && cell.element !== document.activeElement) {
      cell.element.focus({
        preventScroll: true,
      });
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
      if (this.disposeCell(cell, true)) {
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
    const newBounds: GridBounds = { rowBegin, rowEnd, columnBegin, columnEnd };
    let additions: GridBounds[] = [newBounds];
    for (const existing of this._selectedRanges) {
      const nextAdditions: GridBounds[] = [];
      for (const add of additions) {
        nextAdditions.push(...this.subtractRect(add, existing));
      }
      additions = nextAdditions;
      if (additions.length === 0) {
        break;
      }
    }

    this._selectedRanges = this._selectedRanges.concat(additions);
    this._selectedRanges = this.mergeRanges(this._selectedRanges);
    for (const [, cell] of this._cells) {
      if (!cell) {
        continue;
      }
      cell.isSelected = this.isCellSelected(cell.rowBegin, cell.columnBegin);
    }
  }

  /**
   * 사각형 b를 a에서 빼서 결과 사각형 배열을 반환합니다. 겹치지 않는 경우 [a]를 반환합니다.
   */
  private subtractRect(a: GridBounds, b: GridBounds): GridBounds[] {
    if (
      b.rowBegin > a.rowEnd ||
      b.rowEnd < a.rowBegin ||
      b.columnBegin > a.columnEnd ||
      b.columnEnd < a.columnBegin
    ) {
      return [a];
    }
    const results: GridBounds[] = [];
    if (b.rowBegin > a.rowBegin) {
      results.push({
        rowBegin: a.rowBegin,
        rowEnd: b.rowBegin - 1,
        columnBegin: a.columnBegin,
        columnEnd: a.columnEnd,
      });
    }
    if (b.rowEnd < a.rowEnd) {
      results.push({
        rowBegin: b.rowEnd + 1,
        rowEnd: a.rowEnd,
        columnBegin: a.columnBegin,
        columnEnd: a.columnEnd,
      });
    }
    const rowStart = Math.max(a.rowBegin, b.rowBegin);
    const rowStop = Math.min(a.rowEnd, b.rowEnd);
    if (b.columnBegin > a.columnBegin && rowStart <= rowStop) {
      results.push({
        rowBegin: rowStart,
        rowEnd: rowStop,
        columnBegin: a.columnBegin,
        columnEnd: b.columnBegin - 1,
      });
    }
    if (b.columnEnd < a.columnEnd && rowStart <= rowStop) {
      results.push({
        rowBegin: rowStart,
        rowEnd: rowStop,
        columnBegin: b.columnEnd + 1,
        columnEnd: a.columnEnd,
      });
    }
    return results;
  }

  /**
   * 인접한 범위들을 병합합니다.
   *
   * 두 범위가 정확히 인접하고(행 또는 열 방향으로 바로 붙어 있고), 다른 차원에서 정렬되어 있는 경우에만 병합합니다.
   *
   * 예시:
   * - 행 방향 병합: 열 범위가 동일하고 rowEnd + 1 === rowBegin인 경우
   * - 열 방향 병합: 행 범위가 동일하고 columnEnd + 1 === columnBegin인 경우
   *
   * @param ranges 병합할 범위 배열입니다.
   * @returns 병합된 범위 배열입니다.
   */
  private mergeRanges(ranges: GridBounds[]): GridBounds[] {
    if (ranges.length <= 1) return ranges.slice();
    const sorted = ranges.slice().sort((a, b) => {
      if (a.rowBegin !== b.rowBegin) return a.rowBegin - b.rowBegin;
      if (a.rowEnd !== b.rowEnd) return a.rowEnd - b.rowEnd;
      if (a.columnBegin !== b.columnBegin) return a.columnBegin - b.columnBegin;
      return a.columnEnd - b.columnEnd;
    });
    const merged: GridBounds[] = [];
    for (const r of sorted) {
      let mergedWithPrev = false;
      if (merged.length > 0) {
        const last = merged[merged.length - 1];
        if (
          last.columnBegin === r.columnBegin &&
          last.columnEnd === r.columnEnd &&
          last.rowEnd + 1 === r.rowBegin
        ) {
          last.rowEnd = r.rowEnd;
          mergedWithPrev = true;
        } else if (
          last.rowBegin === r.rowBegin &&
          last.rowEnd === r.rowEnd &&
          last.columnEnd + 1 === r.columnBegin
        ) {
          last.columnEnd = r.columnEnd;
          mergedWithPrev = true;
        }
      }
      if (!mergedWithPrev) {
        merged.push({ ...r });
      }
    }
    return merged;
  }

  /**
   * 셀 선택을 취소합니다.
   * @param bounds 선택을 취소할 행과 열의 인덱스 범위입니다.
   */
  unselect(bounds?: GridBounds): void {
    if (!bounds) {
      this._selectedRanges.length = 0;
      for (const [, cell] of this._cells) {
        if (!cell) continue;
        cell.isSelected = false;
      }
      return;
    }
    const { rowBegin, rowEnd, columnBegin, columnEnd } = bounds;
    const removeRange: GridBounds = {
      rowBegin,
      rowEnd,
      columnBegin,
      columnEnd,
    };
    const newRanges: GridBounds[] = [];
    for (const r of this._selectedRanges) {
      newRanges.push(...this.subtractRect(r, removeRange));
    }
    this._selectedRanges = newRanges;
    for (const [, cell] of this._cells) {
      if (!cell) continue;
      cell.isSelected = this.isCellSelected(cell.rowBegin, cell.columnBegin);
    }
  }

  /**
   * 셀을 병합합니다. 이전에 병합된 셀은 초기화 됩니다.
   * @param merges 병합할 셀에 대한 정보입니다.
   */
  merge(merges: GridMerge[]): void {
    this.clearReservedFocus();
    this._cells.forEach((cell) => this.disposeCell(cell));
    this._cells.clear();
    this._cellsIndex = {
      rowBegin: -1,
      rowEnd: -1,
      columnBegin: -1,
      columnEnd: -1,
    };
    for (const { rowIndex, rowSpan, columnIndex, columnSpan } of merges) {
      const cell = this.createCell(rowIndex, columnIndex, rowSpan, columnSpan);
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
    const index = this.getIndexBounds({ left, top, width: 0, height: 0 });
    return this.isCellSelected(index.rowBegin, index.columnBegin);
  }

  /**
   * 지정한 셀이 선택되었는지 확인합니다. 병합된 셀의 경우, 병합된 셀의 영역에 포함되는 셀도 선택된 것으로 간주합니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   * @return 셀이 선택된 경우 true를 반환합니다.
   */
  protected isCellSelected(rowIndex: number, columnIndex: number): boolean {
    for (const r of this._selectedRanges) {
      if (
        rowIndex >= r.rowBegin &&
        rowIndex <= r.rowEnd &&
        columnIndex >= r.columnBegin &&
        columnIndex <= r.columnEnd
      ) {
        return true;
      }
    }
    const key = cellKey(rowIndex, columnIndex);
    const cell = this._cells.get(key);
    if (cell && cell.isMerged) {
      for (const r of this._selectedRanges) {
        if (
          cell.rowBegin >= r.rowBegin &&
          cell.rowEnd <= r.rowEnd &&
          cell.columnBegin >= r.columnBegin &&
          cell.columnEnd <= r.columnEnd
        ) {
          return true;
        }
        if (
          cell.rowEnd >= r.rowBegin &&
          cell.rowBegin <= r.rowEnd &&
          cell.columnEnd >= r.columnBegin &&
          cell.columnBegin <= r.columnEnd
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 지정한 위치에 표시된 행과 열의 인덱스를 가져옵니다.
   * @param location 인덱스를 확인할 위치입니다.
   * @param raw true인 경우 병합 셀 처리를 건너뛰고 순수한 셀 인덱스를 반환합니다. 기본값은 false입니다.
   */
  getIndex(location: Point, raw = false): GridBounds {
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
    const index = this.getIndexBounds({ left, top, width: 0, height: 0 });
    if (raw) {
      return index;
    }

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
  protected render({
    rowBegin,
    rowEnd,
    columnBegin,
    columnEnd,
  }: GridBounds): void {
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
            if (this.disposeCell(cell, true)) {
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
            if (this.disposeCell(cell, true)) {
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
          const cell = this.createCell(rowIndex, columnIndex);
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
   * @return 행과 열의 인덱스 범위입니다.
   */
  getIndexBounds(bounds: Rect): GridBounds {
    const { left, top, width, height } = bounds;
    const right = left + width;
    const bottom = top + height;
    const isPoint = width === 0 && height === 0;
    const lastRowIndex = this._rows.length - 1;
    const lastColumnIndex = this._columns.length - 1;

    let rowBegin = 0;
    if (top >= this._rows[lastRowIndex].bottom) {
      rowBegin = lastRowIndex;
    } else {
      let lo = 0;
      let hi = lastRowIndex;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const row = this._rows[mid];
        if (top < row.bottom) {
          rowBegin = mid;
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      }
    }

    let rowEnd = 0;
    if (top >= this._rows[lastRowIndex].bottom) {
      rowEnd = lastRowIndex;
    } else {
      let lo = 0;
      let hi = lastRowIndex;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const row = this._rows[mid];
        if (row.top < bottom || (isPoint && row.top <= bottom)) {
          rowEnd = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
    }

    let columnBegin = 0;
    if (left >= this._columns[lastColumnIndex].right) {
      columnBegin = lastColumnIndex;
    } else {
      let lo = 0;
      let hi = lastColumnIndex;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const column = this._columns[mid];
        if (left < column.right) {
          columnBegin = mid;
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      }
    }

    let columnEnd = 0;
    if (left >= this._columns[lastColumnIndex].right) {
      columnEnd = lastColumnIndex;
    } else {
      let lo = 0;
      let hi = lastColumnIndex;
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const column = this._columns[mid];
        if (column.left < right || (isPoint && column.left <= right)) {
          columnEnd = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
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
  protected createCell(
    rowIndex: number,
    columnIndex: number,
    rowSpan = 1,
    columnSpan = 1,
  ): GridCell | undefined {
    let rowCollapsed = true;
    for (let i = rowIndex; i < rowIndex + rowSpan; i++) {
      const row = this._rows[i];
      if (row.visibility !== Visibility.Collapsed) {
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
      if (column.visibility !== Visibility.Collapsed) {
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
    const cell = this._cellFactory.createCell(
      element,
      this,
      rowIndex,
      columnIndex,
      rowSpan,
      columnSpan,
    );
    if (cell) {
      cell.isSelected = this.isCellSelected(rowIndex, columnIndex);
    }
    return cell;
  }

  /**
   * 화면에 표시된 그리드 셀 객체를 제거합니다.
   * @param cell 그리드 셀 객체입니다.
   * @param reusable 셀 객체를 재사용 가능한 상태로 분리(detach)할지 여부입니다.
   * true 인 경우, 셀은 화면에서만 제거되며 상황에 따라 재사용될 수 있습니다.
   * false 인 경우, 셀은 완전히 폐기되며 더 이상 사용되지 않습니다.
   * @returns GridPart에서 해당 셀을 완전히 제거해도 되는지 여부입니다.
   */
  protected disposeCell(cell: GridCell, reusable = false): boolean {
    if (reusable) {
      if (cell.element === document.activeElement) {
        return false;
      }
      if (
        this._reservedFocus &&
        cell === this._cells.get(this._reservedFocus)
      ) {
        return false;
      }
      if (cell.isMerged) {
        cell.element.remove();
        cell.dispose();
        return false;
      }
    }
    cell.dispose();
    return true;
  }
}
