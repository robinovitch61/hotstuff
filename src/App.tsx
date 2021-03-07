import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import * as R from 'ramda';

interface ComponentProps {
  //Your component props
}

export default function App(props: ComponentProps) {
  let translateX = 0;
  let translateY = 0;
  let scaleFactor = 1;
  const scaleIncrement = 0.03;

  const handleMouseWheel = (p5: p5Types, event: WheelEvent) => {
    const requestedScroll = event.deltaY;
    const scaleAdjustment = requestedScroll < 0 ? 1 + scaleIncrement : 1 - scaleIncrement;
    scaleFactor *= scaleAdjustment;
    translateX = p5.mouseX * (1 - scaleAdjustment) + translateX * scaleAdjustment;
    translateY = p5.mouseY * (1 - scaleAdjustment) + translateY * scaleAdjustment;
  };

  function setup(p5: p5Types) {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.mouseWheel((event: WheelEvent) => handleMouseWheel(p5, event));
  }

  function draw(p5: p5Types) {
    p5.background(255);
    p5.translate(translateX, translateY);
    p5.scale(scaleFactor);
    p5.rect(100, 100, 100, 100);
    p5.rect(50, 50, 100, 100);

    if (p5.mouseIsPressed) {
      translateX -= p5.pmouseX - p5.mouseX;
      translateY -= p5.pmouseY - p5.mouseY;
    }
  }

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
      <Sketch
          setup={setup}
          draw={draw}
          windowResized={windowResized}
      />
  );
};
