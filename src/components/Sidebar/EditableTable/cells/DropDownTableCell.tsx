import * as React from "react";
import styled from "styled-components/macro";
import { CellOption } from "../types";

const StyledSelect = styled.select`
  display: inline-flex;
  width: 100%;
  height: 100%;
  background: unset;
`;

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
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = event.target.value;

    const selectedOption = props.options.find((option) => option.id === newVal);

    if (selectedOption !== undefined) {
      props.onSelectOption(props.rowId, selectedOption);
    }
  }

  const killMousePropagation = (event: React.MouseEvent) => {
    // necessary for firefox
    // https://github.com/facebook/react/issues/12584
    event.stopPropagation();
  };

  return (
    <StyledSelect
      value={props.setOption?.id}
      onMouseDown={killMousePropagation}
      onMouseUp={killMousePropagation}
      onChange={handleChange}
    >
      {props.options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.text}
        </option>
      ))}
    </StyledSelect>
  );
}
