import { type EventArgs, type PropertyChangeEventArgs } from "./EventArgs";
import { SupportPropertyChange } from "./SupportPropertyChange";
import { Visibility } from "./Visibility";

export interface GridColumnEventMap<TSource extends GridColumn = GridColumn> {
  /**
   * 열의 너비 속성 변경 이벤트입니다.
   */
  widthChanged: PropertyChangeEventArgs<TSource, "width">;

  /**
   * 열의 표시 상태 속성 변경 이벤트입니다.
   */
  visibilityChanged: PropertyChangeEventArgs<TSource, "visibility">;
}

/**
 * 그리드의 열입니다.
 */
export class GridColumn extends SupportPropertyChange {
  protected _index: number;
  protected _left: number;
  protected _width: number;
  protected _visibility: Visibility;

  /**
   * 열의 인덱스를 가져옵니다.
   */
  get index(): number {
    return this._index;
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
    if (this._visibility === Visibility.Collapsed) {
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
   * @param width 열의 너비입니다.
   * @param visibility 열의 표시 상태입니다.
   */
  constructor(width: number, visibility = Visibility.Visible) {
    super();
    this._index = -1;
    this._left = 0;
    this._width = width;
    this._visibility = visibility;
  }

  on<K extends keyof GridColumnEventMap<this>>(
    name: K,
    handler: (this: this, args: GridColumnEventMap<this>[K]) => void,
  ): () => void;
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof GridColumnEventMap<this>>(
    name: K,
    handler: (this: this, args: GridColumnEventMap<this>[K]) => void,
  ): () => void;
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof GridColumnEventMap<this>>(
    name: K,
    handler?: (this: this, args: GridColumnEventMap<this>[K]) => void,
  ): void;
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }

  protected emit<K extends keyof GridColumnEventMap<this>>(
    args: GridColumnEventMap<this>[K],
  ): boolean;
  protected emit(args: EventArgs<string, this>): boolean {
    return super.emit(args);
  }

  /**
   * 열의 너비 속성이 변경되었음을 알립니다.
   * @param propertyName 열의 너비 속성 이름입니다.
   * @param value 열의 너비 속성의 현재 값입니다.
   * @param valuePrevious 열의 너비 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged(
    propertyName: "width",
    value: number,
    valuePrevious: number,
  ): void;
  /**
   * 열의 표시 상태 속성이 변경되었음을 알립니다.
   * @param propertyName 열의 표시 상태 속성 이름입니다.
   * @param value 열의 표시 상태 속성의 현재 값입니다.
   * @param valuePrevious 열의 표시 상태 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged(
    propertyName: "visibility",
    value: Visibility,
    valuePrevious: Visibility,
  ): void;
  protected notifyPropertyChanged<K extends string & keyof this>(
    propertyName: K,
    value: this[K],
    valuePrevious: this[K],
  ): void {
    super.notifyPropertyChanged(propertyName, value, valuePrevious);
  }
}
