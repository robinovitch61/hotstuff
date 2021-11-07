import { makeNode } from "hotstuff-network";
import config from "../config";
import { AppNode } from "../App";
import { Point } from "./pointUtils";

const { newNodeNamePrefix } = config;

export default function getNewAppNode(
  appNodes: AppNode[],
  center: Point
): AppNode {
  const numNodesWithDefaultPrefix = appNodes.filter((node) =>
    node.name.startsWith(newNodeNamePrefix)
  ).length;

  const newNode = makeNode({
    name:
      numNodesWithDefaultPrefix === 0
        ? `${newNodeNamePrefix}`
        : `${newNodeNamePrefix} (${numNodesWithDefaultPrefix + 1})`,
    temperatureDegC: config.defaultTempDegC,
    capacitanceJPerDegK: config.defaultCapJPerDegK,
    powerGenW: config.defaultPowerGenW,
    isBoundary: false,
  });

  return {
    ...newNode,
    center: center,
    isActive: false,
    textDirection: "D",
  };
}
