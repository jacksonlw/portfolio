"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * One IntersectionObserver for every illustration on the page (threshold 0.25). `observe` calls
 * back on each change of the element's visibility; it returns the function that stops it, or null
 * where there is no IntersectionObserver.
 */
type Callback = (visible: boolean) => void;
const callbacks = new WeakMap<Element, Callback>();
let shared: IntersectionObserver | null = null;

export function observe(el: Element, cb: Callback): (() => void) | null {
  if (typeof IntersectionObserver === "undefined") return null;
  shared ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) callbacks.get(e.target)?.(e.isIntersecting);
    },
    { threshold: 0.25 },
  );
  callbacks.set(el, cb);
  shared.observe(el);
  return () => {
    callbacks.delete(el);
    shared?.unobserve(el);
  };
}

/** True when motion should not play: the OS asks for less, or the gallery's switch is off. */
export function motionOff(el: Element): boolean {
  if (el.closest('[data-ill-motion="off"]')) return true;
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays the illustrations inside it when it scrolls into view: adds `.ill-in` once to itself and to
 * every `.ill` inside, and toggles `.ill-live` while it's on screen (illustrations.css pauses what's
 * off screen). Immediate under reduced motion or without IntersectionObserver.
 */
export function Reveal({
  as: Tag = "span",
  className,
  style,
  children,
}: {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = () => [el, ...el.querySelectorAll(".ill")];
    const set = (cls: string, on: boolean) => {
      for (const t of targets()) t.classList.toggle(cls, on);
    };
    const now = () => {
      set("ill-in", true);
      set("ill-live", true);
    };
    if (motionOff(el)) return now();
    const stop = observe(el, (visible) => {
      if (visible) set("ill-in", true);
      set("ill-live", visible);
    });
    if (!stop) return now();
    return stop;
  }, []);
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
