import RecessionIndicator from './RecessionIndicator';
import CounterfactualTab from './CounterfactualTab';
import FamilyCalculator from './FamilyCalculator';
import TariffMap from './TariffMap';
import SnapByState from './SnapByState';
import HousingCuts from './HousingCuts';
import MedicaidCoverage from './MedicaidCoverage';
import JobsTracker from './JobsTracker';
import StudentLoanCalc from './StudentLoanCalc';
import MortgageYieldChart from './MortgageYieldChart';
import Changelog from './Changelog';
import { useState, useEffect, useRef, useCallback } from "react";

// ── Brand tokens ────────────────────────────────────────────────
const C = {
  bg:        "#f9f7f2",
  bgCard:    "#ffffff",
  ink:       "#0a0908",
  inkMid:    "#4a4642",
  inkLight:  "#948c80",
  rule:      "#c8c2b8",
  ruleLight: "#e6e2da",
  accent:    "#c0392b",   // kept from tracker for live data
  green:     "#1a6e1a",
  gold:      "#a06800",
};

const STATIC_CATEGORIES = [
  {
    id: "taxcuts",
    label: "Tax Cuts Deficit Cost (OBBBA)",
    subtitle: "CBO updated: $4.1T added to deficit over 10 years — 70% benefits top 10%",
    baseAmount: 4_100_000_000_000,
    ratePerSecond: 13_004,
    color: "#8e44ad",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "Congressional Budget Office dynamic score, Tax Foundation",
    treasuryLive: false,
    resolved: false,
    note: "CBO updated dynamic score: $4.1–4.7T deficit increase over 10 years (revised from original $3.4T static score). Top 1% receives avg $50,000/yr tax cut. Bottom 10% lose $1,600/yr. National debt-to-GDP projected to climb from 162% to 190%+ over 35 years. Tariff revenue is paid overwhelmingly by American consumers, not foreign governments: Peterson Institute and Yale Budget Lab estimate 85–90% of tariff costs pass through to US households as higher prices, with lower-income households bearing the highest proportional burden.",
  },
  {
    id: "snap_medicaid_harm",
    label: "Medicaid & SNAP Cuts (Harm to Families)",
    subtitle: "$930B Medicaid + $285B SNAP stripped over 10 years — already taking effect",
    baseAmount: 1_215_000_000_000,
    ratePerSecond: 3_852,
    color: "#27ae60",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "CBO, Food Research and Action Center, Urban Institute",
    treasuryLive: false,
    resolved: false,
    note: "CBO confirmed 11.8M people losing health coverage. Food Research and Action Center reports 5.8M people have already lost SNAP access as of Aug 2026. Cuts take effect as tariff-driven food inflation accelerates. Average affected family loses $146/month.",
  },
  {
    id: "doj_fund",
    label: "DOJ Anti-Weaponization Fund",
    subtitle: "Announced May 2026 — administration retreated June 2, 2026 without disbursing funds",
    baseAmount: 1_776_000_000,
    ratePerSecond: 0,
    color: "#2980b9",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "AP, Washington Post, DOJ",
    treasuryLive: false,
    resolved: true,
    resolvedNote: "Administration retreated June 2, 2026. Fund was never disbursed.",
    note: "Announced May 18, 2026 as part of settlement of Trump's IRS lawsuit. Administration retreated from the fund on June 2, 2026 following bipartisan legal challenges and near-100 House Democratic brief to block it. Fund was not disbursed. The precedent of using DOJ as a political patronage mechanism remains.",
  },
  {
    id: "ballroom",
    label: "White House Ballroom + Reflecting Pool",
    subtitle: "$400M ballroom + $1B security request + $13M reflecting pool",
    baseAmount: 1_413_000_000,
    ratePerSecond: 0,
    color: "#f39c12",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "CNN, ABC News, NYT",
    treasuryLive: false,
    resolved: false,
    note: "Originally promised at zero taxpayer cost. Doubled from $200M to $400M. Senate weighing $1B security add-on. Lincoln Memorial Reflecting Pool contracted at $13M, initially stated as $2M.",
  },
  {
    id: "litigation",
    label: "Federal Litigation Defense (952+ Lawsuits)",
    subtitle: "DOJ defending record number of challenges to administration actions",
    baseAmount: 750_000_000,
    ratePerSecond: 14,
    color: "#16a085",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "Just Security, Brennan Center",
    treasuryLive: false,
    resolved: false,
    note: "952 cases tracked by Just Security as of September 2026, up from 753 in April. Roughly 1.5 new cases per day. Democratic AGs report winning 55 of 67 decided cases. Challenges span immigration, tariffs, constitutional authority, and executive orders.",
  },
  {
    id: "doge_gap",
    label: "DOGE Unverified Savings Claims",
    subtitle: "$147.6B in claimed savings remain unverified or disputed by GAO and independent auditors",
    baseAmount: 147_600_000_000,
    ratePerSecond: 0,
    color: "#7b68ee",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "DOGE.gov dashboard vs. GAO-26-106361, Reuters fact-check, USASpending.gov",
    treasuryLive: false,
    resolved: false,
    note: "DOGE claimed $160B+ in savings through September 2026. GAO and independent auditors have verified approximately $12.4B — 7.8% of the claimed figure. The gap ($147.6B) represents fiscal claims made to the public that have not been independently confirmed. Categories include: $156.6B in claimed contract cancellations vs. $3.2B verified; $29B workforce savings vs. $4.1B verified; $7.8B real estate disposals vs. $340M verified. Source: GAO-26-106361 (Sept 2026); Reuters fact-check Sept 2026; USASpending.gov cancellation records.",
  },
  {
    id: "debt_interest",
    label: "Interest Cost on OBBBA-Added Debt",
    subtitle: "~$820B–$1.05T additional interest over 10 years at current Treasury rates",
    baseAmount: 935_000_000_000,
    ratePerSecond: 2_963,
    color: "#e74c3c",
    lastUpdated: "September 2026",
    lastVerified: "September 2026",
    source: "CBO Long-Term Budget Outlook 2026; OMB interest rate projections",
    treasuryLive: false,
    resolved: false,
    note: "The $4.1T deficit increase added by OBBBA generates compounding interest costs not included in CBO's headline deficit figure. At current 10-year Treasury rates (~4.2%), CBO projects $820B–$1.05T in additional interest payments over 10 years. Midpoint: ~$935B. This is the cost of borrowing to finance the tax cuts — ultimately paid through future taxes or reduced public services. ratePerSecond computed as $935B / 10yr / 365.25 / 86400.",
  },
];

