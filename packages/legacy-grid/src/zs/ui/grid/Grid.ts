import style from "../../../styles/ui.module.scss";
import { EventArgs, PropertyChangeEventArgs } from "../../EventArgs";
import { toOptimizer } from "../../toOptimizer";
import {
  Container,
  ContainerEventMap,
  initializationWithMeasure,
} from "../Container";
import { ControlKey } from "../ControlKey";
import { Direction } from "../Direction";
import { Point } from "../Point";
import { Size } from "../Size";
import { Visibility } from "../Visibility";
import { GridBounds } from "./GridBounds";
import { GridColumn } from "./GridColumn";
import { GridColumnsHeader } from "./GridColumnsHeader";
import { GridMerge } from "./GridMerge";
import { GridPart } from "./GridPart";
import { GridRow } from "./GridRow";
import { GridRowsHeader } from "./GridRowsHeader";
import { GridSelectionMode } from "./GridSelectionMode";
import { GridSelectionUnit } from "./GridSelectionUnit";
import { GridSettings } from "./GridSettings";

const boundsZero = { rowBegin: 0, rowEnd: 0, columnBegin: 0, columnEnd: 0 };

/**
 * 지정한 HTML 요소가 표시된 셀의 인덱스 범위를 가져옵니다.
 * @param element 확인할 HTML 요소입니다.
 */
function getIndexBounds(element: HTMLElement | undefined): GridBounds {
  if (!element) {
    return { ...boundsZero };
  }
  if (element.hasAttribute("data-merged")) {
    const rowBegin = parseInt(element.getAttribute("data-rowbegin") || "0", 10);
    const rowEnd = parseInt(element.getAttribute("data-rowend") || "0", 10);
    const columnBegin = parseInt(
      element.getAttribute("data-columnbegin") || "0",
      10,
    );
    const columnEnd = parseInt(
      element.getAttribute("data-columnend") || "0",
      10,
    );
    return { rowBegin, rowEnd, columnBegin, columnEnd };
  } else {
    const rowBegin = parseInt(element.getAttribute("data-row") || "0", 10);
    const rowEnd = rowBegin;
    const columnBegin = parseInt(
      element.getAttribute("data-column") || "0",
      10,
    );
    const columnEnd = columnBegin;
    return { rowBegin, rowEnd, columnBegin, columnEnd };
  }
}

interface GridEventMap extends ContainerEventMap {
  /**
   * 셀 병합 목록 속성 변경 이벤트입니다.
   */
  mergesChanged: PropertyChangeEventArgs<Grid, "merges">;
  /**
   * 셀을 선택하는 방법 속성 변경 이벤트입니다.
   */
  selectionModeChanged: PropertyChangeEventArgs<Grid, "selectionMode">;
  /**
   * 셀을 선택하는 단위 속성 변경 이벤트입니다.
   */
  selectionUnitChanged: PropertyChangeEventArgs<Grid, "selectionUnit">;
}

export interface Grid {
  /**
   * 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  on<K extends keyof GridEventMap>(
    name: K,
    handler: (this: Grid, args: GridEventMap[K]) => void,
  ): void;

  /**
   * 한 번만 실행할 이벤트 처리기를 등록합니다.
   * @param name 등록할 이벤트 이름입니다.
   * @param handler 등록할 이벤트 처리기입니다.
   */
  once<K extends keyof GridEventMap>(
    name: K,
    handler: (this: Grid, args: GridEventMap[K]) => void,
  ): void;

  /**
   * 이벤트 처리기를 제거합니다.
   * @param name 제거할 이벤트 이름입니다.
   * @param handler 제거할 이벤트 처리기입니다.
   */
  off<K extends keyof GridEventMap>(
    name: K,
    handler?: (this: Grid, args: GridEventMap[K]) => void,
  ): void;

  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: EventArgs<"initialized" | "disposed", Grid>): boolean;
  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(args: PropertyChangeEventArgs<Grid, "width" | "height">): boolean;
  /**
   * 이벤트를 발생시킵니다.
   * @param args 이벤트 데이터입니다.
   * @returns 실행된 이벤트 처리기가 있으면 true이고 없으면 false입니다.
   */
  emit(
    args: PropertyChangeEventArgs<
      Grid,
      "merges" | "selectionMode" | "selectionUnit"
    >,
  ): boolean;

  /**
   * 속성이 변경되었음을 알립니다.
   * @param propertyName 변경된 속성 이름입니다.
   * @param value 변경된 속성의 현재 값입니다.
   * @param valuePrevious 변경된 속성의 이전 값입니다.
   */
  notifyPropertyChanged<
    K extends (
      | "width"
      | "height"
      | "merges"
      | "selectionMode"
      | "selectionUnit"
    ) &
      keyof Grid,
  >(
    propertyName: K,
    value: Grid[K],
    valuePrevious: Grid[K],
  ): void;
}

/**
 * 그리드 컨트롤입니다.
 */
export class Grid extends Container {
  static USE_SCROLL_ZOOM = true;
  static USE_SCROLL_ZOOM_MAX = 30000000;

  private _elementScroll: HTMLDivElement;
  private _elementScrollIn: HTMLDivElement;
  private _elementHC: HTMLDivElement;
  private _elementHR: HTMLDivElement;
  private _elementBD: HTMLDivElement;
  private _elementNE: HTMLDivElement;
  private _elementNW: HTMLDivElement;
  private _elementSE: HTMLDivElement;
  private _scrollHorizontal: boolean;
  private _scrollHorizontalMax: number;
  private _scrollVertical: boolean;
  private _scrollVerticalMax: number;
  private _scrollZoom: Point;
  private _scrollListener: (e: Event) => void;
  private _wheelListener: (e: WheelEvent) => void;
  private _propertyChangedHandler: (
    e:
      | PropertyChangeEventArgs<
          Grid,
          "width" | "height" | "merges" | "selectionMode" | "selectionUnit"
        >
      | PropertyChangeEventArgs<GridRow, "height" | "visibility">
      | PropertyChangeEventArgs<GridColumn, "width" | "visibility">
      | PropertyChangeEventArgs<GridRowsHeader, "isCollapsed" | "merges">
      | PropertyChangeEventArgs<GridColumnsHeader, "isCollapsed" | "merges">,
  ) => void;

  private _mouseStart: Point | undefined;
  private _mouseStartTarget!: GridPart;
  private _mouseStartIsSelected!: boolean;
  private _mouseStartIsExtended!: boolean;
  private _mouseStartIsRowsHeader!: boolean;
  private _mouseStartIsColumnsHeader!: boolean;
  private _mouseMove!: Point;
  private _mouseMoveTick = false;
  private _mouseMoveScrollToZero = { horizontal: false, vertical: false };
  private _mouseDownListener: (e: MouseEvent) => void;
  private _mouseMoveListener: (e: MouseEvent) => void;
  private _mouseMoveTickListener: () => void;
  private _mouseUpListener: () => void;

  private _rowsHC: GridRow[];
  private _rowsBF: GridRow[];
  private _rowsBN: GridRow[];
  private _rowsHeader: GridRowsHeader;
  private _columnsHR: GridColumn[];
  private _columnsBF: GridColumn[];
  private _columnsBN: GridColumn[];
  private _columnsHeader: GridColumnsHeader;

  private _inHCF: GridPart | undefined;
  private _inHCN: GridPart;
  private _inHRF: GridPart | undefined;
  private _inHRN: GridPart;
  private _inBFF: GridPart | undefined;
  private _inBNF: GridPart | undefined;
  private _inBFN: GridPart | undefined;
  private _inBNN: GridPart;

  private _merges: GridMerge[] | undefined;
  private _focusIndex: GridBounds;
  private _focusIndexPrevious: GridBounds;
  private _selectionMode: GridSelectionMode;
  private _selectionUnit: GridSelectionUnit;
  private _selectIndex: GridBounds;
  private _selectIndexPrevious: GridBounds;
  private _selectIndexBegin: GridBounds;

  /**
   * 표시할 행 목록을 가져옵니다.
   */
  get rows(): GridRow[] {
    return this._rowsBN;
  }

