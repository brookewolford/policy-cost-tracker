import { useState } from "react";

// ============================================================
// RECESSION RISK INDICATOR
// Drop this into your policy-tracker-v2/src/ folder
// Import and render as <RecessionIndicator /> in App.js
// Update INDICATORS scores as conditions change
// ============================================================

const INDICATORS = [
  {
    id: "tariffs",
    label: "Tariff / Supply-Side Shock",
    score: 82,
    maxScore: 100,
    status: "HIGH",
    color: "#c0392b",
    historicalParallel: "1973 OPEC Oil Embargo",
    parallelYear: 1973,
    parallelScore: 85,
    description:
      "Current tariff structure represents the largest self-imposed supply-side shock since Smoot-Hawley (1930). Like the 1973 oil embargo, this creates cost-push inflation the Fed cannot cure without also crushing employment. The Fed's standard tools are blunt instruments against this type of price pressure.",
    keyFact: "Largest tariff shock since 1930. IMF lowered US growth forecast from 2.7% to 1.8%.",
    lastUpdated: "May 2026",
  },
  {
    id: "fiscal",
    label: "Fiscal Space / Debt Capacity",
    score: 91,
    maxScore: 100,
    status: "CRITICAL",
    color: "#9b6dff",
    historicalParallel: "No prior parallel — unprecedented",
    parallelYear: null,
    parallelScore: null,
    description:
      "The U.S. has never entered a potential recession with debt at ~100% of GDP, deficits near 6% of GDP, and interest consuming ~20% of federal revenue. In 2001 and 2008, the government deployed massive stimulus from a position of relative fiscal strength. That playbook is structurally more expensive to run today.",
    keyFact: "Debt ~$39T. Interest payments tripled to $1T/year since 2021. No modern precedent for entering recession this indebted.",
    lastUpdated: "May 2026",
  },
  {
    id: "stagflation",
    label: "Stagflation / Fed Policy Trap",
    score: 71,
    maxScore: 100,
    status: "ELEVATED",
    color: "#e67e22",
    historicalParallel: "1979–80 Carter / Volcker",
    parallelYear: 1979,
    parallelScore: 90,
    description:
      "The Fed faces conflicting signals: tariff-driven inflation argues for holding or raising rates while softening labor markets argue for cutting. This is the same trap that paralyzed the Carter-era Fed and ultimately required Volcker's brutal 20% rate shock to resolve. The leadership transition at the Fed adds additional unpredictability.",
    keyFact: "Rates at 3.5–3.75%. 4 dissents at April 2026 FOMC — most divided Fed in years. Powell stepped down May 2026.",
    lastUpdated: "May 2026",
  },
  {
    id: "consumer",
    label: "Consumer Balance Sheet Stress",
    score: 64,
    maxScore: 100,
    status: "ELEVATED",
    color: "#f39c12",
    historicalParallel: "1989–90 S&L Aftermath",
    parallelYear: 1990,
    parallelScore: 68,
    description:
      "Four consecutive years of above-target inflation have eroded real purchasing power for low-to-middle income households. Credit card and auto loan delinquencies are rising. Consumer spending has been the primary engine of post-pandemic growth; a spending contraction becomes self-reinforcing once momentum builds.",
    keyFact: "Rising delinquencies. Consumer sentiment deteriorating. Middle-income households absorbing compounding cost pressure since 2021.",
    lastUpdated: "May 2026",
  },
  {
    id: "ai_bubble",
    label: "AI / Tech Investment Bubble",
    score: 58,
    maxScore: 100,
    status: "WATCH",
    color: "#3498db",
    historicalParallel: "1999–2001 Dot-Com Bubble",
    parallelYear: 2000,
    parallelScore: 95,
    description:
      "Major tech firms are deploying hundreds of billions in AI infrastructure capital that has outpaced demonstrated revenue at current scale. The 2001 dot-com collapse followed a similar pattern: real investment in real infrastructure (telecom fiber, data centers) that preceded the revenue justification. If AI capex contracts sharply, the 2001 parallel becomes close.",
    keyFact: "$1T+ in planned AI capex. Financial markets pricing in productivity gains not yet fully demonstrated at scale.",
    lastUpdated: "May 2026",
  },
];

