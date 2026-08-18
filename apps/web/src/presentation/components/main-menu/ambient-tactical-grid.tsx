import React from "react";

export function AmbientTacticalGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-[30rem] h-[30rem] bg-gdp/5 rounded-full blur-3xl" />
      <div className="absolute top-12 left-12 font-mono text-[9px] text-muted-foreground/40 tracking-wider">
        SYS_REF: 44.2026.FA | EMPIRE_CORE
      </div>
      <div className="absolute bottom-12 right-12 font-mono text-[9px] text-muted-foreground/40 tracking-wider">
        GRID_LAT: 35.6892° N | LONG: 51.3890° E
      </div>
    </div>
  );
}