  /**
   * 행 머리글을 가져옵니다.
   */
  get rowsHeader(): GridRowsHeader {
    return this._rowsHeader;
  }

  /**
   * 표시할 열 목록을 가져옵니다.
   */
  get columns(): GridColumn[] {
    return this._columnsBN;
  }

  /**
   * 열 머리글을 가져옵니다.
   */
  get columnsHeader(): GridColumnsHeader {
    return this._columnsHeader;
  }

  /**
   * 셀 병합 목록을 가져오거나 설정합니다.
   */
  get merges(): GridMerge[] | undefined {
    return this._merges;
  }

  set merges(value: GridMerge[] | undefined) {
    const valuePrevious = this._merges;
    this._merges = value;
    this.notifyPropertyChanged("merges", this._merges, valuePrevious);
  }

  /**
   * 셀을 선택하는 방법을 가져오거나 설정합니다.
   */
  get selectionMode(): GridSelectionMode {
    return this._selectionMode;
  }

  set selectionMode(value: GridSelectionMode) {
    if (this._selectionMode !== value) {
      const valuePrevious = this._selectionMode;
      this._selectionMode = value;
      this.notifyPropertyChanged(
        "selectionMode",
        this._selectionMode,
        valuePrevious,
      );
    }
  }

  /**
   * 셀을 선택하는 단위를 가져오거나 설정합니다.
   */
  get selectionUnit(): GridSelectionUnit {
    return this._selectionUnit;
  }

  set selectionUnit(value: GridSelectionUnit) {
    if (this._selectionUnit !== value) {
      const valuePrevious = this._selectionUnit;
      this._selectionUnit = value;
      this.notifyPropertyChanged(
        "selectionUnit",
        this._selectionUnit,
        valuePrevious,
      );
    }
  }

  /**
   * 생성자
   * @param element 그리드에 사용할 HTML 요소입니다.
   * @param settings 그리드 설정입니다.
   */
  constructor(
    element: HTMLDivElement,
    {
      rows,
      rowsFrozen = 0,
      rowsHeader = new GridRowsHeader(),
      columns,
      columnsFrozen = 0,
      columnsHeader = new GridColumnsHeader(),
      merges,
    }: GridSettings,
  ) {
    super(element, true);
    this._elementWrapper.classList.add(style.zsGridWrapper);
    this._elementScroll = document.createElement("div");
    this._elementScroll.classList.add(style.zsGridScroll);
    this._elementScrollIn = document.createElement("div");
    this._elementScrollIn.classList.add(style.zsGridScrollIn);
    this._elementHC = document.createElement("div");
    this._elementHC.classList.add(style.zsGridHead);
    this._elementHC.classList.add(style.zsGridColumnsHeader);
    this._elementHR = document.createElement("div");
    this._elementHR.classList.add(style.zsGridHead);
    this._elementHR.classList.add(style.zsGridRowsHeader);
    this._elementBD = document.createElement("div");
    this._elementBD.classList.add(style.zsGridBody);
    this._elementNE = document.createElement("div");
    this._elementNE.classList.add(style.zsGridCorner);
    this._elementNE.classList.add(style.zsGridCornerNe);
    this._elementNW = document.createElement("div");
    this._elementNW.classList.add(style.zsGridCorner);
    this._elementNW.classList.add(style.zsGridCornerNw);
    this._elementSE = document.createElement("div");
    this._elementSE.classList.add(style.zsGridCorner);
    this._elementSE.classList.add(style.zsGridCornerSe);
    this._scrollHorizontal = false;
    this._scrollHorizontalMax = 0;
    this._scrollVertical = false;
    this._scrollVerticalMax = 0;
    this._scrollZoom = { x: 1, y: 1 };
    this._scrollListener = toOptimizer(this, this._onScroll);
    this._wheelListener = (e) => this._onWheel(e);
    this._propertyChangedHandler = (args) => this._onPropertyChanged(args);
    this._mouseDownListener = (e: MouseEvent): void => this._onMouseDown(e);
    this._mouseMoveListener = (e: MouseEvent): void => this._onMouseMove(e);
    this._mouseMoveTickListener = toOptimizer(this, this._onMouseMoveTick);
    this._mouseUpListener = (): void => this._onMouseUp();

    const useFF = rowsFrozen > 0 && columnsFrozen > 0;
    const useNF = rowsFrozen > 0;
    const useFN = columnsFrozen > 0;
    this._rowsHC = columnsHeader.rowsFactory(columns);
    this._rowsBF = useFF || useNF ? rows.slice(0, rowsFrozen) : [];
    this._rowsBN = Array.from(rows);
    this._rowsHeader = rowsHeader;
    this._columnsHR = rowsHeader.columnsFactory(rows);
    this._columnsBF = useFF || useFN ? columns.slice(0, columnsFrozen) : [];
    this._columnsBN = Array.from(columns);
    this._columnsHeader = columnsHeader;
    if (useFN) {
      this._inHCF = new GridPart(
        GridPart.TYPE_HCF,
        this._rowsHC,
        this._columnsBF,
      );
      this._inHCF.element.classList.add(style.zsGridFrozenVertical);
    }
    if (useNF) {
      this._inHRF = new GridPart(
        GridPart.TYPE_HRF,
        this._rowsBF,
        this._columnsHR,
      );
      this._inHRF.element.classList.add(style.zsGridFrozenHorizontal);
    }
    {
      this._inHCN = new GridPart(
        GridPart.TYPE_HCN,
        this._rowsHC,
        this._columnsBN,
      );
      this._inHRN = new GridPart(
        GridPart.TYPE_HRN,
        this._rowsBN,
        this._columnsHR,
      );
    }
    if (useFF) {
      this._inBFF = new GridPart(
        GridPart.TYPE_BFF,
        this._rowsBF,
        this._columnsBF,
      );
      this._inBFF.element.classList.add(
        style.zsGridFrozenHorizontal,
        style.zsGridFrozenVertical,
      );
    }
    if (useNF) {
      this._inBNF = new GridPart(
        GridPart.TYPE_BNF,
        this._rowsBF,
        this._columnsBN,
      );
      this._inBNF.element.classList.add(style.zsGridFrozenHorizontal);
    }
    if (useFN) {
      this._inBFN = new GridPart(
        GridPart.TYPE_BFN,
        this._rowsBN,
        this._columnsBF,
      );
      this._inBFN.element.classList.add(style.zsGridFrozenVertical);
    }
    {
      this._inBNN = new GridPart(
        GridPart.TYPE_BNN,
        this._rowsBN,
        this._columnsBN,
      );
    }
    this._merges = merges;
    this._focusIndex = { ...boundsZero };
    this._focusIndexPrevious = { ...boundsZero };
    this._selectionMode = GridSelectionMode.Extended;
    this._selectionUnit = GridSelectionUnit.Cell;
    this._selectIndex = { ...boundsZero };
    this._selectIndexPrevious = { ...boundsZero };
    this._selectIndexBegin = { ...boundsZero };
  }

