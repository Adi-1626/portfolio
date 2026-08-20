"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { resume } from "@/data/resume";

// ─── Terminal preview (Omnichat) ──────────────────────────────────────────────
type ChatLine = { role: string; text: string };

const DEFAULT_SCRIPT: ChatLine[] = [
  { role: "user", text: "What models are available?" },
  { role: "assistant", text: "Connected to Cerebras. Models: llama3.1-8b, llama3.1-70b, llama3.3-70b." },
  { role: "user", text: "Use llama3.1-70b and summarise quantum computing." },
  { role: "assistant", text: "Quantum computing uses qubits that exist in superposition, enabling massively parallel computation for specific problem classes — factoring, optimization, simulation..." },
];

// Grounded in Omnichat's actual described capabilities (Cerebras streaming,
// dynamic model switching, SQLite conversation history) — no invented features.
const QUICK_PROMPTS: { label: string; script: ChatLine[] }[] = [
  {
    label: "Model Specs",
    script: [
      { role: "user", text: "What models are available?" },
      { role: "assistant", text: "Connected to Cerebras. Models: llama3.1-8b, llama3.1-70b, llama3.3-70b — switch anytime with /model." },
    ],
  },
  {
    label: "System Architecture",
    script: [
      { role: "user", text: "How is Omnichat built?" },
      { role: "assistant", text: "Python CLI: a Cerebras API client streams tokens in real time, SQLite persists conversation history, and a command router handles dynamic model switching." },
    ],
  },
  {
    label: "Chat History",
    script: [
      { role: "user", text: "Show my last conversation." },
      { role: "assistant", text: "Loaded from SQLite — 1 saved session, 4 messages, model llama3.1-70b." },
    ],
  },
];

