import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import * as R from 'ramda';

interface ComponentProps {
  //Your component props
}

export default function App(props: ComponentProps) {
  var img: p5Types.Image;
  var w: number, h: number, tow: number, toh: number;
  var x: number, y: number, tox: number, toy: number;
  var zoom = .01; //zoom step per mouse tick

  function preload(p5: p5Types) {
    img = p5.loadImage("https://i.imgur.com/9dbblSn.jpg");
  }

  const handleMouseWheel = (p5: p5Types, event: WheelEvent) => {
    const scrollAmount = -event.deltaY;

    if (scrollAmount > 0) { // zoom in
      for (var i = 0; i < scrollAmount; i++) {
        // if (tow > 30 * p5.width) return; //max zoom
        tox -= zoom * (p5.mouseX - tox);
        toy -= zoom * (p5.mouseY - toy);
        tow *= zoom + 1;
        toh *= zoom + 1;
      }
    }

    if (scrollAmount < 0) { // zoom out
      for (var i = 0; i < -scrollAmount; i++) {
        // if (tow < p5.width) return; //min zoom
        tox += zoom / (zoom + 1) * (p5.mouseX - tox);
        toy += zoom / (zoom + 1) * (p5.mouseY - toy);
        toh /= zoom + 1;
        tow /= zoom + 1;
      }
    }
  };

  function setup(p5: p5Types) {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.mouseWheel((event: WheelEvent) => handleMouseWheel(p5, event));
    w = tow = img.width;
    h = toh = img.height;
    x = tox = w / 2;
    y = toy = h / 2;
  }

  function draw(p5: p5Types) {
    p5.background('red');

    //
    x = p5.lerp(x, tox, .1);
    // console.log(x);
    // console.log(tox);
    y = p5.lerp(y, toy, .1);
    w = p5.lerp(w, tow, .1);
    h = p5.lerp(h, toh, .1);

    p5.image(img, x - w / 2, y - h / 2, w, h);
  }

  function mouseDragged(p5: p5Types) {
    tox += p5.mouseX - p5.pmouseX;
    toy += p5.mouseY - p5.pmouseY;
  }


  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
      <Sketch
          preload={preload}
          setup={setup}
          draw={draw}
          windowResized={windowResized}
          mouseDragged={mouseDragged}
      />
  );
};
