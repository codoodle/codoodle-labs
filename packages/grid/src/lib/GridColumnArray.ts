import type { EventArgs, PropertyChangeEventArgs } from "./EventArgs";
import type { GridColumn, GridColumnEventMap } from "./GridColumn";
import { SupportEvent } from "./SupportEvent";

export class GridColumnArray extends SupportEvent {
  private _columns: GridColumn[];
  private _columnCount: number;
  private _factory: (index: number) => GridColumn;
  private _cache: Map<number, GridColumn>;
  private _cacheLimit: number;
  private _cumulativeWidths: number[];
  private _cumulativeWidthsLastIndex: number;
  private _cumulativeWidthsLeft: number;
  private _isVirtual: boolean;
  private _propertyChangedHandler: (
    e: PropertyChangeEventArgs<GridColumn, "width" | "visibility">,
  ) => void;

  get length(): number {
    return this._columnCount;
  }

  constructor(items: GridColumn[]);
  constructor(
    count: number,
    factory: (index: number) => GridColumn,
    cacheLimit: number,
  );
  constructor(
    columns: GridColumn[] | number,
    factory?: (index: number) => GridColumn,
    cacheLimit?: number,
  ) {
    super();
    this._propertyChangedHandler = (args) => {
      this.cumulateWidth();
      this.emit(args as unknown as EventArgs<string, this>);
    };
    if (Array.isArray(columns)) {
      this._columns = [...columns];
      this._columnCount = columns.length;
      this._factory = () => {
        throw new Error("Factory not available when initialized with items.");
      };
      this._cache = new Map();
      this._cacheLimit = 0;
      this._cumulativeWidths = [];
      this._cumulativeWidthsLastIndex = -1;
      this._cumulativeWidthsLeft = 0;
      this._isVirtual = false;
      let width = 0;
      let index = 0;
      for (const column of columns) {
        column.on("widthChanged", this._propertyChangedHandler);
        column.on("visibilityChanged", this._propertyChangedHandler);
        // @ts-expect-error protected 속성 설정
        column._index = index++;
        // @ts-expect-error protected 속성 설정
        column._left = width;
        width += column.width;
      }
    } else {
      this._columns = [];
      this._columnCount = columns;
      this._factory = factory!;
      this._cache = new Map();
      this._cacheLimit = cacheLimit!;
      this._cumulativeWidths = [];
      this._cumulativeWidthsLastIndex = -1;
      this._cumulativeWidthsLeft = 0;
      this._isVirtual = true;
    }
  }

  private cumulateWidth(): void {
    if (!this._isVirtual) {
      let width = 0;
      for (const column of this._columns) {
        // @ts-expect-error protected 속성 설정
        column._left = width;
        width += column.width;
      }
    } else {
      this._cumulativeWidths.length = 0;
      this._cumulativeWidthsLastIndex = -1;
      this._cumulativeWidthsLeft = 0;
      for (const column of this._cache.values()) {
        // @ts-expect-error protected 속성 설정
        column._left = this.left(column.index);
      }
    }
  }

  private getColumn(index: number): GridColumn {
    if (!this._isVirtual) {
      return this._columns[index];
    }
    if (!this._cache.has(index)) {
      if (this._cache.size >= this._cacheLimit) {
        const firstKey = this._cache.keys().next().value;
        if (firstKey !== undefined) {
          this._cache.delete(firstKey);
        }
      }
      const column = this._factory(index);
      column.on("widthChanged", this._propertyChangedHandler);
      column.on("visibilityChanged", this._propertyChangedHandler);
      // @ts-expect-error protected 속성 설정
      column._index = index;
      // @ts-expect-error protected 속성 설정
      column._left = this.left(index);
      this._cache.set(index, column);
    }
    return this._cache.get(index)!;
  }

  at(index: number): GridColumn {
    const normalizedIndex = index < 0 ? this._columnCount + index : index;
    if (normalizedIndex < 0 || normalizedIndex >= this._columnCount) {
      throw new RangeError(`Index ${index} out of range for GridColumnArray`);
    }
    return this.getColumn(normalizedIndex);
  }

  left(index: number): number {
    if (index === 0) {
      return 0;
    }
    if (!this._isVirtual) {
      return this._columns[index].left;
    }
    if (this._cumulativeWidths[index] !== undefined) {
      return this._cumulativeWidths[index];
    }

    let left = this._cumulativeWidthsLeft;
    let startIndex = Math.max(0, this._cumulativeWidthsLastIndex);
    if (this._cumulativeWidthsLastIndex < 0) {
      left = 0;
      startIndex = 0;
    }

    for (let i = startIndex; i < index; i++) {
      const column = this._cache.has(i)
        ? this._cache.get(i)!
        : this._factory(i);
      this._cumulativeWidths[i] = left;
      left += column.width;
    }

    this._cumulativeWidths[index] = left;
    this._cumulativeWidthsLastIndex = index;
    this._cumulativeWidthsLeft = left;
    return left;
  }

  right(index: number): number {
    return this.left(index) + this.at(index).width;
  }

  widths(): number {
    if (this._columnCount === 0) {
      return 0;
    }
    return this.right(this._columnCount - 1);
  }

  cleanup(visibleStart: number, visibleEnd: number, buffer = 50): void {
    if (!this._isVirtual) {
      return;
    }
    if (this._cache.size <= this._cacheLimit) {
      return;
    }

    const toDelete: number[] = [];
    for (const [index] of this._cache) {
      if (index < visibleStart - buffer || index > visibleEnd + buffer) {
        toDelete.push(index);
      }
    }

    for (const index of toDelete) {
      const column = this._cache.get(index);
      if (column) {
        column.dispose();
        this._cache.delete(index);
      }
    }
  }

  clear(): void {
    if (!this._isVirtual) {
      return;
    }
    for (const column of this._cache.values()) {
      column.dispose();
    }
    this._cache.clear();
  }

  dispose(): void {
    if (this._columns) {
      for (const item of this._columns) {
        item.dispose();
      }
      this._columns.length = 0;
    }
    this.clear();
    this._cumulativeWidths.length = 0;
    this._cumulativeWidthsLastIndex = -1;
    this._cumulativeWidthsLeft = 0;
    this._isVirtual = false;
    super.dispose();
  }

  on<K extends keyof GridColumnEventMap<GridColumn>>(
    name: K,
    handler: (this: this, args: GridColumnEventMap<GridColumn>[K]) => void,
  ): () => void;
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof GridColumnEventMap<GridColumn>>(
    name: K,
    handler: (this: this, args: GridColumnEventMap<GridColumn>[K]) => void,
  ): () => void;
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof GridColumnEventMap<GridColumn>>(
    name: K,
    handler?: (this: this, args: GridColumnEventMap<GridColumn>[K]) => void,
  ): void;
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }
}
