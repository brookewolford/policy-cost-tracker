import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    id: "ice",
    label: "ICE / Immigration Enforcement",
    subtitle: "One Big Beautiful Bill + base budget (4-year authorization)",
    baseAmount: 170_000_000_000,
    // $170B over 4 years = ~$42.5B/year = ~$1,347/sec
    ratePerSecond: 1347,
    color: "#c0392b",
    note: "Includes $75B ICE supplement + $65B CBP + $10B state/local grants from OBBBA. ICE budget now larger than all other federal law enforcement agencies combined. Source: National Immigration Forum, DHS budget documents. Last reviewed: September 2026.",
  },
  {
    id: "iran",
    label: "Iran War (Operation Epic Fury)",
    subtitle: "Pentagon confirmed $44B+ through Aug 2026; ceasefire/standby phase ongoing",
    baseAmount: 44_130_000_000,
    // Ceasefire/standby phase ~$95M/day = ~$1,099/sec (down from ~$4,190/sec in active combat)
    ratePerSecond: 1099,
    color: "#e67e22",
    note: "Pentagon confirmed $44.13B in direct military costs through day 211 (Aug 2026). Now in ceasefire/standby phase at ~$95M/day. Harvard economist Linda Bilmes projects full economic cost at $1T including supply chain, gas prices, veteran care. Source: Pentagon congressional testimony, AP, Reuters. Last reviewed: September 2026.",
  },
  {
    id: "taxcuts",
    label: "Tax Cuts for Wealthy (OBBBA Deficit Cost)",
    subtitle: "CBO updated: $4.1T added to deficit over 10 years, 70% benefits top 10%",
    baseAmount: 4_100_000_000_000,
    // $4.1T over 10 years = $410B/year = ~$13,004/sec
    ratePerSecond: 13004,
    color: "#8e44ad",
    note: "CBO updated dynamic score: $4.1–4.7T deficit increase over 10 years (revised from original $3.4T static score). Top 1% receives avg $50,000/yr tax cut; bottom 10% lose $1,600/yr income. National debt-to-GDP projected to climb from 162% to 190%+ over 35 years. Source: Congressional Budget Office. Last reviewed: September 2026.",
  },
  {
    id: "medicaid_snap",
    label: "Medicaid & SNAP Cuts (Harm to Working Families)",
    subtitle: "$930B Medicaid + $285B SNAP cut over 10 years — already taking effect",
    baseAmount: 1_215_000_000_000,
    // $1.215T over 10 years = $121.5B/yr = ~$3,852/sec
    ratePerSecond: 3852,
    color: "#27ae60",
    note: "CBO confirmed 11.8M people losing health coverage (revised from 17M estimate). FRAC reports 5.8M people have already lost SNAP access as of Aug 2026. Cuts take effect as tariff-driven food inflation accelerates. Source: CBO, Food Research and Action Center, Urban Institute. Last reviewed: September 2026.",
  },
  {
    id: "doj_fund",
    label: "DOJ Anti-Weaponization Fund",
    subtitle: "Originally $1.776B — administration retreated June 2, 2026",
    baseAmount: 1_776_000_000,
    ratePerSecond: 0,
    color: "#2980b9",
    note: "Announced May 18, 2026 as part of settlement of Trump's IRS lawsuit. Administration retreated from the fund on June 2, 2026 following bipartisan legal challenges and near-100 House Democratic brief to block it. Fund was not disbursed. Represents the precedent established regardless of outcome. Source: DOJ, AP. Last reviewed: September 2026.",
  },
  {
    id: "ballroom",
    label: "White House Ballroom + Reflecting Pool",
    subtitle: "$400M ballroom + $1B security request + $13M reflecting pool",
    baseAmount: 1_413_000_000,
    ratePerSecond: 0,
    color: "#f39c12",
    note: "Ballroom originally promised at zero taxpayer cost. Now $400M with Senate weighing additional $1B security package. Lincoln Memorial Reflecting Pool contracted at $13M (initially stated as $2M). Source: Congressional appropriations, AP, NPR. Last reviewed: September 2026.",
  },
  {
    id: "litigation",
    label: "Federal Litigation Defense (950+ Lawsuits)",
    subtitle: "DOJ defending 952+ cases challenging administration actions",
    baseAmount: 750_000_000,
    // ~950 cases, growing ~2/day, avg federal legal costs
    ratePerSecond: 14,
    color: "#16a085",
    note: "952 cases tracked by Just Security as of September 2026, up from 753 in April. Administration has lost 55 of 67 decided cases per Democratic AG reports. Challenges span immigration, tariffs, constitutional authority, and executive orders. Source: Just Security, Brennan Center. Last reviewed: September 2026.",
  },
];

