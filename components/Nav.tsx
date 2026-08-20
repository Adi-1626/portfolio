"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { resume } from "@/data/resume";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Active section detection
      const sections = navLinks.map((l) => l.href.slice(1));
      let current = "";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const firstName = resume.name.split(" ")[0];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          backgroundColor: scrolled ? "rgba(8,8,8,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          transition: "background-color 0.4s, border-color 0.4s, backdrop-filter 0.4s",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          {/* Logo */}
          <a href="#hero" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "32px", height: "32px", borderRadius: "6px",
              border: "1px solid var(--color-accent-border)",
              background: "var(--color-accent-dim)",
              fontSize: "0.8rem", fontWeight: 700,
              color: "var(--color-accent)",
            }}>AG</span>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text-primary)" }}>
              {firstName}
            </span>
          </a>

          {/* Desktop nav */}
          <ul style={{ display: "flex", gap: "0", listStyle: "none", alignItems: "center" }}
            className="nav-desktop">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <li key={link.href} style={{ position: "relative" }}>
                  <a
                    href={link.href}
                    style={{
                      display: "block",
                      padding: "0.4rem 0.85rem",
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: "none",
                      color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                      transition: "color 0.2s, font-weight 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)";
                    }}
                  >
                    {link.label}
                    {/* Sliding underline */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          left: "0.85rem",
                          right: "0.85rem",
                          height: "1.5px",
                          background: "var(--color-accent)",
                          borderRadius: "999px",
                          boxShadow: "0 0 6px rgba(45,212,191,0.5)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Command palette trigger */}
            <button
              onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              aria-label="Open command palette"
              className="nav-cmdk"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.6rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                fontSize: "0.75rem",
                minHeight: "2.25rem",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <kbd style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.7rem" }}>
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>

            <a
              href={`mailto:${resume.contact.email}`}
              className="btn-primary nav-cta"
              style={{ fontSize: "0.8rem", padding: "0.5rem 1.1rem" }}
            >
              Let&apos;s Talk
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="nav-hamburger"
              style={{
                display: "none",
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                width: "2.25rem",
                height: "2.25rem",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "4px",
                padding: "0.5rem",
              }}
            >
              <span style={{ display: "block", width: "16px", height: "1px", background: "currentColor", transition: "transform 0.2s, opacity 0.2s", transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }} />
              <span style={{ display: "block", width: "16px", height: "1px", background: "currentColor", opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
              <span style={{ display: "block", width: "16px", height: "1px", background: "currentColor", transition: "transform 0.2s", transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              zIndex: 40,
              background: "rgba(8,8,8,0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--color-border)",
              padding: "1rem var(--container-pad)",
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.85rem 0",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: activeSection === link.href.slice(1) ? "var(--color-accent)" : "var(--color-text-secondary)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href={`mailto:${resume.contact.email}`}
              style={{ display: "block", marginTop: "1rem" }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Let&apos;s Talk
              </span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-cta { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-cmdk kbd { display: none; }
          .nav-cmdk { padding: 0.4rem !important; }
        }
      `}</style>
    </>
  );
}
