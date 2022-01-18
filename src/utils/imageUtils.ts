import { HSConnectionKind } from "hotstuff-network";
import hotsprings from "../img/hotsprings.png";
import link from "../img/link.png";
import sunny from "../img/sunny.png";

export default function connectionKindToImgSrc(
  connectionKind: HSConnectionKind
): string {
  switch (connectionKind) {
    case "conv":
      return hotsprings;
    case "cond":
      return link;
    default:
      return sunny;
  }
}
