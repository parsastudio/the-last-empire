import React, { useRef, useState } from "react";
import { useWebGLContext } from "@/presentation/hooks/tactical-map/final/use-webgl-context";
import { useWebGLMapRenderer } from "@/presentation/hooks/tactical-map/final/use-webgl-map-renderer";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { WebGLHoverHud } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";

interface WebGLMapCanvasProps {
  countries: CountryMapping[];
}

export function WebGLMapCanvas({ countries }: WebGLMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dimensions = useMapDimensions(containerRef);
  const gl = useWebGLContext(canvasRef, dimensions);

  const {
    scale,
    position,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMapGesture();

  useWebGLMapRenderer({
    gl,
    dimensions,
    position,
    scale,
    countries,
  });

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hoverData, setHoverData] = useState<unknown | null>(null);
  const facadeRef = useRef(new BitPackedStateFacade());

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;

    const mapX = Math.floor(((rx - position.x) / scale) * (4096 / rect.width));
    const mapY = Math.floor(((ry - position.y) / scale) * (2048 / rect.height));

    const inspected = facadeRef.current.inspectCoordinates(mapX, mapY);
    if (inspected) {
      setHoverPos({ x: e.clientX, y: e.clientY });
      setHoverData(inspected);
    } else {
      setHoverPos(null);
      setHoverData(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen absolute inset-0 bg-slate-950 overflow-hidden cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full block"
      />
      <WebGLHoverHud hoverPos={hoverPos} hoverData={hoverData} />
    </div>
  );
}