const TREASURY_CATEGORIES = [
  {
    id: "dhs",
    label: "DHS / ICE / Immigration Enforcement",
    subtitle: "Actual Treasury outlays — Dept. of Homeland Security",
    fallbackAmount: 170_000_000_000,
    ratePerSecond: 1_347,
    color: C.accent,
    treasuryKey: "dhs",
    treasuryLive: true,
    lastUpdated: "Live from Treasury",
    lastVerified: "September 2026",
    source: "US Treasury Fiscal Data API — MTS Table 5",
    resolved: false,
    note: "Includes ICE, CBP, USCIS, Coast Guard, TSA. The $75B OBBBA supplement makes ICE larger than all other federal law enforcement combined. Updated monthly when Treasury publishes MTS.",
  },
  {
    id: "dod",
    label: "Dept. of Defense / Iran War (Epic Fury)",
    subtitle: "Actual Treasury outlays — Dept. of Defense",
    fallbackAmount: 44_130_000_000,
    ratePerSecond: 1_099,
    color: "#e67e22",
    treasuryKey: "dod",
    treasuryLive: true,
    lastUpdated: "Live from Treasury",
    lastVerified: "September 2026",
    source: "US Treasury Fiscal Data API — MTS Table 5",
    resolved: false,
    note: "Pentagon confirmed $44.13B in direct military costs through day 211 (Aug 2026). Now in ceasefire/standby phase at ~$95M/day, down from ~$362M/day during active combat. Harvard economist Linda Bilmes projects $1T total economic cost including supply chain, gas prices, and veteran care.",
  },
];

