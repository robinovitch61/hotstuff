## hotstuff-network
This is the thermal model core logic that powers [thermalmodel.com](https://thermalmodel.com).

### Installation
```sh
npm i hotstuff-network
```

### Usage
```typescript
import { run, makeNode, makeConnection } from "hotstuff-network";

const firstNode = makeNode({
  name: "first",
  temperatureDegC: 10,
  capacitanceJPerDegK: 10000,
  powerGenW: 80,
  isBoundary: false,
});

const secondNode = makeNode({
  name: "second",
  temperatureDegC: 40,
  capacitanceJPerDegK: 40000,
  powerGenW: -10,
  isBoundary: true,
});

const connection = makeConnection({
  firstNode: firstNode,
  secondNode: secondNode,
  resistanceDegKPerW: 100,
  kind: "bi",
});

const results = run({
  nodes: [firstNode, secondNode],
  connections: [connection],
  timeStepS: 0.01,
  totalTimeS: 0.03,
});

console.log(JSON.stringify(results, null, 2)); // output below:
/*
{
  "timeSeriesS": [
    0,
    0.01,
    0.02,
    0.03
  ],
  "timeStepS": 0.01,
  "totalTimeS": 0.03,
  "numTimeSteps": 4,
  "nodeResults": [
    {
      "node": {
        "id": "KN67LAR1MXNXS",
        "name": "first",
        "temperatureDegC": 10,
        "capacitanceJPerDegK": 10000,
        "powerGenW": 80,
        "isBoundary": false
      },
      "tempDegC": [
        10,
        10.00008029999998,
        10.000160599999163,
        10.00024089999755
      ]
    },
    {
      "node": {
        "id": "KN67LAR1ZBD56",
        "name": "second",
        "temperatureDegC": 40,
        "capacitanceJPerDegK": 40000,
        "powerGenW": -10,
        "isBoundary": true
      },
      "tempDegC": [
        40,
        40,
        40,
        40
      ]
    }
  ],
  "connectionResults": [
    {
      "connection": {
        "id": "KN67LAR1ZSRZK",
        "firstNode": {
          "id": "KN67LAR1MXNXS",
          "name": "first",
          "temperatureDegC": 10,
          "capacitanceJPerDegK": 10000,
          "powerGenW": 80,
          "isBoundary": false
        },
        "secondNode": {
          "id": "KN67LAR1ZBD56",
          "name": "second",
          "temperatureDegC": 40,
          "capacitanceJPerDegK": 40000,
          "powerGenW": -10,
          "isBoundary": true
        },
        "resistanceDegKPerW": 100,
        "kind": "bi"
      },
      "heatTransferW": [
        -0.3,
        -0.2999991970000002,
        -0.2999983940000084,
        -0.2999975910000245
      ]
    }
  ]
}
 */
```

### Development

Running tests:
```shell
npm run test
```

Releasing a new version:
```shell
npm version patch/minor/major
npm publish
```
