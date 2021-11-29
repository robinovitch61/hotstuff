import styled from "styled-components/macro";

export const StyledTableWrapper = styled.div`
  width: 100%;
`;

export const StyledTable = styled.div`
  width: 100%;
  border-collapse: collapse;
`;

export const StyledTableBody = styled.div`
  width: 100%;
`;

export const StyledAddButton = styled.button``;

export const StyledRow = styled.div<{
  heightOffsetPx?: number;
  isActive: boolean;
}>`
  display: inline-flex;
  align-items: center;
  min-width: 100%;
  position: sticky;
  top: ${({ heightOffsetPx }) =>
    heightOffsetPx ? `${heightOffsetPx}px` : "0px"};
  background: ${({ isActive }) =>
    isActive ? "rgba(112, 165, 255, 0.2)" : "none"};
`;

export const StyledCell = styled.div<{
  width?: number;
  minWidth?: number;
}>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  height: 2em;
  width: ${({ width }) => (!!width ? `${width * 100}%` : "none")};
  min-width: ${({ minWidth }) => (!!minWidth ? `${minWidth}px` : "none")};
`;

export const StyledDeleteCell = styled(StyledCell)`
  cursor: pointer;
  user-select: none;
  min-width: 40px;

  &:hover {
    background: black;
  }
`;

export const StyledHeaderWrapper = styled.div<{ heightOffsetPx?: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  position: sticky;
  top: ${({ heightOffsetPx }) =>
    heightOffsetPx ? `${heightOffsetPx}px` : "0px"};
  z-index: 1;
`;

export const StyledColHeader = styled.div<{
  widthPercent?: number;
  minWidthPx?: number;
}>`
  display: inline-flex;
  width: ${({ widthPercent }) =>
    !!widthPercent ? `${widthPercent * 100}%` : "none"};
  min-width: ${({ minWidthPx }) => (!!minWidthPx ? `${minWidthPx}px` : "none")};
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border: 1px solid lightgrey;
  cursor: pointer;
  user-select: none;
  position: relative;
  background: white;
  border-bottom: 1px solid black;
`;

export const StyledColText = styled.div`
  font-size: 0.8em;
  padding: 1em;
`;

export const StyledSortIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 50%;
  transform: translate(50%);
`;
