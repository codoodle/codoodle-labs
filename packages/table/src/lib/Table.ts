import { Grid, GridColumn, GridRow } from "@codoodle/grid";
import { DefaultCellEditor, type CellEditor } from "./CellEditor";
import type { TableDataSource } from "./TableDataSource";
import type { TableOptions } from "./TableOptions";

/**
 * 데이터 기반 테이블 클래스
 * Grid를 포함하여 데이터 레이어를 제공합니다.
 */
export class Table<T = any> {
  private grid: Grid;
  private dataSource: TableDataSource<T>;
  private cellEditor: CellEditor;
  private readonly: boolean;
  private editingCell: { row: number; column: number } | null = null;

  constructor(element: HTMLDivElement, options: TableOptions<T>) {
    this.dataSource = options.dataSource;
    this.cellEditor = options.cellEditor ?? new DefaultCellEditor();
    this.readonly = options.readonly ?? false;

    // 데이터 소스로부터 행과 열 생성
    const rows = this.createRows(options);
    const columns = this.createColumns(options);

    // Grid 초기화
    this.grid = new Grid(element, {
      rows,
      columns,
      ...options.gridOptions,
    });

    // Grid 내부 DOM 및 레이아웃 초기화
    this.grid.initialize();

    this.setupEventListeners();
    this.renderData();
  }

  /**
   * 내부 Grid 인스턴스를 가져옵니다.
   */
  getGrid(): Grid {
    return this.grid;
  }

  /**
   * 데이터 소스를 가져옵니다.
   */
  getDataSource(): TableDataSource<T> {
    return this.dataSource;
  }

  /**
   * 데이터를 새로고침합니다.
   */
  refresh(): void {
    this.renderData();
  }

  /**
   * 특정 셀의 값을 업데이트합니다.
   */
  updateCell(row: number, column: number, value: any): void {
    this.dataSource.setValue(row, column, value);
    this.renderCell(row, column);
  }

  /**
   * 행을 생성합니다.
   */
  private createRows(options: TableOptions<T>): GridRow[] {
    const rowCount = this.dataSource.getRowCount();
    const defaultHeight = options.defaultRowHeight ?? 28;
    return Array.from({ length: rowCount }, () => new GridRow(defaultHeight));
  }

  /**
   * 열을 생성합니다.
   */
  private createColumns(options: TableOptions<T>): GridColumn[] {
    const columnCount = this.dataSource.getColumnCount();
    const defaultWidth = options.defaultColumnWidth ?? 100;
    return Array.from(
      { length: columnCount },
      () => new GridColumn(defaultWidth),
    );
  }

  /**
   * 이벤트 리스너를 설정합니다.
   */
  private setupEventListeners(): void {
    const element = this.grid.element;

    // 셀 클릭 - 선택
    element.addEventListener("click", (e) => this.handleCellClick(e));

    // 셀 더블클릭 - 편집
    element.addEventListener("dblclick", (e) => this.handleCellDoubleClick(e));

    // 키보드 입력
    element.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // 편집기 저장 이벤트
    element.addEventListener("celleditorsave", (e) =>
      this.handleEditorSave(e as CustomEvent),
    );

    // 편집기 취소 이벤트
    element.addEventListener("celleditorcancel", () =>
      this.handleEditorCancel(),
    );
  }

  /**
   * 모든 데이터를 렌더링합니다.
   */
  private renderData(): void {
    const rowCount = this.dataSource.getRowCount();
    const columnCount = this.dataSource.getColumnCount();

    for (let row = 0; row < rowCount; row++) {
      for (let column = 0; column < columnCount; column++) {
        this.renderCell(row, column);
      }
    }
  }

  /**
   * 특정 셀을 렌더링합니다.
   */
  private renderCell(row: number, column: number): void {
    const value = this.dataSource.getValue(row, column);
    const cellElement = this.getCellElement(row, column);
    if (cellElement) {
      cellElement.textContent = String(value ?? "");
    }
  }

  /**
   * 셀 요소를 가져옵니다.
   */
  private getCellElement(row: number, column: number): HTMLElement | null {
    const element = this.grid.element;
    return element.querySelector(
      `[data-row="${row}"][data-column="${column}"]`,
    ) as HTMLElement | null;
  }

