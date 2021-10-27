import * as React from "react";
import styled from "styled-components/macro";
import { ColOption } from "./EditableTable";

const StyledSelect = styled.select`
  display: inline-flex;
  width: 100%;
  height: 100%;
  background: unset;
`;

export type DropDownTableCellProps = {
  rowId: string;
  options: ColOption[];
  setOption?: ColOption;
  onSelectOption: (id: string, option: ColOption) => void;
  optionsFilter?: (option: ColOption) => ColOption[];
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

  return (
    <StyledSelect value={props.setOption?.id} onChange={handleChange}>
      {props.options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.text}
        </option>
      ))}
    </StyledSelect>
  );
}
