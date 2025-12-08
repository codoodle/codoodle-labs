import { GridColumn } from "./GridColumn";
import { GridColumnsHeader } from "./GridColumnsHeader";
import { GridMerge } from "./GridMerge";
import { GridRow } from "./GridRow";
import { GridRowsHeader } from "./GridRowsHeader";

/**
 * 그리드 설정입니다.
 */
export interface GridSettings {
  /**
   *  표시할 행 목록입니다.
   */
  rows: GridRow[];

  /**
   *  스크롤할 수 없는 행의 수입니다.
   */
  rowsFrozen?: number;

  /**
   *  행 머리글입니다.
   */
  rowsHeader?: GridRowsHeader;

  /**
   *  표시할 열 목록입니다.
   */
  columns: GridColumn[];

  /**
   *  스크롤할 수 없는 열의 수입니다.
   */
  columnsFrozen?: number;

  /**
   *  열 머리글입니다.
   */
  columnsHeader?: GridColumnsHeader;

  /**
   *  셀 병합 목록입니다.
   */
  merges?: GridMerge[];
}