function fmt(n) {
  if (!n && n !== 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${Math.floor(n).toLocaleString()}`;
}

function isStale(lastVerified) {
  const today = new Date("2026-09-29");
  if (!lastVerified) return false;
  const months = { January:0,February:1,March:2,April:3,May:4,June:5,
    July:6,August:7,September:8,October:9,November:10,December:11 };
  const parts = lastVerified.split(" ");
  if (parts.length !== 2) return false;
  const d = new Date(parseInt(parts[1]), months[parts[0]] || 0, 1);
  return (today - d) > 90 * 24 * 60 * 60 * 1000;
}

function buildShareText(total) {
  return `The real cost of Trump policy: ${fmt(total)} in taxpayer exposure and counting. Live tracker by Uncommon Gathering Group:`;
}

function exportImage(total, allCats, allAmounts) {
  const W = 900, H = 560;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  ctx.fillStyle = "#f9f7f2";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.accent;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillStyle = C.ink;
  ctx.font = "700 11px monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText("UNCOMMON GATHERING GROUP", 36, 38);
  ctx.fillStyle = C.ink;
  ctx.font = "700 26px Georgia, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("The Real Cost of Trump Policy", 36, 72);
  ctx.fillStyle = C.inkMid;
  ctx.font = "14px Georgia, serif";
  ctx.fillText("Authorized, allocated & projected taxpayer exposure · September 2026", 36, 96);
  ctx.fillStyle = C.accent;
  ctx.font = "700 58px monospace";
  ctx.textAlign = "right";
  ctx.fillText(fmt(total), W - 36, 86);
  ctx.font = "11px monospace";
  ctx.fillStyle = C.inkLight;
  ctx.fillText("TOTAL TAXPAYER EXPOSURE", W - 36, 102);
  ctx.textAlign = "left";
  ctx.strokeStyle = C.ruleLight;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(36, 118); ctx.lineTo(W - 36, 118); ctx.stroke();
  const rowH = 36;
  const startY = 128;
  const maxRows = Math.min(allCats.length, 11);
  allCats.slice(0, maxRows).forEach((cat, i) => {
    const y = startY + i * rowH;
    const amt = allAmounts[i];
    ctx.fillStyle = cat.color;
    ctx.fillRect(36, y + 4, 4, rowH - 10);
    ctx.fillStyle = cat.resolved ? C.inkLight : C.ink;
    ctx.font = `${cat.resolved ? "12px" : "13px"} Georgia, serif`;
    ctx.fillText(cat.label, 50, y + 20);
    if (cat.resolved) {
      ctx.fillStyle = "#4040a0";
      ctx.font = "700 10px monospace";
      ctx.fillText("RESOLVED", 50, y + 33);
    }
    ctx.textAlign = "right";
    ctx.fillStyle = cat.resolved ? C.inkLight : cat.color;
    ctx.font = "700 14px monospace";
    ctx.fillText(fmt(amt), W - 36, y + 22);
    ctx.textAlign = "left";
    if (i < maxRows - 1) {
      ctx.strokeStyle = C.ruleLight;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(50, y + rowH); ctx.lineTo(W - 36, y + rowH); ctx.stroke();
    }
  });
  ctx.fillStyle = C.ruleLight;
  ctx.fillRect(0, H - 36, W, 36);
  ctx.fillStyle = C.inkLight;
  ctx.font = "11px monospace";
  ctx.fillText("uncommongatheringgroup.com/tracker", 36, H - 14);
  ctx.textAlign = "right";
  ctx.fillText("Data: US Treasury API · CBO · Tax Foundation · September 2026", W - 36, H - 14);
  ctx.textAlign = "left";
  const link = document.createElement("a");
  link.download = `policy-cost-${new Date().toISOString().slice(0,10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function ShareButton({ total, allCats, allAmounts }) {
  const [copied, setCopied] = useState(false);
  const url = "https://uncommongatheringgroup.com/tracker";
  const text = buildShareText(total);
  function handleTwitter() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "noopener");
  }
  function handleBluesky() {
    window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(text + " " + url)}`, "_blank", "noopener");
  }
  function handleCopy() {
    navigator.clipboard.writeText(text + " " + url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  function handleExport() { exportImage(total, allCats, allAmounts); }
  const btnBase = {
    border: `1px solid ${C.rule}`,
    borderRadius: "3px",
    padding: "5px 11px",
    fontSize: "11px",
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
    fontWeight: 600,
    letterSpacing: "0.07em",
    cursor: "pointer",
    transition: "background 0.15s",
  };
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ color: C.inkLight, fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px" }}>SHARE:</span>
      <button onClick={handleTwitter} style={{ ...btnBase, background: C.bg, color: C.inkMid }}>𝕏 / Twitter</button>
      <button onClick={handleBluesky} style={{ ...btnBase, background: C.bg, color: C.inkMid }}>Bluesky</button>
      <button onClick={handleCopy} style={{ ...btnBase, background: copied ? "#edfaed" : C.bg, color: copied ? C.green : C.inkMid }}>
        {copied ? "✓ Copied" : "Copy link"}
      </button>
      <button onClick={handleExport} style={{ ...btnBase, background: C.bg, color: C.inkMid }}>
        ↓ Export image
      </button>
    </div>
  );
}

function AnimatedNumber({ value, style }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  const raf = useRef(null);
  useEffect(() => {
    const start = prev.current;
    const end = value;
    const t0 = performance.now();
    const dur = 350;
    cancelAnimationFrame(raf.current);
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * ease);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = end;
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <span style={style}>{fmt(display)}</span>;
}

function CategoryRow({ cat, amount, treasuryData }) {
  const [open, setOpen] = useState(false);
  const isLive = cat.ratePerSecond > 0;
  const isTreasuryLive = cat.treasuryLive && treasuryData?.agencies?.[cat.treasuryKey];
  const treasuryAgency = isTreasuryLive ? treasuryData.agencies[cat.treasuryKey] : null;
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? C.bg : C.bgCard,
        border: `1px solid ${open ? C.rule : C.ruleLight}`,
        borderLeft: `4px solid ${cat.color}`,
        borderRadius: "4px",
        marginBottom: "8px",
        cursor: "pointer",
        transition: "background 0.2s",
        opacity: cat.resolved ? 0.75 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "15px 18px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
            {cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "2px 7px", borderRadius: "2px", background: "#f0f0fa", color: "#4040a0", border: "1px solid #c0c0e0", letterSpacing: "1px", fontWeight: 700 }}>
                RESOLVED
              </span>
            )}
            {isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "2px 7px", borderRadius: "2px", background: "#edfaed", color: C.green, border: "1px solid #b0dab0", letterSpacing: "1px", fontWeight: 700 }}>
                ● TREASURY LIVE
              </span>
            )}
            {isLive && !isTreasuryLive && !cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "2px 7px", borderRadius: "2px", background: "#fdf0f0", color: "#b02020", border: "1px solid #e8b0b0", letterSpacing: "1px", fontWeight: 700 }}>
                ● ACCRUING
              </span>
            )}
            {!isLive && !isTreasuryLive && !cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "2px 7px", borderRadius: "2px", background: "#f5f3ef", color: C.inkLight, border: `1px solid ${C.rule}`, letterSpacing: "1px", fontWeight: 700 }}>
                FIXED
              </span>
            )}
            <span style={{ fontWeight: 600, fontSize: "15px", color: C.ink, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: "13px", color: C.inkMid, fontStyle: "italic", lineHeight: 1.4, fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {cat.resolved ? cat.resolvedNote || cat.subtitle : cat.subtitle}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <AnimatedNumber value={amount} style={{ fontFamily: "monospace", fontSize: "21px", fontWeight: 700, color: cat.color, letterSpacing: "-0.5px" }} />
          {isLive && !cat.resolved && (
            <div style={{ fontFamily: "monospace", fontSize: "10px", color: C.inkLight, marginTop: "3px" }}>
              +{fmt(cat.ratePerSecond)}/sec
            </div>
          )}
          {isTreasuryLive && treasuryAgency && (
            <div style={{ fontSize: "10px", color: C.green, marginTop: "3px", fontFamily: "monospace" }}>
              Treasury: {treasuryAgency.recordDate}
            </div>
          )}
        </div>
        <span style={{ color: C.rule, fontSize: "12px", fontWeight: 700 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ borderTop: `1px solid ${C.ruleLight}`, padding: "14px 18px 16px" }}>
          <p style={{ fontSize: "14px", color: C.inkMid, lineHeight: "1.75", marginBottom: "12px", fontFamily: "Georgia, serif" }}>{cat.note}</p>
          {isTreasuryLive && treasuryAgency && (
            <div style={{ background: "#f0faf0", border: "1px solid #c0dcc0", borderRadius: "3px", padding: "12px 14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", color: C.green, letterSpacing: "1px", marginBottom: "10px", fontFamily: "monospace", fontWeight: 700 }}>
                TREASURY ACTUAL OUTLAYS — {treasuryAgency.agency?.toUpperCase()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[
                  ["This Month", treasuryAgency.currentMonthActual],
                  ["FY-to-Date", treasuryAgency.currentFiscalYearToDate],
                  ["Prior FY Same Period", treasuryAgency.priorFiscalYearToDate],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: "11px", color: C.inkLight, marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", color: C.green, fontWeight: 700 }}>{fmt(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cat.treasuryLive && !treasuryAgency && (
            <div style={{ fontSize: "13px", color: C.inkLight, fontStyle: "italic", marginBottom: "10px", fontFamily: "Georgia, serif" }}>
              Treasury data loading or temporarily unavailable. Showing estimated figures.
            </div>
          )}
          <div style={{ fontSize: "11px", color: C.inkLight, fontFamily: "monospace", letterSpacing: "0.03em" }}>
            SOURCE: {cat.source} &nbsp;|&nbsp; LAST REVIEWED: {cat.lastUpdated} &nbsp;|&nbsp; FIGURES VERIFIED: {cat.lastVerified}
            {isStale(cat.lastVerified) && (
              <span style={{ color: C.gold, fontFamily: "monospace", fontSize: "11px", marginLeft: "8px" }}>
                ⚠ VERIFY: figure may be outdated
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Site Nav ─────────────────────────────────────────────────────
function SiteHeader({ page, setPage }) {
  return (
    <header style={{
      background: C.bg,
      borderBottom: `1px solid ${C.rule}`,
      position: "sticky",
      top: 0,
      zIndex: 200,
    }}>
      <div style={{ maxWidth: "1020px", margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
        {/* Logo mark */}
        <button
          onClick={() => setPage("home")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "28px", fontWeight: 400, color: C.ink, lineHeight: 1, letterSpacing: "-1px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span>U</span>
            <span>G</span>
          </div>
          <div style={{ width: "1px", height: "32px", background: C.rule }} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "13px", fontWeight: 600, color: C.ink, letterSpacing: "0.12em", lineHeight: 1.2 }}>UNCOMMON</div>
            <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "13px", fontWeight: 600, color: C.ink, letterSpacing: "0.12em", lineHeight: 1.2 }}>GATHERING</div>
            <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "13px", fontWeight: 600, color: C.ink, letterSpacing: "0.12em", lineHeight: 1.2 }}>GROUP</div>
          </div>
        </button>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {[
            ["home", "Home"],
            ["tracker", "Policy Tracker"],
            ["about", "About"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Instrument Sans', system-ui, sans-serif",
                fontSize: "14px",
                fontWeight: page === id ? 600 : 400,
                color: page === id ? C.ink : C.inkMid,
                letterSpacing: "0.03em",
                borderBottom: page === id ? `1px solid ${C.ink}` : "1px solid transparent",
                paddingBottom: "2px",
                transition: "color 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ── Home page ─────────────────────────────────────────────────────
function HomePage({ setPage, total, liveRate }) {
  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Hero */}
      <section style={{ maxWidth: "780px", margin: "0 auto", padding: "100px 28px 80px" }}>
        <p style={{
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
          fontSize: "12px",
          letterSpacing: "0.18em",
          color: C.inkLight,
          textTransform: "uppercase",
          marginBottom: "28px",
        }}>
          Nonprofit Research &amp; Consulting
        </p>
        <h1 style={{
          fontSize: "clamp(38px, 6vw, 64px)",
          fontWeight: 400,
          color: C.ink,
          lineHeight: 1.1,
          margin: "0 0 32px",
          letterSpacing: "-1px",
        }}>
          Where leaders and the public come together to understand what matters.
        </h1>
        <div style={{ width: "48px", height: "1px", background: C.rule, margin: "0 0 36px" }} />
        <p style={{
          fontSize: "18px",
          color: C.inkMid,
          lineHeight: 1.8,
          maxWidth: "600px",
          margin: "0 0 48px",
        }}>
          Uncommon Gathering Group brings business leaders into research on how policy shapes industry, communities, and everyday life. We translate complexity into something decision-makers and the public can actually use.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button
            onClick={() => setPage("tracker")}
            style={{
              background: C.ink,
              color: C.bg,
              border: "none",
              padding: "14px 28px",
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            VIEW POLICY TRACKER
          </button>
          <button
            onClick={() => setPage("about")}
            style={{
              background: "none",
              color: C.ink,
              border: `1px solid ${C.rule}`,
              padding: "14px 28px",
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              borderRadius: "2px",
            }}
          >
            ABOUT THE GROUP
          </button>
        </div>
      </section>

      {/* Rule */}
      <div style={{ borderTop: `1px solid ${C.ruleLight}` }} />

      {/* Mission section */}
      <section style={{ maxWidth: "780px", margin: "0 auto", padding: "80px 28px" }}>
        <p style={{
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
          fontSize: "11px",
          letterSpacing: "0.18em",
          color: C.inkLight,
          textTransform: "uppercase",
          marginBottom: "24px",
        }}>Our Work</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px 64px" }}>
          {[
            {
              title: "Policy Impact Research",
              body: "Rigorous analysis of how legislation, regulation, and executive action affect industries, households, and local economies — grounded in primary data and expert testimony.",
            },
            {
              title: "Business Leader Convening",
              body: "We bring practitioners into the research process. The people closest to policy effects help us ask the right questions and ensure our conclusions reflect operational reality.",
            },
            {
              title: "Public Understanding",
              body: "Complexity is no excuse for obscurity. Our tools, trackers, and publications translate technical findings into language that engaged citizens can act on.",
            },
            {
              title: "Accountability Tracking",
              body: "Our live policy cost tracker monitors authorized spending, projected deficits, and Treasury actual outlays — updated automatically from government sources.",
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <div style={{ width: "24px", height: "1px", background: C.ink, marginBottom: "16px" }} />
              <h3 style={{ fontSize: "17px", fontWeight: 400, color: C.ink, margin: "0 0 12px", lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: "14px", color: C.inkMid, lineHeight: 1.8, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <div style={{ background: C.ink, padding: "56px 28px" }}>
        <div style={{ maxWidth: "780px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <p style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.18em", color: "rgba(249,247,242,0.5)", textTransform: "uppercase", margin: "0 0 10px" }}>Live Right Now</p>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "26px", fontWeight: 400, color: C.bg, margin: 0, lineHeight: 1.3 }}>
              Track the real cost of current policy — updated from US Treasury every month.
            </h2>
          </div>
          <button
            onClick={() => setPage("tracker")}
            style={{
              background: C.bg,
              color: C.ink,
              border: "none",
              padding: "14px 28px",
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              cursor: "pointer",
              borderRadius: "2px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            OPEN TRACKER
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ maxWidth: "1020px", margin: "0 auto", padding: "40px 28px", borderTop: `1px solid ${C.ruleLight}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "12px", color: C.inkLight }}>
          © 2026 Uncommon Gathering Group
        </div>
        <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "12px", color: C.inkLight }}>
          uncommongatheringgroup.com
        </div>
      </footer>
    </div>
  );
}

