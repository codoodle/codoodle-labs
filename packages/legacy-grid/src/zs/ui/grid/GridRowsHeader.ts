import { PropertyChangeEventArgs } from "../../EventArgs";
import { SupportPropertyChange } from "../../SupportPropertyChange";
import { GridColumn } from "./GridColumn";
import { GridMerge } from "./GridMerge";
import { GridRow } from "./GridRow";

interface GridRowsHeaderEventMap {
  /**
   * 머리글을 표시하지 않는지 여부 속성 변경 이벤트입니다.
   */
  isCollapsedChanged: PropertyChangeEventArgs<GridRowsHeader, "isCollapsed">;

  /**
   * 셀 병합 목록 속성 변경 초기화 이벤트입니다.
   */
  mergesChanged: PropertyChangeEventArgs<GridRowsHeader, "merges">;
}

export interface GridRowsHeader {
  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof GridRowsHeaderEventMap>(
    name: K,
    handler: (this: GridRowsHeader, args: GridRowsHeaderEventMap[K]) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof GridRowsHeaderEventMap>(
    name: K,
    handler: (this: GridRowsHeader, args: GridRowsHeaderEventMap[K]) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof GridRowsHeaderEventMap>(
    name: K,
    handler?: (this: GridRowsHeader, args: GridRowsHeaderEventMap[K]) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(
    args: PropertyChangeEventArgs<GridRowsHeader, "isCollapsed" | "merges">,
  ): boolean;

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  notifyPropertyChanged<
    K extends ("isCollapsed" | "merges") & keyof GridRowsHeader,
  >(
    propertyName: K,
    value: GridRowsHeader[K],
    valuePrevious: GridRowsHeader[K],
  ): void;
}

/**
 * 그리드의 행 머리글입니다.
 */
export class GridRowsHeader extends SupportPropertyChange {
  protected _columnsFactory: (rows: GridRow[]) => GridColumn[];
  protected _isCollapsed: boolean;
  protected _merges: readonly GridMerge[] | undefined;

  /**
   * 행 머리글의 열 목록을 생성합니다.
   */
  get columnsFactory(): (rows: GridRow[]) => GridColumn[] {
    return this._columnsFactory;
  }

  /**
   * 머리글을 표시하지 않는지 여부를 가져오거나 설정합니다.
   */
  get isCollapsed(): boolean {
    return this._isCollapsed;
  }

  set isCollapsed(value: boolean) {
    if (this._isCollapsed !== value) {
      const valuePrevious = this._isCollapsed;
      this._isCollapsed = value;
      this.notifyPropertyChanged(
        "isCollapsed",
        this._isCollapsed,
        valuePrevious,
      );
    }
  }

  /**
   * 셀 병합 목록을 가져오거나 설정합니다.
   */
  get merges(): readonly GridMerge[] | undefined {
    return this._merges;
  }

  set merges(value: readonly GridMerge[] | undefined) {
    const valuePrevious = this._merges;
    this._merges = value;
    this.notifyPropertyChanged("merges", this._merges, valuePrevious);
  }

  /**
   * 생성자
   * @param columnsFactory 행 머리글의 열 목록을 생성합니다.
   * @param columnWidth 행 머리글 열의 너비입니다.
   * @param isCollapsed 열 머리글을 표시하지 않는지 여부입니다.
   * @param merges 셀 병합 목록입니다.
   */
  constructor(
    columnsFactory?: (rows: GridRow[]) => GridColumn[],
    columnWidth = 100,
    isCollapsed = false,
    merges?: GridMerge[],
  ) {
    super();
    this._columnsFactory =
      columnsFactory ??
      (() => {
        return [new GridColumn("___ROWNUMBER", columnWidth)];
      });
    this._isCollapsed = isCollapsed;
    this._merges = merges;
  }
}