// Historical context for the composite score
const HISTORICAL_COMPOSITES = [
  { year: 2020, label: "COVID Recession Entry", composite: 38, note: "High exogenous shock, strong fiscal position, low debt" },
  { year: 2008, label: "Great Recession Entry", composite: 61, note: "Financial system risk extreme; fiscal position still manageable" },
  { year: 2001, label: "Dot-Com Entry", composite: 49, note: "Asset bubble high; consumer/fiscal healthy; surplus budget" },
  { year: 1990, label: "S&L Recession Entry", composite: 52, note: "S&L crisis + oil shock; moderate fiscal capacity" },
  { year: 1980, label: "Stagflation Recession Entry", composite: 73, note: "Energy shock + inflation trap; limited tools" },
  { year: "Now", label: "Current (May 2026)", composite: null, note: "All five indicators elevated simultaneously" },
];

function StatusBadge({ status, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "3px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "1.5px",
        fontFamily: "monospace",
        background: color + "22",
        color: color,
        border: `1px solid ${color}44`,
      }}
    >
      {status}
    </span>
  );
}

function ScoreBar({ score, color, parallelScore, parallelYear }) {
  return (
    <div style={{ position: "relative", marginTop: "8px" }}>
      {/* Background track */}
      <div
        style={{
          height: "8px",
          borderRadius: "4px",
          background: "rgba(255,255,255,0.07)",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Fill */}
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            borderRadius: "4px",
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            transition: "width 0.8s ease",
          }}
        />
        {/* Historical parallel marker */}
        {parallelScore && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              left: `${parallelScore}%`,
              width: "2px",
              height: "16px",
              background: "rgba(255,255,255,0.35)",
              borderRadius: "1px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-18px",
                left: "4px",
                fontSize: "9px",
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
                fontFamily: "monospace",
              }}
            >
              {parallelYear}
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "11px",
          color: "rgba(255,255,255,0.3)",
          fontFamily: "monospace",
        }}
      >
        <span>LOW</span>
        <span style={{ color }}>CURRENT: {score}/100</span>
        <span>MAX</span>
      </div>
    </div>
  );
}

