import { PropertyChangeEventArgs } from "../../EventArgs";
import { SupportPropertyChange } from "../../SupportPropertyChange";
import { Visibility } from "../Visibility";

interface GridRowEventMap {
  /**
   * 높이 속성 변경 이벤트입니다.
   */
  heightChanged: PropertyChangeEventArgs<GridRow, "height">;

  /**
   * 표시 상태 속성 변경 초기화 이벤트입니다.
   */
  visibilityChanged: PropertyChangeEventArgs<GridRow, "visibility">;
}

export interface GridRow {
  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof GridRowEventMap>(
    name: K,
    handler: (this: GridRow, args: GridRowEventMap[K]) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof GridRowEventMap>(
    name: K,
    handler: (this: GridRow, args: GridRowEventMap[K]) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof GridRowEventMap>(
    name: K,
    handler?: (this: GridRow, args: GridRowEventMap[K]) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(
    args: PropertyChangeEventArgs<GridRow, "height" | "visibility">,
  ): boolean;

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  notifyPropertyChanged<K extends ("height" | "visibility") & keyof GridRow>(
    propertyName: K,
    value: GridRow[K],
    valuePrevious: GridRow[K],
  ): void;
}

/**
 * 그리드의 행입니다.
 */
export class GridRow extends SupportPropertyChange {
  protected _index: number;
  protected _data: { [index: string]: unknown };
  protected _top: number;
  protected _height: number;
  protected _visibility: Visibility;

  /**
   * 행에 표시할 데이터를 가져옵니다.
   */
  get data(): { [index: string]: unknown } {
    return this._data;
  }

  /**
   * 행의 위쪽 좌표를 가져옵니다.
   */
  get top(): number {
    return this._top;
  }

  /**
   * 행의 아래쪽 좌표를 가져옵니다.
   */
  get bottom(): number {
    return this.top + this.height;
  }

  /**
   * 행의 높이를 가져오거나 설정합니다.
   */
  get height(): number {
    if (this._visibility === Visibility.collapsed) {
      return 0;
    }
    return this._height;
  }

  set height(value: number) {
    if (this._height !== value) {
      const valuePrevious = this._height;
      this._height = value;
      this.notifyPropertyChanged("height", this._height, valuePrevious);
    }
  }

  /**
   * 행의 표시 상태를 가져오거나 설정합니다.
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
   * @param data 행에 표시할 데이터입니다.
   * @param height 행의 높이입니다.
   * @param visibility 행의 표시 상태입니다.
   */
  constructor(
    data: { [index: string]: unknown },
    height: number,
    visibility = Visibility.visible,
  ) {
    super();
    this._index = -1;
    this._data = data;
    this._top = 0;
    this._height = height;
    this._visibility = visibility;
  }
}
