import * as React from "react";
import BooleanTableCell from "./BooleanTableCell";
import { Column, TableCompatibleType } from "./EditableTable";
import NumericalTableCell from "./NumericalTableCell";
import DropDownTableCell from "./DropDownTableCell";
import TextTableCell from "./TextTableCell";
import { StyledCell, StyledDeleteCell, StyledRow } from "./style";

export type TableRowProps<T extends TableCompatibleType> = {
  columns: Column<T>[];
  data: T;
  onUpdateRow: (data: T) => void;
  onDeleteRow: (data: T) => void;
  isActive: boolean;
  isDeletable: boolean;
  heightOffsetPx?: number;
};

export default function TableRow<T extends TableCompatibleType>(
  props: TableRowProps<T>
): React.ReactElement {
  return (
    <StyledRow heightOffsetPx={props.heightOffsetPx} isActive={props.isActive}>
      {props.columns.map((col) => {
        const cell =
          !!col.options && col.options.length > 0 && col.onSelectOption ? (
            <DropDownTableCell
              rowId={props.data.id}
              options={col.options}
              setOption={col.options.find(
                (option) =>
                  option.id === props.data[col.key] ||
                  option.text === props.data[col.key]
              )}
              onSelectOption={col.onSelectOption}
              optionsFilter={col.optionsFilter}
            />
          ) : typeof props.data[col.key] === "number" ? (
            <NumericalTableCell
              initialVal={props.data[col.key]}
              onBlur={(newVal) =>
                props.onUpdateRow({ ...props.data, [col.key]: newVal })
              }
            />
          ) : typeof props.data[col.key] === "string" ? (
            <TextTableCell
              initialVal={props.data[col.key]}
              onBlur={(newVal) =>
                props.onUpdateRow({ ...props.data, [col.key]: newVal })
              }
            />
          ) : (
            <BooleanTableCell
              initialIsActive={props.data[col.key]}
              onClick={(isActive) =>
                props.onUpdateRow({ ...props.data, [col.key]: !isActive })
              }
              showWhenActive={"✅"}
            />
          );
        return (
          <StyledCell
            key={col.key.toString()}
            width={col.width}
            minWidth={col.minWidthPx}
          >
            {cell}
          </StyledCell>
        );
      })}

      {props.isDeletable && (
        <StyledDeleteCell
          width={0.1}
          minWidth={40}
          onClick={() => props.onDeleteRow(props.data)}
        >
          ❌
        </StyledDeleteCell>
      )}
    </StyledRow>
  );
}
