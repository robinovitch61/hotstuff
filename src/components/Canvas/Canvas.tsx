import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppNode } from "../App";
import usePan from "./hooks/pan";
import useScale from "./hooks/scale";
import useWindowSize from "./hooks/resize";
import config from "../../config";

const { canvasHeightPerc, editorWidthPerc } = config;

type CanvasProps = {
  nodes: AppNode[];
  addNode: (node: AppNode) => void;
};

const StyledCanvas = styled.canvas`
  width: 100%;
  height: ${canvasHeightPerc * 100}vh;
  border: 1px solid black;
`;

export default function Canvas(props: CanvasProps) {
  const [offset, startPan] = usePan();
  const [windowWidth, windowHeight] = useWindowSize();
  const ref = useRef<HTMLCanvasElement | null>(null);
  const scale = useScale(ref);
  const [nodes, setNodes] = useState<AppNode[]>([]);

  function rescaleCanvas(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    const { devicePixelRatio: ratio = 1 } = window;
    canvas.width = windowWidth * (1 - editorWidthPerc) * ratio;
    canvas.height = windowHeight * canvasHeightPerc * ratio;
    context.scale(ratio, ratio);
  }

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }
    rescaleCanvas(canvas, context);
    context.beginPath();
    context.arc(50, 50, 50, 0, 2 * Math.PI);
    context.fill();
  }, [windowWidth, windowHeight]);

  return (
    <>
      <StyledCanvas ref={ref} onMouseDown={startPan} />
      <div>{JSON.stringify(offset)}</div>
      <div>{scale}</div>
      <div>{JSON.stringify(nodes)}</div>
    </>
  );
}
