import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import config from "../../config";
import EditableTable, {
  SortDirection,
  SortState,
} from "./EditableTable/EditableTable";

const { editorWidthPerc } = config;

const StyledEditor = styled.div<{ width: number; height: number }>`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  border: 1px solid orange;
`;

type EditorProps = {
  width: number;
  height: number;
};

export default function Editor(props: EditorProps) {
  const [regionData, setRegionData] = useState(defaultRegionData);
  const [sortState, setSortState] = useState<SortState>(defaultSortState);

  function updateRow(regionName: string, newValue: number) {
    setRegionData(
      regionData.map((data) =>
        data.regionName === regionName ? { ...data, value: newValue } : data
      )
    );
  }

  function onDeleteRow(regionName: string, code: string) {
    setRegionData(
      regionData.filter(
        (data) => !(data.regionName === regionName && data.code === code)
      )
    );
  }

  function toggleSortDirection(
    sortKey: keyof RegionData,
    direction: SortDirection
  ) {
    if (direction === "ASC") {
      setRegionData(
        [...regionData].sort((first, second) =>
          first[sortKey] > second[sortKey] ? 1 : -1
        )
      );
    } else {
      setRegionData(
        [...regionData].sort((first, second) =>
          first[sortKey] > second[sortKey] ? -1 : 1
        )
      );
    }
    setSortState({ key: sortKey, direction });
  }

  return (
    <StyledEditor width={props.width} height={props.height}>
      {/* <EditableTable
        regionData={regionData}
        updateRow={updateRow}
        onDeleteRow={onDeleteRow}
        toggleSortDirection={toggleSortDirection}
        sortState={sortState}
      /> */}
    </StyledEditor>
  );
}
