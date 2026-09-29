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
    color: "#c0392b",
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
  // Returns true if lastVerified is more than 90 days before today (Sept 2026)
  // Since all figures are "September 2026" they are current — but future edits may lag
  const today = new Date("2026-09-29");
  if (!lastVerified) return false;
  // Parse "Month YYYY" format
  const months = { January:0,February:1,March:2,April:3,May:4,June:5,
    July:6,August:7,September:8,October:9,November:10,December:11 };
  const parts = lastVerified.split(" ");
  if (parts.length !== 2) return false;
  const d = new Date(parseInt(parts[1]), months[parts[0]] || 0, 1);
  return (today - d) > 90 * 24 * 60 * 60 * 1000;
}

// Share helpers
function buildShareText(total) {
  return `The real cost of Trump policy: ${fmt(total)} in taxpayer exposure and counting. Live tracker by @BMWolford:`;
}

// Export to image — draws a summary card on a hidden canvas and triggers download
function exportImage(total, allCats, allAmounts) {
  const W = 900, H = 560;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2; canvas.height = H * 2; // 2x for retina
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = "#f7f6f3";
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(0, 0, W, 6);

  // Byline
  ctx.fillStyle = "#c0392b";
  ctx.font = "700 11px monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText("B.M. WOLFORD / BMW SUBSTACK", 36, 38);

  // Title
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "700 26px Georgia, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("The Real Cost of Trump Policy", 36, 72);

  // Subtitle
  ctx.fillStyle = "#6b6b6b";
  ctx.font = "14px Georgia, serif";
  ctx.fillText("Authorized, allocated & projected taxpayer exposure · September 2026", 36, 96);

  // Big total
  ctx.fillStyle = "#c0392b";
  ctx.font = "700 58px monospace";
  ctx.textAlign = "right";
  ctx.fillText(fmt(total), W - 36, 86);
  ctx.font = "11px monospace";
  ctx.fillStyle = "#6b6b6b";
  ctx.fillText("TOTAL TAXPAYER EXPOSURE", W - 36, 102);
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = "#e0ddd8";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(36, 118); ctx.lineTo(W - 36, 118); ctx.stroke();

  // Category rows
  const rowH = 36;
  const startY = 128;
  const maxRows = Math.min(allCats.length, 11);

  allCats.slice(0, maxRows).forEach((cat, i) => {
    const y = startY + i * rowH;
    const amt = allAmounts[i];

    // Left color bar
    ctx.fillStyle = cat.color;
    ctx.fillRect(36, y + 4, 4, rowH - 10);

    // Label
    ctx.fillStyle = cat.resolved ? "#6b6b6b" : "#1a1a1a";
    ctx.font = `${cat.resolved ? "12px" : "13px"} Georgia, serif`;
    ctx.fillText(cat.label, 50, y + 20);

    // Resolved badge
    if (cat.resolved) {
      ctx.fillStyle = "#4040a0";
      ctx.font = "700 10px monospace";
      ctx.fillText("✓ RESOLVED", 50, y + 33);
    }

    // Amount
    ctx.textAlign = "right";
    ctx.fillStyle = cat.resolved ? "#6b6b6b" : cat.color;
    ctx.font = "700 14px monospace";
    ctx.fillText(fmt(amt), W - 36, y + 22);
    ctx.textAlign = "left";

    // Row divider
    if (i < maxRows - 1) {
      ctx.strokeStyle = "#e0ddd8";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(50, y + rowH); ctx.lineTo(W - 36, y + rowH); ctx.stroke();
    }
  });

  // Footer
  ctx.fillStyle = "#eeebe6";
  ctx.fillRect(0, H - 36, W, 36);
  ctx.fillStyle = "#6b6b6b";
  ctx.font = "11px monospace";
  ctx.fillText("policy-cost-tracker.vercel.app", 36, H - 14);
  ctx.textAlign = "right";
  ctx.fillText("Data: US Treasury API · CBO · Tax Foundation · September 2026", W - 36, H - 14);
  ctx.textAlign = "left";

  // Download
  const link = document.createElement("a");
  link.download = `policy-cost-${new Date().toISOString().slice(0,10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function ShareButton({ total, allCats, allAmounts }) {
  const [copied, setCopied] = useState(false);
  const url = "https://policy-cost-tracker.vercel.app";
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
  function handleExport() {
    exportImage(total, allCats, allAmounts);
  }

  const btnBase = {
    border: "1px solid #d8d5d0",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "11px",
    fontFamily: "monospace",
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ color: "#6b6b6b", fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px" }}>SHARE:</span>
      <button onClick={handleTwitter} style={{ ...btnBase, background: "#f5f4f2", color: "#333" }}>𝕏 / Twitter</button>
      <button onClick={handleBluesky} style={{ ...btnBase, background: "#f5f4f2", color: "#333" }}>Bluesky</button>
      <button onClick={handleCopy} style={{ ...btnBase, background: copied ? "#edfaed" : "#f5f4f2", color: copied ? "#1a6e1a" : "#333" }}>
        {copied ? "✓ COPIED" : "Copy link"}
      </button>
      <button onClick={handleExport} style={{ ...btnBase, background: "#f5f4f2", color: "#333" }}>
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
        background: open ? "#fafaf8" : "#ffffff",
        border: `1px solid ${open ? "#c8c4be" : "#e0ddd8"}`,
        borderLeft: `5px solid ${cat.color}`,
        borderRadius: "6px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "background 0.2s",
        opacity: cat.resolved ? 0.75 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "5px" }}>
            {/* Status badges */}
            {cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#f0f0fa", color: "#4040a0", border: "1px solid #c0c0e0", letterSpacing: "1px", fontWeight: 700 }}>
                ✓ RESOLVED
              </span>
            )}
            {isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#edfaed", color: "#1a6e1a", border: "1px solid #b0dab0", letterSpacing: "1px", fontWeight: 700 }}>
                ● TREASURY LIVE
              </span>
            )}
            {isLive && !isTreasuryLive && !cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#fdf0f0", color: "#b02020", border: "1px solid #e8b0b0", letterSpacing: "1px", fontWeight: 700 }}>
                ● ACCRUING
              </span>
            )}
            {!isLive && !isTreasuryLive && !cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#f2f2f2", color: "#555555", border: "1px solid #d0d0d0", letterSpacing: "1px", fontWeight: 700 }}>
                FIXED
              </span>
            )}
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: "13px", color: "#5a5a5a", fontStyle: "italic", lineHeight: 1.4 }}>
            {cat.resolved ? cat.resolvedNote || cat.subtitle : cat.subtitle}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <AnimatedNumber value={amount} style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: cat.color, letterSpacing: "-0.5px" }} />
          {isLive && !cat.resolved && (
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#888888", marginTop: "3px" }}>
              +{fmt(cat.ratePerSecond)}/sec
            </div>
          )}
          {isTreasuryLive && treasuryAgency && (
            <div style={{ fontSize: "11px", color: "#1a6e1a", marginTop: "3px" }}>
              Treasury: {treasuryAgency.recordDate}
            </div>
          )}
        </div>
        <span style={{ color: "#aaaaaa", fontSize: "14px", fontWeight: 700 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #eeebe6", padding: "14px 18px 16px" }}>
          <p style={{ fontSize: "14px", color: "#333333", lineHeight: "1.75", marginBottom: "12px" }}>{cat.note}</p>
          {isTreasuryLive && treasuryAgency && (
            <div style={{ background: "#f0faf0", border: "1px solid #c0dcc0", borderRadius: "4px", padding: "12px 14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#1a6e1a", letterSpacing: "1px", marginBottom: "10px", fontFamily: "monospace", fontWeight: 700 }}>
                TREASURY ACTUAL OUTLAYS — {treasuryAgency.agency?.toUpperCase()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[
                  ["This Month", treasuryAgency.currentMonthActual],
                  ["FY-to-Date", treasuryAgency.currentFiscalYearToDate],
                  ["Prior FY Same Period", treasuryAgency.priorFiscalYearToDate],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: "11px", color: "#6b6b6b", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#1a6e1a", fontWeight: 700 }}>{fmt(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cat.treasuryLive && !treasuryAgency && (
            <div style={{ fontSize: "13px", color: "#6b6b6b", fontStyle: "italic", marginBottom: "10px" }}>
              Treasury data loading or temporarily unavailable. Showing estimated figures.
            </div>
          )}
          <div style={{ fontSize: "12px", color: "#8a8a8a", fontFamily: "monospace" }}>
            SOURCE: {cat.source} &nbsp;|&nbsp; LAST REVIEWED: {cat.lastUpdated} &nbsp;|&nbsp; FIGURES VERIFIED: {cat.lastVerified}
            {isStale(cat.lastVerified) && (
              <span style={{ color: "#a06800", fontFamily: "monospace", fontSize: "11px", marginLeft: "8px" }}>
                ⚠ VERIFY: figure may be outdated
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [treasuryData, setTreasuryData] = useState(null);
  const [treasuryStatus, setTreasuryStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("tracker");
  const [showMarquee, setShowMarquee] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchTreasury = useCallback(async () => {
    try {
      setTreasuryStatus("loading");
      const res = await fetch("/api/treasury");
      const data = await res.json();
      if (data.success) {
        setTreasuryData(data);
        setTreasuryStatus("live");
      } else {
        setTreasuryStatus("error");
      }
    } catch {
      setTreasuryStatus("error");
    }
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

  const staticAmounts = STATIC_CATEGORIES.map(
    (cat) => cat.baseAmount + cat.ratePerSecond * elapsed
  );

  const allAmounts = [...treasuryAmounts, ...staticAmounts];
  const allCats = [...TREASURY_CATEGORIES, ...STATIC_CATEGORIES];
  const total = allAmounts.reduce((a, b) => a + b, 0);
  const liveRate = allCats.reduce((a, c) => a + c.ratePerSecond, 0);

  // Session elapsed display
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);

  // Accrued this session
  const sessionAccrued = liveRate * elapsed;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f6f3", color: "#1a1a1a", fontFamily: "Georgia, serif" }}>

      {/* Marquee ticker with toggle */}
      {showMarquee && (
        <div style={{ background: "#c0392b", overflow: "hidden", whiteSpace: "nowrap", padding: "9px 0", position: "relative" }}>
          <div style={{ display: "inline-block", animation: "marquee 45s linear infinite", fontFamily: "monospace", fontSize: "13px", letterSpacing: "1px", color: "#fff", fontWeight: 600 }}>
            {[...allCats, ...allCats].map((cat, i) => (
              <span key={i}>&nbsp;&nbsp;{cat.label.toUpperCase()}: {fmt(allAmounts[i % allCats.length])}&nbsp;&nbsp;●</span>
            ))}
            &nbsp;&nbsp;TOTAL TAXPAYER EXPOSURE: {fmt(total)}&nbsp;&nbsp;●&nbsp;&nbsp;
          </div>
          <button
            onClick={() => setShowMarquee(false)}
            title="Hide ticker"
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.15)", border: "none", color: "#fff", borderRadius: "3px",
              fontFamily: "monospace", fontSize: "11px", padding: "2px 8px", cursor: "pointer", fontWeight: 700,
            }}
          >
            ✕ HIDE
          </button>
        </div>
      )}
      {!showMarquee && (
        <div style={{ background: "#fff5f5", borderBottom: "1px solid #ffd0d0", padding: "4px 0", textAlign: "center" }}>
          <button
            onClick={() => setShowMarquee(true)}
            style={{
              background: "transparent", border: "none", color: "#c0392b", fontFamily: "monospace",
              fontSize: "11px", cursor: "pointer", letterSpacing: "1px",
            }}
          >
            ▶ SHOW TICKER
          </button>
        </div>
      )}

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#ffffff", borderBottom: "1px solid #e0ddd8", boxShadow: "0 1px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "18px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "3px", color: "#c0392b", marginBottom: "7px", fontWeight: 700 }}>
                B.M. WOLFORD / BMW SUBSTACK
              </div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1a1a1a", margin: 0, lineHeight: 1.2 }}>
                The Real Cost of Trump Policy
              </h1>
              <div style={{ fontSize: "13px", color: "#4a4a4a", marginTop: "6px" }}>
                Authorized, allocated &amp; projected taxpayer exposure · Updated September 2026
              </div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", borderRadius: "3px", display: "inline-block",
                  background: treasuryStatus === "live" ? "#edfaed" : treasuryStatus === "loading" ? "#fffbe6" : "#fdf0f0",
                  color: treasuryStatus === "live" ? "#1a6e1a" : treasuryStatus === "loading" ? "#7a6010" : "#b02020",
                  border: `1px solid ${treasuryStatus === "live" ? "#b0dab0" : treasuryStatus === "loading" ? "#e0d080" : "#e8b0b0"}`,
                  fontWeight: 600,
                }}>
                  {treasuryStatus === "live" ? `● TREASURY LIVE — ${treasuryData?.asOf}` : treasuryStatus === "loading" ? "○ FETCHING TREASURY DATA..." : "○ TREASURY UNAVAILABLE — USING ESTIMATES"}
                </span>
              </div>
              {/* Share buttons in header */}
              <div style={{ marginTop: "10px" }}>
                <ShareButton total={total} allCats={allCats} allAmounts={allAmounts} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: "34px", fontWeight: 700, color: "#c0392b", letterSpacing: "-1px", lineHeight: 1 }}>
                <AnimatedNumber value={total} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888888", marginTop: "5px" }}>+{fmt(liveRate)}/sec accruing</div>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#aaaaaa", marginTop: "3px" }}>{mins}m {secs}s this session</div>
              {/* Since you opened this tab */}
              {sessionAccrued > 0 && (
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(192,57,43,0.8)", marginTop: "3px" }}>
                  +{fmt(sessionAccrued)} since you opened this
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        {/* Tab nav */}
        <div style={{ padding: "16px 0 20px", marginBottom: "8px" }}>
          {/* Row 1: main tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            {[
              ["tracker",       "📊 Cost Tracker",     "#7b3fa0"],
              ["family",        "👨‍👩‍👧 Family Impact",    "#c0392b"],
              ["recession",     "📉 Recession Risk",   "#d95926"],
              ["counterfactual","💡 What Could Be",    "#2471a3"],
            ].map(([id, label, color]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: "9px 16px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  fontWeight: 700,
                  border: `2px solid ${color}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: activeTab === id ? color : "#ffffff",
                  color: activeTab === id ? "#fff" : color,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Row 2: state/data tabs */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
            {[
              ["housing",  "🏠 Housing Cuts",     "#1a6e1a"],
              ["jobs",     "👷 Federal Jobs",      "#1a6e1a"],
              ["medicaid", "🏥 Medicaid Loss",     "#1a6e1a"],
              ["snap",     "🛒 SNAP Cuts",         "#1a6e1a"],
              ["tariff",   "🌐 Tariff by State",   "#1a6e1a"],
            ].map(([id, label, color]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: "9px 16px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  fontWeight: 700,
                  border: `2px solid ${color}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: activeTab === id ? color : "#ffffff",
                  color: activeTab === id ? "#fff" : color,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Row 3: calculators + changelog */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              ["loans",     "🎓 Student Loans",    "#a06800"],
              ["mortgage",  "🏡 Mortgage & Yields","#a06800"],
              ["changelog", "🆕 What's New",       "#4a4a4a"],
            ].map(([id, label, color]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: "9px 16px",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  fontWeight: 700,
                  border: `2px solid ${color}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: activeTab === id ? color : "#ffffff",
                  color: activeTab === id ? "#fff" : color,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderBottom: "2px solid #e0ddd8", marginBottom: "24px" }} />

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

            <div style={{ background: "#f9f8f6", border: "1px solid #e0ddd8", borderRadius: "6px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", color: "#333333", lineHeight: "1.8" }}>
              <strong style={{ color: "#1a1a1a", fontSize: "14px" }}>How this works:</strong> Items marked{" "}
              <span style={{ color: "#1a6e1a", fontFamily: "monospace", fontWeight: 700 }}>TREASURY LIVE</span> pull real outlay data automatically from the US Treasury Fiscal Data API, updated each month. Items marked{" "}
              <span style={{ color: "#b02020", fontFamily: "monospace", fontWeight: 700 }}>ACCRUING</span> tick forward continuously based on authorized multi-year spending rates.{" "}
              <span style={{ color: "#555555", fontFamily: "monospace", fontWeight: 700 }}>FIXED</span> items are one-time allocations.{" "}
              <span style={{ color: "#4040a0", fontFamily: "monospace", fontWeight: 700 }}>✓ RESOLVED</span> items are tracked for accountability but are no longer accruing. Click any row to expand sources and context.{" "}
              Figures marked <span style={{ color: "#a06800", fontFamily: "monospace", fontWeight: 700 }}>⚠ VERIFY</span> have not been reviewed in more than 90 days and should be independently confirmed before citing.
              {treasuryData?.asOf && <span style={{ color: "#1a6e1a" }}> Treasury data current as of {treasuryData.asOf}.</span>}
            </div>

            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1a6e1a", letterSpacing: "2px", marginBottom: "10px", paddingLeft: "4px", fontWeight: 700 }}>
              ● LIVE TREASURY DATA
            </div>
            {TREASURY_CATEGORIES.map((cat, i) => (
              <CategoryRow key={cat.id} cat={cat} amount={treasuryAmounts[i]} treasuryData={treasuryData} />
            ))}

            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#6b6b6b", letterSpacing: "2px", margin: "20px 0 10px", paddingLeft: "4px", fontWeight: 700 }}>
              ○ CBO / AUTHORIZED FIGURES
            </div>
            {STATIC_CATEGORIES.map((cat, i) => (
              <CategoryRow key={cat.id} cat={cat} amount={staticAmounts[i]} treasuryData={null} />
            ))}

            {/* Total bar */}
            <div style={{ marginTop: "20px", background: "#ffffff", border: "2px solid rgba(192,57,43,0.27)", borderRadius: "6px", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "13px", letterSpacing: "2px", color: "#333333", textTransform: "uppercase", fontWeight: 700 }}>Total Taxpayer Exposure</div>
                <div style={{ fontSize: "13px", color: "#888888", marginTop: "5px" }}>Treasury actual + CBO projected + authorized</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "40px", fontWeight: 700, color: "#c0392b", letterSpacing: "-1px" }}>
                <AnimatedNumber value={total} />
              </div>
            </div>

            {/* What this could fund */}
            <div style={{ marginTop: "16px", background: "#f2fbf2", border: "1px solid #c8e6c8", borderRadius: "6px", padding: "18px 22px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "2px", color: "#1a6e1a", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>
                What This Could Fund Instead
              </div>
              {[
                { label: "Section 8 Voucher Waitlist (1.5M households)", annual: 11_000_000_000, unit: "years" },
                { label: "Universal Pre-K, Nationwide", annual: 60_000_000_000, unit: "years" },
                { label: "Eliminate US Child Poverty", annual: 90_000_000_000, unit: "years" },
                { label: "Rebuild Every Structurally Deficient Bridge", annual: 125_000_000_000, unit: "times over" },
              ].map(({ label, annual, unit }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #c8e6c8", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#333333" }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#1a6e1a", fontWeight: 700 }}>{(total / annual).toFixed(1)}× {unit}</span>
                </div>
              ))}
            </div>

            {/* Family calculator */}
            <FamilyCalculator />

            {/* Footer */}
            <div style={{ marginTop: "32px", paddingTop: "18px", borderTop: "1px solid #e0ddd8", fontSize: "12px", color: "#9a9a9a", lineHeight: "2", textAlign: "center" }}>
              Research and analysis by B.M. Wolford for BMW Substack<br />
              Treasury data: fiscaldata.treasury.gov (MTS Table 5, free public API, no key required)<br />
              Other sources: CBO · Tax Foundation · Brennan Center · National Immigration Forum · Pentagon Congressional Testimony · Just Security · Food Research and Action Center · AP · NPR · CBS News · CNN · ABC News<br />
              <span style={{ color: "#9a9a9a" }}>Treasury figures refresh automatically. CBO/projection figures last reviewed and verified September 2026.</span>
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f7f6f3; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0ede8; }
        ::-webkit-scrollbar-thumb { background: #ccc8c2; border-radius: 3px; }
      `}</style>
    </div>
  );
}
