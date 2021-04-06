import * as hs from "hotstuff-network";

const firstNode = hs.makeNode({
  name: "first",
  temperatureDegC: 10,
  capacitanceJPerDegK: 10000,
  powerGenW: 80,
  isBoundary: false,
});

const secondNode = hs.makeNode({
  name: "second",
  temperatureDegC: 40,
  capacitanceJPerDegK: 40000,
  powerGenW: -10,
  isBoundary: true,
});

const connection = hs.makeConnection({
  source: firstNode,
  target: secondNode,
  resistanceDegKPerW: 100,
  kind: "bi",
});

const results = hs.run({
  nodes: [firstNode, secondNode],
  connections: [connection],
  timeStepS: 0.01,
  totalTimeS: 0.03,
});

console.log(JSON.stringify(results, null, 2));
