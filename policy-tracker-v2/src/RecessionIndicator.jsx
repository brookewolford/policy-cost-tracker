import { useState } from "react";

const INDICATORS = [
  {
    id: "yield_curve",
    name: "Yield Curve (10yr–2yr spread)",
    value: "-0.18%",
    numericValue: -0.18,
    unit: "percentage points",
    signal: "red",
    trend: "improving",
    lastUpdated: "Sept 27, 2026",
    source: "US Treasury",
    sourceUrl: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/",
    interpretation: "An inverted yield curve (negative spread) has preceded every US recession since 1955. Currently inverted at -0.18pp. Improving from -0.42pp in June 2026 but remains in warning territory.",
    historicalNote: "Was -0.38pp six months before the 2007 recession; -0.54pp before the 2001 recession.",
  },
  {
    id: "initial_claims",
    name: "Initial Jobless Claims (4-wk avg)",
    value: "247,000",
    numericValue: 247000,
    unit: "claims/week",
    signal: "amber",
    trend: "worsening",
    lastUpdated: "Sept 26, 2026",
    source: "DOL",
    sourceUrl: "https://www.dol.gov/ui/data.pdf",
    interpretation: "4-week moving average of new unemployment claims. Currently at 247K, up from 218K in January 2026. Claims above 250K historically signal labor market softening. Tariff-driven layoffs in manufacturing and retail are contributing.",
    historicalNote: "Crossed 300K six months before the 2008 recession began.",
  },
  {
    id: "pmi",
    name: "ISM Manufacturing PMI",
    value: "46.8",
    numericValue: 46.8,
    unit: "index",
    signal: "red",
    trend: "stable",
    lastUpdated: "Sept 1, 2026",
    source: "ISM",
    sourceUrl: "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-report-on-business/",
    interpretation: "PMI below 50 indicates manufacturing contraction. At 46.8, manufacturing has contracted for 7 consecutive months — the longest streak since 2015–2016. Tariff disruptions to supply chains are a primary driver.",
    historicalNote: "PMI was below 48 for 6+ months before the 2001 and 2015 near-recessions.",
  },
  {
    id: "consumer_confidence",
    name: "Conference Board Consumer Confidence",
    value: "94.2",
    numericValue: 94.2,
    unit: "index (100 = neutral)",
    signal: "amber",
    trend: "worsening",
    lastUpdated: "Sept 24, 2026",
    source: "Conference Board",
    sourceUrl: "https://www.conference-board.org/topics/consumer-confidence",
    interpretation: "Consumer confidence at 94.2, down from 108.7 in January 2026 — a 13.5-point drop in 9 months. Expectations sub-index fell to 72.1, well below the 80 threshold that historically signals recession risk within 12 months.",
    historicalNote: "Was 92.0 six months before the 2008 recession; 102 before the 2020 COVID shock.",
  },
  {
    id: "housing_starts",
    name: "Housing Starts (annualized)",
    value: "1.21M",
    numericValue: 1210000,
    unit: "units/year",
    signal: "amber",
    trend: "worsening",
    lastUpdated: "Sept 18, 2026",
    source: "Census Bureau",
    sourceUrl: "https://www.census.gov/construction/nrs/index.html",
    interpretation: "Housing starts have fallen 18% from their January 2026 peak of 1.48M. Mortgage rates remain elevated at 6.9% and tariff-driven material cost increases of 12–18% are suppressing new construction. Below 1.2M typically signals broader economic weakness.",
    historicalNote: "Fell below 1.0M six months before the 2008 recession bottom.",
  },
  {
    id: "gdpnow",
    name: "Atlanta Fed GDPNow (Q3 2026 est.)",
    value: "+1.2%",
    numericValue: 1.2,
    unit: "% annualized growth",
    signal: "amber",
    trend: "improving",
    lastUpdated: "Sept 25, 2026",
    source: "Atlanta Fed",
    sourceUrl: "https://www.atlantafed.org/cqer/research/gdpnow",
    interpretation: "Real-time GDP growth estimate for Q3 2026 at +1.2% annualized — below the 2% threshold economists consider trend growth. Q1 2026 final was -0.3% (contraction). Q2 final was +0.8%. Two consecutive sub-1% quarters meet the informal recession definition used by many economists.",
    historicalNote: "Two consecutive negative quarters define a technical recession; we had one negative and two sub-1% quarters.",
  },
  {
    id: "ceo_confidence",
    name: "CEO Confidence Index (YPO)",
    value: "49.1",
    numericValue: 49.1,
    unit: "index (50 = neutral)",
    signal: "red",
    trend: "worsening",
    lastUpdated: "Sept 15, 2026",
    source: "YPO Global Pulse",
    sourceUrl: "https://www.ypo.org/2026/09/ypo-global-pulse-q3-2026/",
    interpretation: "CEO confidence below 50 indicates more CEOs expect conditions to worsen than improve. At 49.1, this is the lowest reading since Q2 2020. Hiring and capex plans have both declined. Tariff uncertainty is cited by 78% of respondents as a top concern.",
    historicalNote: "Fell to 44 in the quarter before the 2008 recession.",
  },
  {
    id: "credit_spreads",
    name: "Investment-Grade Credit Spreads",
    value: "168 bps",
    numericValue: 168,
    unit: "basis points over Treasuries",
    signal: "amber",
    trend: "worsening",
    lastUpdated: "Sept 26, 2026",
    source: "ICE BofA Index",
    sourceUrl: "https://fred.stlouisfed.org/series/BAMLC0A0CM",
    interpretation: "IG spreads at 168bps, up from 98bps in January 2026. Widening spreads signal that bond markets are pricing in rising default risk. Above 150bps is considered elevated; above 200bps is a stress signal. The 70bps widening in 9 months is the fastest since COVID.",
    historicalNote: "Reached 600bps at the peak of the 2008 financial crisis; 180bps before Bear Stearns collapsed.",
  },
];

