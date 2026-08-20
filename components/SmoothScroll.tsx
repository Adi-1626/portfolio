"use client";

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";

// Mounted once near the root layout. `root` attaches Lenis directly to
// window/documentElement — no wrapper/content divs are injected, so nothing
// about the existing fixed-position layout (Nav, GravityGrid) needs to change.
// `anchors` makes every `<a href="#section">` in the app (Nav, Hero, mobile
// menu) smooth-scroll automatically, offset to clear the fixed 64px nav bar.
// `respectReducedMotion` defaults to true in Lenis core: under
// prefers-reduced-motion, smoothing is disabled and scrolls become instant
// automatically — no manual matchMedia check needed here.
export default function SmoothScroll() {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.1,
        anchors: { offset: -80 },
      }}
    />
  );
}