function formatDollars(n) {
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progress;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else prevRef.current = end;
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{formatDollars(display)}</span>;
}

function CategoryRow({ cat, amount }) {
  const [expanded, setExpanded] = useState(false);
  const pct = cat.ratePerSecond > 0 ? "LIVE" : "FIXED";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${cat.color}33`,
        borderLeft: `3px solid ${cat.color}`,
        borderRadius: "4px",
        marginBottom: "8px",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          gap: "12px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "2px",
                background: cat.ratePerSecond > 0 ? "#c0392b22" : "#ffffff11",
                color: cat.ratePerSecond > 0 ? "#ff6b6b" : "#888",
                border: `1px solid ${cat.ratePerSecond > 0 ? "#c0392b" : "#555"}`,
                letterSpacing: "1px",
              }}
            >
              {pct}
            </span>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "#f0f0f0", letterSpacing: "0.02em" }}>
              {cat.label}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: "#888", marginTop: "3px", fontStyle: "italic" }}>
            {cat.subtitle}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "16px",
              fontWeight: 700,
              color: cat.color,
            }}
          >
            <CountUp value={amount} />
          </div>
          {cat.ratePerSecond > 0 && (
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
              +{formatDollars(cat.ratePerSecond)}/sec
            </div>
          )}
        </div>
        <div style={{ color: "#555", fontSize: "12px", marginLeft: "4px" }}>
          {expanded ? "▲" : "▼"}
        </div>
      </div>
      {expanded && (
        <div
          style={{
            padding: "0 16px 12px 16px",
            fontSize: "12px",
            color: "#aaa",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "10px",
            lineHeight: "1.6",
          }}
        >
          {cat.note}
        </div>
      )}
    </div>
  );
}

export default function PolicyCostTracker() {
  const startTimeRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const amounts = CATEGORIES.map((cat) => cat.baseAmount + cat.ratePerSecond * elapsed);
  const total = amounts.reduce((a, b) => a + b, 0);
  const liveRate = CATEGORIES.reduce((a, c) => a + c.ratePerSecond, 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e0e0e0",
        fontFamily: "'Georgia', serif",
        padding: "0",
        margin: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0f0f0f",
          borderBottom: "1px solid #1a1a1a",
          padding: "24px 24px 20px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "#c0392b",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                ● LIVE TRACKER
              </div>
              <h1
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                The Real Cost of Trump Policy
              </h1>
              <div style={{ fontSize: "12px", color: "#777", marginTop: "4px" }}>
                Authorized, allocated & projected spending — taxpayer exposure · Updated September 2026
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#c0392b",
                  letterSpacing: "-1px",
                  lineHeight: 1,
                }}
              >
                {formatDollars(total)}
              </div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "11px",
                  color: "#555",
                  marginTop: "4px",
                }}
              >
                +{formatDollars(liveRate)}/sec accruing
              </div>
              <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
                Session time: {Math.floor(elapsed / 60)}m {Math.floor(elapsed % 60)}s
              </div>
            </div>
          </div>

          {/* Live ticker bar */}
          <div
            style={{
              marginTop: "16px",
              background: "#1a1a1a",
              borderRadius: "2px",
              height: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #c0392b, #e74c3c, #ff6b6b, #c0392b)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s linear infinite",
              }}
            />
          </div>
        </div>
      </div>

      {/* Scrolling marquee */}
      <div
        style={{
          background: "#c0392b",
          padding: "7px 0",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "inline-block",
            animation: "marquee 30s linear infinite",
            fontSize: "11px",
            fontFamily: "'Courier New', monospace",
            letterSpacing: "1px",
            color: "#fff",
          }}
        >
          &nbsp;&nbsp;&nbsp;
          ICE/IMMIGRATION: {formatDollars(amounts[0])} &nbsp;●&nbsp;
          IRAN WAR (EPIC FURY): {formatDollars(amounts[1])} &nbsp;●&nbsp;
          TAX CUTS DEFICIT: {formatDollars(amounts[2])} &nbsp;●&nbsp;
          MEDICAID/SNAP CUTS: {formatDollars(amounts[3])} &nbsp;●&nbsp;
          DOJ ALLY FUND: {formatDollars(amounts[4])} &nbsp;●&nbsp;
          WHITE HOUSE BALLROOM: {formatDollars(amounts[5])} &nbsp;●&nbsp;
          LITIGATION DEFENSE: {formatDollars(amounts[6])} &nbsp;●&nbsp;
          TOTAL: {formatDollars(total)} &nbsp;&nbsp;&nbsp;
          ICE/IMMIGRATION: {formatDollars(amounts[0])} &nbsp;●&nbsp;
          IRAN WAR (EPIC FURY): {formatDollars(amounts[1])} &nbsp;●&nbsp;
          TAX CUTS DEFICIT: {formatDollars(amounts[2])} &nbsp;●&nbsp;
          MEDICAID/SNAP CUTS: {formatDollars(amounts[3])} &nbsp;●&nbsp;
          DOJ ALLY FUND: {formatDollars(amounts[4])} &nbsp;●&nbsp;
          WHITE HOUSE BALLROOM: {formatDollars(amounts[5])} &nbsp;●&nbsp;
          LITIGATION DEFENSE: {formatDollars(amounts[6])} &nbsp;●&nbsp;
          TOTAL: {formatDollars(total)}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "20px 24px 40px" }}>

        {/* Disclaimer */}
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            borderRadius: "4px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "11px",
            color: "#666",
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: "#888" }}>Methodology:</strong> Base figures drawn from Congressional Budget Office scores, Pentagon testimony, and confirmed appropriations. Figures updated September 2026. Live rates calculated from multi-year authorizations divided to per-second accrual. LIVE items tick in real time. FIXED items are one-time allocations. Click any row for source context.
        </div>

        {/* Category rows */}
        {CATEGORIES.map((cat, i) => (
          <CategoryRow key={cat.id} cat={cat} amount={amounts[i]} />
        ))}

        {/* Total bar */}
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #c0392b44",
            borderRadius: "4px",
            padding: "20px 20px",
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#666", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>
              Running Total
            </div>
            <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
              Authorized + projected 10-year exposure
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "36px",
              fontWeight: 700,
              color: "#c0392b",
              letterSpacing: "-1px",
            }}
          >
            {formatDollars(total)}
          </div>
        </div>

        {/* What this could fund */}
        <div
          style={{
            marginTop: "20px",
            background: "#0a120a",
            border: "1px solid #1a3a1a",
            borderRadius: "4px",
            padding: "16px 20px",
          }}
        >
          <div style={{ fontSize: "11px", color: "#4a8a4a", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Courier New', monospace", marginBottom: "12px" }}>
            What This Could Fund Instead
          </div>
          {[
            ["Universal Pre-K (nationwide)", "$60B/year", `${Math.floor(total / 60_000_000_000)} years`],
            ["US Child Poverty Elimination", "~$90B/year", `${Math.floor(total / 90_000_000_000)} years`],
            ["All Structurally Deficient US Bridges", "$125B estimate", `${Math.floor(total / 125_000_000_000)}x over`],
            ["Section 8 Housing Voucher Waitlist", "$30B/year", `${Math.floor(total / 30_000_000_000)} years`],
          ].map(([program, cost, equiv]) => (
            <div
              key={program}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "7px 0",
                borderBottom: "1px solid #1a2a1a",
                fontSize: "12px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span style={{ color: "#ccc" }}>{program}</span>
              <span style={{ color: "#888", fontFamily: "'Courier New', monospace", fontSize: "11px" }}>
                {cost} &nbsp;→&nbsp; <span style={{ color: "#4a8a4a" }}>{equiv}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "10px", color: "#444", textAlign: "center", marginTop: "20px", lineHeight: "1.8" }}>
          Sources: CBO, Tax Foundation, Brennan Center, National Immigration Forum, Pentagon testimony, Just Security, Food Research and Action Center, Harvard Kennedy School · Base figures last reviewed September 2026
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
