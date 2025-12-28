import type { GridOptions } from "@codoodle/grid";
import type { CellEditor } from "./CellEditor";
import type { TableDataSource } from "./TableDataSource";

/**
 * 테이블 옵션
 */
export interface TableOptions<T = any> {
  /**
   * 데이터 소스
   */
  dataSource: TableDataSource<T>;

  /**
   * 셀 편집기 (기본값: DefaultCellEditor)
   */
  cellEditor?: CellEditor;

  /**
   * 그리드 옵션 (행/열 설정 제외)
   */
  gridOptions?: Partial<Omit<GridOptions, "rows" | "columns">>;

  /**
   * 기본 행 높이
   */
  defaultRowHeight?: number;

  /**
   * 기본 열 너비
   */
  defaultColumnWidth?: number;

  /**
   * 읽기 전용 모드
   */
  readonly?: boolean;
}