  /**
   * 그리드 컨트롤을 시작합니다.
   */
  @initializationWithMeasure
  initialize(): void {
    super.initialize();
    if (this._isInitialized) {
      this._elementScroll.scrollLeft = 0;
      this._elementScroll.scrollTop = 0;
    } else {
      {
        let height = 0;
        let index = 0;
        for (const row of this._rowsBN) {
          row.on("heightChanged", this._propertyChangedHandler);
          row.on("visibilityChanged", this._propertyChangedHandler);
          (row as unknown as { _index: number })._index = index++;
          (row as unknown as { _top: number })._top = height;
          height += row.height;
          row.data.___ROWNUMBER = index;
        }
      }
      {
        let width = 0;
        let index = 0;
        for (const column of this._columnsBN) {
          column.on("widthChanged", this._propertyChangedHandler);
          column.on("visibilityChanged", this._propertyChangedHandler);
          (column as unknown as { _index: number })._index = index++;
          (column as unknown as { _left: number })._left = width;
          width += column.width;
        }
      }
      this._element.classList.add(style.zsGrid);
      this._elementWrapper.appendChild(this._elementBD);
      this._elementWrapper.appendChild(this._elementHC);
      this._elementWrapper.appendChild(this._elementHR);
      this._elementWrapper.appendChild(this._elementNE);
      this._elementWrapper.appendChild(this._elementNW);
      this._elementWrapper.appendChild(this._elementSE);
      this._elementWrapper.addEventListener(
        "wheel",
        this._wheelListener,
        false,
      );
      this._elementBD.appendChild(this._elementScroll);
      this._elementScroll.appendChild(this._elementScrollIn);
      this._elementScroll.addEventListener("scroll", this._scrollListener, {
        passive: true,
      });
      {
        this._elementHC.appendChild(this._inHCN.element);
        this._elementHR.appendChild(this._inHRN.element);
      }
      if (this._inHCF) {
        this._elementHC.appendChild(this._inHCF.element);
      }
      if (this._inHRF) {
        this._elementHR.appendChild(this._inHRF.element);
      }
      {
        this._elementBD.appendChild(this._inBNN.element);
      }
      if (this._inBNF) {
        this._elementBD.appendChild(this._inBNF.element);
      }
      if (this._inBFN) {
        this._elementBD.appendChild(this._inBFN.element);
      }
      if (this._inBFF) {
        this._elementBD.appendChild(this._inBFF.element);
      }
    }

    const { hcf, hcn, hrf, hrn, bff, bnf, bfn, bnn } =
      this._separateMergeOptions({
        rowsHeader: this._rowsHeader.merges,
        columnsHeader: this._columnsHeader.merges,
        body: this.merges,
      });
    if (this._inHCF) {
      this._inHCF.initialize(
        undefined,
        undefined,
        hcf.length > 0 ? hcf : undefined,
      );
      this._inHCF.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inHCN) {
      this._inHCN.initialize(
        { x: this._inHCF?.columnsWidth ?? 0, y: 0 },
        undefined,
        hcn.length > 0 ? hcn : undefined,
      );
      this._inHCN.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inHRF) {
      this._inHRF.initialize(
        undefined,
        undefined,
        hrf.length > 0 ? hrf : undefined,
      );
      this._inHRF.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inHRN) {
      this._inHRN.initialize(
        { x: 0, y: this._inHRF?.rowsHeight ?? 0 },
        undefined,
        hrn.length > 0 ? hrn : undefined,
      );
      this._inHRN.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inBFF) {
      this._inBFF.initialize(
        undefined,
        undefined,
        bff.length > 0 ? bff : undefined,
      );
      this._inBFF.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inBNF) {
      this._inBNF.initialize(
        { x: this._inBFN?.columnsWidth ?? 0, y: 0 },
        undefined,
        bnf.length > 0 ? bnf : undefined,
      );
      this._inBNF.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inBFN) {
      this._inBFN.initialize(
        { x: 0, y: this._inBNF?.rowsHeight ?? 0 },
        undefined,
        bfn.length > 0 ? bfn : undefined,
      );
      this._inBFN.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }
    if (this._inBNN) {
      this._inBNN.initialize(
        { x: this._inBFN?.columnsWidth ?? 0, y: this._inBNF?.rowsHeight ?? 0 },
        undefined,
        bnn.length > 0 ? bnn : undefined,
      );
      this._inBNN.element.addEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
    }

    this.on("mergesChanged", this._propertyChangedHandler);
    this.on("selectionModeChanged", this._propertyChangedHandler);
    this.on("selectionUnitChanged", this._propertyChangedHandler);
    this._rowsHeader.on("isCollapsedChanged", this._propertyChangedHandler);
    this._rowsHeader.on("mergesChanged", this._propertyChangedHandler);
    this._columnsHeader.on("isCollapsedChanged", this._propertyChangedHandler);
    this._columnsHeader.on("mergesChanged", this._propertyChangedHandler);
  }

  /**
   * 그리드 컨트롤을 더 이상 사용할 수 없도록 제거합니다.
   */
  dispose(): void {
    if (this._isInitialized) {
      this._element.classList.remove(style.zsGrid);
      this._element.classList.remove(style.zsGridScrollableHorizontal);
      this._element.classList.remove(style.zsGridScrollableVertical);
      this._elementWrapper.removeEventListener(
        "wheel",
        this._wheelListener,
        false,
      );
      this._elementWrapper.removeChild(this._elementBD);
      this._elementWrapper.removeChild(this._elementHC);
      this._elementWrapper.removeChild(this._elementHR);
      this._elementWrapper.removeChild(this._elementNE);
      this._elementWrapper.removeChild(this._elementNW);
      this._elementWrapper.removeChild(this._elementSE);
      this._elementBD.removeChild(this._elementScroll);
      this._elementScroll.removeEventListener(
        "scroll",
        this._scrollListener,
        false,
      );
      this._elementScroll.removeChild(this._elementScrollIn);
      {
        this._elementHC.removeChild(this._inHCN.element);
        this._elementHR.removeChild(this._inHRN.element);
      }
      if (this._inHCF) {
        this._elementHC.removeChild(this._inHCF.element);
      }
      if (this._inHRF) {
        this._elementHR.removeChild(this._inHRF.element);
      }
      {
        this._elementBD.removeChild(this._inBNN.element);
      }
      if (this._inBNF) {
        this._elementBD.removeChild(this._inBNF.element);
      }
      if (this._inBFN) {
        this._elementBD.removeChild(this._inBFN.element);
      }
      if (this._inBFF) {
        this._elementBD.removeChild(this._inBFF.element);
      }
    }
    this._rowsHeader?.dispose();
    this._columnsHeader?.dispose();

    if (this._inHCF) {
      this._inHCF.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inHCF.dispose();
    }
    if (this._inHCN) {
      this._inHCN.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inHCN.dispose();
    }
    if (this._inHRF) {
      this._inHRF.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inHRF.dispose();
    }
    if (this._inHRN) {
      this._inHRN.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inHRN.dispose();
    }
    if (this._inBFF) {
      this._inBFF.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inBFF.dispose();
    }
    if (this._inBNF) {
      this._inBNF.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inBNF.dispose();
    }
    if (this._inBFN) {
      this._inBFN.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inBFN.dispose();
    }
    if (this._inBNN) {
      this._inBNN.element.removeEventListener(
        "mousedown",
        this._mouseDownListener,
        false,
      );
      this._inBNN.dispose();
    }
    if (this._rowsHC) this._rowsHC.length = 0;
    if (this._rowsBF) this._rowsBF.length = 0;
    if (this._rowsBN) this._rowsBN.length = 0;
    if (this._columnsHR) this._columnsHR.length = 0;
    if (this._columnsBF) this._columnsBF.length = 0;
    if (this._columnsBN) this._columnsBN.length = 0;
    super.dispose();
  }

