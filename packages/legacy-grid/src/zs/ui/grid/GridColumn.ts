import { PropertyChangeEventArgs } from "../../EventArgs";
import { SupportPropertyChange } from "../../SupportPropertyChange";
import { Visibility } from "../Visibility";
import { GridRow } from "./GridRow";

interface GridColumnEventMap {
  /**
   * 너비 속성 변경 이벤트입니다.
   */
  widthChanged: PropertyChangeEventArgs<GridColumn, "width">;

  /**
   * 표시 상태 속성 변경 초기화 이벤트입니다.
   */
  visibilityChanged: PropertyChangeEventArgs<GridColumn, "visibility">;
}

export interface GridColumn {
  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof GridColumnEventMap>(
    name: K,
    handler: (this: GridColumn, args: GridColumnEventMap[K]) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof GridColumnEventMap>(
    name: K,
    handler: (this: GridColumn, args: GridColumnEventMap[K]) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof GridColumnEventMap>(
    name: K,
    handler?: (this: GridColumn, args: GridColumnEventMap[K]) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(
    args: PropertyChangeEventArgs<GridColumn, "width" | "visibility">,
  ): boolean;

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  notifyPropertyChanged<K extends ("width" | "visibility") & keyof GridColumn>(
    propertyName: K,
    value: GridColumn[K],
    valuePrevious: GridColumn[K],
  ): void;
}

/**
 * 그리드의 열입니다.
 */
export class GridColumn extends SupportPropertyChange {
  protected _index: number;
  protected _dataField: string;
  protected _left: number;
  protected _width: number;
  protected _visibility: Visibility;

  /**
   * 열에 표시할 데이터의 속성을 가져옵니다.
   */
  get dataField(): string {
    return this._dataField;
  }

  /**
   * 열의 왼쪽 좌표를 가져옵니다.
   */
  get left(): number {
    return this._left;
  }

  /**
   * 열의 오른쪽 좌표를 가져옵니다.
   */
  get right(): number {
    return this.left + this.width;
  }

  /**
   * 열의 너비를 가져오거나 설정합니다.
   */
  get width(): number {
    if (this._visibility === Visibility.collapsed) {
      return 0;
    }
    return this._width;
  }

  set width(value: number) {
    if (this._width !== value) {
      const valuePrevious = this._width;
      this._width = value;
      this.notifyPropertyChanged("width", this._width, valuePrevious);
    }
  }

  /**
   * 열의 표시 상태를 가져오거나 설정합니다.
   */
  get visibility(): Visibility {
    return this._visibility;
  }

  set visibility(value: Visibility) {
    if (this._visibility !== value) {
      const valuePrevious = this._visibility;
      this._visibility = value;
      this.notifyPropertyChanged("visibility", this._visibility, valuePrevious);
    }
  }

  /**
   * 생성자
   * @param dataField 열에 표시할 데이터의 속성입니다.
   * @param width 열의 너비입니다.
   * @param visibility 열의 표시 상태입니다.
   */
  constructor(
    dataField: string,
    width: number,
    visibility = Visibility.visible,
  ) {
    super();
    this._index = -1;
    this._dataField = dataField;
    this._left = 0;
    this._width = width;
    this._visibility = visibility;
  }

  /**
   * 셀이 생성된 후 필요한 작업을 처리합니다.
   * @param row 그리드 행입니다.
   * @param element 셀의 내용을 표시하는 HTML 요소입니다.
   */
  cellCreated(row: GridRow, element: HTMLDivElement): void {
    element.textContent = row.data ? (row.data[this._dataField] as string) : "";
  }

  /**
   * 셀이 제거된 후 필요한 작업을 처리합니다.
   * @param {import('./GridRow').GridRow} row 그리드 행입니다.
   * @param {HTMLDivElement} element 셀의 내용을 표시하는 HTML 요소입니다.
   */

  cellDisposed(row: GridRow, element: HTMLDivElement): void {}
}
