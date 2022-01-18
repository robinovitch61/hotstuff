import * as React from "react";
import { CellOption } from "../types";
import DropDown from "../../DropDown";

export type DropDownTableCellProps = {
  rowId: string;
  options: CellOption[];
  setOption?: CellOption;
  onSelectOption: (id: string, option: CellOption) => void;
  optionsFilter?: (option: CellOption) => CellOption[];
};

export default function DropDownTableCell(
  props: DropDownTableCellProps
): React.ReactElement {
  function handleChange(newVal: CellOption) {
    const selectedOption = props.options.find(
      (option) => option.id === newVal.id
    );

    if (selectedOption !== undefined) {
      props.onSelectOption(props.rowId, selectedOption);
    }
  }

  const setOption = props.setOption;
  if (!setOption) {
    return <></>;
  }

  return (
    <DropDown
      value={setOption}
      options={props.options.filter((option) => option.id !== setOption.id)}
      onChange={handleChange}
    />
  );
}
