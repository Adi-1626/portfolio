"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { resume } from "@/data/resume";

// ─── Architecture Flow Diagram ─────────────────────────────────────────────────
// Connector arrows carry a small glowing "data packet" that travels node-to-node,
// staggered per-arrow for an async streaming feel. Purely decorative (aria-hidden),
// and skipped entirely under prefers-reduced-motion.
function FlowDiagram({ nodes, arrows = true }: { nodes: string[]; arrows?: boolean }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25rem" }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <div style={{
            padding: "0.3rem 0.65rem",
            borderRadius: "5px",
            border: "1px solid rgba(45,212,191,0.2)",
            background: "rgba(45,212,191,0.06)",
            fontSize: "0.7rem",
            color: "rgba(240,240,240,0.75)",
            fontFamily: "var(--font-geist-mono), monospace",
            whiteSpace: "nowrap",
          }}>
            {node}
          </div>
          {arrows && i < nodes.length - 1 && (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
              <path d="M0 5h12M8 1l4 4-4 4" stroke="rgba(45,212,191,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              {animate && (
                <g opacity="0">
                  <circle r="2.6" fill="rgba(94,234,212,0.3)" />
                  <circle r="1" fill="#c7fbef" />
                  <animateTransform
                    attributeName="transform" type="translate"
                    values="0,5; 12,5" dur="1.6s" repeatCount="indefinite"
                    begin={`${(i * 0.35).toFixed(2)}s`}
                  />
                  <animate
                    attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1"
                    dur="1.6s" repeatCount="indefinite" begin={`${(i * 0.35).toFixed(2)}s`}
                  />
                </g>
              )}
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Rolling number counter for metric cards ────────────────────────────────────
function parseMetric(value: string) {
  const m = value.match(/^(~?)(\d+)(%?)$/);
  return m ? { prefix: m[1], target: parseInt(m[2], 10), suffix: m[3] } : null;
}

