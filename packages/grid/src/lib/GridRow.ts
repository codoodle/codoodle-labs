import { type EventArgs, type PropertyChangeEventArgs } from "./EventArgs";
import { SupportPropertyChange } from "./SupportPropertyChange";
import { Visibility } from "./Visibility";

export interface GridRowEventMap<TSource extends GridRow = GridRow> {
  /**
   * 행의 높이 속성 변경 이벤트입니다.
   */
  heightChanged: PropertyChangeEventArgs<TSource, "height">;

  /**
   * 행의 표시 상태 속성 변경 이벤트입니다.
   */
  visibilityChanged: PropertyChangeEventArgs<TSource, "visibility">;
}

/**
 * 그리드의 행입니다.
 */
export class GridRow extends SupportPropertyChange {
  protected _index: number;
  protected _top: number;
  protected _height: number;
  protected _visibility: Visibility;

  /**
   * 행의 인덱스를 가져옵니다.
   */
  get index(): number {
    return this._index;
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
    if (this._visibility === Visibility.Collapsed) {
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
   * @param height 행의 높이입니다.
   * @param visibility 행의 표시 상태입니다.
   */
  constructor(height: number, visibility = Visibility.Visible) {
    super();
    this._index = -1;
    this._top = 0;
    this._height = height;
    this._visibility = visibility;
  }

  on<K extends keyof GridRowEventMap<this>>(
    name: K,
    handler: (this: this, args: GridRowEventMap<this>[K]) => void,
  ): () => void;
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof GridRowEventMap<this>>(
    name: K,
    handler: (this: this, args: GridRowEventMap<this>[K]) => void,
  ): () => void;
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof GridRowEventMap<this>>(
    name: K,
    handler?: (this: this, args: GridRowEventMap<this>[K]) => void,
  ): void;
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }

  protected emit<K extends keyof GridRowEventMap<this>>(
    args: GridRowEventMap<this>[K],
  ): boolean;
  protected emit(args: EventArgs<string, this>): boolean {
    return super.emit(args);
  }

  protected notifyPropertyChanged(
    propertyName: "height",
    value: number,
    valuePrevious: number,
  ): void;
  /**
   * 행의 표시 상태 속성이 변경되었음을 알립니다.
   * @param propertyName 행의 표시 상태 속성 이름입니다.
   * @param value 행의 표시 상태 속성의 현재 값입니다.
   * @param valuePrevious 행의 표시 상태 속성의 이전 값입니다.
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
