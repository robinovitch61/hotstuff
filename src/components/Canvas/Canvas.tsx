import {HotNode} from "../App";
import usePan from "./hooks/pan";
import styled from "styled-components";
import useScale from "./hooks/scale";
import {useRef} from "react";
import useNodes from "./hooks/nodes";

type CanvasProps = {
  nodes: HotNode[]
  addNode: (node: HotNode) => void
}

const StyledCanvas = styled.div`
  width: 50vw;
  height: 50vh;
  border: 1px solid black;
`;

// TODO: CONTINUE READING https://reactjs.org/docs/hooks-effect.html#tips-for-using-effects
export default function Canvas(props: CanvasProps) {
  const [offset, startPan] = usePan();
  const ref = useRef<HTMLDivElement | null>(null);
  const scale = useScale(ref);
  const [nodes, addNode] = useNodes(props.nodes);

  return (
    <StyledCanvas ref={ref} onMouseDown={startPan} onDoubleClick={addNode}>
      <div>{JSON.stringify(offset)}</div>
      <div>{scale}</div>
      <div>{JSON.stringify(nodes)}</div>
    </StyledCanvas>
  );
}