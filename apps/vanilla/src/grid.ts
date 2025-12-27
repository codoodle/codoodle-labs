import {
  Grid,
  GridCell,
  type GridCellFactory,
  GridColumn,
  GridColumnsHeader,
  GridPart,
  GridRow,
  GridRowsHeader,
  GridSelectionMode,
  GridSelectionUnit,
} from "@codoodle/grid";
import "@codoodle/grid/dist/index.css";
import "./main.css";

const ROWS = 1_000_000;
const COLS = 1_000_000;

class CustomGridCell extends GridCell {
  constructor(
    element: HTMLDivElement,
    part: GridPart,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number,
  ) {
    super(element, part, rowIndex, columnIndex, rowSpan, columnSpan);
    if (part.isRowHeader) {
      this.element.textContent = String(rowIndex + 1);
    } else if (part.isColumnHeader) {
      this.element.textContent = String(columnIndex + 1);
    } else {
      this.element.textContent = `${rowIndex + 1}
${columnIndex + 1}`;
    }
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.justifyContent = "center";
    this.element.style.whiteSpace = "pre-line";
  }

  set isSelected(value: boolean) {
    super.isSelected = value;
    if (value) {
      this.element.style.backgroundColor = "#3399ff";
      this.element.style.color = "white";
    } else {
      this.element.style.backgroundColor = "";
      this.element.style.color = "";
    }
  }
}

class CustomGridCellFactory implements GridCellFactory {
  createCell(
    element: HTMLDivElement,
    part: GridPart,
    rowIndex: number,
    columnIndex: number,
    rowSpan: number,
    columnSpan: number,
  ): GridCell | undefined {
    return new CustomGridCell(
      element,
      part,
      rowIndex,
      columnIndex,
      rowSpan,
      columnSpan,
    );
  }
}

const rows: GridRow[] = Array.from(
  {
    length: ROWS,
  },
  () => new GridRow(100),
);
const columns: GridColumn[] = Array.from(
  {
    length: COLS,
  },
  () => new GridColumn(100),
);

const host = document.getElementById("grid-root") as HTMLDivElement | null;
if (!host) {
  throw new Error("#grid-root not found");
}

const grid = new Grid(host, {
  rows,
  columns,
  rowsFrozen: 2,
  columnsFrozen: 2,
  rowsHeader: new GridRowsHeader(
    () => [new GridColumn(60), new GridColumn(60)],
    false,
    [
      { rowIndex: 0, rowSpan: 1, columnIndex: 0, columnSpan: 2 },
      { rowIndex: 2, rowSpan: 1, columnIndex: 0, columnSpan: 2 },
      { rowIndex: 3, rowSpan: 2, columnIndex: 0, columnSpan: 1 },
      { rowIndex: 3, rowSpan: 2, columnIndex: 1, columnSpan: 1 },
    ],
  ),
  columnsHeader: new GridColumnsHeader(
    () => [new GridRow(30), new GridRow(30)],
    false,
    [
      { rowIndex: 0, rowSpan: 2, columnIndex: 0, columnSpan: 1 },
      { rowIndex: 0, rowSpan: 2, columnIndex: 2, columnSpan: 1 },
      { rowIndex: 0, rowSpan: 1, columnIndex: 3, columnSpan: 2 },
      { rowIndex: 1, rowSpan: 1, columnIndex: 3, columnSpan: 2 },
    ],
  ),
  selectionMode: GridSelectionMode.Extended,
  selectionUnit: GridSelectionUnit.Cell,
  merges: [
    { rowIndex: 2, rowSpan: 2, columnIndex: 2, columnSpan: 2 },
    { rowIndex: 20, rowSpan: 3, columnIndex: 10, columnSpan: 3 },
    { rowIndex: 23, rowSpan: 3, columnIndex: 10, columnSpan: 3 },
    { rowIndex: 20, rowSpan: 3, columnIndex: 7, columnSpan: 3 },
    { rowIndex: 23, rowSpan: 3, columnIndex: 7, columnSpan: 3 },
  ],
  cellFactory: new CustomGridCellFactory(), // 커스텀 셀 팩토리 적용
});
grid.initialize();
