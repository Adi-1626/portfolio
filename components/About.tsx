"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { resume } from "@/data/resume";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="about" ref={ref} className="section" style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="container">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "4rem",
          alignItems: "start",
        }}
          className="about-grid"
        >
          {/* Label column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-section-label">About</p>
            <h2 className="text-section-heading" style={{ marginTop: "0.75rem" }}>
              A bit about<br />
              <span className="accent-text">me</span>
            </h2>
          </motion.div>

          {/* Content column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", lineHeight: 1.85 }}>
              {resume.about}
            </p>

            {/* Education mini-cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <p className="text-section-label" style={{ marginBottom: "0.25rem" }}>Education</p>
              {resume.education.map((edu, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    padding: "1rem 1.25rem",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent-border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--color-accent-dim)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{edu.degree}</p>
                      <p style={{ fontSize: "0.825rem", color: "var(--color-text-secondary)", marginTop: "0.15rem" }}>{edu.institution}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.775rem", color: "var(--color-text-muted)" }}>{edu.dateRange}</p>
                      <p style={{ fontSize: "0.775rem", color: "var(--color-accent)", marginTop: "0.15rem" }}>{edu.details}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
}
