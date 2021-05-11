import styled from "styled-components/macro";

export const StyledInput = styled.input`
  display: inline-block;
  border: none;
  width: 100%;
  height: 100%;
  text-align: center;
  padding: 0;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
