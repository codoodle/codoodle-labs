import type {
  PropertyChangeEventArgs,
  PropertyChangesEventArgs,
} from "./EventArgs";
import { SupportEvent } from "./SupportEvent";

/**
 * 속성변경을 지원합니다.
 */
export class SupportPropertyChange extends SupportEvent {
  private _propertyChanges?: PropertyChangeEventArgs<
    this,
    string & keyof this
  >[];
  private _batchDepth?: number;

  /**
   * 속성 변경 이벤트를 배치 처리하기 시작합니다.
   */
  beginBatch(): void {
    this._batchDepth = (this._batchDepth ?? 0) + 1;
  }

  /**
   * 배치된 속성 변경 이벤트를 발생시키고 배치를 종료합니다.
   */
  endBatch(): void {
    if (this._batchDepth !== undefined) {
      this._batchDepth--;
      if (this._batchDepth <= 0) {
        this._batchDepth = undefined;
        this.emitPropertyChanges();
      }
    }
  }

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  protected notifyPropertyChanged<K extends string & keyof this>(
    propertyName: K,
    value: this[K],
    valuePrevious: this[K],
  ): void {
    const propertyChanged: PropertyChangeEventArgs<this, K> = {
      name: `${propertyName}Changed`,
      source: this,
      propertyName,
      value,
      valuePrevious,
    };
    if (this._batchDepth) {
      (this._propertyChanges ??= []).push(propertyChanged);
    } else {
      this.emit(propertyChanged);
    }
  }

  /**
   * 누적된 속성 변경 이벤트를 발생시킵니다.
   */
  protected emitPropertyChanges(): void {
    if (this._propertyChanges && this._propertyChanges.length > 0) {
      const propertyChanges: PropertyChangesEventArgs<
        this,
        string & keyof this
      > = {
        name: "propertyChanges",
        source: this,
        changes: this._propertyChanges,
      };
      this.emit(propertyChanges);
      this.clearPropertyChanges();
    }
  }

  /**
   * 객체의 변경된 속성에 대한 데이터를 모두 제거합니다.
   */
  protected clearPropertyChanges(): void {
    if (this._propertyChanges) {
      this._propertyChanges.length = 0;
      this._propertyChanges = undefined;
    }
  }
}
