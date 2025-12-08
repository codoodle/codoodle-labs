import { SupportEvent } from "./SupportEvent";

/**
 * 속성변경 이벤트 데이터입니다.
 */
interface PropertyChangeEventArgs {
  /**
   * 이벤트 이름입니다.
   */
  name: string;
  /**
   * 이벤트를 발생시킨 개체입니다.
   */
  source: unknown;
  /**
   * 변경된 속성 이름입니다.
   */
  propertyName: string;
  /**
   * 변경된 속성의 현재 값입니다.
   */
  value: unknown;
  /**
   * 변경된 속성의 이전 값입니다.
   */
  valuePrevious: unknown;
}

/**
 * 속성변경을 지원합니다.
 */
export class SupportPropertyChange extends SupportEvent {
  private _propertyChanges?: PropertyChangeEventArgs[];

  /**
   * 객체의 속성이 변경되었는지 여부를 가져옵니다.
   */
  get isPropertyChanged(): boolean {
    return this._propertyChanges ? this._propertyChanges.length > 0 : false;
  }

  /**
   * 객체의 변경된 속성에 대한 데이터 목록을 가져옵니다.
   */
  get propertyChanges(): readonly PropertyChangeEventArgs[] {
    return this._propertyChanges ?? [];
  }

  /**
   * 객체의 변경된 속성에 대한 데이터를 모두 제거합니다.
   */
  clearPropertyChanges(): void {
    if (this._propertyChanges) {
      this._propertyChanges.length = 0;
      this._propertyChanges = undefined;
    }
  }

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  notifyPropertyChanged(
    propertyName: string,
    value: unknown,
    valuePrevious: unknown,
  ): void {
    const propertyChanged = {
      name: `${propertyName}Changed`,
      source: this,
      propertyName,
      value,
      valuePrevious,
    } as PropertyChangeEventArgs;
    (this._propertyChanges ??= []).push(propertyChanged);
    this.emit(propertyChanged);
  }
}
