"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { resume } from "@/data/resume";

// Icon glyphs per skill (monospace shorthand) — purely decorative
const SKILL_GLYPHS: Record<string, string> = {
  // Languages
  Python: "Py", "C++": "C+", Java: "Ja", TypeScript: "TS",
  // AI/ML
  "Machine Learning": "ML", LightGBM: "⬡", "Llama 3.1": "🦙", "ChatGPT API": "GPT",
  "Cerebras API": "⚡", "AI Agents": "🤖",
  // Backend
  "Node.js": "No", Express: "Ex", Flask: "Fl", FastAPI: "Fa",
  "REST APIs": "API", CRUD: "DB", "API Integration": "↔",
  // Cloud/Mobile
  AWS: "☁", "React Native": "RN", Firebase: "🔥", Zustand: "⚛",
  "TanStack Query": "TQ", "GitHub Actions": "⚙",
  // Data/Production
  Firestore: "FS", SQLite: "SQ", "Firebase Auth": "🔐", FCM: "📨",
  "Firebase Storage": "💾", Sentry: "🛡", Crashlytics: "📊", Git: "⎇",
};

// Category metadata
const CATEGORY_META: Record<string, { label: string; speed: number; direction: "left" | "right" }> = {
  Languages:         { label: "Languages",         speed: 28, direction: "left"  },
  "AI / ML":         { label: "AI / ML",            speed: 22, direction: "right" },
  Backend:           { label: "Backend",            speed: 32, direction: "left"  },
  "Cloud / Mobile":  { label: "Cloud / Mobile",     speed: 25, direction: "right" },
  "Data / Production": { label: "Data / Production", speed: 30, direction: "left" },
};

// Chip component
function SkillChip({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  const glyph = SKILL_GLYPHS[label] ?? label.slice(0, 2);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.4rem 0.9rem",
        borderRadius: "6px",
        border: `1px solid ${hovered ? "var(--color-accent-border)" : "rgba(255,255,255,0.07)"}`,
        background: hovered ? "var(--color-accent-dim)" : "rgba(255,255,255,0.03)",
        flexShrink: 0,
        cursor: "default",
        transition: "border-color 0.2s, background 0.2s, transform 0.2s",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        userSelect: "none",
      }}
    >
      <span style={{
        fontSize: "0.68rem",
        fontFamily: "var(--font-geist-mono), monospace",
        color: hovered ? "var(--color-accent)" : "var(--color-text-muted)",
        minWidth: "1.6em",
        textAlign: "center",
        transition: "color 0.2s",
      }}>
        {glyph}
      </span>
      <span style={{
        fontSize: "0.8rem",
        fontWeight: 500,
        color: hovered ? "var(--color-accent)" : "var(--color-text-secondary)",
        whiteSpace: "nowrap",
        transition: "color 0.2s",
      }}>
        {label}
      </span>
    </div>
  );
}

// Marquee row
function MarqueeRow({
  skills,
  speed,
  direction,
  paused,
}: {
  skills: string[];
  speed: number;
  direction: "left" | "right";
  paused: boolean;
}) {
  // Duplicate for seamless loop
  const doubled = [...skills, ...skills, ...skills];
  const duration = doubled.length * speed * 0.1;

  return (
    <div
      style={{
        overflow: "hidden",
        // Fixed-pixel fade, not a percentage — a %-based fade widens with the
        // container and can swallow whole chips into invisible "empty space"
        // on wide viewports. A fixed edge vignette stays small at any width.
        maskImage: "linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          width: "max-content",
          animation: `marquee-${direction} ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
        aria-hidden="true"
      >
        {doubled.map((skill, i) => (
          <SkillChip key={`${skill}-${i}`} label={skill} />
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [pausedRow, setPausedRow] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const categories = Object.keys(resume.skills);

  return (
    <section id="skills" ref={ref} className="section" style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={inView ? { opacity: 1, clipPath: "inset(0 0 0% 0)" } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "3.5rem" }}
        >
          <p className="text-section-label">Skills</p>
          <h2 className="text-section-heading" style={{ marginTop: "0.6rem" }}>
            What I work <span className="accent-text">with</span>
          </h2>
        </motion.div>
      </div>

      {/* Full-bleed marquee rows (outside container for edge-to-edge) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {categories.map((category, ci) => {
          const meta = CATEGORY_META[category] ?? { label: category, speed: 28, direction: "left" as const };
          const skills = resume.skills[category];

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + ci * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setPausedRow(category)}
              onMouseLeave={() => setPausedRow(null)}
            >
              {/* Category label */}
              <div className="container" style={{ marginBottom: "0.6rem" }}>
                <p style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}>
                  {meta.label}
                </p>
              </div>

              {/* Marquee */}
              <div style={{ paddingLeft: "var(--container-pad)", paddingRight: "var(--container-pad)" }}>
                <MarqueeRow
                  skills={skills}
                  speed={meta.speed}
                  direction={meta.direction}
                  paused={pausedRow === category}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Keyframes injected globally (CSS-only scroll, no JS animation loop) */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-33.333%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee-left"], [style*="marquee-right"] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
