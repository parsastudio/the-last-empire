import React from "react";

interface TacticalViewportProps {
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

export function TacticalViewport({
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
}: TacticalViewportProps) {
  return (
    <div
      ref={containerRef}
      className={`w-screen h-screen absolute inset-0 bg-slate-950 overflow-hidden cursor-grab ${
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
      <canvas
        ref={canvasDestRef}
        className="pointer-events-none absolute inset-0 w-full h-full block"
      />
      {children}
    </div>
  );
}