function useRollingValue(value: string, inView: boolean) {
  const parsed = parseMetric(value);
  const [display, setDisplay] = useState(() => (parsed ? `${parsed.prefix}0${parsed.suffix}` : value));

  useEffect(() => {
    if (!inView) return;
    const parsedValue = parseMetric(value);
    if (!parsedValue || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const { prefix, target, suffix } = parsedValue;
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${prefix}${Math.round(target * eased)}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return display;
}

// ─── Expandable area ───────────────────────────────────────────────────────────
function Area({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 0",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: open ? "var(--color-accent)" : "var(--color-text-primary)", transition: "color 0.2s", textAlign: "left" }}>
          {title}
        </span>
        <motion.svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={open ? "var(--color-accent)" : "var(--color-text-muted)"} strokeWidth="2" strokeLinecap="round"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"/>
        </motion.svg>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div style={{ paddingBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tech chip row ─────────────────────────────────────────────────────────────
function TechChips({ techs }: { techs: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
      {techs.map(t => (
        <span key={t} className="skill-tag" style={{ fontSize: "0.72rem" }}>{t}</span>
      ))}
    </div>
  );
}

// ─── Bullet list ───────────────────────────────────────────────────────────────
function Bullets({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: "0.55rem", fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
          <span style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: "0.4rem" }}>
            <svg width="5" height="5" viewBox="0 0 5 5" fill="currentColor" aria-hidden="true"><circle cx="2.5" cy="2.5" r="2.5"/></svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Metric highlight ──────────────────────────────────────────────────────────
function Metric({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const display = useRollingValue(value, inView);

  return (
    <div ref={ref} style={{
      padding: "0.75rem 1rem",
      borderRadius: "8px",
      border: "1px solid var(--color-accent-border)",
      background: "var(--color-accent-dim)",
      display: "flex",
      flexDirection: "column",
      gap: "0.2rem",
    }}>
      <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{display}</span>
      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{label}</span>
    </div>
  );
}

// ─── Per-internship content panels ────────────────────────────────────────────
function SectfitPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
          Full-stack engineering role at a health-tech startup — spanning backend integration, AI-driven workflows, real-time application behavior, mobile product development, and end-to-end automation. The most technically diverse internship, covering the entire application stack.
        </p>
      </div>

      <Area title="Backend Integration & API Workflows" defaultOpen>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Integrated API-driven application workflows connecting multiple application layers — UI, backend services, data processing, and Firebase — into coherent end-to-end flows. Worked on improving existing backend functionality, validating data flows, debugging cross-layer issues, and coordinating frontend-backend behavior.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Architecture</p>
          <FlowDiagram nodes={["App UI", "REST API", "Backend Services", "Firebase / Data"]} />
        </div>
        <TechChips techs={["Node.js", "Express", "REST APIs", "Firestore", "Firebase"]} />
      </Area>

      <Area title="End-to-End Automation Flows">
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Configured multiple complete end-to-end automation flows across the app — connecting user interactions through API requests, backend processing, data updates, and subsequent application states. Engineering focus: wiring isolated screens into complete, cohesive workflows.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Flow pattern</p>
          <FlowDiagram nodes={["User Action", "API Request", "Backend Processing", "Data Update", "Next App State"]} />
        </div>
      </Area>

      <Area title="AI Integration">
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Integrated AI-powered functionality into a production health-tech application — connecting AI-related processing with backend and API layers, handling application data around AI-driven workflows, and wiring AI outputs to user-facing behavior. Engineering work focused on the integration layer and data flow, not the underlying model.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Integration pattern</p>
          <FlowDiagram nodes={["Application", "API / Backend", "AI Processing", "App Response"]} />
        </div>
        <TechChips techs={["AI Agents", "REST APIs", "Backend Integration"]} />
      </Area>

      <Area title="Mobile Product Engineering">
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Built and integrated mobile product functionality using React Native + TypeScript and FlutterFlow, translating Figma designs into reusable TSX components. Worked across the full mobile stack: UI layer, API integration, backend functionality, and Firebase data layer — developing an understanding of how each layer interacts in a real production product.
        </p>
        <TechChips techs={["React Native", "TypeScript", "FlutterFlow", "TanStack Query", "Zustand", "Firestore"]} />
      </Area>

      <Area title="Real-Time Data & Firebase">
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Integrated Firebase for real-time data handling and application state synchronization — connecting application functionality with backend data services, managing real-time data flows, and ensuring consistent application state across layers.
        </p>
        <TechChips techs={["Firebase", "Firestore", "Firebase Auth", "FCM", "Firebase Storage", "Real-time data"]} />
      </Area>
    </div>
  );
}

function SanyuPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
          Cloud engineering internship focused on deploying a scalable AI-powered application on AWS. Gained practical exposure to multiple AWS services working together in a real production deployment, with a measurable performance outcome.
        </p>
      </div>

      <Area title="Core Project: AI-Powered Cloud Storage" defaultOpen>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Built an AI-powered cloud storage platform using Amazon Rekognition that automatically analyzed and tagged images based on visual content — eliminating the need to manually scroll through large image libraries to find specific content. Dramatically reduced image retrieval time.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Metric value="~90%" label="Reduction in image search time" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Image analysis pipeline</p>
          <FlowDiagram nodes={["Image Upload", "S3 Storage", "Rekognition", "Visual Metadata", "Fast Retrieval"]} />
        </div>
      </Area>

      <Area title="AWS Architecture & Deployment">
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
          Deployed the platform using a full AWS stack — compute, storage, database, application deployment, and scaling. Built understanding of how multiple cloud services work together in a real deployed application.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div>
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Request path</p>
            <FlowDiagram nodes={["User", "Load Balancer", "Application (EB)", "RDS"]} />
          </div>
          <div>
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Scaling layer</p>
            <FlowDiagram nodes={["EC2 Instances", "Auto Scaling", "Load Balancing"]} />
          </div>
        </div>
        <TechChips techs={["EC2", "S3", "RDS", "Elastic Beanstalk", "Auto Scaling", "Load Balancing", "Amazon Rekognition"]} />
      </Area>
    </div>
  );
}

function InfeanetPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
          Android development internship focused on delivering real, production-oriented applications. Shipped two complete Android apps integrating external APIs and Firebase, including one AI-powered conversational app.
        </p>
      </div>

      <Area title="Production Android Apps" defaultOpen>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{
            padding: "0.9rem 1rem",
            borderRadius: "7px",
            border: "1px solid var(--color-border)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>Multi-Engine Web Browser</p>
            <p style={{ fontSize: "0.825rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              A fully functional Android browser supporting multiple search engines, built with native Android APIs, REST integration, and Firebase for real-time data synchronization.
            </p>
          </div>
          <div style={{
            padding: "0.9rem 1rem",
            borderRadius: "7px",
            border: "1px solid rgba(45,212,191,0.15)",
            background: "rgba(45,212,191,0.03)",
          }}>
            <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>AI Chatbot (ChatGPT API)</p>
            <p style={{ fontSize: "0.825rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
              An Android conversational AI application integrating the ChatGPT API — handling API requests, managing response streaming, and displaying AI-generated content in the application UI.
            </p>
            <div style={{ marginTop: "0.6rem" }}>
              <FlowDiagram nodes={["Android UI", "ChatGPT API", "AI Response", "App UI"]} />
            </div>
          </div>
        </div>
      </Area>

      <Area title="API & Firebase Integration">
        <Bullets items={[
          "Integrated REST APIs for real-time data handling across both production applications.",
          "Implemented Firebase for data synchronization — connecting application state to backend data updates in real time.",
          "Worked with production-grade application flows: authentication, data persistence, API error handling, and state management.",
        ]} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Data flow</p>
          <FlowDiagram nodes={["Android UI", "REST API / Firebase", "Data Sync", "Updated App State"]} />
        </div>
        <TechChips techs={["Java", "Firebase", "REST APIs", "Android SDK", "Real-time data"]} />
      </Area>
    </div>
  );
}

const PANELS: Record<string, React.ComponentType> = {
  "Sectfit Healthtech Pvt. Ltd.": SectfitPanel,
  "Sanyu Infotech Pvt. Ltd.": SanyuPanel,
  "Infeanet Digital Marketing & Web Media": InfeanetPanel,
};

// ─── Main Experience component ────────────────────────────────────────────────
export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeOrg, setActiveOrg] = useState(resume.experience[0].org);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const activeExp = resume.experience.find(e => e.org === activeOrg) ?? resume.experience[0];
  const Panel = PANELS[activeExp.org];

  return (
    <section id="experience" ref={ref} className="section" style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={inView ? { opacity: 1, clipPath: "inset(0 0 0% 0)" } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "3rem" }}
        >
          <p className="text-section-label">Experience</p>
          <h2 className="text-section-heading" style={{ marginTop: "0.6rem" }}>
            Where I&apos;ve <span className="accent-text">worked</span>
          </h2>
        </motion.div>

        {/* Tab nav + content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "2.5rem",
            alignItems: "start",
          }}
          className="exp-grid"
        >
          {/* ── Tab list (vertical on desktop, horizontal scroll strip on mobile) ── */}
          <div className="exp-tabs" role="tablist" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {resume.experience.map((exp) => {
              const isActive = activeOrg === exp.org;
              return (
                <button
                  key={exp.org}
                  onClick={() => setActiveOrg(exp.org)}
                  className="exp-tab-btn"
                  role="tab"
                  aria-selected={isActive}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0.2rem",
                    padding: "1rem 1.1rem",
                    background: isActive ? "rgba(45,212,191,0.06)" : "transparent",
                    border: "none",
                    borderLeft: `2px solid ${isActive ? "var(--color-accent)" : "var(--color-border)"}`,
                    borderBottom: "1px solid var(--color-border)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {exp.current && (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-green)", boxShadow: "0 0 6px var(--color-green)", flexShrink: 0, display: "inline-block" }} />
                    )}
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)", transition: "color 0.2s" }}>
                      {exp.org}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", paddingLeft: exp.current ? "1.1rem" : "0" }}>
                    {exp.title}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", paddingLeft: exp.current ? "1.1rem" : "0" }}>
                    {exp.dateRange}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Content panel ── */}
          <div className="exp-tab-content" style={{
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            padding: "1.75rem",
            background: "rgba(255,255,255,0.015)",
            minHeight: "400px",
          }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeOrg}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Role header */}
                <div style={{ marginBottom: "1.5rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{activeExp.title}</h3>
                      <p style={{ fontSize: "0.9rem", color: "var(--color-accent)", marginTop: "0.2rem", fontWeight: 500 }}>{activeExp.org}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>{activeExp.location}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{activeExp.dateRange}</p>
                      {activeExp.current && (
                        <span style={{
                          display: "inline-block", marginTop: "0.35rem",
                          fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em",
                          padding: "0.15rem 0.5rem", borderRadius: "999px",
                          background: "rgba(45,212,191,0.15)",
                          color: "var(--color-accent)",
                          border: "1px solid var(--color-accent-border)",
                          textTransform: "uppercase",
                        }}>Current</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic panel */}
                {Panel ? <Panel /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .exp-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
