import React from "react";
import styled from "styled-components/macro";
import { ColOption } from "./EditableTable";

const StyledSelect = styled.select`
  display: inline-flex;
  width: 100%;
  height: 100%;
`;

export type DropDownTableCellProps = {
  rowId: string;
  options: ColOption[];
  initialVal: string;
  onSelectOption: (id: string, option: ColOption) => void;
};

export default function DropDownTableCell(
  props: DropDownTableCellProps
): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = event.target.value;
    const selectedOption = props.options.filter(
      (option) => option.value === newVal
    )[0];
    props.onSelectOption(props.rowId, selectedOption);
  }

  return (
    <StyledSelect value={props.initialVal} onChange={handleChange}>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </StyledSelect>
  );
}