  /**
   * 셀 클릭 핸들러
   */
  private handleCellClick(e: Event): void {
    const target = e.target as HTMLElement;
    const cellElement = target.closest(
      "[data-row][data-column]",
    ) as HTMLElement;
    if (!cellElement) return;

    const row = Number(cellElement.dataset.row);
    const column = Number(cellElement.dataset.column);

    // 셀 선택만 (편집은 더블클릭 또는 F2)
    this.selectCell(row, column);
  }

  /**
   * 셀 더블클릭 핸들러
   */
  private handleCellDoubleClick(e: Event): void {
    if (this.readonly) return;

    const target = e.target as HTMLElement;
    const cellElement = target.closest(
      "[data-row][data-column]",
    ) as HTMLElement;
    if (!cellElement) return;

    const row = Number(cellElement.dataset.row);
    const column = Number(cellElement.dataset.column);

    this.startEdit(row, column, "append");
  }

  /**
   * 키보드 입력 핸들러
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (this.readonly) return;
    if (this.cellEditor.isEditing()) return;

    const target = e.target as HTMLElement;
    const cellElement = target.closest(
      "[data-row][data-column]",
    ) as HTMLElement;
    if (!cellElement) return;

    const row = Number(cellElement.dataset.row);
    const column = Number(cellElement.dataset.column);

    // F2 - 편집 모드 (내용 유지)
    if (e.key === "F2") {
      e.preventDefault();
      this.startEdit(row, column, "append");
    }
    // Enter - 편집 모드 (내용 교체)
    else if (e.key === "Enter") {
      e.preventDefault();
      this.startEdit(row, column, "replace");
    }
    // 일반 문자 입력 - 즉시 편집 (내용 교체)
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      this.startEdit(row, column, "replace");
    }
  }

  /**
   * 셀을 선택합니다.
   */
  private selectCell(row: number, column: number): void {
    // TODO: Grid의 선택 API 사용
    const cellElement = this.getCellElement(row, column);
    if (cellElement) {
      cellElement.focus();
    }
  }

  /**
   * 셀 편집을 시작합니다.
   */
  private startEdit(
    row: number,
    column: number,
    mode: "replace" | "append",
  ): void {
    const cellElement = this.getCellElement(row, column);
    if (!cellElement) return;

    this.editingCell = { row, column };
    const value = this.dataSource.getValue(row, column);
    this.cellEditor.start(cellElement, value, mode);
  }

  /**
   * 편집기 저장 핸들러
   */
  private handleEditorSave(e: CustomEvent): void {
    if (!this.editingCell) return;

    const newValue = this.cellEditor.save();
    const { row, column } = this.editingCell;

    // 데이터 소스 업데이트
    this.dataSource.setValue(row, column, newValue);

    // 셀 렌더링
    this.renderCell(row, column);

    // 변경 이벤트 발생
    this.dispatchChangeEvent(row, column, newValue);

    // 다음 셀로 이동 (Enter/Tab에 따라)
    const reason = e.detail?.reason;
    if (reason === "enter") {
      this.moveToCell(row + 1, column);
    } else if (reason === "tab") {
      this.moveToCell(row, column + 1);
    } else if (reason === "tab-reverse") {
      this.moveToCell(row, column - 1);
    }

    this.editingCell = null;
  }

  /**
   * 편집기 취소 핸들러
   */
  private handleEditorCancel(): void {
    this.editingCell = null;
  }

  /**
   * 다음 셀로 이동합니다.
   */
  private moveToCell(row: number, column: number): void {
    const rowCount = this.dataSource.getRowCount();
    const columnCount = this.dataSource.getColumnCount();

    // 범위 체크
    if (row < 0 || row >= rowCount || column < 0 || column >= columnCount) {
      return;
    }

    this.selectCell(row, column);
  }

  /**
   * 셀 변경 이벤트를 발생시킵니다.
   */
  private dispatchChangeEvent(row: number, column: number, value: any): void {
    this.grid.element.dispatchEvent(
      new CustomEvent("cellchange", {
        detail: { row, column, value },
        bubbles: true,
      }),
    );
  }

  /**
   * 테이블을 파기합니다.
   */
  dispose(): void {
    // TODO: 이벤트 리스너 제거 및 리소스 정리
  }
}