  /**
   * 그리드 컨트롤의 레이아웃을 업데이트합니다.
   * @param availableSize 사용가능한 크기입니다.
   */
  arrange(availableSize: Size): void {
    const headerWidth = this._rowsHeader.isCollapsed
      ? 0
      : this._columnsHR[this._columnsHR.length - 1].right;
    const headerHeight = this._columnsHeader.isCollapsed
      ? 0
      : this._rowsHC[this._rowsHC.length - 1].bottom;
    availableSize.width -= headerWidth;
    availableSize.height -= headerHeight;

    const bodyWidth = this._inBNN.columnsWidth;
    const bodyHeight = this._inBNN.rowsHeight;
    const wrapWidth = availableSize.width;
    const wrapHeight = availableSize.height;
    const scrollBarWidth = this.getScrollBarWidth();
    let boundsWidth = wrapWidth;
    let boundsHeight = wrapHeight;
    let scrollHorizontal = false;
    let scrollVertical = false;
    while (true) {
      const sh = boundsWidth < bodyWidth;
      const sv = boundsHeight < bodyHeight;
      if (sh) {
        boundsHeight = wrapHeight - scrollBarWidth;
      } else {
        boundsHeight = wrapHeight;
      }
      if (sv) {
        boundsWidth = wrapWidth - scrollBarWidth;
      } else {
        boundsWidth = wrapWidth;
      }
      if (scrollHorizontal === sh && scrollVertical === sv) {
        break;
      }
      scrollHorizontal = sh;
      scrollVertical = sv;
    }

    if (scrollHorizontal) {
      this._element.classList.add(style.zsGridScrollableHorizontal);
    } else {
      this._element.classList.remove(style.zsGridScrollableHorizontal);
    }
    if (scrollVertical) {
      this._element.classList.add(style.zsGridScrollableVertical);
    } else {
      this._element.classList.remove(style.zsGridScrollableVertical);
    }
    if (this._columnsHeader.isCollapsed || this._columnsHeader.isCollapsed) {
      this._elementNE.style.display = "none";
    } else {
      this._elementNE.style.display = "block";
      this._elementNE.style.width = headerWidth + "px";
      this._elementNE.style.height = headerHeight + "px";
    }

    if (this._rowsHeader.isCollapsed) {
      this._elementSE.style.display = "none";
      this._elementHR.style.display = "none";
    } else {
      this._elementSE.style.display = "block";
      this._elementSE.style.width = headerWidth + "px";
      this._elementSE.style.height =
        wrapHeight - Math.min(boundsHeight, this._inBNN.rowsHeight) + "px";
      this._elementHR.style.display = "block";
      this._elementHR.style.top = headerHeight + "px";
      this._elementHR.style.width = headerWidth + "px";
      this._elementHR.style.height = boundsHeight + "px";
      if (this._inHRF) {
        this._inHRF.element.style.width = headerWidth + "px";
        this._inHRF.element.style.height = this._inHRF.rowsHeight + "px";
        this._inHRF.measure(true);
      }
      {
        this._inHRN.element.style.width = headerWidth + "px";
        this._inHRN.element.style.height = boundsHeight + "px";
        this._inHRN.measure(true);
      }
    }

    if (this._columnsHeader.isCollapsed) {
      this._elementNW.style.display = "none";
      this._elementHC.style.display = "none";
    } else {
      this._elementNW.style.display = "block";
      this._elementNW.style.width =
        wrapWidth - Math.min(boundsWidth, this._inBNN.columnsWidth) + "px";
      this._elementNW.style.height = headerHeight + "px";
      this._elementHC.style.display = "block";
      this._elementHC.style.left = headerWidth + "px";
      this._elementHC.style.width = boundsWidth + "px";
      this._elementHC.style.height = headerHeight + "px";
      if (this._inHCF) {
        this._inHCF.element.style.width = this._inHCF.columnsWidth + "px";
        this._inHCF.element.style.height = headerHeight + "px";
        this._inHCF.measure(true);
      }
      {
        this._inHCN.element.style.width = boundsWidth + "px";
        this._inHCN.element.style.height = headerHeight + "px";
        this._inHCN.measure(true);
      }
    }

    this._elementBD.style.left = headerWidth + "px";
    this._elementBD.style.top = headerHeight + "px";
    this._elementBD.style.width = wrapWidth + "px";
    this._elementBD.style.height = wrapHeight + "px";
    if (this._inBFF) {
      this._inBFF.element.style.width = this._inBFF.columnsWidth + "px";
      this._inBFF.element.style.height = this._inBFF.rowsHeight + "px";
      this._inBFF.measure(true);
    }
    if (this._inBNF) {
      this._inBNF.element.style.width = boundsWidth + "px";
      this._inBNF.element.style.height = this._inBNF.rowsHeight + "px";
      this._inBNF.measure(true);
    }
    if (this._inBFN) {
      this._inBFN.element.style.width = this._inBFN.columnsWidth + "px";
      this._inBFN.element.style.height = boundsHeight + "px";
      this._inBFN.measure(true);
    }
    {
      this._inBNN.element.style.width = boundsWidth + "px";
      this._inBNN.element.style.height = boundsHeight + "px";
      this._inBNN.measure(true);
    }

    const contentHeight = Grid.USE_SCROLL_ZOOM
      ? Math.min(Grid.USE_SCROLL_ZOOM_MAX, bodyHeight)
      : bodyHeight;
    const contentWidth = Grid.USE_SCROLL_ZOOM
      ? Math.min(Grid.USE_SCROLL_ZOOM_MAX, bodyWidth)
      : bodyWidth;
    if (contentHeight < bodyHeight) {
      this._scrollZoom.y =
        (bodyHeight - boundsHeight) / (contentHeight - boundsHeight);
    } else {
      this._scrollZoom.y = 1;
    }
    if (contentWidth < bodyWidth) {
      this._scrollZoom.x =
        (bodyWidth - boundsWidth) / (contentWidth - boundsWidth);
    } else {
      this._scrollZoom.x = 1;
    }
    this._elementScroll.style.height = wrapHeight + "px";
    this._elementScroll.style.width = wrapWidth + "px";
    this._elementScrollIn.style.height = contentHeight + "px";
    this._elementScrollIn.style.width = contentWidth + "px";
    this._scrollHorizontal = scrollHorizontal;
    this._scrollHorizontalMax = scrollHorizontal
      ? contentWidth - wrapWidth + (scrollVertical ? scrollBarWidth : 0)
      : 0;
    this._scrollVertical = scrollVertical;
    this._scrollVerticalMax = scrollVertical
      ? contentHeight - wrapHeight + (scrollHorizontal ? scrollBarWidth : 0)
      : 0;
  }

  /**
   * 포커스를 시작합니다.
   * @param element 포커스된 HTML 요소입니다.
   */
  focusBegin(element: HTMLElement): void {
    super.focusBegin(element);
    const bounds = this._focusIndex;
    const inPart = this._getPart(bounds.rowBegin, bounds.columnBegin);
    const scrollPrevious = inPart._scroll;
    inPart.focus(bounds.rowBegin, bounds.columnBegin);
    if (
      inPart._scroll.x !== scrollPrevious.x ||
      inPart._scroll.y !== scrollPrevious.y
    ) {
      if (inPart === this._inBNN || inPart === this._inBNF) {
        this._elementScroll.scrollLeft = Math.floor(
          inPart._scroll.x / this._scrollZoom.x,
        );
      }
      if (inPart === this._inBNN || inPart === this._inBFN) {
        this._elementScroll.scrollTop = Math.floor(
          inPart._scroll.y / this._scrollZoom.y,
        );
      }
    }
    this._selectIndex = bounds;
    this._selectIndexPrevious = { ...this._selectIndex };
    this._selectIndexBegin = { ...this._selectIndex };
  }