export default function RecessionIndicator() {
  const [expanded, setExpanded] = useState(null);

  const composite = Math.round(
    INDICATORS.reduce((sum, i) => sum + i.score, 0) / INDICATORS.length
  );

  const compositeColor =
    composite >= 80 ? "#c0392b" : composite >= 65 ? "#e67e22" : composite >= 50 ? "#f39c12" : "#27ae60";

  const compositeLabel =
    composite >= 80 ? "CRITICAL" : composite >= 65 ? "HIGH" : composite >= 50 ? "ELEVATED" : "MODERATE";

  return (
    <div
      style={{
        background: "#0d0d0d",
        color: "#e8e8e8",
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
        padding: "0 0 32px 0",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "24px 24px 20px",
          background: "#111",
        }}
      >
        <div style={{ fontSize: "10px", color: "#666", letterSpacing: "2px", marginBottom: "6px" }}>
          B.M. WOLFORD / BMW SUBSTACK — RECESSION RISK MONITOR
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
          Recession Risk Indicator
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
          Five-factor composite model. Historical parallels shown for context.
        </div>
      </div>

      {/* Composite Score */}
      <div
        style={{
          margin: "24px 24px 0",
          padding: "20px 24px",
          border: `1px solid ${compositeColor}44`,
          borderRadius: "6px",
          background: compositeColor + "0a",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#666", letterSpacing: "2px", marginBottom: "8px" }}>
              COMPOSITE RISK SCORE — MAY 2026
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "56px", fontWeight: 700, color: compositeColor, lineHeight: 1 }}>
                {composite}
              </span>
              <div>
                <div style={{ fontSize: "13px", color: "#aaa" }}>/100</div>
                <StatusBadge status={compositeLabel} color={compositeColor} />
              </div>
            </div>
          </div>
          <div style={{ maxWidth: "340px" }}>
            <div style={{ fontSize: "11px", color: "#aaa", lineHeight: 1.7 }}>
              All five risk indicators are elevated simultaneously. This convergence has no direct precedent
              in modern recession history. Prior downturns typically showed 1-2 elevated factors with others
              acting as buffers.
            </div>
          </div>
        </div>

        {/* Composite bar vs. history */}
        <div style={{ marginTop: "20px" }}>
          <div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px", marginBottom: "10px" }}>
            COMPOSITE SCORE VS. PRIOR RECESSION ENTRY POINTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {HISTORICAL_COMPOSITES.map((h) => (
              <div key={h.year} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "52px",
                    fontSize: "10px",
                    color: h.year === "Now" ? compositeColor : "#666",
                    textAlign: "right",
                    flexShrink: 0,
                    fontWeight: h.year === "Now" ? 700 : 400,
                  }}
                >
                  {h.year}
                </div>
                <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${h.year === "Now" ? composite : h.composite}%`,
                      background:
                        h.year === "Now"
                          ? compositeColor
                          : "rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: "28px",
                    fontSize: "10px",
                    color: h.year === "Now" ? compositeColor : "#555",
                    fontWeight: h.year === "Now" ? 700 : 400,
                  }}
                >
                  {h.year === "Now" ? composite : h.composite}
                </div>
                <div style={{ fontSize: "10px", color: "#444", display: "none" }}>{h.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Indicators */}
      <div style={{ margin: "20px 24px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "10px", color: "#555", letterSpacing: "2px", marginBottom: "4px" }}>
          INDIVIDUAL RISK FACTORS
        </div>

        {INDICATORS.map((ind) => {
          const isOpen = expanded === ind.id;
          return (
            <div
              key={ind.id}
              style={{
                border: isOpen ? `1px solid ${ind.color}44` : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "6px",
                background: isOpen ? ind.color + "08" : "#111",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => setExpanded(isOpen ? null : ind.id)}
            >
              {/* Header row */}
              <div style={{ padding: "14px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#ddd" }}>{ind.label}</span>
                    <StatusBadge status={ind.status} color={ind.color} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: ind.color }}>{ind.score}</span>
                    <span style={{ fontSize: "12px", color: "#555" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>
                <ScoreBar
                  score={ind.score}
                  color={ind.color}
                  parallelScore={ind.parallelScore}
                  parallelYear={ind.parallelYear}
                />
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    padding: "16px 18px 18px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "3px",
                      fontSize: "10px",
                      color: "#888",
                      letterSpacing: "1px",
                      marginBottom: "12px",
                    }}
                  >
                    HISTORICAL PARALLEL: {ind.historicalParallel}
                  </div>

                  <p style={{ fontSize: "13px", color: "#bbb", lineHeight: 1.75, marginBottom: "12px" }}>
                    {ind.description}
                  </p>

                  <div
                    style={{
                      padding: "10px 12px",
                      background: ind.color + "11",
                      border: `1px solid ${ind.color}22`,
                      borderRadius: "4px",
                      fontSize: "11px",
                      color: "#aaa",
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ color: ind.color, fontWeight: 700 }}>KEY DATA: </span>
                    {ind.keyFact}
                  </div>

                  <div style={{ fontSize: "10px", color: "#444", marginTop: "10px" }}>
                    LAST REVIEWED: {ind.lastUpdated}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Methodology note */}
      <div
        style={{
          margin: "24px 24px 0",
          padding: "14px 18px",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "6px",
          background: "#0a0a0a",
        }}
      >
        <div style={{ fontSize: "10px", color: "#444", letterSpacing: "1px", marginBottom: "6px" }}>
          METHODOLOGY
        </div>
        <p style={{ fontSize: "11px", color: "#555", lineHeight: 1.7 }}>
          Scores represent qualitative-quantitative assessment based on NBER recession history,
          Federal Reserve historical records, CBO projections, and current economic data.
          Historical parallel markers on each bar show the approximate score for the closest prior
          parallel at the onset of that recession. The composite score is a simple average of the
          five indicators. This is an analytical framework, not a forecasting model.
          Sources: NBER, Federal Reserve History, Brookings Institution, Stanford SIEPR,
          Apollo Global Management, Committee for a Responsible Federal Budget.
        </p>
      </div>
    </div>
  );
}
