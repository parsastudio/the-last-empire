import { useState, useEffect, RefObject } from "react";

export function useMapDimensions(
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return dimensions;
}