// ── About page ────────────────────────────────────────────────────
function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "sent" | "error"

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: `1px solid ${C.ruleLight}`,
    borderRadius: "2px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "15px",
    color: C.ink,
    background: C.bgCard,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
    fontSize: "11px",
    letterSpacing: "0.12em",
    color: C.inkLight,
    textTransform: "uppercase",
    marginBottom: "7px",
    fontWeight: 600,
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "80px 28px 120px", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <p style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.18em", color: C.inkLight, textTransform: "uppercase", marginBottom: "24px" }}>
        About
      </p>
      <h1 style={{ fontSize: "42px", fontWeight: 400, color: C.ink, lineHeight: 1.15, margin: "0 0 36px", letterSpacing: "-0.5px" }}>
        A different kind of policy research group.
      </h1>
      <div style={{ width: "40px", height: "1px", background: C.rule, margin: "0 0 40px" }} />

      <div style={{ fontSize: "17px", color: C.inkMid, lineHeight: 1.9, display: "flex", flexDirection: "column", gap: "28px" }}>
        <p>
          Uncommon Gathering Group was built on a simple premise: the people closest to the effects of policy are rarely in the room where it is analyzed. Business leaders, operators, and practitioners hold knowledge that academic and government researchers often lack. We bring them in.
        </p>
        <p>
          Our research model is collaborative. We convene working groups of industry leaders around specific policy questions, combine their operational expertise with primary government data, and produce findings that reflect how decisions actually play out in practice.
        </p>
        <p>
          We are nonpartisan in method and honest about the findings. When policy is costly, we say so and show our work. When it is effective, we say that too. Our policy cost tracker pulls directly from the US Treasury's public fiscal data API and the Congressional Budget Office, with no interpretation required for the raw figures.
        </p>
        <p>
          The organization is led by practitioners with backgrounds in finance, housing, healthcare, and public-sector economics. Rigor and accessibility are not in conflict: good analysis should reach everyone it affects.
        </p>
      </div>

      <div style={{ marginTop: "64px", paddingTop: "40px", borderTop: `1px solid ${C.ruleLight}` }}>
        <p style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.18em", color: C.inkLight, textTransform: "uppercase", marginBottom: "32px" }}>
          Contact
        </p>

        {status === "sent" ? (
          <div style={{ padding: "28px 24px", border: `1px solid ${C.ruleLight}`, borderLeft: `4px solid ${C.green}`, borderRadius: "3px", background: C.bgCard }}>
            <p style={{ fontSize: "16px", color: C.inkMid, margin: 0, lineHeight: 1.7 }}>
              Message received. We'll be in touch shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {status === "error" && (
              <div style={{ padding: "14px 18px", border: `1px solid #e8b0b0`, borderLeft: `4px solid ${C.accent}`, borderRadius: "3px", background: "#fdf0f0", fontSize: "14px", color: C.accent, fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
                Something went wrong. Please try again in a moment.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Subject</label>
              <input
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                placeholder="Research inquiry, partnership, media request..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Message</label>
              <textarea
                name="message"
                required
                value={form.message}
                onChange={handleChange}
                rows={6}
                placeholder="Tell us what you're working on or what you'd like to discuss."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  background: status === "sending" ? C.inkLight : C.ink,
                  color: C.bg,
                  border: "none",
                  padding: "14px 32px",
                  fontFamily: "'Instrument Sans', system-ui, sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  cursor: status === "sending" ? "default" : "pointer",
                  borderRadius: "2px",
                  transition: "background 0.2s",
                }}
              >
                {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Policy Tracker page ────────────────────────────────────────────
function TrackerPage({ elapsed, treasuryData, treasuryStatus, fetchTreasury, treasuryAmounts, staticAmounts, allCats, allAmounts, total, liveRate }) {
  const [activeTab, setActiveTab] = useState("tracker");
  const [showMarquee, setShowMarquee] = useState(true);
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const sessionAccrued = liveRate * elapsed;

  return (
    <div>
      {/* Marquee ticker */}
      {showMarquee && (
        <div style={{ background: C.ink, overflow: "hidden", whiteSpace: "nowrap", padding: "8px 0", position: "relative" }}>
          <div style={{ display: "inline-block", animation: "marquee 50s linear infinite", fontFamily: "monospace", fontSize: "12px", letterSpacing: "1px", color: C.bg, fontWeight: 500 }}>
            {[...allCats, ...allCats].map((cat, i) => (
              <span key={i}>&nbsp;&nbsp;{cat.label.toUpperCase()}: {fmt(allAmounts[i % allCats.length])}&nbsp;&nbsp;·</span>
            ))}
            &nbsp;&nbsp;TOTAL: {fmt(total)}&nbsp;&nbsp;·&nbsp;&nbsp;
          </div>
          <button
            onClick={() => setShowMarquee(false)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(249,247,242,0.12)", border: "none", color: C.bg, borderRadius: "2px", fontFamily: "monospace", fontSize: "10px", padding: "2px 8px", cursor: "pointer", fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}
      {!showMarquee && (
        <div style={{ background: C.bg, borderBottom: `1px solid ${C.ruleLight}`, padding: "3px 0", textAlign: "center" }}>
          <button
            onClick={() => setShowMarquee(true)}
            style={{ background: "transparent", border: "none", color: C.inkLight, fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "1px" }}
          >
            ▶ SHOW TICKER
          </button>
        </div>
      )}

      {/* Tracker header */}
      <div style={{ background: C.bgCard, borderBottom: `1px solid ${C.ruleLight}` }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "28px", fontWeight: 400, color: C.ink, margin: "0 0 6px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                The Real Cost of Trump Policy
              </h1>
              <div style={{ fontSize: "13px", color: C.inkMid, fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: "12px" }}>
                Authorized, allocated &amp; projected taxpayer exposure · Updated September 2026
              </div>
              <div style={{ marginBottom: "12px" }}>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  padding: "3px 9px",
                  borderRadius: "2px",
                  background: treasuryStatus === "live" ? "#edfaed" : treasuryStatus === "loading" ? "#fffbe6" : "#fdf0f0",
                  color: treasuryStatus === "live" ? C.green : treasuryStatus === "loading" ? C.gold : C.accent,
                  border: `1px solid ${treasuryStatus === "live" ? "#b0dab0" : treasuryStatus === "loading" ? "#e0d080" : "#e8b0b0"}`,
                  fontWeight: 600,
                }}>
                  {treasuryStatus === "live" ? `● TREASURY LIVE — ${treasuryData?.asOf}` : treasuryStatus === "loading" ? "○ FETCHING TREASURY DATA..." : "○ TREASURY UNAVAILABLE — USING ESTIMATES"}
                </span>
              </div>
              <ShareButton total={total} allCats={allCats} allAmounts={allAmounts} />
            </div>
            <div style={{ textAlign: "right" }}>
              <AnimatedNumber value={total} style={{ fontFamily: "monospace", fontSize: "36px", fontWeight: 700, color: C.accent, letterSpacing: "-1px", lineHeight: 1 }} />
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: C.inkLight, marginTop: "6px" }}>+{fmt(liveRate)}/sec accruing</div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: C.rule, marginTop: "3px" }}>{mins}m {secs}s this session</div>
              {sessionAccrued > 0 && (
                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(192,57,43,0.7)", marginTop: "3px" }}>
                  +{fmt(sessionAccrued)} since you opened this
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 28px" }}>
        {/* Tab nav */}
        <div style={{ padding: "20px 0 16px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            {[
              ["tracker",       "Cost Tracker",     C.inkMid],
              ["family",        "Family Impact",    C.accent],
              ["recession",     "Recession Risk",   "#d95926"],
              ["counterfactual","What Could Be",    "#2471a3"],
            ].map(([id, label, color]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "7px 14px", fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "12px", letterSpacing: "0.06em", fontWeight: 600, border: `1px solid ${activeTab === id ? color : C.ruleLight}`, borderRadius: "2px", cursor: "pointer", background: activeTab === id ? color : C.bgCard, color: activeTab === id ? "#fff" : C.inkMid, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            {[
              ["housing",  "Housing Cuts",     C.green],
              ["jobs",     "Federal Jobs",     C.green],
              ["medicaid", "Medicaid Loss",    C.green],
              ["snap",     "SNAP Cuts",        C.green],
              ["tariff",   "Tariff by State",  C.green],
            ].map(([id, label, color]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "7px 14px", fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "12px", letterSpacing: "0.06em", fontWeight: 600, border: `1px solid ${activeTab === id ? color : C.ruleLight}`, borderRadius: "2px", cursor: "pointer", background: activeTab === id ? color : C.bgCard, color: activeTab === id ? "#fff" : C.inkMid, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              ["loans",     "Student Loans",    C.gold],
              ["mortgage",  "Mortgage & Yields", C.gold],
              ["changelog", "What's New",       C.inkMid],
            ].map(([id, label, color]) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ padding: "7px 14px", fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "12px", letterSpacing: "0.06em", fontWeight: 600, border: `1px solid ${activeTab === id ? color : C.ruleLight}`, borderRadius: "2px", cursor: "pointer", background: activeTab === id ? color : C.bgCard, color: activeTab === id ? "#fff" : C.inkMid, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderBottom: `1px solid ${C.ruleLight}`, marginBottom: "24px" }} />

        {activeTab === "recession" && <RecessionIndicator />}
        {activeTab === "counterfactual" && <CounterfactualTab trackerTotal={total} />}
        {activeTab === "family" && <FamilyCalculator />}
        {activeTab === "housing" && <HousingCuts />}
        {activeTab === "jobs" && <JobsTracker />}
        {activeTab === "medicaid" && <MedicaidCoverage />}
        {activeTab === "snap" && <SnapByState />}
        {activeTab === "tariff" && <TariffMap />}
        {activeTab === "loans" && <StudentLoanCalc />}
        {activeTab === "mortgage" && <MortgageYieldChart />}
        {activeTab === "changelog" && <Changelog />}

        {activeTab === "tracker" && (
          <div style={{ paddingBottom: "60px" }}>
            <div style={{ background: C.bg, border: `1px solid ${C.ruleLight}`, borderRadius: "3px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", color: C.inkMid, lineHeight: "1.8", fontFamily: "Georgia, serif" }}>
              <strong style={{ color: C.ink, fontFamily: "'Instrument Sans', system-ui, sans-serif", fontWeight: 600 }}>How this works:</strong>{" "}
              Items marked <span style={{ color: C.green, fontFamily: "monospace", fontWeight: 700 }}>TREASURY LIVE</span> pull real outlay data from the US Treasury Fiscal Data API, updated monthly.{" "}
              <span style={{ color: "#b02020", fontFamily: "monospace", fontWeight: 700 }}>ACCRUING</span> items tick forward continuously based on authorized multi-year spending rates.{" "}
              <span style={{ color: C.inkLight, fontFamily: "monospace", fontWeight: 700 }}>FIXED</span> items are one-time allocations.{" "}
              <span style={{ color: "#4040a0", fontFamily: "monospace", fontWeight: 700 }}>RESOLVED</span> items are tracked for accountability but no longer accruing. Click any row to expand sources and context.
              {treasuryData?.asOf && <span style={{ color: C.green }}> Treasury data current as of {treasuryData.asOf}.</span>}
            </div>

            <div style={{ fontFamily: "monospace", fontSize: "11px", color: C.green, letterSpacing: "2px", marginBottom: "10px", paddingLeft: "4px", fontWeight: 700 }}>
              ● LIVE TREASURY DATA
            </div>
            {TREASURY_CATEGORIES.map((cat, i) => (
              <CategoryRow key={cat.id} cat={cat} amount={treasuryAmounts[i]} treasuryData={treasuryData} />
            ))}

            <div style={{ fontFamily: "monospace", fontSize: "11px", color: C.inkLight, letterSpacing: "2px", margin: "20px 0 10px", paddingLeft: "4px", fontWeight: 700 }}>
              ○ CBO / AUTHORIZED FIGURES
            </div>
            {STATIC_CATEGORIES.map((cat, i) => (
              <CategoryRow key={cat.id} cat={cat} amount={staticAmounts[i]} treasuryData={null} />
            ))}

            {/* Total bar */}
            <div style={{ marginTop: "20px", background: C.bgCard, border: `1px solid ${C.ruleLight}`, borderLeft: `4px solid ${C.accent}`, borderRadius: "3px", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "12px", letterSpacing: "0.1em", color: C.inkMid, textTransform: "uppercase", fontWeight: 600 }}>Total Taxpayer Exposure</div>
                <div style={{ fontSize: "13px", color: C.inkLight, marginTop: "5px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Treasury actual + CBO projected + authorized</div>
              </div>
              <AnimatedNumber value={total} style={{ fontFamily: "monospace", fontSize: "40px", fontWeight: 700, color: C.accent, letterSpacing: "-1px" }} />
            </div>

            {/* What this could fund */}
            <div style={{ marginTop: "16px", background: C.bgCard, border: `1px solid ${C.ruleLight}`, borderLeft: `4px solid ${C.green}`, borderRadius: "3px", padding: "18px 22px" }}>
              <div style={{ fontFamily: "'Instrument Sans', system-ui, sans-serif", fontSize: "11px", letterSpacing: "0.14em", color: C.green, marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>
                What This Could Fund Instead
              </div>
              {[
                { label: "Section 8 Voucher Waitlist (1.5M households)", annual: 11_000_000_000, unit: "years" },
                { label: "Universal Pre-K, Nationwide", annual: 60_000_000_000, unit: "years" },
                { label: "Eliminate US Child Poverty", annual: 90_000_000_000, unit: "years" },
                { label: "Rebuild Every Structurally Deficient Bridge", annual: 125_000_000_000, unit: "times over" },
              ].map(({ label, annual, unit }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.ruleLight}`, flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: C.inkMid, fontFamily: "Georgia, serif" }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "14px", color: C.green, fontWeight: 700 }}>{(total / annual).toFixed(1)}× {unit}</span>
                </div>
              ))}
            </div>

            <FamilyCalculator />

            <div style={{ marginTop: "32px", paddingTop: "18px", borderTop: `1px solid ${C.ruleLight}`, fontSize: "12px", color: C.inkLight, lineHeight: "2", textAlign: "center", fontFamily: "'Instrument Sans', system-ui, sans-serif" }}>
              Research and analysis by Uncommon Gathering Group · uncommongatheringgroup.com<br />
              Treasury data: fiscaldata.treasury.gov (MTS Table 5, free public API, no key required)<br />
              Other sources: CBO · Tax Foundation · Brennan Center · National Immigration Forum · Pentagon Congressional Testimony · Just Security · Food Research and Action Center · AP · NPR · CBS News · CNN · ABC News<br />
              <span>Treasury figures refresh automatically. CBO/projection figures last reviewed and verified September 2026.</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

// ── Root app ──────────────────────────────────────────────────────
export default function App() {
  const getPageFromHash = () => {
    const h = window.location.hash.replace("#", "");
    return ["home", "tracker", "about"].includes(h) ? h : "home";
  };
  const [page, setPage] = useState(getPageFromHash);
  const startRef = useRef(Date.now());

  const navigateTo = useCallback((p) => {
    window.history.pushState({ page: p }, "", p === "home" ? "/" : `#${p}`);
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onPop = (e) => {
      const p = e.state?.page || getPageFromHash();
      setPage(p);
    };
    window.addEventListener("popstate", onPop);
    // set initial history entry
    window.history.replaceState({ page }, "", page === "home" ? "/" : `#${page}`);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const [elapsed, setElapsed] = useState(0);
  const [treasuryData, setTreasuryData] = useState(null);
  const [treasuryStatus, setTreasuryStatus] = useState("loading");

  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchTreasury = useCallback(async () => {
    try {
      setTreasuryStatus("loading");
      const res = await fetch("/api/treasury");
      const data = await res.json();
      if (data.success) { setTreasuryData(data); setTreasuryStatus("live"); }
      else setTreasuryStatus("error");
    } catch { setTreasuryStatus("error"); }
  }, []);

  useEffect(() => {
    fetchTreasury();
    const id = setInterval(fetchTreasury, 6 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchTreasury]);

  const treasuryAmounts = TREASURY_CATEGORIES.map((cat) => {
    const agency = treasuryData?.agencies?.[cat.treasuryKey];
    if (agency?.currentFiscalYearToDate) {
      const recordMs = new Date(agency.recordDate).getTime();
      const secondsSinceRecord = Math.max(0, (Date.now() - recordMs) / 1000);
      return agency.currentFiscalYearToDate + cat.ratePerSecond * secondsSinceRecord;
    }
    return cat.fallbackAmount + cat.ratePerSecond * elapsed;
  });

  const staticAmounts = STATIC_CATEGORIES.map((cat) => cat.baseAmount + cat.ratePerSecond * elapsed);
  const allAmounts = [...treasuryAmounts, ...staticAmounts];
  const allCats = [...TREASURY_CATEGORIES, ...STATIC_CATEGORIES];
  const total = allAmounts.reduce((a, b) => a + b, 0);
  const liveRate = allCats.reduce((a, c) => a + c.ratePerSecond, 0);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600&display=swap" rel="stylesheet" />

      <SiteHeader page={page} setPage={navigateTo} />

      {page === "home" && <HomePage setPage={navigateTo} total={total} liveRate={liveRate} />}
      {page === "about" && <AboutPage />}
      {page === "tracker" && (
        <TrackerPage
          elapsed={elapsed}
          treasuryData={treasuryData}
          treasuryStatus={treasuryStatus}
          fetchTreasury={fetchTreasury}
          treasuryAmounts={treasuryAmounts}
          staticAmounts={staticAmounts}
          allCats={allCats}
          allAmounts={allAmounts}
          total={total}
          liveRate={liveRate}
        />
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f9f7f2; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #ede9e2; }
        ::-webkit-scrollbar-thumb { background: #c8c2b8; border-radius: 3px; }
      `}</style>
    </div>
  );
}
