import { useEffect, useState } from "react";
import { HSConnectionKind } from "hotstuff-network";
import link from "../img/link.png";
import hotsprings from "../img/hotsprings.png";
import sunny from "../img/sunny.png";

export default function useConnectionKindImageMap(): Map<
  HSConnectionKind,
  HTMLImageElement
> {
  const [images, setImages] = useState<Map<HSConnectionKind, HTMLImageElement>>(
    new Map()
  );

  useEffect(() => {
    const linkImage = new Image();
    linkImage.src = link;
    linkImage.onload = () =>
      setImages((prev) => new Map(prev.set("cond", linkImage)));

    const hotspringsImage = new Image();
    hotspringsImage.src = hotsprings;
    hotspringsImage.onload = () =>
      setImages((prev) => new Map(prev.set("conv", hotspringsImage)));

    const sunnyImage = new Image();
    sunnyImage.src = sunny;
    sunnyImage.onload = () =>
      setImages((prev) => new Map(prev.set("rad", sunnyImage)));
  }, []);

  return images;
}
