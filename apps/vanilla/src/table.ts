import "@codoodle/grid/dist/index.css";
import "./main.css";

import { ArrayDataSource, Table } from "@codoodle/table";

const host = document.getElementById("table-root") as HTMLDivElement | null;
if (!host) {
  throw new Error("#table-root not found");
}

// 샘플 데이터 생성
const rows = 20;
const columns = ["A", "B", "C", "D", "E"] as const;
const data = Array.from({ length: rows }, (_, r) => {
  const row: Record<string, string | number> = {};
  for (let c = 0; c < columns.length; c++) {
    const key = columns[c];
    row[key] = `${key}${r + 1}`;
  }
  return row;
});

// 데이터 소스 및 테이블 생성
const dataSource = new ArrayDataSource(data, columns as unknown as string[]);
const table = new Table(host, {
  dataSource,
  defaultRowHeight: 28,
  defaultColumnWidth: 100,
});

// 변경 이벤트 로그
host.addEventListener("cellchange", (e: Event) => {
  const { row, column, value } = (e as CustomEvent).detail ?? {};
  console.log(`cellchange: [${row}, ${column}] =`, value);
});
