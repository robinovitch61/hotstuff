import React, { useCallback, useMemo, useState } from "react";
import config from "../../../../config";
import { AppConnection, AppNode } from "../../../../App";
import {
  StyledCell,
  StyledColHeader,
  StyledColText,
  StyledDeleteCell,
  StyledHeaderWrapper,
  StyledRow,
  StyledSortIcon,
  StyledTable,
  StyledTableBody,
  StyledTableWrapper,
} from "../style";
import DropDownTableCell from "../cells/DropDownTableCell";
import TextTableCell from "../cells/TextTableCell";
import NumericalTableCell from "../cells/NumericalTableCell";
import BooleanTableCell from "../cells/BooleanTableCell";
import { CellOption, SortDirection } from "../types";

export type AppConnectionTable = AppConnection & { isActive: boolean };

export type ConnectionTableProps = {
  rows: AppConnection[];
  nodes: AppNode[];
  onUpdateRow: (row: AppConnection) => void;
  onDeleteRow: (row: AppConnection) => void;
};

export type ConnectionTableColumn = {
  text: string;
  key: keyof AppConnection;
  width: number; // 0 to 1
  minWidthPx?: number;
  options?: CellOption[];
  onSelectOption?: (id: string, option: CellOption) => void;
};

type ConnectionTableSortState = {
  key: keyof AppConnectionTable;
  direction: SortDirection;
};

const defaultConnectionSortState: ConnectionTableSortState = {
  key: "source",
  direction: "ASC",
};

const connectionTypes: CellOption[] = [
  {
    id: "bi",
    text: "Bidirectional",
  },
  {
    id: "uni",
    text: "Unidirectional",
  },
  {
    id: "rad",
    text: "Radiative",
  },
];

// TODO LEO: Cannot select option that would create a duplicate connection
function filterOutSelfConnectionOption(
  colKey: string,
  options: CellOption[],
  selectedSourceId: string,
  selectedTargetId: string
): CellOption[] {
  if (colKey === "sourceName") {
    return options.filter((option) => option.id !== selectedTargetId);
  } else if (colKey === "targetName") {
    return options.filter((option) => option.id !== selectedSourceId);
  } else {
    return options;
  }
}

