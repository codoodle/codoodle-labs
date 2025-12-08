import { Grid } from "./zs/ui/grid/Grid";
import { GridColumn } from "./zs/ui/grid/GridColumn";
import { GridRow } from "./zs/ui/grid/GridRow";
import { Visibility } from "./zs/ui/Visibility";

const gridElement = document.createElement("div");
gridElement.style.width = "800px";
gridElement.style.height = "800px";
document.body.appendChild(gridElement);

const columns = [];
for (let i = 0; i < 1000; i++) {
  // columns.push(new GridColumn(i + '', 60));
  if (i === 1) {
    columns.push(
      new GridColumn(
        i + "",
        Math.max(60, Math.floor(Math.random() * 100)),
        Visibility.collapsed,
      ),
    );
  } else {
    columns.push(
      new GridColumn(i + "", Math.max(60, Math.floor(Math.random() * 100))),
    );
  }
}

const rows = [];
for (let i = 0; i < 1000; i++) {
  // rows.push(new GridRow({}, 60));
  if (i === 1) {
    rows.push(
      new GridRow(
        columns.reduce((o: { [index: string]: unknown }, column, j) => {
          o[column.dataField] = `${i}:${j}`;
          return o;
        }, {}),
        Math.max(60, Math.floor(Math.random() * 100)),
        Visibility.collapsed,
      ),
    );
  } else if (i === 2) {
    rows.push(
      new GridRow(
        columns.reduce((o: { [index: string]: unknown }, column, j) => {
          o[column.dataField] = `${i}:${j}`;
          return o;
        }, {}),
        Math.max(60, Math.floor(Math.random() * 100)),
        Visibility.collapsed,
      ),
    );
  } else {
    rows.push(
      new GridRow(
        columns.reduce((o: { [index: string]: unknown }, column, j) => {
          o[column.dataField] = `${i}:${j}`;
          return o;
        }, {}),
        Math.max(60, Math.floor(Math.random() * 100)),
      ),
    );
  }
}

const grid = new Grid(gridElement, {
  rows,
  rowsFrozen: 3,
  columns,
  columnsFrozen: 3,
});
grid.initialize();
grid.merges = [
  { rowIndex: 1, rowSpan: 2, columnIndex: 1, columnSpan: 2 },
  { rowIndex: 20, rowSpan: 3, columnIndex: 10, columnSpan: 3 },
  { rowIndex: 23, rowSpan: 3, columnIndex: 10, columnSpan: 3 },
  { rowIndex: 20, rowSpan: 3, columnIndex: 7, columnSpan: 3 },
  { rowIndex: 23, rowSpan: 3, columnIndex: 7, columnSpan: 3 },
];

(globalThis as any).grid = grid;