  /**
   * 포커스를 이동합니다.
   * @param key 컨트롤의 키 입력 값입니다.
   * @param event 원본 키보드 이벤트입니다.
   */
  focusMove(key: ControlKey, event: KeyboardEvent): boolean {
    const selectIsExtended =
      this._selectionMode === GridSelectionMode.Extended && event.shiftKey;
    const { rowBegin: rowBeginPrevious, columnBegin: columnBeginPrevious } =
      selectIsExtended ? this._selectIndexPrevious : this._focusIndexPrevious;
    const { rowBegin, rowEnd, columnBegin, columnEnd } = selectIsExtended
      ? this._selectIndex
      : this._focusIndex;
    let rowIndexPrevious = Math.min(
      Math.max(rowBegin, rowBeginPrevious),
      rowEnd,
    );
    let columnIndexPrevious = Math.min(
      Math.max(columnBegin, columnBeginPrevious),
      columnEnd,
    );
    switch (key) {
      case ControlKey.first:
      case ControlKey.pageUp:
      case ControlKey.arrowUp:
      case ControlKey.last:
      case ControlKey.pageDown:
      case ControlKey.arrowDown:
        if (columnBegin > columnBeginPrevious) {
          while (
            columnIndexPrevious >= 0 &&
            columnIndexPrevious < this._columnsBN.length &&
            (this._columnsBN[columnIndexPrevious].visibility ===
              Visibility.hidden ||
              this._columnsBN[columnIndexPrevious].visibility ===
                Visibility.collapsed)
          ) {
            columnIndexPrevious++;
          }
        }
        if (columnBegin < columnBeginPrevious) {
          while (
            columnIndexPrevious >= 0 &&
            columnIndexPrevious < this._columnsBN.length &&
            (this._columnsBN[columnIndexPrevious].visibility ===
              Visibility.hidden ||
              this._columnsBN[columnIndexPrevious].visibility ===
                Visibility.collapsed)
          ) {
            columnIndexPrevious--;
          }
        }
        break;
      case ControlKey.home:
      case ControlKey.arrowLeft:
      case ControlKey.end:
      case ControlKey.arrowRight:
        if (rowBegin > rowBeginPrevious) {
          while (
            rowIndexPrevious >= 0 &&
            rowIndexPrevious < this._rowsBN.length &&
            (this._rowsBN[rowIndexPrevious].visibility === Visibility.hidden ||
              this._rowsBN[rowIndexPrevious].visibility ===
                Visibility.collapsed)
          ) {
            rowIndexPrevious++;
          }
        }
        if (rowBegin < rowBeginPrevious) {
          while (
            rowIndexPrevious >= 0 &&
            rowIndexPrevious < this._rowsBN.length &&
            (this._rowsBN[rowIndexPrevious].visibility === Visibility.hidden ||
              this._rowsBN[rowIndexPrevious].visibility ===
                Visibility.collapsed)
          ) {
            rowIndexPrevious--;
          }
        }
        break;
    }
    let rowIndex = -1;
    let columnIndex = -1;
    switch (key) {
      case ControlKey.first:
        rowIndex = 0;
        columnIndex =
          columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
        break;
      case ControlKey.last:
        rowIndex = this._rowsBN.length - 1;
        columnIndex =
          columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
        break;
      case ControlKey.home:
        rowIndex = rowBegin === rowEnd ? rowBegin : rowIndexPrevious;
        columnIndex = 0;
        break;
      case ControlKey.end:
        rowIndex = rowBegin === rowEnd ? rowBegin : rowIndexPrevious;
        columnIndex = this._columnsBN.length - 1;
        break;
      case ControlKey.pageUp:
        {
          if (rowBegin > this._inBNN._cellsIndex.rowBegin) {
            rowIndex = this._inBNN._cellsIndex.rowBegin;
            columnIndex =
              columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
          } else {
            const wrapHeight = this._inBNN.height;
            let pageHeight = 0;
            let i = this._inBNN._cellsIndex.rowEnd;
            while (i >= this._inBNN._cellsIndex.rowBegin) {
              const height = this._rowsBN[i--].height;
              if (pageHeight + height > wrapHeight) {
                break;
              }
              pageHeight += height;
            }
            i = this._inBNN._cellsIndex.rowBegin;
            while (i >= 0) {
              const height = this._rowsBN[i--].height;
              pageHeight -= height;
              if (pageHeight <= 0) {
                break;
              }
            }
            rowIndex = Math.max(i, 0);
            columnIndex =
              columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
          }
        }
        break;
      case ControlKey.pageDown:
        {
          if (rowEnd < this._inBNN._cellsIndex.rowEnd) {
            rowIndex = this._inBNN._cellsIndex.rowEnd;
            columnIndex =
              columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
          } else {
            const wrapHeight = this._inBNN.height;
            let pageHeight = 0;
            let i = this._inBNN._cellsIndex.rowBegin;
            while (i <= this._inBNN._cellsIndex.rowEnd) {
              const height = this._rowsBN[i++].height;
              if (pageHeight + height > wrapHeight) {
                break;
              }
              pageHeight += height;
            }
            while (i < this._rowsBN.length) {
              const height = this._rowsBN[i++].height;
              pageHeight -= height;
              if (pageHeight <= 0) {
                break;
              }
            }
            rowIndex = Math.min(i - 1, this._rowsBN.length - 1);
            columnIndex =
              columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
          }
        }
        break;
      case ControlKey.arrowLeft:
        rowIndex = rowBegin === rowEnd ? rowBegin : rowIndexPrevious;
        columnIndex = columnBegin - 1;
        break;
      case ControlKey.arrowUp:
        rowIndex = rowBegin - 1;
        columnIndex =
          columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
        break;
      case ControlKey.arrowRight:
        rowIndex = rowBegin === rowEnd ? rowBegin : rowIndexPrevious;
        columnIndex = columnEnd + 1;
        break;
      case ControlKey.arrowDown:
        rowIndex = rowEnd + 1;
        columnIndex =
          columnBegin === columnEnd ? columnBegin : columnIndexPrevious;
        break;
    }
    rowIndex = Math.min(Math.max(0, rowIndex), this._rowsBN.length - 1);
    columnIndex = Math.min(
      Math.max(0, columnIndex),
      this._columnsBN.length - 1,
    );
    switch (key) {
      case ControlKey.first:
      case ControlKey.pageUp:
      case ControlKey.arrowUp:
        if (rowBegin === 0) return false;
        while (
          rowIndex >= 0 &&
          rowIndex < this._rowsBN.length &&
          (this._rowsBN[rowIndex].visibility === Visibility.hidden ||
            this._rowsBN[rowIndex].visibility === Visibility.collapsed)
        ) {
          rowIndex--;
        }
        break;
      case ControlKey.last:
      case ControlKey.pageDown:
      case ControlKey.arrowDown:
        if (rowEnd === this._rowsBN.length - 1) return false;
        while (
          rowIndex >= 0 &&
          rowIndex < this._rowsBN.length &&
          (this._rowsBN[rowIndex].visibility === Visibility.hidden ||
            this._rowsBN[rowIndex].visibility === Visibility.collapsed)
        ) {
          rowIndex++;
        }
        break;
      case ControlKey.home:
      case ControlKey.arrowLeft:
        if (columnBegin === 0) return false;
        while (
          columnIndex >= 0 &&
          columnIndex < this._columnsBN.length &&
          (this._columnsBN[columnIndex].visibility === Visibility.hidden ||
            this._columnsBN[columnIndex].visibility === Visibility.collapsed)
        ) {
          columnIndex--;
        }
        break;
      case ControlKey.end:
      case ControlKey.arrowRight:
        if (columnEnd === this._columnsBN.length - 1) return false;
        while (
          columnIndex >= 0 &&
          columnIndex < this._columnsBN.length &&
          (this._columnsBN[columnIndex].visibility === Visibility.hidden ||
            this._columnsBN[columnIndex].visibility === Visibility.collapsed)
        ) {
          columnIndex++;
        }
        break;
    }

    const inPart = this._getPart(rowIndex, columnIndex);
    if (selectIsExtended) {
      inPart.scrollInto(rowIndex, columnIndex);
    } else {
      inPart.focus(rowIndex, columnIndex);
    }
    if (inPart === this._inBFF) {
      if (rowBegin >= this._rowsBF.length) {
        this._elementScroll.scrollTop = 0;
      }
      if (columnBegin >= this._columnsBF.length) {
        this._elementScroll.scrollLeft = 0;
      }
    } else {
      if (inPart === this._inBNN || inPart === this._inBNF) {
        if (inPart === this._inBNF && rowBegin >= this._rowsBF.length) {
          this._elementScroll.scrollTop = 0;
        }
        this._elementScroll.scrollLeft = Math.floor(
          inPart._scroll.x / this._scrollZoom.x,
        );
      }
      if (inPart === this._inBNN || inPart === this._inBFN) {
        this._elementScroll.scrollTop = Math.floor(
          inPart._scroll.y / this._scrollZoom.y,
        );
        if (inPart === this._inBFN && columnBegin >= this._columnsBF.length) {
          this._elementScroll.scrollLeft = 0;
        }
      }
    }

    if (this._selectionMode !== GridSelectionMode.None) {
      const merge = this._merges?.find(
        (m) =>
          m.rowIndex <= rowIndex &&
          m.rowIndex + m.rowSpan > rowIndex &&
          m.columnIndex <= columnIndex &&
          m.columnIndex + m.columnSpan > columnIndex,
      );
      if (
        this._selectIndex.rowBegin === this._selectIndex.rowEnd &&
        this._selectIndex.columnBegin === this._selectIndex.columnEnd &&
        merge
      ) {
        this._selectIndexPrevious = { ...this._selectIndex };
      }
      this._selectIndex = merge
        ? {
            rowBegin: merge.rowIndex,
            rowEnd: merge.rowIndex + merge.rowSpan - 1,
            columnBegin: merge.columnIndex,
            columnEnd: merge.columnIndex + merge.columnSpan - 1,
          }
        : {
            rowBegin: rowIndex,
            rowEnd: rowIndex,
            columnBegin: columnIndex,
            columnEnd: columnIndex,
          };

      const bounds = { ...this._selectIndex };
      if (this._selectionUnit === GridSelectionUnit.Column) {
        bounds.columnBegin = 0;
        bounds.columnEnd = this._columnsBN.length - 1;
      }
      if (this._selectionUnit === GridSelectionUnit.Row) {
        bounds.rowBegin = 0;
        bounds.rowEnd = this._rowsBN.length - 1;
      }
      if (selectIsExtended) {
        bounds.rowBegin = Math.min(
          this._selectIndexBegin.rowBegin,
          bounds.rowBegin,
        );
        bounds.rowEnd = Math.max(this._selectIndexBegin.rowEnd, bounds.rowEnd);
        bounds.columnBegin = Math.min(
          this._selectIndexBegin.columnBegin,
          bounds.columnBegin,
        );
        bounds.columnEnd = Math.max(
          this._selectIndexBegin.columnEnd,
          bounds.columnEnd,
        );
      } else {
        this._selectIndexBegin = { ...this._selectIndex };
      }
      this._inBFF?.unselect();
      this._inBNF?.unselect();
      this._inBFN?.unselect();
      this._inBNN?.unselect();
      this._inBFF?.select(bounds);
      this._inBNF?.select(bounds);
      this._inBFN?.select(bounds);
      this._inBNN?.select(bounds);
    }

    return !(
      rowBegin <= rowIndex &&
      rowEnd >= rowIndex &&
      columnBegin <= columnIndex &&
      columnEnd >= columnIndex
    );
  }

