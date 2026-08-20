"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { resume } from "@/data/resume";
import dynamic from "next/dynamic";
import Magnetic from "./Magnetic";

// Live IST clock — renders nothing until mounted so the server-rendered
// (timeless) markup matches the client's first paint, avoiding a hydration
// mismatch on a value that changes every second.
function LocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date());
    setTime(format());
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time === null) return null;

  return (
    <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontVariantNumeric: "tabular-nums", color: "var(--color-text-muted)", fontSize: "0.78rem" }}>
      {time} IST
    </span>
  );
}

const ThreeScene = dynamic(() => import("./ThreeScene"), {
  ssr: false,
  loading: () => (
    <div style={{
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: 0.3,
    }}>
      <svg viewBox="0 0 300 300" width="280" height="280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(45,212,191,0.3)" strokeWidth="0.5"/>
        <ellipse cx="150" cy="150" rx="130" ry="50" fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth="0.5"/>
        <ellipse cx="150" cy="150" rx="90" ry="130" fill="none" stroke="rgba(45,212,191,0.2)" strokeWidth="0.5"/>
        <ellipse cx="150" cy="150" rx="50" ry="130" fill="none" stroke="rgba(45,212,191,0.15)" strokeWidth="0.5"/>
        <circle cx="150" cy="150" r="90" fill="none" stroke="rgba(45,212,191,0.15)" strokeWidth="0.5"/>
        <circle cx="150" cy="150" r="50" fill="none" stroke="rgba(45,212,191,0.12)" strokeWidth="0.5"/>
      </svg>
    </div>
  ),
});

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);

    const onMove = (e: MouseEvent) => {
      if (mq.matches) return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) / cx);
      mouseY.set((e.clientY - cy) / cy);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  const currentRole = resume.experience.find((e) => e.current);
  const firstName = resume.name.split(" ")[0];
  const lastName = resume.name.split(" ").slice(1).join(" ");

  return (
    <section
      id="hero"
      ref={heroRef}
      className="section"
      style={{ minHeight: "100svh", display: "flex", alignItems: "center", paddingTop: "calc(64px + 3rem)" }}
    >
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "center",
        }}
          className="hero-grid"
        >
          {/* ── Left: Text ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="status-badge">
                <span className={`status-dot status-dot--${resume.status.dot}`} />
                {resume.status.label}
                <span className="badge-clock" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                  <span aria-hidden="true" style={{ width: "1px", height: "12px", background: "var(--color-border)", flexShrink: 0 }} />
                  <LocalClock />
                </span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p style={{ fontSize: "1rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                Hi, I&apos;m
              </p>
              <h1 className="text-hero" style={{ marginBottom: "0.15em" }}>
                <span style={{ color: "var(--color-text-primary)" }}>{firstName}</span>{" "}
                <span style={{ color: "var(--color-text-secondary)" }}>{lastName}</span>
              </h1>
              <h1 className="text-hero" style={{ color: "var(--color-text-secondary)", fontWeight: 400, fontSize: "clamp(1.6rem, 3.5vw, 3.2rem)" }}>
                <span className="accent-text">{resume.headline}</span>
              </h1>
            </motion.div>

            {/* Location + current role */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {resume.location}
              </div>
              {currentRole && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.4rem 0.5rem", color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-green)", boxShadow: "0 0 6px var(--color-green)", flexShrink: 0, display: "inline-block" }} />
                  <span>{currentRole.title} at <strong style={{ color: "var(--color-text-primary)" }}>{currentRole.org}</strong></span>
                  <span style={{ color: "var(--color-text-muted)" }}>· {currentRole.dateRange}</span>
                </div>
              )}
            </motion.div>

            {/* Summary */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ color: "var(--color-text-secondary)", fontSize: "1rem", lineHeight: 1.75, maxWidth: "480px" }}
            >
              {resume.summary}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}
              className="hero-ctas"
            >
              <Magnetic className="magnetic-cta">
                <a href="#projects" className="btn-primary">
                  View Projects
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
              </Magnetic>
              <Magnetic className="magnetic-cta">
                <a href={resume.contact.links.resume} className="btn-outline" target="_blank" rel="noopener noreferrer">
                  Resume
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </a>
              </Magnetic>

              {/* Social links */}
              <a href={resume.contact.links.github} className="icon-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href={resume.contact.links.linkedin} className="icon-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </motion.div>
          </div>

          {/* ── Right: 3D Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "520px",
            }}
            className="hero-visual"
          >
            {/* Glow */}
            {!prefersReduced && (
              <motion.div
                style={{
                  position: "absolute",
                  width: "360px",
                  height: "360px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)",
                  x: springX,
                  y: springY,
                  pointerEvents: "none",
                }}
              />
            )}
            <ThreeScene />
          </motion.div>
        </div>

        {/* Scroll indicator — hidden on mobile/tablet, where the hero's content
            height exceeds one viewport and there's no stable "bottom" to anchor to */}
        <motion.div
          className="hero-scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--color-text-muted)",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <span>Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid > div:first-child {
            align-items: center;
          }
          .hero-visual {
            height: 320px !important;
            order: -1;
          }
          .hero-scroll-indicator {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
