import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import config from "../../config";
import EditableTable, { SortDirection, SortState } from "./EditableTable";

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

export type RegionData = {
  regionName: string;
  code: string;
  value: number;
};

const defaultRegionData: RegionData[] = [
  { regionName: "Alabama", code: "AL", value: 89 },
  { regionName: "Alaska", code: "AK", value: 112 },
  { regionName: "Arizona", code: "AZ", value: 101 },
  { regionName: "Arkansas", code: "AR", value: 123 },
  { regionName: "California", code: "CA", value: 145 },
  { regionName: "Colorado", code: "CO", value: 98 },
  { regionName: "Connecticut", code: "CT", value: 101 },
  { regionName: "Delaware", code: "DE", value: 109 },
  { regionName: "Florida", code: "FL", value: 122 },
  { regionName: "Georgia", code: "GA", value: 91 },
  { regionName: "Hawaii", code: "HI", value: 131 },
  { regionName: "Idaho", code: "ID", value: 110 },
  { regionName: "Illinois", code: "IL", value: 134 },
  { regionName: "Indiana", code: "IN", value: 94 },
  { regionName: "Iowa", code: "IA", value: 106 },
  { regionName: "Kansa", code: "KS", value: 116 },
  { regionName: "Kentucky", code: "KY", value: 122 },
  { regionName: "Lousiana", code: "LA", value: 99 },
  { regionName: "Maine", code: "ME", value: 100 },
  { regionName: "Maryland", code: "MD", value: 101 },
  { regionName: "Massachusetts", code: "MA", value: 102 },
  { regionName: "Michigan", code: "MI", value: 104 },
  { regionName: "Minnesota", code: "MN", value: 112 },
  { regionName: "Mississippi", code: "MS", value: 105 },
  { regionName: "Missouri", code: "MO", value: 116 },
  { regionName: "Montana", code: "MT", value: 107 },
  { regionName: "Nebraska", code: "NE", value: 97 },
  { regionName: "Nevada", code: "NV", value: 108 },
  { regionName: "New Hampshire", code: "NH", value: 118 },
  { regionName: "New Jersey", code: "NJ", value: 98 },
  { regionName: "New Mexico", code: "NM", value: 109 },
  { regionName: "New York", code: "NY", value: 119 },
  { regionName: "North Carolina", code: "NC", value: 99 },
  { regionName: "North Dakota", code: "ND", value: 100 },
  { regionName: "Ohio", code: "OH", value: 126 },
  { regionName: "Oklahoma", code: "OK", value: 125 },
  { regionName: "Oregon", code: "OR", value: 124 },
  { regionName: "Pennsylvania", code: "PA", value: 122 },
  { regionName: "Rhode Island", code: "RI", value: 122 },
  { regionName: "South Carolina", code: "SC", value: 141 },
  { regionName: "South Dakota", code: "SD", value: 131 },
  { regionName: "Tennessee", code: "TN", value: 132 },
  { regionName: "Texas", code: "TX", value: 133 },
  { regionName: "Utah", code: "UT", value: 134 },
  { regionName: "Vermont", code: "VT", value: 121 },
  { regionName: "Virginia", code: "VA", value: 122 },
  { regionName: "Washington", code: "WA", value: 91 },
  { regionName: "West Virginia", code: "WV", value: 92 },
  { regionName: "Wisconsin", code: "WI", value: 93 },
  { regionName: "Wyoming", code: "WY", value: 94 },
];

const defaultSortState: SortState = { key: "regionName", direction: "ASC" };

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
