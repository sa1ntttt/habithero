import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  glow?: string;
};

export function CardSurface({ children, className = "", style, glow }: Props) {
  const shadow = glow
    ? `0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 30px -10px ${glow}`
    : "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 12px rgba(0,0,0,0.3)";
  return (
    <div
      className={`rounded-2xl bg-ink-surface border border-line ${className}`}
      style={{ boxShadow: shadow, ...style }}
    >
      {children}
    </div>
  );
}
