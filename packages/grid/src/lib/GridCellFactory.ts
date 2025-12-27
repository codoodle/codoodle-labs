import { GridCell } from "./GridCell";
import { GridPart } from "./GridPart";

/**
 * 그리드 셀을 생성하기 위한 팩토리입니다.
 */
export interface GridCellFactory {
  /**
   * 그리드 셀을 생성합니다.
   * @param element 셀을 표시하는 HTML 요소입니다.
   * @param part 셀이 속한 그리드 파트입니다.
   * @param rowIndex 셀의 시작 행 인덱스입니다.
   * @param columnIndex 셀의 시작 열 인덱스입니다.
   * @param rowSpan 셀이 차지하는 행의 수입니다.
   * @param columnSpan 셀이 차지하는 열의 수입니다.
   * @returns 생성된 그리드 셀, 또는 셀을 생성할 수 없는 경우 undefined입니다.
   */
  createCell(
    element: HTMLDivElement,
    part: GridPart,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number,
  ): GridCell | undefined;
}

/**
 * 기본 그리드 셀 팩토리입니다.
 */
export class DefaultGridCellFactory implements GridCellFactory {
  createCell(
    element: HTMLDivElement,
    part: GridPart,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number,
  ): GridCell | undefined {
    return new GridCell(
      element,
      part,
      rowIndex,
      columnIndex,
      rowSpan,
      columnSpan,
    );
  }
}
