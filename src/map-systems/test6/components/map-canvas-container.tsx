import React from "react";

interface MapCanvasContainerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasDestRef: React.RefObject<HTMLCanvasElement | null>;
  canvasSrcRef: React.RefObject<HTMLCanvasElement | null>;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}

export function MapCanvasContainer({
  containerRef,
  canvasDestRef,
  canvasSrcRef,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onClick,
  children,
}: MapCanvasContainerProps) {
  return (
    <div
      ref={containerRef}
      className={`flex-1 relative bg-slate-950 overflow-hidden cursor-grab ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onClick={onClick}
    >
      <canvas ref={canvasSrcRef} className="hidden" />

      <div className="w-full h-full absolute inset-0">
        <canvas
          ref={canvasDestRef}
          className="pointer-events-none w-full h-full"
          style={{
            filter:
              "drop-shadow(0 2px 4px rgba(25, 35, 55, 0.15)) drop-shadow(0 1px 2px rgba(25, 35, 55, 0.08))",
          }}
        />
      </div>

      {children}
    </div>
  );
}