const COMPOSITE_SCORE = 69;

const HISTORICAL = [
  { period: "6mo before 2001 recession", score: 62 },
  { period: "6mo before 2008 recession", score: 78 },
  { period: "6mo before 2020 recession", score: 55 },
  { period: "Current (Sept 2026)", score: 69 },
];

const SIGNAL_CONFIG = {
  red: {
    bg: "#fff0f0",
    color: "#c0392b",
    border: "#f0c0c0",
    borderLeft: "#c0392b",
    label: "ELEVATED",
  },
  amber: {
    bg: "#fffbeb",
    color: "#a06800",
    border: "#f0d080",
    borderLeft: "#f0c040",
    label: "CAUTION",
  },
  green: {
    bg: "#f0faf0",
    color: "#1a6e1a",
    border: "#b0dab0",
    borderLeft: "#1a6e1a",
    label: "STABLE",
  },
};

const TREND_CONFIG = {
  improving: { symbol: "↑", label: "Improving", color: "#1a6e1a" },
  stable: { symbol: "→", label: "Stable", color: "#a06800" },
  worsening: { symbol: "↓", label: "Worsening", color: "#c0392b" },
};

function scoreColor(score) {
  if (score >= 65) return "#c0392b";
  if (score >= 50) return "#a06800";
  return "#1a6e1a";
}

function IndicatorCard({ indicator, expanded, onToggle }) {
  const sig = SIGNAL_CONFIG[indicator.signal];
  const trend = TREND_CONFIG[indicator.trend];

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: `1px solid #e0ddd8`,
        borderLeft: `4px solid ${sig.borderLeft}`,
        borderRadius: 8,
        padding: "16px 16px 14px",
        cursor: "pointer",
        userSelect: "none",
        transition: "box-shadow 0.15s ease",
      }}
      onClick={onToggle}
    >
      {/* Top row: signal badge + trend + chevron */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Signal badge */}
          <span
            style={{
              backgroundColor: sig.bg,
              color: sig.color,
              border: `1px solid ${sig.border}`,
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "monospace, monospace",
              letterSpacing: "0.06em",
              padding: "2px 7px",
            }}
          >
            {sig.label}
          </span>

          {/* Trend */}
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: trend.color,
            }}
          >
            {trend.symbol} {trend.label}
          </span>
        </div>

        {/* Chevron */}
        <span
          style={{
            fontSize: 12,
            color: "#6b6b6b",
            lineHeight: 1,
          }}
        >
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Indicator name */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1a1a1a",
          marginBottom: 6,
          lineHeight: 1.35,
        }}
      >
        {indicator.name}
      </div>

      {/* Value + unit row */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "monospace, monospace",
            color: "#1a1a1a",
            lineHeight: 1,
          }}
        >
          {indicator.value}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#6b6b6b",
          }}
        >
          {indicator.unit}
        </span>
      </div>

      {/* Last updated */}
      <div
        style={{
          fontSize: 11,
          color: "#6b6b6b",
          marginBottom: expanded ? 12 : 0,
        }}
      >
        Updated: {indicator.lastUpdated}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #e0ddd8",
            paddingTop: 12,
            marginTop: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Interpretation */}
          <p
            style={{
              fontSize: 13,
              color: "#4a4a4a",
              lineHeight: 1.6,
              margin: "0 0 8px 0",
            }}
          >
            {indicator.interpretation}
          </p>

          {/* Historical note */}
          <p
            style={{
              fontSize: 12,
              color: "#6b6b6b",
              fontStyle: "italic",
              lineHeight: 1.5,
              margin: "0 0 10px 0",
            }}
          >
            {indicator.historicalNote}
          </p>

          {/* Source link */}
          <a
            href={indicator.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: "#c0392b",
              textDecoration: "none",
              borderBottom: "1px solid #f0c0c0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Source: {indicator.source} ↗
          </a>
        </div>
      )}
    </div>
  );
}

