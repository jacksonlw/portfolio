import type { ReactNode } from "react";
import { animProps, type Motion } from "./anim";

/**
 * The main object's hard offset shadow: its shapes drawn twice, first as a solid silhouette offset
 * +4,+4 (ink; blue on an ink surface), then as themselves. Only the main object gets one.
 */
export function Shadowed({ dx = 4, dy = 4, children, ...motion }: { dx?: number; dy?: number; children: ReactNode } & Motion) {
  return (
    <g {...animProps(motion)}>
      <g className="ill-shadow" transform={`translate(${dx} ${dy})`}>
        {children}
      </g>
      {children}
    </g>
  );
}
