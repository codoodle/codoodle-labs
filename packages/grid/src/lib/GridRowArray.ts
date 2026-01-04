import type { EventArgs, PropertyChangeEventArgs } from "./EventArgs";
import type { GridRow, GridRowEventMap } from "./GridRow";
import { SupportEvent } from "./SupportEvent";

export class GridRowArray extends SupportEvent {
  private _rows: GridRow[];
  private _rowCount: number;
  private _factory: (index: number) => GridRow;
  private _cache: Map<number, GridRow>;
  private _cacheLimit: number;
  private _cumulativeHeights: number[];
  private _cumulativeHeightsLastIndex: number;
  private _cumulativeHeightsTop: number;
  private _isVirtual: boolean;
  private _propertyChangedHandler: (
    e: PropertyChangeEventArgs<GridRow, "height" | "visibility">,
  ) => void;

  get length(): number {
    return this._rowCount;
  }

  constructor(items: GridRow[]);
  constructor(
    count: number,
    factory: (index: number) => GridRow,
    cacheLimit: number,
  );
  constructor(
    rows: GridRow[] | number,
    factory?: (index: number) => GridRow,
    cacheLimit?: number,
  ) {
    super();
    this._propertyChangedHandler = (args) => {
      this.cumulateHeight();
      this.emit(args as unknown as EventArgs<string, this>);
    };
    if (Array.isArray(rows)) {
      this._rows = [...rows];
      this._rowCount = rows.length;
      this._factory = () => {
        throw new Error("Factory not available when initialized with items.");
      };
      this._cache = new Map();
      this._cacheLimit = 0;
      this._cumulativeHeights = [];
      this._cumulativeHeightsLastIndex = -1;
      this._cumulativeHeightsTop = 0;
      this._isVirtual = false;
      let height = 0;
      let index = 0;
      for (const row of rows) {
        row.on("heightChanged", this._propertyChangedHandler);
        row.on("visibilityChanged", this._propertyChangedHandler);
        // @ts-expect-error protected 속성 설정
        row._index = index++;
        // @ts-expect-error protected 속성 설정
        row._top = height;
        height += row.height;
      }
    } else {
      this._rows = [];
      this._rowCount = rows;
      this._factory = factory!;
      this._cache = new Map();
      this._cacheLimit = cacheLimit!;
      this._cumulativeHeights = [];
      this._cumulativeHeightsLastIndex = -1;
      this._cumulativeHeightsTop = 0;
      this._isVirtual = true;
    }
  }

  private cumulateHeight(): void {
    if (!this._isVirtual) {
      let height = 0;
      for (const row of this._rows) {
        // @ts-expect-error protected 속성 설정
        row._top = height;
        height += row.height;
      }
    } else {
      this._cumulativeHeights.length = 0;
      this._cumulativeHeightsLastIndex = -1;
      this._cumulativeHeightsTop = 0;
      for (const row of this._cache.values()) {
        // @ts-expect-error protected 속성 설정
        row._top = this.top(row.index);
      }
    }
  }

  private getRow(index: number): GridRow {
    if (!this._isVirtual) {
      return this._rows[index];
    }
    if (!this._cache.has(index)) {
      if (this._cache.size >= this._cacheLimit) {
        const firstKey = this._cache.keys().next().value;
        if (firstKey !== undefined) {
          this._cache.delete(firstKey);
        }
      }
      const row = this._factory(index);
      row.on("heightChanged", this._propertyChangedHandler);
      row.on("visibilityChanged", this._propertyChangedHandler);
      // @ts-expect-error protected 속성 설정
      row._index = index;
      // @ts-expect-error protected 속성 설정
      row._top = this.top(index);
      this._cache.set(index, row);
    }
    return this._cache.get(index)!;
  }

  at(index: number): GridRow {
    const normalizedIndex = index < 0 ? this._rowCount + index : index;
    if (normalizedIndex < 0 || normalizedIndex >= this._rowCount) {
      throw new RangeError(`Index ${index} out of range for GridRowArray`);
    }
    return this.getRow(normalizedIndex);
  }

  top(index: number): number {
    if (index === 0) {
      return 0;
    }
    if (!this._isVirtual) {
      return this._rows[index].top;
    }
    if (this._cumulativeHeights[index] !== undefined) {
      return this._cumulativeHeights[index];
    }

    let top = this._cumulativeHeightsTop;
    let startIndex = Math.max(0, this._cumulativeHeightsLastIndex);
    if (this._cumulativeHeightsLastIndex < 0) {
      top = 0;
      startIndex = 0;
    }

    for (let i = startIndex; i < index; i++) {
      const row = this._cache.has(i) ? this._cache.get(i)! : this._factory(i);
      this._cumulativeHeights[i] = top;
      top += row.height;
    }

    this._cumulativeHeights[index] = top;
    this._cumulativeHeightsLastIndex = index;
    this._cumulativeHeightsTop = top;
    return top;
  }

  bottom(index: number): number {
    return this.top(index) + this.at(index).height;
  }

  heights(): number {
    if (this._rowCount === 0) {
      return 0;
    }
    return this.bottom(this._rowCount - 1);
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
      const row = this._cache.get(index);
      if (row) {
        row.dispose();
        this._cache.delete(index);
      }
    }
  }

  clear(): void {
    if (!this._isVirtual) {
      return;
    }
    for (const row of this._cache.values()) {
      row.dispose();
    }
    this._cache.clear();
  }

  dispose(): void {
    if (this._rows) {
      for (const item of this._rows) {
        item.dispose();
      }
      this._rows.length = 0;
    }
    this.clear();
    this._cumulativeHeights.length = 0;
    this._cumulativeHeightsLastIndex = -1;
    this._cumulativeHeightsTop = 0;
    this._isVirtual = false;
    super.dispose();
  }

  on<K extends keyof GridRowEventMap<GridRow>>(
    name: K,
    handler: (this: this, args: GridRowEventMap<GridRow>[K]) => void,
  ): () => void;
  on(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.on(name, handler);
  }

  once<K extends keyof GridRowEventMap<GridRow>>(
    name: K,
    handler: (this: this, args: GridRowEventMap<GridRow>[K]) => void,
  ): () => void;
  once(
    name: string,
    handler: (this: this, args: EventArgs<string, unknown>) => void,
  ): () => void {
    return super.once(name, handler);
  }

  off<K extends keyof GridRowEventMap<GridRow>>(
    name: K,
    handler?: (this: this, args: GridRowEventMap<GridRow>[K]) => void,
  ): void;
  off(
    name: string,
    handler?: (this: this, args: EventArgs<string, unknown>) => void,
  ): void {
    super.off(name, handler);
  }
}