  /**
   * 포커스 됐을때 필요한 작업을 수행합니다.
   * @param element 포커스된 HTML 요소입니다.
   * @param focusBeginning 포커스 덫을 처음 시작하는지 여부입니다.
   */
  focusIn(element: HTMLElement, focusBeginning = false): void {
    const inPart = this._getPart(
      this._focusIndex.rowBegin,
      this._focusIndex.columnBegin,
    );
    inPart.focusClear(this._focusIndex.rowBegin, this._focusIndex.columnBegin);

    const cellElement = (
      element.classList.contains(style.zsGridCell)
        ? element
        : element.closest("." + style.zsGridCell)
    ) as HTMLElement;
    if (cellElement) {
      this._focusElement?.classList.remove(style.zsFocus);
      if (focusBeginning) {
        this._focusElement = cellElement;
        this._focusElementPrevious = undefined;
        this._focusIndex = getIndexBounds(this._focusElement);
        this._focusIndexPrevious = getIndexBounds(this._focusElementPrevious);
      } else {
        if (
          !this._focusElement?.hasAttribute("data-merged") &&
          cellElement.hasAttribute("data-merged")
        ) {
          this._focusElementPrevious = this._focusElement;
          this._focusIndexPrevious = getIndexBounds(this._focusElementPrevious);
        }
        this._focusElement = cellElement;
        this._focusIndex = getIndexBounds(this._focusElement);
      }
      this._focusElement.classList.add(style.zsFocus);
    }
  }

  /**
   * 지정한 행과 열의 인덱스가 표시되는 그리드의 일부를 가져옵니다.
   * @param rowIndex 행 인덱스입니다.
   * @param columnIndex 열 인덱스입니다.
   */
  _getPart(rowIndex: number, columnIndex: number): GridPart {
    if (
      this._inBFF &&
      rowIndex < this._rowsBF.length &&
      columnIndex < this._columnsBF.length
    ) {
      return this._inBFF;
    }
    if (this._inBNF && rowIndex < this._rowsBF.length) {
      return this._inBNF;
    }
    if (this._inBFN && columnIndex < this._columnsBF.length) {
      return this._inBFN;
    }
    return this._inBNN;
  }

  /**
   * 셀 병합을 각 그리드의 일부에 적용할 수 있도록 분리합니다.
   * @param mergeOptions 머리글 및 본문에 대한 셀 병합입니다.
   * @param mergeOptions.rowsHeader 행 머리글에 대한 셀 병합입니다.
   * @param mergeOptions.columnsHeader 열 머리글에 대한 셀 병합입니다.
   * @param mergeOptions.body 본문에 대한 셀 병합입니다.
   */
  _separateMergeOptions(mergeOptions?: {
    rowsHeader?: readonly GridMerge[];
    columnsHeader?: readonly GridMerge[];
    body?: readonly GridMerge[];
  }): {
    hcf: GridMerge[];
    hcn: GridMerge[];
    hrf: GridMerge[];
    hrn: GridMerge[];
    bff: GridMerge[];
    bnf: GridMerge[];
    bfn: GridMerge[];
    bnn: GridMerge[];
  } {
    const hcf = [];
    const hcn = [];
    if (mergeOptions && mergeOptions.columnsHeader) {
      for (const {
        rowIndex,
        rowSpan,
        columnIndex,
        columnSpan,
      } of mergeOptions.columnsHeader) {
        if (this._inHCF && columnIndex < this._columnsBF.length) {
          hcf.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        } else {
          hcn.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        }
      }
    }

    const hrf = [];
    const hrn = [];
    if (mergeOptions && mergeOptions.rowsHeader) {
      for (const {
        rowIndex,
        rowSpan,
        columnIndex,
        columnSpan,
      } of mergeOptions.rowsHeader) {
        if (this._inHRF && rowIndex < this._rowsBF.length) {
          hrf.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        } else {
          hrn.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        }
      }
    }

    const bff = [];
    const bnf = [];
    const bfn = [];
    const bnn = [];
    if (mergeOptions && mergeOptions.body) {
      for (const {
        rowIndex,
        rowSpan,
        columnIndex,
        columnSpan,
      } of mergeOptions.body) {
        if (
          this._inBFF &&
          rowIndex < this._rowsBF.length &&
          columnIndex < this._columnsBF.length
        ) {
          bff.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        } else if (this._inBNF && rowIndex < this._rowsBF.length) {
          bnf.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        } else if (this._inBFN && columnIndex < this._columnsBF.length) {
          bfn.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        } else {
          bnn.push({ rowIndex, rowSpan, columnIndex, columnSpan });
        }
      }
    }

    return { hcf, hcn, hrf, hrn, bff, bnf, bfn, bnn };
  }

  /**
   * 스크롤 이벤트를 처리합니다.
   */
  _onScroll(): void {
    const x = this._elementScroll.scrollLeft * this._scrollZoom.x;
    const y = this._elementScroll.scrollTop * this._scrollZoom.y;
    if (!this._columnsHeader.isCollapsed) {
      this._inHCN.scrollTo({ x, y: 0 });
    }
    if (!this._rowsHeader.isCollapsed) {
      this._inHRN.scrollTo({ x: 0, y });
    }
    if (this._inBNF) {
      this._inBNF.scrollTo({ x, y: 0 });
    }
    if (this._inBFN) {
      this._inBFN.scrollTo({ x: 0, y });
    }
    {
      this._inBNN.scrollTo({ x, y });
    }
  }

