# @codoodle/table

데이터 기반 테이블 라이브러리. `@codoodle/grid`를 기반으로 Excel 스타일의 셀 편집 기능을 제공합니다.

## 특징

- **Composition 패턴**: Grid를 포함하여 데이터 레이어를 분리
- **Excel 스타일 편집**: 더블클릭, F2, 직접 타이핑 지원
- **데이터 바인딩**: 배열 데이터를 테이블에 자동 바인딩
- **타입 안전**: TypeScript 완전 지원

## 설치

```bash
pnpm add @codoodle/table
```

## 기본 사용법

```typescript
import { Table, ArrayDataSource } from "@codoodle/table";

// 데이터 준비
const data = [
  { name: "Alice", age: 30, city: "Seoul" },
  { name: "Bob", age: 25, city: "Busan" },
  { name: "Charlie", age: 35, city: "Incheon" },
];

// 데이터 소스 생성
const dataSource = new ArrayDataSource(data);

// 테이블 생성
const container = document.getElementById("table-container") as HTMLDivElement;
const table = new Table(container, {
  dataSource,
  defaultRowHeight: 28,
  defaultColumnWidth: 120,
});

// 셀 변경 이벤트 리스닝
container.addEventListener("cellchange", (e: CustomEvent) => {
  const { row, column, value } = e.detail;
  console.log(`Cell [${row}, ${column}] changed to: ${value}`);
});
```

## 편집 기능

### 셀 편집 시작

- **더블클릭**: 셀을 더블클릭하여 편집 시작 (커서 위치 유지)
- **F2 키**: 선택한 셀에서 F2를 눌러 편집 시작 (커서 끝으로 이동)
- **직접 타이핑**: 셀을 선택하고 바로 타이핑 (기존 내용 교체)
- **Enter 키**: 선택한 셀에서 Enter를 눌러 편집 시작 (기존 내용 교체)

### 편집 완료

- **Enter**: 저장하고 아래 셀로 이동
- **Tab**: 저장하고 오른쪽 셀로 이동
- **Shift+Tab**: 저장하고 왼쪽 셀로 이동
- **Esc**: 취소하고 원래 값으로 복원

## API

### Table

```typescript
class Table<T = any> {
  constructor(element: HTMLDivElement, options: TableOptions<T>);
  getGrid(): Grid;
  getDataSource(): TableDataSource<T>;
  refresh(): void;
  updateCell(row: number, column: number, value: any): void;
  dispose(): void;
}
```

### TableDataSource

```typescript
interface TableDataSource<T = any> {
  getData(): T[];
  setData(data: T[]): void;
  getRowCount(): number;
  getColumnCount(): number;
  getValue(row: number, column: number): any;
  setValue(row: number, column: number, value: any): void;
  getRow(row: number): T | undefined;
  getColumnKey(column: number): string;
}
```

### ArrayDataSource

```typescript
class ArrayDataSource<T extends Record<string, any> = Record<string, any>>
  implements TableDataSource<T> {
  constructor(data: T[], columnKeys?: string[]);
  getColumnKeys(): string[];
  setColumnKeys(keys: string[]): void;
}
```

## 커스텀 셀 편집기

기본 `DefaultCellEditor` 대신 커스텀 편집기를 사용할 수 있습니다:

```typescript
import { CellEditor, CellEditMode } from "@codoodle/table";

class CustomCellEditor implements CellEditor {
  start(cell: HTMLElement, value: any, mode: CellEditMode): void {
    // 커스텀 편집 UI 구현
  }

  save(): any {
    // 값 반환
  }

  cancel(): void {
    // 편집 취소
  }

  isEditing(): boolean {
    return false;
  }
}

const table = new Table(container, {
  dataSource,
  cellEditor: new CustomCellEditor(),
});
```

## 읽기 전용 모드

```typescript
const table = new Table(container, {
  dataSource,
  readonly: true, // 편집 비활성화
});
```

## 이벤트

### cellchange

셀 값이 변경되었을 때 발생합니다.

```typescript
container.addEventListener("cellchange", (e: CustomEvent) => {
  const { row, column, value } = e.detail;
  console.log(`Cell changed: [${row}, ${column}] = ${value}`);
});
```

## 라이선스

MIT