function TerminalPreview() {
  const [script, setScript] = useState<ChatLine[]>(DEFAULT_SCRIPT);
  const [displayed, setDisplayed] = useState<{ role: string; text: string; done: boolean }[]>([]);
  const [charIdx, setCharIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause">("pause");

  const runScript = (next: ChatLine[]) => {
    setScript(next);
    setDisplayed([]);
    setCharIdx(0);
    setLineIdx(0);
    setPhase("pause");
  };

  useEffect(() => {
    if (lineIdx >= script.length) {
      // loop: return to the default demo after any script finishes
      const t = setTimeout(() => runScript(DEFAULT_SCRIPT), 2800);
      return () => clearTimeout(t);
    }

    if (phase === "pause") {
      const t = setTimeout(() => {
        setDisplayed(prev => [...prev, { role: script[lineIdx].role, text: "", done: false }]);
        setCharIdx(0);
        setPhase("typing");
      }, lineIdx === 0 ? 400 : 200);
      return () => clearTimeout(t);
    }

    if (phase === "typing") {
      const target = script[lineIdx].text;
      if (charIdx < target.length) {
        const speed = script[lineIdx].role === "user" ? 40 : 18;
        const t = setTimeout(() => {
          setDisplayed(prev => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], text: target.slice(0, charIdx + 1) };
            return copy;
          });
          setCharIdx(c => c + 1);
        }, speed);
        return () => clearTimeout(t);
      } else {
        setDisplayed(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], done: true };
          return copy;
        });
        setLineIdx(l => l + 1);
        setPhase("pause");
      }
    }
  }, [phase, charIdx, lineIdx, script]);

  return (
    <div style={{
      background: "#0a0d0d",
      borderRadius: "8px",
      border: "1px solid rgba(45,212,191,0.15)",
      fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
      fontSize: "0.78rem",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Title bar */}
      <div style={{ padding: "0.5rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {["#ef4444","#f59e0b","#22c55e"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
        ))}
        <span style={{ marginLeft: "0.5rem", color: "rgba(255,255,255,0.3)", fontSize: "0.72rem" }}>omnichat — llama3.1-70b</span>
      </div>
      {/* Terminal body */}
      <div style={{ padding: "1rem", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {displayed.map((line, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <span style={{ color: line.role === "user" ? "rgba(45,212,191,0.7)" : "rgba(129,140,248,0.7)", flexShrink: 0, fontSize: "0.7rem", marginTop: "0.1rem" }}>
              {line.role === "user" ? ">" : "$"}
            </span>
            <span style={{ color: line.role === "user" ? "rgba(240,240,240,0.85)" : "rgba(200,210,210,0.7)", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {line.text}
              {i === displayed.length - 1 && !line.done && (
                <span style={{ display: "inline-block", width: "6px", height: "0.9em", background: "var(--color-accent)", marginLeft: "2px", verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
              )}
            </span>
          </div>
        ))}
      </div>
      {/* Quick prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", padding: "0.55rem 1rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => runScript(qp.script)}
            style={{
              fontSize: "0.68rem",
              padding: "0.4rem 0.7rem",
              minHeight: "32px",
              borderRadius: "999px",
              border: "1px solid rgba(45,212,191,0.25)",
              background: "rgba(45,212,191,0.06)",
              color: "var(--color-accent)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.12)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.06)"; }}
          >
            {qp.label}
          </button>
        ))}
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Extension preview (Clickbait Clarifier) ──────────────────────────────────
const EXAMPLES = [
  { headline: "You Won't BELIEVE What Scientists Found on Mars 🔴🚀", score: 94, label: "Clickbait" },
  { headline: "NASA confirms presence of perchlorate salts in Martian regolith", score: 12, label: "Credible" },
  { headline: "This ONE Trick Doubles Your Productivity (Doctors HATE This)", score: 97, label: "Clickbait" },
];

// Deterministic heuristic standing in for the real LightGBM + Llama 3.1 ensemble —
// scores observable surface signals (punctuation, caps, listicle openers,
// curiosity-gap phrasing, emoji). Pure function of the input string (no
// randomness) so it stays stable/replayable. Not the real model — a much
// wider net of linguistic tells than a first pass, but still a heuristic:
// it will occasionally miss or over-flag headlines the real ensemble
// wouldn't, same as any rule-based stand-in for a trained classifier.
function scoreHeadline(headline: string): number {
  const text = headline.trim();
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 8;

  // Emphasis / punctuation signals
  score += (text.match(/!/g) ?? []).length * 14;
  score += Math.min((text.match(/\?/g) ?? []).length, 2) * 9;
  score += (text.match(/\b[A-Z]{3,}\b/g) ?? []).length * 13;
  score += (text.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) ?? []).length * 11;

  // Numbered-listicle openers — "10 Things...", "7 Kitchen Habits...",
  // "5 Surprising Facts..." (allows up to 2 filler/adjective words before
  // the listicle noun, since real headlines rarely put the noun right
  // after the number)
  if (/^\s*\d{1,3}\s+(?:\w+\s+){0,2}(things?|reasons?|ways?|facts?|secrets?|signs?|photos?|times?|tips?|tricks?|habits?|foods?|celebrit(?:y|ies)|movies?|stories|questions?|quotes?|memes?|myths?|mistakes?|lessons?|rules?|moments?|images?|videos?|recipes?|apps?|gadgets?|products?|hacks?)\b/i.test(text)) {
    score += 28;
  }

  // Curiosity-gap / withheld-information phrases — the core clickbait "tell".
  // Multi-word phrases are a strong, low-false-positive signal.
  const phrases = [
    "won't believe", "wont believe", "this one trick", "one weird trick",
    "one trick", "doctors hate", "must see", "must watch", "must read",
    "before it's too late", "the truth about", "gone wrong", "goes wrong",
    "never seen before", "you've never seen", "youve never seen",
    "what happened next", "blow your mind", "you'll never guess",
    "youll never guess", "this is why", "here's why", "heres why",
    "here's what happened", "will shock you", "will surprise you",
    "change your life", "changed my life", "changed everything",
    "wait until you see", "wait till you see", "the reason why",
    "goes viral", "gone viral", "broke the internet",
    "everyone is talking about", "will make you cry", "will make you laugh",
    "restore your faith", "melt your heart", "leave you speechless",
    "left speechless", "you need to see", "is obsessed with",
    "can't stop watching", "cant stop watching", "did next",
    "will leave you", "epic fail", "you have to see", "you have to watch",
    "won't want to miss", "wont want to miss", "the real reason",
    "here's the reason", "heres the reason",
  ];
  for (const p of phrases) if (lower.includes(p)) score += 19;

  // "Shocking reason" / "surprising reason" — the withheld-cause pattern
  if (/\b(shocking|surprising|real|true|actual)\s+reason\b/i.test(text)) score += 19;

  // "Something [emotional adjective]" — the withheld-subject pattern, in
  // either word order ("found something terrifying" / "something terrifying
  // happened")
  if (/\bsomething\s+\w{0,12}\s*(terrifying|shocking|amazing|incredible|insane|unbelievable|horrifying|heartbreaking|heartwarming)\b/i.test(text)) score += 20;

  // Single-word tabloid vocabulary — a weaker signal on its own (so it won't
  // trip on ordinary tech/business wording), but stacks with everything else.
  // Deliberately excludes double-edged words common in real tech/news
  // headlines too (e.g. "revealed", "warning", "breaking", "epic", "hack").
  const words = [
    "shocking", "shockingly", "shocked", "unbelievable", "jaw-dropping",
    "mind-blowing", "heartwarming", "heartbreaking", "adorable", "hilarious",
    "terrifying", "horrifying", "insane", "unreal", "furious", "obsessed",
    "scandal", "banned", "forbidden", "controversial", "secret", "secrets",
    "secretly", "viral", "priceless",
  ];
  let wordHits = 0;
  for (const w of words) if (lower.includes(w)) wordHits++;
  score += Math.min(wordHits, 4) * 10;

  // Vague subject + strong-reaction verb — "This ___ will change how you..."
  if (/^(this|these|that)\b.{0,40}\b(will|can|might|could)\b/i.test(text)) score += 10;

  // Superlative + "ever" — "The Craziest Thing You'll Ever See"
  if (/\b(best|worst|most|craziest|funniest|weirdest|greatest|dumbest|scariest)\b.{0,30}\bever\b/i.test(text)) score += 20;

  return Math.max(2, Math.min(98, Math.round(score)));
}

// Guaranteed-good demo path (same idea as Omnichat's quick prompts): the
// heuristic above is a stand-in, not the real ensemble, so it can misjudge
// arbitrary text a visitor types. These two are pre-scored to reliably show
// both ends of the spectrum working correctly.
const QUICK_EXAMPLES: { label: string; headline: string; score: number }[] = [
  { label: "Try a clickbait example", headline: "10 Photos That Will Restore Your Faith In Humanity 😱", score: 91 },
  { label: "Try a credible example", headline: "RBI raises repo rate by 25 basis points to curb inflation", score: 9 },
];

function ExtensionPreview() {
  const [idx, setIdx] = useState(0);
  const [meterVal, setMeterVal] = useState(0);
  const [typing, setTyping] = useState("");
  const [phase, setPhase] = useState<"typing" | "analyzing" | "result" | "pause">("typing");
  const [customInput, setCustomInput] = useState("");
  const [customHeadline, setCustomHeadline] = useState<string | null>(null);
  const [customScore, setCustomScore] = useState(0);

  const isCustom = customHeadline !== null;
  const activeHeadline = isCustom ? customHeadline : EXAMPLES[idx].headline;
  const activeScore = isCustom ? customScore : EXAMPLES[idx].score;

  // (Re)start the sequence whenever the active example or custom headline changes
  useEffect(() => {
    setTyping(isCustom ? activeHeadline : "");
    setMeterVal(0);
    setPhase(isCustom ? "analyzing" : "typing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, customHeadline]);

  useEffect(() => {
    if (phase === "typing") {
      if (typing.length < activeHeadline.length) {
        const t = setTimeout(() => setTyping(activeHeadline.slice(0, typing.length + 1)), 28);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("analyzing"), 300);
        return () => clearTimeout(t);
      }
    }
    if (phase === "analyzing") {
      if (meterVal < activeScore) {
        const t = setTimeout(() => setMeterVal(v => Math.min(v + 3, activeScore)), 22);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("result"), 200);
        return () => clearTimeout(t);
      }
    }
    if (phase === "result") {
      const t = setTimeout(() => setPhase("pause"), 2200);
      return () => clearTimeout(t);
    }
    if (phase === "pause") {
      const t = setTimeout(() => {
        if (isCustom) {
          // Return to the auto-cycling demo after showing the visitor's result
          setCustomHeadline(null);
        } else {
          setIdx(i => (i + 1) % EXAMPLES.length);
        }
      }, 800);
      return () => clearTimeout(t);
    }
  }, [phase, typing, meterVal, activeHeadline, activeScore, isCustom]);

  const isClickbait = isCustom ? activeScore >= 36 : EXAMPLES[idx].label === "Clickbait";
  const meterColor = meterVal > 70 ? "#ef4444" : meterVal > 40 ? "#f59e0b" : "#22c55e";

  const handleAnalyze = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    setCustomHeadline(trimmed);
    setCustomScore(scoreHeadline(trimmed));
  };

  const runQuickExample = (headline: string, score: number) => {
    setCustomInput(headline);
    setCustomHeadline(headline);
    setCustomScore(score);
  };

  return (
    <div style={{
      background: "#111416",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "1.25rem",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "0.85rem",
    }}>
      {/* Extension header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "rgba(45,212,191,0.15)", border: "1px solid rgba(45,212,191,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--color-accent)" }}>CC</div>
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--color-text-primary)" }}>Clickbait Clarifier</p>
          <p style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>Chrome Extension · Simulated demo</p>
        </div>
      </div>

      {/* Headline input */}
      <div style={{ background: "#0d1010", borderRadius: "6px", padding: "0.6rem 0.75rem", border: "1px solid rgba(255,255,255,0.06)", minHeight: "54px" }}>
        <p style={{ fontSize: "0.78rem", color: "rgba(240,240,240,0.75)", lineHeight: 1.5, fontFamily: "var(--font-geist-mono), monospace" }}>
          {typing}
          {phase === "typing" && <span style={{ borderRight: "2px solid var(--color-accent)", marginLeft: "1px", animation: "blink 0.8s step-end infinite" }}>&nbsp;</span>}
        </p>
      </div>

      {/* Confidence meter */}
      {(phase === "analyzing" || phase === "result") && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {phase === "analyzing" ? "Analyzing…" : "Clickbait Score"}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: meterColor, fontVariantNumeric: "tabular-nums" }}>
              {meterVal}%
            </span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${meterVal}%`, background: meterColor, borderRadius: "999px", transition: "width 0.02s linear, background 0.3s" }} />
          </div>
        </div>
      )}

      {/* Verdict */}
      {phase === "result" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: "0.6rem 0.85rem",
            borderRadius: "6px",
            background: isClickbait ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
            border: `1px solid ${isClickbait ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
            fontSize: "0.8rem",
            fontWeight: 600,
            color: isClickbait ? "#ef4444" : "#22c55e",
          }}
        >
          {isClickbait ? "⚠ High clickbait probability detected" : "✓ Content appears credible"}
        </motion.div>
      )}

      {/* Try-your-own-headline sandbox */}
      <div style={{ marginTop: "auto", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {QUICK_EXAMPLES.map((qe) => (
            <button
              key={qe.label}
              onClick={() => runQuickExample(qe.headline, qe.score)}
              style={{
                fontSize: "0.68rem",
                padding: "0.4rem 0.7rem",
                minHeight: "32px",
                borderRadius: "999px",
                border: "1px solid rgba(45,212,191,0.25)",
                background: "rgba(45,212,191,0.06)",
                color: "var(--color-accent)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.12)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,212,191,0.06)"; }}
            >
              {qe.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
            placeholder="Try your own headline…"
            aria-label="Enter a headline to analyze"
            style={{
              flex: 1,
              minWidth: 0,
              background: "#0d1010",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "6px",
              padding: "0.5rem 0.65rem",
              fontSize: "0.75rem",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-geist-mono), monospace",
              outline: "none",
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={!customInput.trim()}
            style={{
              flexShrink: 0,
              padding: "0.5rem 0.85rem",
              minHeight: "36px",
              borderRadius: "6px",
              border: "none",
              background: customInput.trim() ? "var(--color-accent)" : "rgba(255,255,255,0.06)",
              color: customInput.trim() ? "#080808" : "var(--color-text-muted)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: customInput.trim() ? "pointer" : "default",
              transition: "background 0.2s",
            }}
          >
            Analyze
          </button>
        </div>
        <p style={{ fontSize: "0.62rem", color: "var(--color-text-muted)" }}>
          Simulated scoring based on surface signals — not the real ML model.
        </p>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─── Receipt preview (Retail POS) ─────────────────────────────────────────────
function ReceiptPreview() {
  const items = [
    { name: "Basmati Rice 5kg", qty: 2, rate: 320 },
    { name: "Cold Pressed Oil 1L", qty: 1, rate: 485 },
    { name: "Organic Dal 1kg", qty: 3, rate: 145 },
    { name: "Sugar 2kg", qty: 2, rate: 88 },
  ];
  const GST_RATE = 0.05;

  const [visibleCount, setVisibleCount] = useState(0);
  const [showGST, setShowGST] = useState(false);
  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    setVisibleCount(0);
    setShowGST(false);
    setShowTotal(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), 500 + i * 420));
    });
    timers.push(setTimeout(() => setShowGST(true), 500 + items.length * 420 + 200));
    timers.push(setTimeout(() => setShowTotal(true), 500 + items.length * 420 + 550));
    // Loop
    timers.push(setTimeout(() => {
      setVisibleCount(0);
      setShowGST(false);
      setShowTotal(false);
    }, 500 + items.length * 420 + 3000));

    return () => timers.forEach(clearTimeout);
  }, []);

  const subtotal = items.slice(0, visibleCount).reduce((s, it) => s + it.qty * it.rate, 0);
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  return (
    <div style={{
      background: "#0f1010",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "1.25rem",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-geist-mono), monospace",
      fontSize: "0.75rem",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", paddingBottom: "0.75rem", borderBottom: "1px dashed rgba(255,255,255,0.1)", marginBottom: "0.75rem" }}>
        <p style={{ fontWeight: 700, color: "var(--color-text-primary)", fontSize: "0.85rem" }}>VendorVault POS</p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.68rem" }}>Invoice #INV-2024-0847</p>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.68rem" }}>May 14, 2024 · 11:32 AM</p>
      </div>

      {/* Line items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.5rem", color: "var(--color-text-muted)", fontSize: "0.68rem", paddingBottom: "0.35rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span>Item</span><span>Qty</span><span style={{ textAlign: "right" }}>Amt</span>
        </div>
        {items.slice(0, visibleCount).map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.5rem", color: "var(--color-text-secondary)" }}
          >
            <span style={{ fontSize: "0.72rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
            <span style={{ color: "var(--color-text-muted)" }}>{item.qty}</span>
            <span style={{ textAlign: "right" }}>₹{(item.qty * item.rate).toLocaleString()}</span>
          </motion.div>
        ))}
      </div>

      {/* Subtotal + GST + Total */}
      <div style={{ borderTop: "1px dashed rgba(255,255,255,0.1)", marginTop: "0.75rem", paddingTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.72rem" }}>
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        {showGST && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", justifyContent: "space-between", color: "var(--color-text-muted)", fontSize: "0.72rem" }}
          >
            <span>GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </motion.div>
        )}
        {showTotal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: "flex", justifyContent: "space-between", color: "var(--color-accent)", fontWeight: 700, fontSize: "0.85rem", marginTop: "0.2rem" }}
          >
            <span>TOTAL</span>
            <span>₹{total.toFixed(2)}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Project data with preview components ─────────────────────────────────────
const PROJECT_PREVIEWS: Record<string, React.ComponentType> = {
  "Omnichat": TerminalPreview,
  "Clickbait Clarifier": ExtensionPreview,
  "Retail POS & Invoice System": ReceiptPreview,
};

// ─── Main Projects component ──────────────────────────────────────────────────
export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [inView, setInView] = useState(false);

  // Cursor-following radial glow
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = paneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
  }, []);

  // Framer Motion tilt
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const rotateX = useTransform(motionY, [-1, 1], [5, -5]);
  const rotateY = useTransform(motionX, [-1, 1], [-6, 6]);

  const onPaneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    motionX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    motionY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    onMouseMove(e);
  };
  const onPaneMouseLeave = () => {
    motionX.set(0);
    motionY.set(0);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const activeProject = resume.projects[activeIdx];
  const PreviewComp = PROJECT_PREVIEWS[activeProject.name] ?? TerminalPreview;

  return (
    <section id="projects" ref={sectionRef} className="section" style={{ borderTop: "1px solid var(--color-border)" }}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={inView ? { opacity: 1, clipPath: "inset(0 0 0% 0)" } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "3rem" }}
        >
          <p className="text-section-label">Projects</p>
          <h2 className="text-section-heading" style={{ marginTop: "0.6rem" }}>
            Things I&apos;ve <span className="accent-text">built</span>
          </h2>
        </motion.div>

        {/* Explorer layout */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "1.5rem",
            alignItems: "start",
            minHeight: "360px",
          }}
          className="projects-explorer"
        >
          {/* ── Sidebar list ── */}
          <div className="projects-sidebar" style={{
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.015)",
          }}>
            {/* Sidebar header */}
            <div className="projects-sidebar-header" style={{ padding: "0.6rem 1rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Projects</span>
            </div>

            {resume.projects.map((project, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="projects-sidebar-btn"
                aria-current={activeIdx === i}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  background: activeIdx === i ? "rgba(45,212,191,0.07)" : "transparent",
                  border: "none",
                  borderLeft: `2px solid ${activeIdx === i ? "var(--color-accent)" : "transparent"}`,
                  borderBottom: i < resume.projects.length - 1 ? "1px solid var(--color-border)" : "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.2s, border-color 0.2s",
                  minHeight: "44px",
                }}
                onMouseEnter={(e) => {
                  if (activeIdx !== i) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (activeIdx !== i) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={activeIdx === i ? "var(--color-accent)" : "var(--color-text-muted)"} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transition: "stroke 0.2s" }} aria-hidden="true">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
                <span style={{ fontSize: "0.8rem", fontWeight: activeIdx === i ? 600 : 400, color: activeIdx === i ? "var(--color-text-primary)" : "var(--color-text-secondary)", lineHeight: 1.3, transition: "color 0.2s" }}>
                  {project.name}
                </span>
              </button>
            ))}

            {/* Date footer */}
            <div className="projects-sidebar-footer" style={{ padding: "0.6rem 1rem", borderTop: "1px solid var(--color-border)" }}>
              <span style={{ fontSize: "0.68rem", color: "var(--color-text-muted)" }}>{activeProject.date}</span>
            </div>
          </div>

          {/* ── Preview pane ── */}
          <motion.div
            ref={paneRef}
            onMouseMove={onPaneMouseMove}
            onMouseLeave={onPaneMouseLeave}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              overflow: "hidden",
              background: "rgba(255,255,255,0.015)",
              position: "relative",
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              perspective: 800,
            }}
          >
            {/* Cursor radial glow */}
            <div style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(45,212,191,0.06), transparent 60%)",
              zIndex: 1,
              borderRadius: "10px",
            }} aria-hidden="true" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", minHeight: "340px" }}
              >
                {/* Project title + description */}
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                    {activeProject.name}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                    {activeProject.description}
                  </p>
                </div>

                {/* Animated preview */}
                <div style={{ flex: 1, minHeight: "200px" }}>
                  <PreviewComp />
                </div>

                {/* Stack + link */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {activeProject.stack.map((tech) => (
                      <motion.span
                        key={tech}
                        className="skill-tag"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        style={{ fontSize: "0.72rem" }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                  {activeProject.links?.repo && (
                    <a
                      href={activeProject.links.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        fontSize: "0.8rem", fontWeight: 500, color: "var(--color-text-secondary)",
                        textDecoration: "none",
                        padding: "0.35rem 0.8rem",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        transition: "color 0.2s, border-color 0.2s",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-accent)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent-border)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)"; }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View Code
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .projects-explorer {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