  /**
   * 휠 이벤트를 처리합니다.
   * @param e
   */
  _onWheel(e: WheelEvent): void {
    if (this._scrollHorizontal && e.deltaX !== 0) {
      const scrollLeft = this._elementScroll.scrollLeft;
      if (scrollLeft > 0 && scrollLeft < this._scrollHorizontalMax) {
        e.preventDefault();
      }
      this._elementScroll.scrollLeft = Math.max(
        0,
        this._elementScroll.scrollLeft + e.deltaX,
      );
    }
    if (this._scrollVertical && e.deltaY !== 0) {
      const scrollTop = this._elementScroll.scrollTop;
      if (scrollTop > 0 && scrollTop < this._scrollVerticalMax) {
        e.preventDefault();
      }
      this._elementScroll.scrollTop = Math.max(
        0,
        this._elementScroll.scrollTop + e.deltaY,
      );
    }
  }

  /**
   * 속성 변경 이벤트를 처리합니다.
   * @param args 속성변경 이벤트 데이터입니다.
   */
  _onPropertyChanged(
    args:
      | PropertyChangeEventArgs<
          Grid,
          "width" | "height" | "merges" | "selectionMode" | "selectionUnit"
        >
      | PropertyChangeEventArgs<GridRow, "height" | "visibility">
      | PropertyChangeEventArgs<GridColumn, "width" | "visibility">
      | PropertyChangeEventArgs<GridRowsHeader, "isCollapsed" | "merges">
      | PropertyChangeEventArgs<GridColumnsHeader, "isCollapsed" | "merges">,
  ): void {
    if (args.propertyName === "merges") {
      if (args.source === this._rowsHeader) {
        const { hrf, hrn } = this._separateMergeOptions({
          rowsHeader: args.value as GridMerge[],
        });
        if (this._inHRF && hrf) this._inHRF.merge(hrf);
        if (this._inHRN && hrn) this._inHRN.merge(hrn);
      } else if (args.source === this._columnsHeader) {
        const { hcf, hcn } = this._separateMergeOptions({
          columnsHeader: args.value as GridMerge[],
        });
        if (this._inHCF && hcf) this._inHCF.merge(hcf);
        if (this._inHCN && hcn) this._inHCN.merge(hcn);
        return;
      } else if (args.source === this) {
        const { bff, bnf, bfn, bnn } = this._separateMergeOptions({
          body: args.value as GridMerge[],
        });
        if (this._inBFF && bff) this._inBFF.merge(bff);
        if (this._inBNF && bnf) this._inBNF.merge(bnf);
        if (this._inBFN && bfn) this._inBFN.merge(bfn);
        if (this._inBNN && bnn) this._inBNN.merge(bnn);
      }
      return;
    }
    if (
      args.propertyName === "selectionMode" ||
      args.propertyName === "selectionUnit"
    ) {
      this._inBFF?.unselect();
      this._inBNF?.unselect();
      this._inBFN?.unselect();
      this._inBNN?.unselect();
      return;
    }

    const rowChanged = args.source instanceof GridRow;
    const columnChanged = args.source instanceof GridColumn;
    const rowsHeaderChanged = args.source instanceof GridRowsHeader;
    const columnsHeaderChanged = args.source instanceof GridColumnsHeader;
    if (rowChanged) {
      let height = 0;
      for (const row of this._rowsBN) {
        (row as unknown as { _top: number })._top = height;
        height += row.height;
      }
    }
    if (columnChanged) {
      let width = 0;
      for (const column of this._columnsBN) {
        (column as unknown as { _left: number })._left = width;
        width += column.width;
      }
    }
    if (
      rowChanged ||
      columnChanged ||
      rowsHeaderChanged ||
      columnsHeaderChanged
    ) {
      this.initialize();
    }
  }

  /**
   * 마우스 다운 이벤트를 처리합니다.
   * @param e
   */
  _onMouseDown(e: MouseEvent): void {
    if (this._selectionMode === GridSelectionMode.None) {
      return;
    }
    const { clientX: x, clientY: y } = e;
    this._mouseStart = { x, y };
    this._mouseMove = { x, y };
    this._mouseStartIsRowsHeader = false;
    this._mouseStartIsColumnsHeader = false;
    if (this._inHCF?.element === e.currentTarget) {
      if (this._selectionUnit === GridSelectionUnit.Column) {
        return;
      }
      this._mouseStartTarget = this._inHCF;
      this._mouseMoveScrollToZero.horizontal = true;
      this._mouseMoveScrollToZero.vertical = false;
      this._mouseStartIsColumnsHeader = true;
    } else if (this._inHCN?.element === e.currentTarget) {
      if (this._selectionUnit === GridSelectionUnit.Column) {
        return;
      }
      this._mouseStartTarget = this._inHCN;
      this._mouseMoveScrollToZero.horizontal = false;
      this._mouseMoveScrollToZero.vertical = false;
      this._mouseStartIsColumnsHeader = true;
    } else if (this._inHRF?.element === e.currentTarget) {
      if (this._selectionUnit === GridSelectionUnit.Row) {
        return;
      }
      this._mouseStartTarget = this._inHRF;
      this._mouseMoveScrollToZero.horizontal = false;
      this._mouseMoveScrollToZero.vertical = true;
      this._mouseStartIsRowsHeader = true;
    } else if (this._inHRN?.element === e.currentTarget) {
      if (this._selectionUnit === GridSelectionUnit.Row) {
        return;
      }
      this._mouseStartTarget = this._inHRN;
      this._mouseMoveScrollToZero.horizontal = false;
      this._mouseMoveScrollToZero.vertical = false;
      this._mouseStartIsRowsHeader = true;
    } else if (this._inBFF?.element === e.currentTarget) {
      this._mouseStartTarget = this._inBFF;
      this._mouseMoveScrollToZero.horizontal = true;
      this._mouseMoveScrollToZero.vertical = true;
    } else if (this._inBNF?.element === e.currentTarget) {
      this._mouseStartTarget = this._inBNF;
      this._mouseMoveScrollToZero.horizontal = false;
      this._mouseMoveScrollToZero.vertical = true;
    } else if (this._inBFN?.element === e.currentTarget) {
      this._mouseStartTarget = this._inBFN;
      this._mouseMoveScrollToZero.horizontal = true;
      this._mouseMoveScrollToZero.vertical = false;
    } else if (this._inBNN?.element === e.currentTarget) {
      this._mouseStartTarget = this._inBNN;
      this._mouseMoveScrollToZero.horizontal = false;
      this._mouseMoveScrollToZero.vertical = false;
    }

    this._mouseStartIsSelected = this._inBNN.isSelected({ x, y });
    this._mouseStartIsExtended =
      this._selectionMode === GridSelectionMode.Extended &&
      ((this.isMac && e.metaKey) || (!this.isMac && e.ctrlKey));
    if (
      !(
        !this._mouseStartIsExtended &&
        this._selectionMode === GridSelectionMode.Extended &&
        e.shiftKey &&
        this._inBNN.hasSelected
      )
    ) {
      this._selectIndex = this._mouseStartTarget.getIndex({ x, y });
      this._selectIndexBegin = { ...this._selectIndex };
      this._selectIndexPrevious = { ...this._selectIndex };
    }
    this._elementWrapper.removeEventListener(
      "wheel",
      this._wheelListener,
      false,
    );
    this._elementScroll.removeEventListener(
      "scroll",
      this._scrollListener,
      false,
    );
    window.addEventListener("mousemove", this._mouseMoveListener, false);
    window.addEventListener("mouseup", this._mouseUpListener, false);
    this._mouseMoveTick = true;
    this._mouseMoveTickListener();
  }

  /**
   * 마우스 이동 이벤트를 처리합니다.
   * @param e
   */
  _onMouseMove(e: MouseEvent): void {
    const { clientX: x, clientY: y } = e;
    this._mouseMove = { x, y };
  }

