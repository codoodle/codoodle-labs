/**
 * 테이블 데이터 소스 인터페이스
 */
export interface TableDataSource<T = any> {
  /**
   * 전체 데이터 배열을 가져옵니다.
   */
  getData(): T[];

  /**
   * 전체 데이터 배열을 설정합니다.
   */
  setData(data: T[]): void;

  /**
   * 행의 개수를 가져옵니다.
   */
  getRowCount(): number;

  /**
   * 열의 개수를 가져옵니다.
   */
  getColumnCount(): number;

  /**
   * 특정 셀의 값을 가져옵니다.
   * @param row 행 인덱스
   * @param column 열 인덱스
   */
  getValue(row: number, column: number): any;

  /**
   * 특정 셀의 값을 설정합니다.
   * @param row 행 인덱스
   * @param column 열 인덱스
   * @param value 설정할 값
   */
  setValue(row: number, column: number, value: any): void;

  /**
   * 특정 행의 데이터를 가져옵니다.
   * @param row 행 인덱스
   */
  getRow(row: number): T | undefined;

  /**
   * 특정 열의 키/필드명을 가져옵니다.
   * @param column 열 인덱스
   */
  getColumnKey(column: number): string;
}

/**
 * 배열 기반 기본 데이터 소스 구현
 */
export class ArrayDataSource<
  T extends Record<string, any> = Record<string, any>,
> implements TableDataSource<T> {
  private data: T[];
  private columnKeys: string[];

  constructor(data: T[], columnKeys?: string[]) {
    this.data = data;
    this.columnKeys = columnKeys ?? this.inferColumnKeys(data);
  }

  private inferColumnKeys(data: T[]): string[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }

  getData(): T[] {
    return this.data;
  }

  setData(data: T[]): void {
    this.data = data;
    if (this.columnKeys.length === 0) {
      this.columnKeys = this.inferColumnKeys(data);
    }
  }

  getRowCount(): number {
    return this.data.length;
  }

  getColumnCount(): number {
    return this.columnKeys.length;
  }

  getValue(row: number, column: number): any {
    const rowData = this.data[row];
    if (!rowData) return undefined;
    const key = this.columnKeys[column];
    return rowData[key];
  }

  setValue(row: number, column: number, value: any): void {
    const rowData = this.data[row];
    if (!rowData) return;
    const key = this.columnKeys[column];
    (rowData as any)[key] = value;
  }

  getRow(row: number): T | undefined {
    return this.data[row];
  }

  getColumnKey(column: number): string {
    return this.columnKeys[column];
  }

  /**
   * 열 키 목록을 가져옵니다.
   */
  getColumnKeys(): string[] {
    return this.columnKeys;
  }

  /**
   * 열 키 목록을 설정합니다.
   */
  setColumnKeys(keys: string[]): void {
    this.columnKeys = keys;
  }
}
