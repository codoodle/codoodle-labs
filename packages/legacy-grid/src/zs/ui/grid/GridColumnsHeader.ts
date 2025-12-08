import { PropertyChangeEventArgs } from "../../EventArgs";
import { SupportPropertyChange } from "../../SupportPropertyChange";
import { GridColumn } from "./GridColumn";
import { GridMerge } from "./GridMerge";
import { GridRow } from "./GridRow";

interface GridColumnsHeaderEventMap {
  /**
   * 머리글을 표시하지 않는지 여부 속성 변경 이벤트입니다.
   */
  isCollapsedChanged: PropertyChangeEventArgs<GridColumnsHeader, "isCollapsed">;

  /**
   * 셀 병합 목록 속성 변경 초기화 이벤트입니다.
   */
  mergesChanged: PropertyChangeEventArgs<GridColumnsHeader, "merges">;
}

export interface GridColumnsHeader {
  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof GridColumnsHeaderEventMap>(
    name: K,
    handler: (
      this: GridColumnsHeader,
      args: GridColumnsHeaderEventMap[K],
    ) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof GridColumnsHeaderEventMap>(
    name: K,
    handler: (
      this: GridColumnsHeader,
      args: GridColumnsHeaderEventMap[K],
    ) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof GridColumnsHeaderEventMap>(
    name: K,
    handler?: (
      this: GridColumnsHeader,
      args: GridColumnsHeaderEventMap[K],
    ) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(
    args: PropertyChangeEventArgs<GridColumnsHeader, "isCollapsed" | "merges">,
  ): boolean;

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  notifyPropertyChanged<
    K extends ("isCollapsed" | "merges") & keyof GridColumnsHeader,
  >(
    propertyName: K,
    value: GridColumnsHeader[K],
    valuePrevious: GridColumnsHeader[K],
  ): void;
}

/**
 * 그리드의 열 머리글입니다.
 */
export class GridColumnsHeader extends SupportPropertyChange {
  protected _rowsFactory: (columns: GridColumn[]) => GridRow[];
  protected _isCollapsed: boolean;
  protected _merges: GridMerge[] | undefined;

  /**
   * 열 머리글의 행 목록을 생성합니다.
   */
  get rowsFactory(): (columns: GridColumn[]) => GridRow[] {
    return this._rowsFactory;
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
  get merges(): GridMerge[] | undefined {
    return this._merges;
  }

  set merges(value: GridMerge[] | undefined) {
    const valuePrevious = this._merges;
    this._merges = value;
    this.notifyPropertyChanged("merges", this._merges, valuePrevious);
  }

  /**
   * 생성자
   * @param rowsFactory 열 머리글의 행 목록을 생성합니다.
   * @param rowHeight 열 머리글 행의 높이입니다.
   * @param isCollapsed 열 머리글을 표시하지 않는지 여부입니다.
   * @param merges 셀 병합 목록입니다.
   */
  constructor(
    rowsFactory?: (columns: GridColumn[]) => GridRow[],
    rowHeight = 30,
    isCollapsed = false,
    merges?: GridMerge[],
  ) {
    super();
    this._rowsFactory =
      rowsFactory ??
      ((columns) => {
        let index = 0;
        const item = {} as { [index: string]: unknown };
        for (const column of columns) {
          item[column.dataField] = ++index;
        }
        return [new GridRow(item, rowHeight)];
      });
    this._isCollapsed = isCollapsed;
    this._merges = merges;
  }
}