  /**
   * 마우스 이동 이벤트를 처리합니다.
   */
  _onMouseMoveTick(): void {
    const { x, y } = this._mouseMove;

    let mouseMoveTarget;
    if (!mouseMoveTarget && this._inBFF) {
      const bounds = this._inBFF.element.getBoundingClientRect();
      if (x < bounds.right && y < bounds.bottom) {
        mouseMoveTarget = this._inBFF;
        if (this._mouseStartIsRowsHeader) {
          mouseMoveTarget = this._inHRF;
        } else if (this._mouseStartIsColumnsHeader) {
          mouseMoveTarget = this._inHCF;
        }
      }
    }
    if (!mouseMoveTarget && this._inBNF) {
      const bounds = this._inBNF.element.getBoundingClientRect();
      if (x >= bounds.left && y < bounds.bottom) {
        mouseMoveTarget = this._inBNF;
        if (this._mouseStartIsRowsHeader) {
          mouseMoveTarget = this._inHRF;
        } else if (this._mouseStartIsColumnsHeader) {
          mouseMoveTarget = this._inHCN;
        }
      }
    }
    if (!mouseMoveTarget && this._inBFN) {
      const bounds = this._inBFN.element.getBoundingClientRect();
      if (x < bounds.right && y >= bounds.top) {
        mouseMoveTarget = this._inBFN;
        if (this._mouseStartIsRowsHeader) {
          mouseMoveTarget = this._inHRN;
        } else if (this._mouseStartIsColumnsHeader) {
          mouseMoveTarget = this._inHCF;
        }
      }
    }
    if (!mouseMoveTarget) {
      mouseMoveTarget = this._inBNN;
      if (this._mouseStartIsRowsHeader) {
        mouseMoveTarget = this._inHRN;
      } else if (this._mouseStartIsColumnsHeader) {
        mouseMoveTarget = this._inHCN;
      }
    }

    let mouseMove = { x, y };
    let mouseDirection = 0;
    if (this._scrollHorizontal || this._scrollVertical) {
      const scrollLeft = this._elementScroll.scrollLeft;
      const scrollTop = this._elementScroll.scrollTop;
      let { left, top, right, bottom } =
        this._inBNN.element.getBoundingClientRect();
      left += this._inBNN._location.x;
      top += this._inBNN._location.y;
      if (this._scrollHorizontal) {
        if (
          this._mouseMoveScrollToZero.horizontal &&
          (mouseMoveTarget === this._inHCN ||
            mouseMoveTarget === this._inBNF ||
            mouseMoveTarget === this._inBNN)
        ) {
          this._elementScroll.scrollLeft = 0;
          this._mouseMoveScrollToZero.horizontal = false;
        } else if (
          x < left &&
          (this._mouseStartTarget === this._inHCN ||
            this._mouseStartTarget === this._inBNF ||
            this._mouseStartTarget === this._inBNN)
        ) {
          this._elementScroll.scrollLeft -= left - x;
        } else if (x > right) {
          this._elementScroll.scrollLeft += x - right;
        }
      }
      if (this._scrollVertical) {
        if (
          this._mouseMoveScrollToZero.vertical &&
          (mouseMoveTarget === this._inHRN ||
            mouseMoveTarget === this._inBFN ||
            mouseMoveTarget === this._inBNN)
        ) {
          this._elementScroll.scrollTop = 0;
          this._mouseMoveScrollToZero.vertical = false;
        } else if (
          y < top &&
          (this._mouseStartTarget === this._inHRN ||
            this._mouseStartTarget === this._inBFN ||
            this._mouseStartTarget === this._inBNN)
        ) {
          this._elementScroll.scrollTop -= top - y;
        } else if (y > bottom) {
          this._elementScroll.scrollTop += y - bottom;
        }
      }
      if (scrollLeft < this._elementScroll.scrollLeft) {
        mouseMove = { x: right, y };
        mouseDirection |= Direction.right;
      }
      if (scrollLeft > this._elementScroll.scrollLeft) {
        mouseMove = { x: left, y };
        mouseDirection |= Direction.left;
      }
      if (scrollTop < this._elementScroll.scrollTop) {
        mouseMove = { x, y: bottom };
        mouseDirection |= Direction.down;
      }
      if (scrollTop > this._elementScroll.scrollTop) {
        mouseMove = { x, y: top };
        mouseDirection |= Direction.up;
      }
      if (mouseDirection) {
        const x = this._elementScroll.scrollLeft * this._scrollZoom.x;
        const y = this._elementScroll.scrollTop * this._scrollZoom.y;
        if (!this._columnsHeader.isCollapsed) {
          this._inHCN.scrollTo({ x, y: 0 });
        }
        if (!this._rowsHeader.isCollapsed) {
          this._inHRN.scrollTo({ x: 0, y });
        }
        if (this._inBNF) {
          this._inBNF.scrollTo({ x, y: 0 });
        }
        if (this._inBFN) {
          this._inBFN.scrollTo({ x: 0, y });
        }
        {
          this._inBNN.scrollTo({ x, y });
        }
      }
    }

    const currentIndex = mouseMoveTarget.getIndex(mouseMove);
    if ((mouseDirection & Direction.left) === Direction.left) {
      if (
        mouseMoveTarget === this._inHCF ||
        mouseMoveTarget === this._inBFF ||
        mouseMoveTarget === this._inBFN
      ) {
        currentIndex.columnBegin =
          this._mouseStartTarget.getIndex({ x, y }).columnBegin + 2;
      } else {
        currentIndex.columnBegin += 2;
      }
    } else if ((mouseDirection & Direction.right) === Direction.right) {
      currentIndex.columnEnd -= 2;
    }
    if ((mouseDirection & Direction.up) === Direction.up) {
      if (
        mouseMoveTarget === this._inHRF ||
        mouseMoveTarget === this._inBFF ||
        mouseMoveTarget === this._inBNF
      ) {
        currentIndex.rowBegin =
          this._mouseStartTarget.getIndex({ x, y }).rowBegin + 2;
      } else {
        currentIndex.rowBegin += 2;
      }
    } else if ((mouseDirection & Direction.down) === Direction.down) {
      currentIndex.rowEnd -= 2;
    }
    const bounds = {
      rowBegin: Math.min(
        this._selectIndexBegin.rowBegin,
        currentIndex.rowBegin,
      ),
      rowEnd: Math.max(this._selectIndexBegin.rowEnd, currentIndex.rowEnd),
      columnBegin: Math.min(
        this._selectIndexBegin.columnBegin,
        currentIndex.columnBegin,
      ),
      columnEnd: Math.max(
        this._selectIndexBegin.columnEnd,
        currentIndex.columnEnd,
      ),
    };
    if (
      this._mouseStartIsRowsHeader ||
      this._selectionUnit === GridSelectionUnit.Column
    ) {
      bounds.columnBegin = 0;
      bounds.columnEnd = this._columnsBN.length - 1;
    }
    if (
      this._mouseStartIsColumnsHeader ||
      this._selectionUnit === GridSelectionUnit.Row
    ) {
      bounds.rowBegin = 0;
      bounds.rowEnd = this._rowsBN.length - 1;
    }
    if (this._mouseStartIsExtended) {
      if (this._mouseStartIsSelected) {
        this._inBFF?.unselect(bounds);
        this._inBNF?.unselect(bounds);
        this._inBFN?.unselect(bounds);
        this._inBNN?.unselect(bounds);
      } else {
        this._inBFF?.select(bounds);
        this._inBNF?.select(bounds);
        this._inBFN?.select(bounds);
        this._inBNN?.select(bounds);
      }
    } else {
      this._inBFF?.unselect();
      this._inBNF?.unselect();
      this._inBFN?.unselect();
      this._inBNN?.unselect();
      this._inBFF?.select(bounds);
      this._inBNF?.select(bounds);
      this._inBFN?.select(bounds);
      this._inBNN?.select(bounds);
    }

    if (this._mouseMoveTick) {
      window.requestAnimationFrame(this._mouseMoveTickListener);
    }
  }

  /**
   * 마우스 업 이벤트를 처리합니다.
   */
  _onMouseUp(): void {
    this._mouseStart = undefined;
    this._mouseMoveTick = false;
    this._elementWrapper.addEventListener("wheel", this._wheelListener, false);
    this._elementScroll.addEventListener("scroll", this._scrollListener, false);
    window.removeEventListener("mousemove", this._mouseMoveListener, false);
    window.removeEventListener("mouseup", this._mouseUpListener, false);
  }
}
