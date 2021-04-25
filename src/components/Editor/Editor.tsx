import styled from "styled-components";
import config from "../../config";

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
  return (
    <StyledEditor width={props.width} height={props.height}>
      EDITOR
    </StyledEditor>
  );
}