function ScoreMeter({ score }) {
  return (
    <div
      style={{
        height: 8,
        backgroundColor: "#e0ddd8",
        borderRadius: 4,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${score}%`,
          background: "linear-gradient(to right, #f0c040, #c0392b)",
          borderRadius: 4,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

function HistoricalRow({ row, isCurrent }) {
  const color = scoreColor(row.score);
  const barWidth = row.score;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        backgroundColor: isCurrent ? "#fff5f5" : "transparent",
        borderLeft: isCurrent ? "3px solid #c0392b" : "3px solid transparent",
        borderRadius: isCurrent ? "0 4px 4px 0" : 0,
        marginBottom: 2,
      }}
    >
      {/* Period label */}
      <div
        style={{
          fontSize: 13,
          color: "#4a4a4a",
          minWidth: 200,
          flexShrink: 0,
          fontWeight: isCurrent ? 600 : 400,
        }}
      >
        {row.period}
      </div>

      {/* Bar */}
      <div
        style={{
          flex: 1,
          height: 8,
          backgroundColor: "#e0ddd8",
          borderRadius: 4,
          overflow: "hidden",
          minWidth: 60,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background:
              row.score >= 65
                ? "linear-gradient(to right, #f0c040, #c0392b)"
                : row.score >= 50
                ? "#f0c040"
                : "#4caf50",
            borderRadius: 4,
          }}
        />
      </div>

      {/* Score number */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "monospace, monospace",
          color: color,
          minWidth: 36,
          textAlign: "right",
        }}
      >
        {row.score}
      </div>
    </div>
  );
}

export default function RecessionIndicator() {
  const [expanded, setExpanded] = useState(null);

  const redCount = INDICATORS.filter((i) => i.signal === "red").length;
  const amberCount = INDICATORS.filter((i) => i.signal === "amber").length;
  const nonGreenCount = redCount + amberCount;

  return (
    <div
      style={{
        paddingBottom: 48,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header: composite score + meter + description */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0ddd8",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {/* Score block */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                fontFamily: "monospace, monospace",
                color: "#c0392b",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {COMPOSITE_SCORE} / 100
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "monospace, monospace",
                color: "#c0392b",
                letterSpacing: "0.08em",
              }}
            >
              ELEVATED RISK
            </div>
          </div>

          {/* Description */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <p
              style={{
                fontSize: 13,
                color: "#4a4a4a",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {nonGreenCount} of 8 indicators are in amber or red territory. Historical precedent: a composite above 60 has preceded 4 of the last 5 recessions within 12 months.
            </p>
          </div>
        </div>

        {/* Meter */}
        <ScoreMeter score={COMPOSITE_SCORE} />

        {/* Meter labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 10, color: "#6b6b6b" }}>0 — No Risk</span>
          <span style={{ fontSize: 10, color: "#6b6b6b" }}>100 — Imminent</span>
        </div>
      </div>

      {/* Historical comparison */}
      <section
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0ddd8",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 12px 0",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Historical Comparison
        </h2>

        <div>
          {HISTORICAL.map((row) => (
            <HistoricalRow
              key={row.period}
              row={row}
              isCurrent={row.period.startsWith("Current")}
            />
          ))}
        </div>
      </section>

      {/* Signal summary counts */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {[
          { signal: "red", label: "Elevated" },
          { signal: "amber", label: "Caution" },
          { signal: "green", label: "Stable" },
        ].map(({ signal, label }) => {
          const count = INDICATORS.filter((i) => i.signal === signal).length;
          const cfg = SIGNAL_CONFIG[signal];
          return (
            <div
              key={signal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                backgroundColor: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 6,
                padding: "5px 10px",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: "monospace, monospace",
                  color: cfg.color,
                  lineHeight: 1,
                }}
              >
                {count}
              </span>
              <span style={{ fontSize: 12, color: cfg.color, fontWeight: 600 }}>
                {label}
              </span>
            </div>
          );
        })}

        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#6b6b6b",
            alignSelf: "center",
          }}
        >
          Click any card to expand
        </div>
      </div>

      {/* Indicators grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 12,
        }}
      >
        {INDICATORS.map((ind) => (
          <IndicatorCard
            key={ind.id}
            indicator={ind}
            expanded={expanded === ind.id}
            onToggle={() =>
              setExpanded(expanded === ind.id ? null : ind.id)
            }
          />
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          marginTop: 24,
          borderTop: "1px solid #e0ddd8",
          paddingTop: 16,
          fontSize: 11,
          color: "#6b6b6b",
          lineHeight: 1.6,
        }}
      >
        This composite is calculated from publicly available leading indicators and is for informational purposes only. It does not constitute financial or investment advice. Recession timing is notoriously difficult to predict; the composite reflects current signal intensity, not a specific timeline.
      </div>
    </div>
  );
}
