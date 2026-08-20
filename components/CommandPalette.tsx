"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { resume } from "@/data/resume";
import { useToast } from "./Toast";

type Action = {
  id: string;
  label: string;
  hint: string;
  group: "Navigate" | "Actions" | "Projects";
  icon: React.ReactNode;
  perform: () => void;
  keepOpen?: boolean;
};

const IconNav = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconCopy = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconDownload = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconExternal = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconGithub = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);
const IconLinkedin = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const showToast = useToast();
  const lenis = useLenis();

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
    previouslyFocused.current?.focus?.();
  };

  const goTo = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [lenis]);

  const actions = useMemo<Action[]>(() => {
    const nav: Action[] = SECTIONS.map((s) => ({
      id: `nav-${s.id}`,
      label: `Go to ${s.label}`,
      hint: `#${s.id}`,
      group: "Navigate",
      icon: IconNav,
      perform: () => goTo(s.id),
    }));

    const doActions: Action[] = [
      {
        id: "copy-email",
        label: "Copy Email",
        hint: resume.contact.email,
        group: "Actions",
        icon: IconCopy,
        perform: () => {
          navigator.clipboard?.writeText(resume.contact.email).then(() => {
            showToast(`Copied ${resume.contact.email} to clipboard`);
          }).catch(() => {});
        },
      },
      {
        id: "download-resume",
        label: "Download Resume",
        hint: "PDF",
        group: "Actions",
        icon: IconDownload,
        perform: () => {
          const a = document.createElement("a");
          a.href = resume.contact.links.resume;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
      },
      {
        id: "open-github",
        label: "Open GitHub Profile",
        hint: "github.com",
        group: "Actions",
        icon: IconGithub,
        perform: () => window.open(resume.contact.links.github, "_blank", "noopener,noreferrer"),
      },
      {
        id: "open-linkedin",
        label: "Open LinkedIn Profile",
        hint: "linkedin.com",
        group: "Actions",
        icon: IconLinkedin,
        perform: () => window.open(resume.contact.links.linkedin, "_blank", "noopener,noreferrer"),
      },
    ];

    const projectActions: Action[] = resume.projects
      .filter((p) => p.links?.repo)
      .map((p) => ({
        id: `repo-${p.name}`,
        label: `Open ${p.name} on GitHub`,
        hint: "repo",
        group: "Projects",
        icon: IconExternal,
        perform: () => window.open(p.links!.repo, "_blank", "noopener,noreferrer"),
      }));

    return [...nav, ...doActions, ...projectActions];
  }, [showToast, goTo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q));
  }, [actions, query]);

  const run = (action: Action) => {
    action.perform();
    if (!action.keepOpen) close();
  };

  // Global open shortcut + external trigger (header button dispatches this)
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        previouslyFocused.current = document.activeElement as HTMLElement;
        setOpen((o) => !o);
      }
    };
    const onExternalOpen = () => {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("open-command-palette", onExternalOpen);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("open-command-palette", onExternalOpen);
    };
  }, []);

  // Focus the search field on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Reset selection when the filtered list changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keep the active row scrolled into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  const onModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const action = filtered[activeIdx];
      if (action) run(action);
    } else if (e.key === "Tab") {
      // Simple focus trap — there's only one focusable control (the input)
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  let runningIdx = -1;
  const groups: { group: string; items: { action: Action; idx: number }[] }[] = [];
  for (const action of filtered) {
    runningIdx += 1;
    let bucket = groups.find((g) => g.group === action.group);
    if (!bucket) {
      bucket = { group: action.group, items: [] };
      groups.push(bucket);
    }
    bucket.items.push({ action, idx: runningIdx });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(4,4,4,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            paddingTop: "min(14vh, 120px)",
            paddingLeft: "1.25rem",
            paddingRight: "1.25rem",
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onModalKeyDown}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "560px",
              height: "fit-content",
              maxHeight: "min(70vh, 480px)",
              display: "flex",
              flexDirection: "column",
              background: "rgba(13,13,13,0.98)",
              border: "1px solid var(--color-border-hover)",
              borderRadius: "12px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02)",
              overflow: "hidden",
            }}
          >
            {/* Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.9rem 1.1rem", borderBottom: "1px solid var(--color-border)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions, sections, projects…"
                aria-label="Search commands"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--color-text-primary)",
                  fontSize: "0.95rem",
                }}
              />
              <kbd style={{
                fontSize: "0.68rem", color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)", borderRadius: "4px",
                padding: "0.15rem 0.4rem", fontFamily: "var(--font-geist-mono), monospace",
              }}>
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} style={{ overflowY: "auto", padding: "0.5rem" }}>
              {filtered.length === 0 && (
                <p style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                  No matching commands.
                </p>
              )}
              {groups.map(({ group, items }) => (
                <div key={group} style={{ marginBottom: "0.4rem" }}>
                  <p style={{ padding: "0.5rem 0.75rem 0.3rem", fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                    {group}
                  </p>
                  {items.map(({ action, idx }) => (
                    <button
                      key={action.id}
                      data-idx={idx}
                      onClick={() => run(action)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "8px",
                        border: "none",
                        background: idx === activeIdx ? "var(--color-accent-dim)" : "transparent",
                        color: idx === activeIdx ? "var(--color-accent)" : "var(--color-text-secondary)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "0.875rem",
                        transition: "background 0.12s, color 0.12s",
                      }}
                    >
                      <span style={{ flexShrink: 0, display: "flex", color: idx === activeIdx ? "var(--color-accent)" : "var(--color-text-muted)" }}>
                        {action.icon}
                      </span>
                      <span style={{ flex: 1, color: idx === activeIdx ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
                        {action.label}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", fontFamily: "var(--font-geist-mono), monospace" }}>
                        {action.hint}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div style={{ display: "flex", gap: "1rem", padding: "0.6rem 1.1rem", borderTop: "1px solid var(--color-border)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
