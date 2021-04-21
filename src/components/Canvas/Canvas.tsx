import { useRef, useState } from "react";
import styled from "styled-components";
import { AppNode } from "../App";
import usePan from "./hooks/pan";
import useScale from "./hooks/scale";

type CanvasProps = {
  nodes: AppNode[];
  addNode: (node: AppNode) => void;
};

const StyledCanvas = styled.div`
  /* width: 50vw;
  height: 50vh;
  border: 1px solid black; */
`;

export default function Canvas(props: CanvasProps) {
  const [offset, startPan] = usePan();
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useScale(ref);
  const [nodes, setNodes] = useState<AppNode[]>([]);

  return (
    <StyledCanvas ref={ref} onMouseDown={startPan}>
      <div>{JSON.stringify(offset)}</div>
      <div>{scale}</div>
      <div>{JSON.stringify(nodes)}</div>
    </StyledCanvas>
  );
}
