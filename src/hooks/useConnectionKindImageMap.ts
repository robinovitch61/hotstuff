import { useEffect, useState } from "react";
import { HSConnectionKind } from "hotstuff-network";
import connectionKindToImgSrc from "../utils/imageUtils";

export default function useConnectionKindImageMap(): Map<
  HSConnectionKind,
  HTMLImageElement
> {
  const [images, setImages] = useState<Map<HSConnectionKind, HTMLImageElement>>(
    new Map()
  );

  useEffect(() => {
    const connectionKinds: HSConnectionKind[] = ["cond", "conv", "rad"];
    connectionKinds.forEach((kind) => {
      const img = new Image();
      img.src = connectionKindToImgSrc(kind);
      img.onload = () => setImages((prev) => new Map(prev.set(kind, img)));
    });
  }, []);

  return images;
}
