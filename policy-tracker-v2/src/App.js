import RecessionIndicator from './RecessionIndicator';
import CounterfactualTab from './CounterfactualTab';
import FamilyCalculator from './FamilyCalculator';
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
    note: "CBO updated dynamic score: $4.1–4.7T deficit increase over 10 years (revised from original $3.4T static score). Top 1% receives avg $50,000/yr tax cut. Bottom 10% lose $1,600/yr. National debt-to-GDP projected to climb from 162% to 190%+ over 35 years.",
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
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Top accent bar
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(0, 0, W, 6);

  // Byline
  ctx.fillStyle = "#e05555";
  ctx.font = "700 11px monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText("B.M. WOLFORD / BMW SUBSTACK", 36, 38);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px Georgia, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText("The Real Cost of Trump Policy", 36, 72);

  // Subtitle
  ctx.fillStyle = "#888";
  ctx.font = "14px Georgia, serif";
  ctx.fillText("Authorized, allocated & projected taxpayer exposure · September 2026", 36, 96);

  // Big total
  ctx.fillStyle = "#e05555";
  ctx.font = "700 58px monospace";
  ctx.textAlign = "right";
  ctx.fillText(fmt(total), W - 36, 86);
  ctx.font = "11px monospace";
  ctx.fillStyle = "#555";
  ctx.fillText("TOTAL TAXPAYER EXPOSURE", W - 36, 102);
  ctx.textAlign = "left";

  // Divider
  ctx.strokeStyle = "#222";
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
    ctx.fillStyle = cat.resolved ? "#666" : "#ccc";
    ctx.font = `${cat.resolved ? "12px" : "13px"} Georgia, serif`;
    ctx.fillText(cat.label, 50, y + 20);

    // Resolved badge
    if (cat.resolved) {
      ctx.fillStyle = "#8888cc";
      ctx.font = "700 10px monospace";
      ctx.fillText("✓ RESOLVED", 50, y + 33);
    }

    // Amount
    ctx.textAlign = "right";
    ctx.fillStyle = cat.resolved ? "#555" : "#e05555";
    ctx.font = "700 14px monospace";
    ctx.fillText(fmt(amt), W - 36, y + 22);
    ctx.textAlign = "left";

    // Row divider
    if (i < maxRows - 1) {
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(50, y + rowH); ctx.lineTo(W - 36, y + rowH); ctx.stroke();
    }
  });

  // Footer
  ctx.fillStyle = "#333";
  ctx.fillRect(0, H - 36, W, 36);
  ctx.fillStyle = "#666";
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
    border: "1px solid #333",
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
      <span style={{ color: "#555", fontSize: "11px", fontFamily: "monospace", letterSpacing: "1px" }}>SHARE:</span>
      <button onClick={handleTwitter} style={{ ...btnBase, background: "#1a1a1a", color: "#ccc" }}>𝕏 / Twitter</button>
      <button onClick={handleBluesky} style={{ ...btnBase, background: "#1a1a1a", color: "#ccc" }}>Bluesky</button>
      <button onClick={handleCopy} style={{ ...btnBase, background: copied ? "#0a2a0a" : "#1a1a1a", color: copied ? "#5dca5d" : "#ccc" }}>
        {copied ? "✓ COPIED" : "Copy link"}
      </button>
      <button onClick={handleExport} style={{ ...btnBase, background: "#1a1a1a", color: "#aaa" }}>
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
        background: open ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${cat.color}44`,
        borderLeft: `5px solid ${cat.color}`,
        borderRadius: "6px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "background 0.2s",
        opacity: cat.resolved ? 0.8 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "5px" }}>
            {/* Status badges */}
            {cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#1a1a2a", color: "#8888cc", border: "1px solid #3a3a6a", letterSpacing: "1px", fontWeight: 700 }}>
                ✓ RESOLVED
              </span>
            )}
            {isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#1a3a1a", color: "#5dca5d", border: "1px solid #3a7a3a", letterSpacing: "1px", fontWeight: 700 }}>
                ● TREASURY LIVE
              </span>
            )}
            {isLive && !isTreasuryLive && !cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#3a1a1a", color: "#ff7b7b", border: "1px solid #6a3a3a", letterSpacing: "1px", fontWeight: 700 }}>
                ● ACCRUING
              </span>
            )}
            {!isLive && !isTreasuryLive && !cat.resolved && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#1e1e1e", color: "#aaa", border: "1px solid #3a3a3a", letterSpacing: "1px", fontWeight: 700 }}>
                FIXED
              </span>
            )}
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: "13px", color: "#999", fontStyle: "italic", lineHeight: 1.4 }}>
            {cat.resolved ? cat.resolvedNote || cat.subtitle : cat.subtitle}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <AnimatedNumber value={amount} style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: cat.color, letterSpacing: "-0.5px" }} />
          {isLive && !cat.resolved && (
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#777", marginTop: "3px" }}>
              +{fmt(cat.ratePerSecond)}/sec
            </div>
          )}
          {isTreasuryLive && treasuryAgency && (
            <div style={{ fontSize: "11px", color: "#5dca5d", marginTop: "3px" }}>
              Treasury: {treasuryAgency.recordDate}
            </div>
          )}
        </div>
        <span style={{ color: "#777", fontSize: "14px", fontWeight: 700 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "14px 18px 16px" }}>
          <p style={{ fontSize: "14px", color: "#ccc", lineHeight: "1.75", marginBottom: "12px" }}>{cat.note}</p>
          {isTreasuryLive && treasuryAgency && (
            <div style={{ background: "#0a1a0a", border: "1px solid #2a4a2a", borderRadius: "4px", padding: "12px 14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#5dca5d", letterSpacing: "1px", marginBottom: "10px", fontFamily: "monospace", fontWeight: 700 }}>
                TREASURY ACTUAL OUTLAYS — {treasuryAgency.agency?.toUpperCase()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {[
                  ["This Month", treasuryAgency.currentMonthActual],
                  ["FY-to-Date", treasuryAgency.currentFiscalYearToDate],
                  ["Prior FY Same Period", treasuryAgency.priorFiscalYearToDate],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: "11px", color: "#777", marginBottom: "3px" }}>{label}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "14px", color: "#5dca5d", fontWeight: 700 }}>{fmt(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cat.treasuryLive && !treasuryAgency && (
            <div style={{ fontSize: "13px", color: "#777", fontStyle: "italic", marginBottom: "10px" }}>
              Treasury data loading or temporarily unavailable. Showing estimated figures.
            </div>
          )}
          <div style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}>
            SOURCE: {cat.source} &nbsp;|&nbsp; LAST REVIEWED: {cat.lastUpdated} &nbsp;|&nbsp; FIGURES VERIFIED: {cat.lastVerified}
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
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0", fontFamily: "Georgia, serif" }}>

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
              background: "rgba(0,0,0,0.3)", border: "none", color: "#fff", borderRadius: "3px",
              fontFamily: "monospace", fontSize: "11px", padding: "2px 8px", cursor: "pointer", fontWeight: 700,
            }}
          >
            ✕ HIDE
          </button>
        </div>
      )}
      {!showMarquee && (
        <div style={{ background: "#1a0808", borderBottom: "1px solid #3a1a1a", padding: "4px 0", textAlign: "center" }}>
          <button
            onClick={() => setShowMarquee(true)}
            style={{
              background: "transparent", border: "none", color: "#888", fontFamily: "monospace",
              fontSize: "11px", cursor: "pointer", letterSpacing: "1px",
            }}
          >
            ▶ SHOW TICKER
          </button>
        </div>
      )}

      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#0d0d0d", borderBottom: "2px solid #222", boxShadow: "0 2px 24px rgba(0,0,0,0.9)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "18px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "3px", color: "#e05555", marginBottom: "7px", fontWeight: 700 }}>
                B.M. WOLFORD / BMW SUBSTACK
              </div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.2 }}>
                The Real Cost of Trump Policy
              </h1>
              <div style={{ fontSize: "13px", color: "#aaa", marginTop: "6px" }}>
                Authorized, allocated &amp; projected taxpayer exposure · Updated September 2026
              </div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{
                  fontFamily: "monospace", fontSize: "12px", padding: "4px 10px", borderRadius: "3px", display: "inline-block",
                  background: treasuryStatus === "live" ? "#0a2a0a" : treasuryStatus === "loading" ? "#1a1a0a" : "#1e1212",
                  color: treasuryStatus === "live" ? "#5dca5d" : treasuryStatus === "loading" ? "#f0c040" : "#cc8888",
                  border: `1px solid ${treasuryStatus === "live" ? "#3a7a3a" : treasuryStatus === "loading" ? "#6a6020" : "#5a3030"}`,
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
              <div style={{ fontFamily: "monospace", fontSize: "34px", fontWeight: 700, color: "#e05555", letterSpacing: "-1px", lineHeight: 1 }}>
                <AnimatedNumber value={total} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888", marginTop: "5px" }}>+{fmt(liveRate)}/sec accruing</div>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#555", marginTop: "3px" }}>{mins}m {secs}s this session</div>
              {/* Since you opened this tab */}
              {sessionAccrued > 0 && (
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#7a4a4a", marginTop: "3px" }}>
                  +{fmt(sessionAccrued)} since you opened this
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: "4px", padding: "16px 0 0", borderBottom: "2px solid #222", marginBottom: "24px", flexWrap: "wrap" }}>
          {[["tracker", "Policy Cost Tracker"], ["recession", "Recession Risk Indicator"], ["counterfactual", "What Could Have Been"]].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                padding: "9px 20px",
                fontFamily: "monospace",
                fontSize: "12px",
                letterSpacing: "1px",
                fontWeight: 700,
                border: "none",
                borderRadius: "4px 4px 0 0",
                cursor: "pointer",
                background: activeTab === id ? "#c0392b" : "transparent",
                color: activeTab === id ? "#fff" : "#666",
                transition: "all 0.15s",
              }}
            >
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "recession" && <RecessionIndicator />}

        {activeTab === "counterfactual" && <CounterfactualTab trackerTotal={total} />}

        {activeTab === "tracker" && (
          <div style={{ paddingBottom: "60px" }}>

            <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", color: "#bbb", lineHeight: "1.8" }}>
              <strong style={{ color: "#eee", fontSize: "14px" }}>How this works:</strong> Items marked{" "}
              <span style={{ color: "#5dca5d", fontFamily: "monospace", fontWeight: 700 }}>TREASURY LIVE</span> pull real outlay data automatically from the US Treasury Fiscal Data API, updated each month. Items marked{" "}
              <span style={{ color: "#ff7b7b", fontFamily: "monospace", fontWeight: 700 }}>ACCRUING</span> tick forward continuously based on authorized multi-year spending rates.{" "}
              <span style={{ color: "#aaa", fontFamily: "monospace", fontWeight: 700 }}>FIXED</span> items are one-time allocations.{" "}
              <span style={{ color: "#8888cc", fontFamily: "monospace", fontWeight: 700 }}>✓ RESOLVED</span> items are tracked for accountability but are no longer accruing. Click any row to expand sources and context.
              {treasuryData?.asOf && <span style={{ color: "#5dca5d" }}> Treasury data current as of {treasuryData.asOf}.</span>}
            </div>

            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#5dca5d", letterSpacing: "2px", marginBottom: "10px", paddingLeft: "4px", fontWeight: 700 }}>
              ● LIVE TREASURY DATA
            </div>
            {TREASURY_CATEGORIES.map((cat, i) => (
              <CategoryRow key={cat.id} cat={cat} amount={treasuryAmounts[i]} treasuryData={treasuryData} />
            ))}

            <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#aaa", letterSpacing: "2px", margin: "20px 0 10px", paddingLeft: "4px", fontWeight: 700 }}>
              ○ CBO / AUTHORIZED FIGURES
            </div>
            {STATIC_CATEGORIES.map((cat, i) => (
              <CategoryRow key={cat.id} cat={cat} amount={staticAmounts[i]} treasuryData={null} />
            ))}

            {/* Total bar */}
            <div style={{ marginTop: "20px", background: "#111", border: "2px solid #c0392b66", borderRadius: "6px", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "13px", letterSpacing: "2px", color: "#ccc", textTransform: "uppercase", fontWeight: 700 }}>Total Taxpayer Exposure</div>
                <div style={{ fontSize: "13px", color: "#777", marginTop: "5px" }}>Treasury actual + CBO projected + authorized</div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "40px", fontWeight: 700, color: "#e05555", letterSpacing: "-1px" }}>
                <AnimatedNumber value={total} />
              </div>
            </div>

            {/* What this could fund */}
            <div style={{ marginTop: "16px", background: "#0b120b", border: "1px solid #1e3a1e", borderRadius: "6px", padding: "18px 22px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "12px", letterSpacing: "2px", color: "#5dca5d", marginBottom: "16px", textTransform: "uppercase", fontWeight: 700 }}>
                What This Could Fund Instead
              </div>
              {[
                { label: "Section 8 Voucher Waitlist (1.5M households)", annual: 11_000_000_000, unit: "years" },
                { label: "Universal Pre-K, Nationwide", annual: 60_000_000_000, unit: "years" },
                { label: "Eliminate US Child Poverty", annual: 90_000_000_000, unit: "years" },
                { label: "Rebuild Every Structurally Deficient Bridge", annual: 125_000_000_000, unit: "times over" },
              ].map(({ label, annual, unit }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #162416", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#ddd" }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#5dca5d", fontWeight: 700 }}>{(total / annual).toFixed(1)}× {unit}</span>
                </div>
              ))}
            </div>

            {/* Family calculator */}
            <FamilyCalculator />

            {/* Footer */}
            <div style={{ marginTop: "32px", paddingTop: "18px", borderTop: "1px solid #1e1e1e", fontSize: "12px", color: "#555", lineHeight: "2", textAlign: "center" }}>
              Research and analysis by B.M. Wolford for BMW Substack<br />
              Treasury data: fiscaldata.treasury.gov (MTS Table 5, free public API, no key required)<br />
              Other sources: CBO · Tax Foundation · Brennan Center · National Immigration Forum · Pentagon Congressional Testimony · Just Security · Food Research and Action Center · AP · NPR · CBS News · CNN · ABC News<br />
              <span style={{ color: "#444" }}>Treasury figures refresh automatically. CBO/projection figures last reviewed and verified September 2026.</span>
            </div>

          </div>
        )}

      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
    </div>
  );
}