export default function ConnectionTable(
  props: ConnectionTableProps
): React.ReactElement {
  const [sortState, setSortState] = useState<ConnectionTableSortState>(
    defaultConnectionSortState
  );

  const nodeOptions: CellOption[] = props.nodes.map((node) => ({
    id: node.id,
    text: node.name,
  }));

  const onSelectNewSource = useCallback(
    (id: string, option: CellOption) => {
      const connection = props.rows.find((conn) => conn.id === id);
      const newSourceNode = props.nodes.find((node) => node.id === option.id);
      if (
        !connection ||
        !newSourceNode ||
        newSourceNode.id === connection.target.id
      ) {
        return;
      }
      props.onUpdateRow({
        ...connection,
        source: newSourceNode,
        sourceName: newSourceNode.name,
      });
    },
    [props]
  );

  const onSelectNewTarget = useCallback(
    (id: string, option: CellOption) => {
      const connection = props.rows.find((conn) => conn.id === id);
      const newTargetNode = props.nodes.find((node) => node.id === option.id);
      if (
        !connection ||
        !newTargetNode ||
        newTargetNode.id === connection.source.id
      ) {
        return;
      }
      props.onUpdateRow({
        ...connection,
        target: newTargetNode,
        targetName: newTargetNode.name,
      });
    },
    [props]
  );

  const connectionColumns: ConnectionTableColumn[] = useMemo(
    () => [
      {
        text: "Source",
        key: "sourceName",
        width: 0.25,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewSource,
      },
      {
        text: "Target",
        key: "targetName",
        width: 0.25,
        minWidthPx: 100,
        options: nodeOptions,
        onSelectOption: onSelectNewTarget,
      },
      {
        text: "Resistance degK/W",
        key: "resistanceDegKPerW",
        width: 0.25,
        minWidthPx: 100,
      },
      {
        text: "Kind",
        key: "kind",
        width: 0.25,
        minWidthPx: 100,
        options: connectionTypes,
        onSelectOption: (id: string, option: CellOption) =>
          props.onUpdateRow({
            ...props.rows.filter((conn) => conn.id === id)[0],
            kind: option.id as "bi" | "uni" | "rad",
          }),
      },
    ],
    [nodeOptions, onSelectNewSource, onSelectNewTarget, props]
  );

  function sortByState(
    first: AppConnectionTable,
    second: AppConnectionTable
  ): number {
    if (first[sortState.key] > second[sortState.key]) {
      return sortState.direction === "ASC" ? 1 : -1;
    } else {
      return sortState.direction === "ASC" ? -1 : 1;
    }
  }

  const activeNodeIds = props.nodes
    .filter((node) => node.isActive)
    .map((node) => node.id);

  const sortedRowsWithIsActive: AppConnectionTable[] = props.rows
    .map((row) => {
      return {
        ...row,
        isActive:
          activeNodeIds.includes(row.source.id) ||
          activeNodeIds.includes(row.target.id),
      };
    })
    .sort(sortByState);

  const tableRows = sortedRowsWithIsActive.map((row) => {
    return (
      <StyledRow
        key={row.id}
        heightOffsetPx={config.tabHeightPx}
        isActive={row.isActive}
      >
        {connectionColumns.map((col) => {
          const initialVal = row[col.key];
          const tableCell =
            !!col.options && col.options.length > 0 && col.onSelectOption ? (
              <DropDownTableCell
                rowId={row.id}
                options={filterOutSelfConnectionOption(
                  col.key,
                  col.options,
                  row.source.id,
                  row.target.id
                )}
                setOption={col.options.find(
                  (option) =>
                    option.id === row[col.key] || option.text === row[col.key]
                )}
                onSelectOption={col.onSelectOption}
              />
            ) : typeof initialVal === "string" ? (
              <TextTableCell
                initialVal={initialVal}
                onBlur={(newVal) =>
                  props.onUpdateRow({ ...row, [col.key]: newVal })
                }
              />
            ) : typeof initialVal === "number" &&
              typeof row[col.key] === "number" ? (
              <NumericalTableCell
                initialVal={initialVal}
                onBlur={(newVal) =>
                  props.onUpdateRow({ ...row, [col.key]: newVal })
                }
              />
            ) : typeof initialVal === "boolean" ? (
              <BooleanTableCell
                initialIsActive={initialVal}
                onClick={(newVal) =>
                  props.onUpdateRow({ ...row, [col.key]: newVal })
                }
                showWhenActive={"✅"}
              />
            ) : (
              <></>
            );
          return (
            <StyledCell
              key={col.key}
              width={col.width}
              minWidth={col.minWidthPx}
            >
              {tableCell}
            </StyledCell>
          );
        })}
        <StyledDeleteCell
          width={0.1}
          minWidth={40}
          onClick={() => props.onDeleteRow(row)}
        >
          ❌
        </StyledDeleteCell>
      </StyledRow>
    );
  });

  const sortIcon = !sortState
    ? ""
    : sortState.direction === "ASC"
    ? "\u25B2"
    : "\u25BC";

  function oppositeSortDirection(sortDirection: SortDirection): SortDirection {
    return sortDirection === "ASC" ? "DESC" : "ASC";
  }

  return (
    <StyledTableWrapper>
      <StyledTable>
        <StyledHeaderWrapper heightOffsetPx={config.tabHeightPx}>
          {connectionColumns.map((col) => {
            const isSortedCol = sortState && sortState.key === col.key;
            const onClick = () => {
              setSortState({
                key: col.key,
                direction:
                  !isSortedCol || !sortState
                    ? "ASC"
                    : oppositeSortDirection(sortState.direction),
              });
            };

            return (
              <StyledColHeader
                key={col.key.toString()}
                onClick={onClick}
                width={col.width}
                minWidth={col.minWidthPx}
              >
                <StyledColText>{col.text}</StyledColText>
                <StyledSortIcon>{isSortedCol ? sortIcon : ""}</StyledSortIcon>
              </StyledColHeader>
            );
          })}
          <StyledColHeader
            width={0.1}
            minWidth={40}
            style={{ cursor: "unset" }}
          />
        </StyledHeaderWrapper>
        <StyledTableBody>{tableRows}</StyledTableBody>
      </StyledTable>
    </StyledTableWrapper>
  );
}
