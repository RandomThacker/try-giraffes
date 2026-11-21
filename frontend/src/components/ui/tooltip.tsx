"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
};

type Coords = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

export function Tooltip({ label, children, side = "top", className = "" }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    function place() {
      const trigger = triggerRef.current;
      const tip = tipRef.current;
      if (!trigger || !tip) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const tipWidth = tip.offsetWidth;
      const tipHeight = tip.offsetHeight;
      const gap = 8;
      const preferTop = side === "top";
      const fitsTop = rect.top >= tipHeight + gap + 4;
      const placement: "top" | "bottom" = preferTop
        ? fitsTop
          ? "top"
          : "bottom"
        : rect.bottom + tipHeight + gap <= window.innerHeight
          ? "bottom"
          : "top";

      let left = rect.left + rect.width / 2 - tipWidth / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));
      const top =
        placement === "top" ? rect.top - tipHeight - gap : rect.bottom + gap;

      setCoords({ top, left, placement });
    }

    const frame = window.requestAnimationFrame(place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, side, label]);

  return (
    <span
      ref={triggerRef}
      className={`inline-flex shrink-0 ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setCoords(null);
      }}
      onFocus={() => setOpen(true)}
      onBlur={() => {
        setOpen(false);
        setCoords(null);
      }}
    >
      {children}
      {open
        ? createPortal(
            <span
              ref={tipRef}
              role="tooltip"
              style={{
                position: "fixed",
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                visibility: coords ? "visible" : "hidden",
              }}
              className="pointer-events-none z-[100] whitespace-nowrap rounded-[8px] bg-[#2B2B38] px-2.5 py-1 text-[12px] font-medium text-white shadow-[0_8px_20px_rgba(30,35,70,0.18)]"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
