import type { GridCellFactory } from "./GridCellFactory";
import { GridColumn } from "./GridColumn";
import { GridColumnsHeader } from "./GridColumnsHeader";
import type { GridMerge } from "./GridMerge";
import { GridRow } from "./GridRow";
import { GridRowsHeader } from "./GridRowsHeader";
import type { GridSelectionMode } from "./GridSelectionMode";
import type { GridSelectionUnit } from "./GridSelectionUnit";

/**
 * 그리드 설정입니다.
 */
export interface GridOptions {
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

  /**
   * 선택 모드입니다.
   */
  selectionMode?: GridSelectionMode;

  /**
   * 선택 단위입니다.
   */
  selectionUnit?: GridSelectionUnit;

  /**
   * 그리드 셀을 생성하는 팩토리입니다. 지정하지 않으면 기본 팩토리를 사용합니다.
   */
  cellFactory?: GridCellFactory;
}
