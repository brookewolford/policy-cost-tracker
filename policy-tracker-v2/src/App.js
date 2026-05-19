import { useState, useEffect, useRef, useCallback } from "react";

const STATIC_CATEGORIES = [
  {
    id: "taxcuts",
    label: "Tax Cuts Deficit Cost (OBBBA)",
    subtitle: "CBO: $3.4T added to deficit over 10 years — 70% benefits top 10%",
    baseAmount: 3_400_000_000_000,
    ratePerSecond: 10_776,
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
    ratePerSecond: 3_852,
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "5px" }}>
            {isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#1a3a1a", color: "#5dca5d", border: "1px solid #3a7a3a", letterSpacing: "1px", fontWeight: 700 }}>
                ● TREASURY LIVE
              </span>
            )}
            {isLive && !isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#3a1a1a", color: "#ff7b7b", border: "1px solid #6a3a3a", letterSpacing: "1px", fontWeight: 700 }}>
                ● ACCRUING
              </span>
            )}
            {!isLive && !isTreasuryLive && (
              <span style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "#1e1e1e", color: "#aaa", border: "1px solid #3a3a3a", letterSpacing: "1px", fontWeight: 700 }}>
                FIXED
              </span>
            )}
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#ffffff" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: "13px", color: "#999", fontStyle: "italic", lineHeight: 1.4 }}>{cat.subtitle}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <AnimatedNumber value={amount} style={{ fontFamily: "monospace", fontSize: "22px", fontWeight: 700, color: cat.color, letterSpacing: "-0.5px" }} />
          {isLive && (
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
            SOURCE: {cat.source} &nbsp;|&nbsp; LAST REVIEWED: {cat.lastUpdated}
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

  useEffect(() => {
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100);
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
  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e0e0e0", fontFamily: "Georgia, serif" }}>

      <div style={{ background: "#c0392b", overflow: "hidden", whiteSpace: "nowrap", padding: "9px 0" }}>
        <div style={{ display: "inline-block", animation: "marquee 45s linear infinite", fontFamily: "monospace", fontSize: "13px", letterSpacing: "1px", color: "#fff", fontWeight: 600 }}>
          {[...allCats, ...allCats].map((cat, i) => (
            <span key={i}>&nbsp;&nbsp;{cat.label.toUpperCase()}: {fmt(allAmounts[i % allCats.length])}&nbsp;&nbsp;●</span>
          ))}
          &nbsp;&nbsp;TOTAL TAXPAYER EXPOSURE: {fmt(total)}&nbsp;&nbsp;●&nbsp;&nbsp;
        </div>
      </div>

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
                Authorized, allocated &amp; projected taxpayer exposure
              </div>
              <div style={{ marginTop: "8px" }}>
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
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "monospace", fontSize: "34px", fontWeight: 700, color: "#e05555", letterSpacing: "-1px", lineHeight: 1 }}>
                <AnimatedNumber value={total} />
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#888", marginTop: "5px" }}>+{fmt(liveRate)}/sec accruing</div>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#555", marginTop: "3px" }}>{mins}m {secs}s this session</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 24px 60px" }}>

        <div style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: "6px", padding: "16px 20px", marginBottom: "24px", fontSize: "13px", color: "#bbb", lineHeight: "1.8" }}>
          <strong style={{ color: "#eee", fontSize: "14px" }}>How this works:</strong> Items marked{" "}
          <span style={{ color: "#5dca5d", fontFamily: "monospace", fontWeight: 700 }}>TREASURY LIVE</span> pull real outlay data automatically from the US Treasury Fiscal Data API, updated each month. Items marked{" "}
          <span style={{ color: "#ff7b7b", fontFamily: "monospace", fontWeight: 700 }}>ACCRUING</span> tick forward continuously based on authorized multi-year spending rates.{" "}
          <span style={{ color: "#aaa", fontFamily: "monospace", fontWeight: 700 }}>FIXED</span> items are one-time allocations. Click any row to expand sources and context.
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

        <div style={{ marginTop: "20px", background: "#111", border: "2px solid #c0392b66", borderRadius: "6px", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: "13px", letterSpacing: "2px", color: "#ccc", textTransform: "uppercase", fontWeight: 700 }}>Total Taxpayer Exposure</div>
            <div style={{ fontSize: "13px", color: "#777", marginTop: "5px" }}>Treasury actual + CBO projected + authorized</div>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "40px", fontWeight: 700, color: "#e05555", letterSpacing: "-1px" }}>
            <AnimatedNumber value={total} />
          </div>
        </div>

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

        <div style={{ marginTop: "32px", paddingTop: "18px", borderTop: "1px solid #1e1e1e", fontSize: "12px", color: "#555", lineHeight: "2", textAlign: "center" }}>
          Research and analysis by B.M. Wolford for BMW Substack<br />
          Treasury data: fiscaldata.treasury.gov (MTS Table 5, free public API, no key required)<br />
          Other sources: CBO · Tax Foundation · Brennan Center · National Immigration Forum · Pentagon Congressional Testimony · AP · NPR · CBS News · CNN · ABC News<br />
          <span style={{ color: "#444" }}>Treasury figures refresh automatically. CBO/projection figures reviewed manually when new scores are published.</span>
        </div>
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
