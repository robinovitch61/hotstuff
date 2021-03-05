import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";

interface ComponentProps {
  //Your component props
}

export default function App(props: ComponentProps) {
  const x = 50;
  const y = 50;

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background(0);
    Array.from(Array(100).keys()).map(ystart => p5.ellipse(x, ystart * 10, x, x));
    x++;
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  }

  return <Sketch setup={setup} draw={draw} windowResized={windowResized}/>;
};
