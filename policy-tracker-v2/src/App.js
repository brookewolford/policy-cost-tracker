import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC CATEGORIES
// These are the items Treasury cannot provide automatically.
// Update baseAmount manually when CBO scores or major news confirms new figures.
// ratePerSecond is calculated from multi-year authorizations.
// ─────────────────────────────────────────────────────────────────────────────
const STATIC_CATEGORIES = [
  {
    id: "taxcuts",
    label: "Tax Cuts Deficit Cost (OBBBA)",
    subtitle: "CBO: $3.4T added to deficit over 10 years — 70% benefits top 10%",
    baseAmount: 3_400_000_000_000,
    ratePerSecond: 10_776, // $3.4T / 10 years
    color: "#8e44ad",
    lastUpdated: "July 2025",
    source: "Congressional Budget Office, Tax Foundation",
    treasuryLive: false,
    note: "Top 1% receives avg $50,000/yr tax cut. Bottom 10% lose $1,600/yr. Most expensive law since 2012.",
  },
  {
    id: "snap_medicaid_harm",
    label: "Medicaid & SNAP Cuts (Harm to Families)",
    subtitle: "$930B Medicaid + $285B SNAP stripped over 10 years",
    baseAmount: 1_215_000_000_000,
    ratePerSecond: 3_852, // $1.215T / 10 years
    color: "#27ae60",
    lastUpdated: "July 2025",
    source: "CBO, Urban Institute, Commonwealth Fund",
    treasuryLive: false,
    note: "22.3M families lose food benefits. 17M lose health coverage. Up to 1M jobs lost by 2026. Average family loses $146/month.",
  },
  {
    id: "doj_fund",
    label: "DOJ Anti-Weaponization Fund",
    subtitle: "Taxpayer-funded payouts to Trump political allies",
    baseAmount: 1_776_000_000,
    ratePerSecond: 0,
    color: "#2980b9",
    lastUpdated: "May 18, 2026",
    source: "AP, Washington Post",
    treasuryLive: false,
    note: "Announced May 18, 2026. Resolves Trump's IRS lawsuit with $1.776B in public money. Democrats called it unconstitutional.",
  },
  {
    id: "ballroom",
    label: "White House Ballroom + Reflecting Pool",
    subtitle: "$400M ballroom + $1B security request + $13M reflecting pool",
    baseAmount: 1_413_000_000,
    ratePerSecond: 0,
    color: "#f39c12",
    lastUpdated: "May 2026",
    source: "CNN, ABC News, NYT",
    treasuryLive: false,
    note: "Promised at zero taxpayer cost. Doubled from $200M to $400M. Congress now weighing $1B security add-on.",
  },
  {
    id: "litigation",
    label: "Federal Litigation Defense (753+ Lawsuits)",
    subtitle: "DOJ defending record number of challenges to administration actions",
    baseAmount: 500_000_000,
    ratePerSecond: 12,
    color: "#16a085",
    lastUpdated: "April 2026",
    source: "Just Security, Lawfare trackers",
    treasuryLive: false,
    note: "As of April 2026: 753 cases filed, 2+ new cases per day. Democratic AGs report winning 55 of 67 decided cases.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TREASURY-LIVE CATEGORIES
// These pull real outlay data from the US Treasury MTS Table 5 API.
// Fallback baseAmounts are used if Treasury is unavailable.
// ─────────────────────────────────────────────────────────────────────────────
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
    source: "US Treasury Fiscal Data API — MTS Table 5",
    note: "Includes ICE, CBP, USCIS. The $75B OBBBA supplement makes ICE larger than all other federal law enforcement combined. Updated monthly when Treasury publishes MTS.",
  },
  {
    id: "dod",
    label: "Dept. of Defense / Iran War (Epic Fury)",
    subtitle: "Actual Treasury outlays — Dept. of Defense",
    fallbackAmount: 29_000_000_000,
    ratePerSecond: 4_190,
    color: "#e67e22",
    treasuryKey: "dod",
    treasuryLive: true,
    lastUpdated: "Live from Treasury",
    source: "US Treasury Fiscal Data API — MTS Table 5",
    note: "Includes all DoD outlays. Pentagon confirmed $25-29B for Operation Epic Fury alone. Harvard economist Linda Bilmes projects $1T total economic cost.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `$${(n / 1e6).toFixed(1)}M`;
  return `$${Math.floor(n).toLocaleString()}`;
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

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY ROW
// ─────────────────────────────────────────────────────────────────────────────
function CategoryRow({ cat, amount, treasuryData }) {
  const [open, setOpen] = useState(false);

  const isLive = cat.ratePerSecond > 0;
  const isTreasuryLive = cat.treasuryLive && treasuryData?.agencies?.[cat.treasuryKey];
  const treasuryAgency = isTreasuryLive ? treasuryData.agencies[cat.treasuryKey] : null;

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${cat.color}33`,
        borderLeft: `4px solid ${cat.color}`,
        borderRadius: "4px",
        marginBottom: "8px",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", padding: "13px 16px", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "180px" }}>
          <div style={{ display: "flex", gap: "7px", alignItems: "center", flexWrap: "wrap", marginBottom: "3px" }}>
            {/* Badges */}
            {isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 6px", borderRadius: "2px", background: "#1a3a1a", color: "#4caf50", border: "1px solid #2a5a2a", letterSpacing: "1px" }}>
                ● TREASURY LIVE
              </span>
            )}
            {isLive && !isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 6px", borderRadius: "2px", background: "#3a1a1a", color: "#ff6b6b", border: "1px solid #5a2a2a", letterSpacing: "1px" }}>
                ● ACCRUING
              </span>
            )}
            {!isLive && !isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "9px", padding: "2px 6px", borderRadius: "2px", background: "#1a1a1a", color: "#666", border: "1px solid #333", letterSpacing: "1px" }}>
                FIXED
              </span>
            )}
            <span style={{ fontWeight: 700, fontSize: "14px", color: "#f0f0f0" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>{cat.subtitle}</div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <AnimatedNumber
            value={amount}
            style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: 700, color: cat.color, letterSpacing: "-0.5px" }}
          />
          {isLive && (
            <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#555", marginTop: "2px" }}>
              +{fmt(cat.ratePerSecond)}/sec
            </div>
          )}
          {isTreasuryLive && treasuryAgency && (
            <div style={{ fontSize: "10px", color: "#4caf50", marginTop: "2px" }}>
              Treasury: {treasuryAgency.recordDate}
            </div>
          )}
        </div>
        <span style={{ color: "#444", fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px 14px" }}>
          <p style={{ fontSize: "12px", color: "#bbb", lineHeight: "1.7", marginBottom: "10px" }}>{cat.note}</p>

          {/* Treasury detail block */}
          {isTreasuryLive && treasuryAgency && (
            <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: "3px", padding: "10px 12px", marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", color: "#4caf50", letterSpacing: "1px", marginBottom: "8px", fontFamily: "monospace" }}>
                TREASURY ACTUAL OUTLAYS — {treasuryAgency.agency?.toUpperCase()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  ["This Month", treasuryAgency.currentMonthActual],
                  ["FY-to-Date", treasuryAgency.currentFiscalYearToDate],
                  ["Prior FY Same Period", treasuryAgency.priorFiscalYearToDate],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: "10px", color: "#555", marginBottom: "2px" }}>{label}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "13px", color: "#4caf50", fontWeight: 700 }}>{fmt(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cat.treasuryLive && !treasuryAgency && (
            <div style={{ fontSize: "11px", color: "#555", fontStyle: "italic", marginBottom: "8px" }}>
              Treasury data loading or temporarily unavailable. Showing estimated figures.
            </div>
          )}

          <div style={{ fontSize: "10px", color: "#444", fontFamily: "monospace" }}>
            SOURCE: {cat.source} &nbsp;|&nbsp; LAST REVIEWED: {cat.lastUpdated}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [treasuryData, setTreasuryData] = useState(null);
  const [treasuryStatus, setTreasuryStatus] = useState("loading"); // loading | live | error

  // Tick every 100ms
  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100);
    return () => clearInterval(id);
  }, []);

  // Fetch Treasury data on mount, then every 6 hours
  const fetchTreasury = useCallback(async () => {
    try {
      setTreasuryStatus("loading");
      // In production this hits /api/treasury (Vercel serverless function)
      // In local dev it hits the same relative path
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

  // ── Compute live amounts ──────────────────────────────────────────────────

  // Treasury-live categories: use real Treasury YTD if available,
  // otherwise fall back to estimated base + accrual
  const treasuryAmounts = TREASURY_CATEGORIES.map((cat) => {
    const agency = treasuryData?.agencies?.[cat.treasuryKey];
    if (agency?.currentFiscalYearToDate) {
      // Use real Treasury number + tick forward from the record date
      const recordMs = new Date(agency.recordDate).getTime();
      const nowMs = Date.now();
      const secondsSinceRecord = Math.max(0, (nowMs - recordMs) / 1000);
      return agency.currentFiscalYearToDate + cat.ratePerSecond * secondsSinceRecord;
    }
    // Fallback: estimated base + session accrual
    return cat.fallbackAmount + cat.ratePerSecond * elapsed;
  });

  // Static categories: base + session accrual
  const staticAmounts = STATIC_CATEGORIES.map(
    (cat) => cat.baseAmount + cat.ratePerSecond * elapsed
  );

  const allAmounts = [...treasuryAmounts, ...staticAmounts];
  const allCats = [...TREASURY_CATEGORIES, ...STATIC_CATEGORIES];
  const total = allAmounts.reduce((a, b) => a + b, 0);
  const liveRate = allCats.reduce((a, c) => a + c.ratePerSecond, 0);

  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0", fontFamily: "Georgia, serif" }}>

      {/* ── Scrolling ticker bar ── */}
      <div style={{ background: "#c0392b", overflow: "hidden", whiteSpace: "nowrap", padding: "6px 0" }}>
        <div style={{ display: "inline-block", animation: "marquee 45s linear infinite", fontFamily: "monospace", fontSize: "11px", letterSpacing: "1px", color: "#fff" }}>
          {[...allCats, ...allCats].map((cat, i) => (
            <span key={i}>
              &nbsp;&nbsp;{cat.label.toUpperCase()}: {fmt(allAmounts[i % allCats.length])}&nbsp;&nbsp;●
            </span>
          ))}
          &nbsp;&nbsp;TOTAL TAXPAYER EXPOSURE: {fmt(total)}&nbsp;&nbsp;●&nbsp;&nbsp;
        </div>
      </div>

      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#0a0a0a", borderBottom: "1px solid #1c1c1c", boxShadow: "0 2px 24px rgba(0,0,0,0.9)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "3px", color: "#c0392b", marginBottom: "6px" }}>
                B.M. WOLFORD / BMW SUBSTACK
              </div>
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>
                The Real Cost of Trump Policy
              </h1>
              <div style={{ fontSize: "11px", color: "#444", marginTop: "4px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <span>Authorized, allocated &amp; projected taxpayer exposure</span>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "2px",
                  background: treasuryStatus === "live" ? "#0a2a0a" : treasuryStatus === "loading" ? "#1a1a0a" : "#2a0a0a",
                  color: treasuryStatus === "live" ? "#4caf50" : treasuryStatus === "loading" ? "#f0a500" : "#888",
                  border: `1px solid ${treasuryStatus === "live" ? "#2a5a2a" : "#444"}`,
                }}>
                  {treasuryStatus === "live"
                    ? `● TREASURY LIVE — ${treasuryData?.asOf}`
                    : treasuryStatus === "loading"
                    ? "○ FETCHING TREASURY DATA..."
                    : "○ TREASURY UNAVAILABLE — USING ESTIMATES"}
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: "32px", fontWeight: 700, color: "#c0392b", letterSpacing: "-1px", lineHeight: 1 }}>
                <AnimatedNumber value={total} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#555", marginTop: "4px" }}>
                +{fmt(liveRate)}/sec
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#333", marginTop: "2px" }}>
                {mins}m {secs}s this session
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 24px 60px" }}>

        {/* How this works */}
        <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: "4px", padding: "12px 16px", marginBottom: "20px", fontSize: "11px", color: "#555", lineHeight: "1.7" }}>
          <strong style={{ color: "#777" }}>How this works:</strong> Items marked{" "}
          <span style={{ color: "#4caf50", fontFamily: "monospace" }}>TREASURY LIVE</span> pull real
          outlay data automatically from the US Treasury Fiscal Data API (MTS Table 5) — updated monthly
          when Treasury publishes. Items marked{" "}
          <span style={{ color: "#ff6b6b", fontFamily: "monospace" }}>ACCRUING</span> tick forward
          continuously based on authorized multi-year spending rates. FIXED items are one-time
          allocations. Click any row for sources. All figures reflect taxpayer exposure, not administration
          framing.
          {treasuryData?.asOf && (
            <span style={{ color: "#4caf50" }}> Treasury data current as of {treasuryData.asOf}.</span>
          )}
        </div>

        {/* Treasury-live rows first */}
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#4caf50", letterSpacing: "2px", marginBottom: "8px", paddingLeft: "4px" }}>
          ● LIVE TREASURY DATA
        </div>
        {TREASURY_CATEGORIES.map((cat, i) => (
          <CategoryRow key={cat.id} cat={cat} amount={treasuryAmounts[i]} treasuryData={treasuryData} />
        ))}

        {/* Static/CBO rows */}
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#666", letterSpacing: "2px", margin: "16px 0 8px", paddingLeft: "4px" }}>
          ○ CBO / AUTHORIZED FIGURES
        </div>
        {STATIC_CATEGORIES.map((cat, i) => (
          <CategoryRow key={cat.id} cat={cat} amount={staticAmounts[i]} treasuryData={null} />
        ))}

        {/* Grand total */}
        <div style={{ marginTop: "16px", background: "#0f0f0f", border: "2px solid #c0392b44", borderRadius: "4px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "2px", color: "#555", textTransform: "uppercase" }}>Total Taxpayer Exposure</div>
            <div style={{ fontSize: "11px", color: "#333", marginTop: "3px" }}>Treasury actual + CBO projected + authorized</div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "38px", fontWeight: 700, color: "#c0392b", letterSpacing: "-1px" }}>
            <AnimatedNumber value={total} />
          </div>
        </div>

        {/* What it could fund — updates dynamically */}
        <div style={{ marginTop: "16px", background: "#090e09", border: "1px solid #1a2e1a", borderRadius: "4px", padding: "16px 20px" }}>
          <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px", color: "#3a7a3a", marginBottom: "14px", textTransform: "uppercase" }}>
            What This Could Fund Instead
          </div>
          {[
            { label: "Section 8 Voucher Waitlist (1.5M households)", annual: 11_000_000_000, unit: "years" },
            { label: "Universal Pre-K, Nationwide", annual: 60_000_000_000, unit: "years" },
            { label: "Eliminate US Child Poverty", annual: 90_000_000_000, unit: "years" },
            { label: "Rebuild Every Structurally Deficient Bridge", annual: 125_000_000_000, unit: "times over" },
          ].map(({ label, annual, unit }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #121e12", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#ccc" }}>{label}</span>
              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#3a9a3a", fontWeight: 700 }}>
                {(total / annual).toFixed(1)}× {unit}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid #151515", fontSize: "10px", color: "#2e2e2e", lineHeight: "2", textAlign: "center" }}>
          Research and analysis by B.M. Wolford for BMW Substack<br />
          Treasury data: fiscaldata.treasury.gov (MTS Table 5, free public API, no key required)<br />
          Other sources: CBO · Tax Foundation · Brennan Center · National Immigration Forum ·
          Pentagon Congressional Testimony · AP · NPR · CBS News · CNN · ABC News<br />
          <span style={{ color: "#3a3a3a" }}>
            Treasury figures refresh automatically. CBO/projection figures reviewed manually when new scores are published.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
      `}</style>
    </div>
  );
}
