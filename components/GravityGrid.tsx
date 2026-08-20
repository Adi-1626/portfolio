"use client";

import { useRef, useEffect } from "react";

export default function GravityGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Touch-only devices have no persistent cursor → static grid only
    const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const ANIMATED = !prefersReduced && !isTouch;

    const SPACING = 60;
    const GRID_COLOR = "rgba(255,255,255,0.028)";
    const EFFECT_RADIUS = 210;
    const CURSOR_LERP = 0.10;  // cursor lag: 0.10 = responsive but clearly trailing
    const PUSH_LERP = 0.16;    // how fast vertices spring toward push target
    const DECAY = 0.87;        // per-frame decay factor (spring-back speed)
    const PUSH_MAX = 24;       // max displacement in px at closest point

    let W = 0, H = 0, cols = 0, rows = 0;

    // Per-vertex displacement state (indexed [row][col])
    let vdx: Float32Array[] = [];
    let vdy: Float32Array[] = [];

    const allocArrays = (r: number, c: number) => {
      vdx = Array.from({ length: r + 2 }, () => new Float32Array(c + 2));
      vdy = Array.from({ length: r + 2 }, () => new Float32Array(c + 2));
    };

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cols = Math.ceil(W / SPACING) + 1;
      rows = Math.ceil(H / SPACING) + 1;
      allocArrays(rows, cols);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // ── Static draw (touch / reduced-motion) ─────────────────────────────────
    if (!ANIMATED) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * SPACING); ctx.lineTo(W, r * SPACING); ctx.stroke();
      }
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath(); ctx.moveTo(c * SPACING, 0); ctx.lineTo(c * SPACING, H); ctx.stroke();
      }
      return () => window.removeEventListener("resize", onResize);
    }

    // ── Animated path ─────────────────────────────────────────────────────────
    let rawX = -9999, rawY = -9999;
    let dampX = -9999, dampY = -9999;
    let prevDampX = -9999, prevDampY = -9999;
    let rafId = 0;
    let visible = true;

    const onMove = (e: MouseEvent) => { rawX = e.clientX; rawY = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Pause render when page section is off-screen (canvas covers full viewport
    // so it's always "intersecting" — we track page visibility instead)
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    const frame = () => {
      rafId = requestAnimationFrame(frame);
      if (!visible) return;

      ctx.clearRect(0, 0, W, H);

      // 1. Update damped cursor position
      prevDampX = dampX; prevDampY = dampY;
      if (rawX > -100) {
        if (dampX < -100) { dampX = rawX; dampY = rawY; } // first move: teleport
        dampX += (rawX - dampX) * CURSOR_LERP;
        dampY += (rawY - dampY) * CURSOR_LERP;
      }

      // Cursor speed (for glow flare)
      const speed = Math.sqrt((dampX - prevDampX) ** 2 + (dampY - prevDampY) ** 2);

      // 2. Cursor push: only affects vertices within EFFECT_RADIUS bounding box
      const hasCursor = rawX > -100;
      const cMin = hasCursor ? Math.max(0, Math.floor((dampX - EFFECT_RADIUS) / SPACING)) : 0;
      const cMax = hasCursor ? Math.min(cols, Math.ceil((dampX + EFFECT_RADIUS) / SPACING)) : -1;
      const rMin = hasCursor ? Math.max(0, Math.floor((dampY - EFFECT_RADIUS) / SPACING)) : 0;
      const rMax = hasCursor ? Math.min(rows, Math.ceil((dampY + EFFECT_RADIUS) / SPACING)) : -1;

      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          const bx = c * SPACING;
          const by = r * SPACING;
          const dvx = bx - dampX;
          const dvy = by - dampY;
          const dist2 = dvx * dvx + dvy * dvy;
          const dist = Math.sqrt(dist2);

          if (dist < EFFECT_RADIUS && dist > 1) {
            // Lens-like falloff: stronger at ~60% of radius, tails off at edge and center
            const t = dist / EFFECT_RADIUS;
            const lensStrength = PUSH_MAX * (1 - t) * (1 - t) / (1 + dist * 0.045);
            const nx = dvx / dist, ny = dvy / dist;
            const targetX = nx * lensStrength;
            const targetY = ny * lensStrength;
            // Spring toward push target
            vdx[r][c] += (targetX - vdx[r][c]) * PUSH_LERP;
            vdy[r][c] += (targetY - vdy[r][c]) * PUSH_LERP;
          }
        }
      }

      // 3. Decay all non-zero displacements (spring-back to rest)
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          if (vdx[r][c] !== 0) { vdx[r][c] *= DECAY; if (Math.abs(vdx[r][c]) < 0.005) vdx[r][c] = 0; }
          if (vdy[r][c] !== 0) { vdy[r][c] *= DECAY; if (Math.abs(vdy[r][c]) < 0.005) vdy[r][c] = 0; }
        }
      }

      // 4. Draw displaced grid
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;

      const px = (c: number, r: number) => ({
        x: c * SPACING + (vdx[r]?.[c] ?? 0),
        y: r * SPACING + (vdy[r]?.[c] ?? 0),
      });

      // Horizontal lines
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        const p0 = px(0, r);
        ctx.moveTo(p0.x, p0.y);
        for (let c = 1; c <= cols; c++) {
          const p = px(c, r);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Vertical lines
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        const p0 = px(c, 0);
        ctx.moveTo(p0.x, p0.y);
        for (let r = 1; r <= rows; r++) {
          const p = px(c, r);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // 5. Radial glow at damped cursor (speed-reactive size)
      if (hasCursor && dampX > -100) {
        const glowR = 155 + Math.min(speed * 5, 60);
        const grd = ctx.createRadialGradient(dampX, dampY, 0, dampX, dampY, glowR);
        grd.addColorStop(0,    "rgba(45,212,191,0.07)");
        grd.addColorStop(0.35, "rgba(45,212,191,0.04)");
        grd.addColorStop(0.7,  "rgba(45,212,191,0.015)");
        grd.addColorStop(1,    "rgba(45,212,191,0)");
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grd;
        ctx.fillRect(dampX - glowR, dampY - glowR, glowR * 2, glowR * 2);
        ctx.restore();
      }
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
