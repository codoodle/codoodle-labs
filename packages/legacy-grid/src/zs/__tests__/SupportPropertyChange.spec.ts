import { expect, test, vi } from "vitest";
import { SupportPropertyChange } from "../SupportPropertyChange";

class TestSupportPropertyChange extends SupportPropertyChange {
  _property1 = "";
  _property2 = 0;

  get property1() {
    return this._property1;
  }

  set property1(value) {
    if (this._property1 !== value) {
      const valuePrevious = this._property1;
      this._property1 = value;
      this.notifyPropertyChanged("property1", this._property1, valuePrevious);
    }
  }

  get property2() {
    return this._property2;
  }

  set property2(value) {
    if (this._property2 !== value) {
      const valuePrevious = this._property2;
      this._property2 = value;
      this.notifyPropertyChanged("property2", this._property2, valuePrevious);
    }
  }
}

const mockOnPropertyChanged = vi.fn();
test("SupportPropertyChange", () => {
  const supportEvent = new TestSupportPropertyChange();
  supportEvent.on("property1Changed", mockOnPropertyChanged);
  supportEvent.on("property2Changed", mockOnPropertyChanged);
  supportEvent.on("property2Changed", mockOnPropertyChanged);

  expect(mockOnPropertyChanged).not.toHaveBeenCalled();
  expect(supportEvent.isPropertyChanged).toBeFalsy();

  supportEvent.property1 = "--";
  expect(supportEvent.isPropertyChanged).toBeTruthy();
  expect(mockOnPropertyChanged).toBeCalledTimes(1);
  expect(mockOnPropertyChanged).toHaveBeenCalledWith({
    name: "property1Changed",
    source: supportEvent,
    propertyName: "property1",
    value: "--",
    valuePrevious: "",
  });

  supportEvent.property1 = "--";
  expect(supportEvent.isPropertyChanged).toBeTruthy();
  expect(mockOnPropertyChanged).toBeCalledTimes(1);
  expect(mockOnPropertyChanged).toHaveBeenCalledWith({
    name: "property1Changed",
    source: supportEvent,
    propertyName: "property1",
    value: "--",
    valuePrevious: "",
  });

  supportEvent.property2 = 1;
  expect(supportEvent.isPropertyChanged).toBeTruthy();
  expect(mockOnPropertyChanged).toBeCalledTimes(2);
  expect(mockOnPropertyChanged).toHaveBeenCalledWith({
    name: "property2Changed",
    source: supportEvent,
    propertyName: "property2",
    value: 1,
    valuePrevious: 0,
  });

  expect(supportEvent.propertyChanges).toEqual([
    {
      name: "property1Changed",
      source: supportEvent,
      propertyName: "property1",
      value: "--",
      valuePrevious: "",
    },
    {
      name: "property2Changed",
      source: supportEvent,
      propertyName: "property2",
      value: 1,
      valuePrevious: 0,
    },
  ]);

  supportEvent.clearPropertyChanges();
  expect(supportEvent.isPropertyChanged).toBeFalsy();
  expect(supportEvent.propertyChanges).toEqual([]);
});
