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
export type GridOptions = {
  /**
   *  스크롤할 수 없는 행의 수입니다.
   */
  rowsFrozen?: number;

  /**
   *  행 머리글입니다.
   */
  rowsHeader?: GridRowsHeader;

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
} & (
  | {
      /**
       *  표시할 행 목록입니다. (레거시 방식)
       *  대용량 데이터의 경우 rowCount와 rowFactory를 사용하세요.
       */
      rows: GridRow[];
      rowCount?: never;
      rowFactory?: never;
      rowCacheSize?: never;

      /**
       *  표시할 열 목록입니다. (레거시 방식)
       *  대용량 데이터의 경우 columnCount와 columnFactory를 사용하세요.
       */
      columns: GridColumn[];
      columnCount?: never;
      columnFactory?: never;
      columnCacheSize?: never;
    }
  | {
      rows?: never;
      /**
       *  표시할 행의 총 개수입니다. (가상화 방식)
       *  rowFactory와 함께 사용하여 필요한 행만 생성합니다.
       */
      rowCount: number;
      /**
       *  행을 생성하는 팩토리 함수입니다. (가상화 방식)
       *  rowCount와 함께 사용하여 필요한 행만 생성합니다.
       */
      rowFactory: (index: number) => GridRow;
      /**
       * 가상화된 행 캐시의 최대 크기입니다. 지정하지 않으면 기본값(1000)이 사용됩니다.
       */
      rowCacheSize?: number;

      columns?: never;
      /**
       *  표시할 열의 총 개수입니다. (가상화 방식)
       *  columnFactory와 함께 사용하여 필요한 열만 생성합니다.
       */
      columnCount: number;
      /**
       *  열을 생성하는 팩토리 함수입니다. (가상화 방식)
       *  columnCount와 함께 사용하여 필요한 열만 생성합니다.
       */
      columnFactory: (index: number) => GridColumn;
      /**
       * 가상화된 열 캐시의 최대 크기입니다. 지정하지 않으면 기본값(500)이 사용됩니다.
       */
      columnCacheSize?: number;
    }
);
