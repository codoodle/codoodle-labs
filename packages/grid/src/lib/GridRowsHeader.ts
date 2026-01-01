import { type EventArgs, type PropertyChangeEventArgs } from "./EventArgs";
import { GridColumn } from "./GridColumn";
import type { GridMerge } from "./GridMerge";
import { SupportPropertyChange } from "./SupportPropertyChange";

export interface GridRowsHeaderEventMap<
  TSource extends GridRowsHeader = GridRowsHeader,
> {
  /**
   * 머리글을 표시하지 않는지 여부 속성 변경 이벤트입니다.
   */
  isCollapsedChanged: PropertyChangeEventArgs<TSource, "isCollapsed">;

  /**
   * 셀 병합 목록 속성 변경 이벤트입니다.
   */
  mergesChanged: PropertyChangeEventArgs<TSource, "merges">;
}

/**
 * 그리드의 행 머리글입니다.
 */
export class GridRowsHeader extends SupportPropertyChange {
  protected _columnsFactory: () => GridColumn[];
  protected _isCollapsed: boolean;
  protected _merges: GridMerge[] | undefined;

  /**
   * 행 머리글의 열 목록을 생성합니다.
   */
  get columnsFactory(): () => GridColumn[] {
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
  get merges(): ReadonlyArray<GridMerge> | undefined {
    return this._merges;
  }

  set merges(value: GridMerge[] | undefined) {
    const valuePrevious = this._merges;
    this._merges = value;
    this.notifyPropertyChanged("merges", this._merges, valuePrevious);
  }

  /**
   * 생성자
   * @param columnsFactory 행 머리글의 열 목록을 생성합니다.
   * @param isCollapsed 행 머리글을 표시하지 않는지 여부입니다.
   * @param merges 셀 병합 목록입니다.
   */
  constructor(
    columnsFactory?: () => GridColumn[],
    isCollapsed = false,
    merges?: GridMerge[],
  ) {
    super();
    this._columnsFactory =
      columnsFactory ??
      (() => {
        return [new GridColumn(50)];
      });
    this._isCollapsed = isCollapsed;
    this._merges = merges;
  }

  on<K extends keyof GridRowsHeaderEventMap<this>>(
    name: K,
    handler: (this: this, args: GridRowsHeaderEventMap<this>[K]) => void,
  ): () => void;
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof GridRowsHeaderEventMap<this>>(
    name: K,
    handler: (this: this, args: GridRowsHeaderEventMap<this>[K]) => void,
  ): () => void;
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof GridRowsHeaderEventMap<this>>(
    name: K,
    handler?: (this: this, args: GridRowsHeaderEventMap<this>[K]) => void,
  ): void;
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }

  protected emit<K extends keyof GridRowsHeaderEventMap<this>>(
    args: GridRowsHeaderEventMap<this>[K],
  ): boolean;
  protected emit(args: EventArgs<string, this>): boolean {
    return super.emit(args);
  }

  /**
   * 머리글을 표시하지 않는지 여부 속성이 변경되었음을 알립니다.
   * @param propertyName 머리글을 표시하지 않는지 여부 속성 이름입니다.
   * @param value 머리글을 표시하지 않는지 여부 속성의 현재 값입니다.
   * @param valuePrevious 머리글을 표시하지 않는지 여부 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged(
    propertyName: "isCollapsed",
    value: boolean,
    valuePrevious: boolean,
  ): void;
  /**
   * 셀 병합 목록 속성이 변경되었음을 알립니다.
   * @param propertyName 셀 병합 목록 속성 이름입니다.
   * @param value 셀 병합 목록 속성의 현재 값입니다.
   * @param valuePrevious 셀 병합 목록 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged(
    propertyName: "merges",
    value: GridMerge[] | undefined,
    valuePrevious: GridMerge[] | undefined,
  ): void;
  protected notifyPropertyChanged<K extends string & keyof this>(
    propertyName: K,
    value: this[K],
    valuePrevious: this[K],
  ): void {
    super.notifyPropertyChanged(propertyName, value, valuePrevious);
  }
}
