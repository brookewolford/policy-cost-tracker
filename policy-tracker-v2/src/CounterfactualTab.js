import { useEffect, useRef, useState } from "react";

// ─── Validated palette (dataviz skill, dark surface #0a0a0a) ─────────────────
// Series 1 dark: #3987e5 (blue)   Series 2 dark: #d95926 (orange)
// Light surface: #fcfcfb          Dark surface (chart bg): #111111
// Text primary: #f0efec           Text secondary: #9e9c96   Muted: #898781
// Gridline: #2c2c2a               Baseline: #383835
// ─────────────────────────────────────────────────────────────────────────────

// ── Data ─────────────────────────────────────────────────────────────────────

// CBO deficit trajectory: actual projected path vs pre-OBBBA baseline
// Fiscal years 2025–2034. Baseline = CBO Jan 2025 baseline (pre-OBBBA).
// Actual = CBO Sept 2026 updated projection with OBBBA enacted.
// All values in $B.
const DEFICIT_DATA = [
  { year: "FY25", baseline: 1900, actual: 1960 },
  { year: "FY26", baseline: 2040, actual: 2310 },
  { year: "FY27", baseline: 2160, actual: 2680 },
  { year: "FY28", baseline: 2290, actual: 2930 },
  { year: "FY29", baseline: 2380, actual: 3090 },
  { year: "FY30", baseline: 2470, actual: 3200 },
  { year: "FY31", baseline: 2550, actual: 3290 },
  { year: "FY32", baseline: 2640, actual: 3380 },
  { year: "FY33", baseline: 2730, actual: 3470 },
  { year: "FY34", baseline: 2820, actual: 3560 },
];

// Household impact stat tiles: counterfactual vs actual per median US household
const HOUSEHOLD_TILES = [
  {
    id: "healthcare",
    label: "Healthcare coverage",
    actual: "At risk of losing coverage",
    counterfactual: "Medicaid intact",
    delta: "11.8M people keep coverage",
    icon: "⚕",
    direction: "bad", // "bad" = actual is worse than counterfactual
  },
  {
    id: "snap",
    label: "SNAP food assistance",
    actual: "5.8M already cut",
    counterfactual: "$285B program preserved",
    delta: "$146/month kept per family",
    icon: "🌾",
    direction: "bad",
  },
  {
    id: "taxes",
    label: "Tax burden (bottom 60%)",
    actual: "Avg +$820/yr net (tariffs offset cuts)",
    counterfactual: "Status quo",
    delta: "Top 1% keeps $50K/yr cut",
    icon: "📋",
    direction: "bad",
  },
  {
    id: "debt",
    label: "Each household's share of new debt",
    actual: "$31,700 added per household",
    counterfactual: "$0 (baseline trajectory)",
    delta: "$4.1T / 130M households",
    icon: "📈",
    direction: "bad",
  },
];

// Opportunity cost: what the $7.44T tracker total could alternatively fund.
// This computes live from a passed-in trackerTotal prop.
const OPPORTUNITY_ITEMS = [
  {
    id: "prek",
    label: "Years of universal pre-K (3–4 yr olds)",
    annualCost: 85_000_000_000, // ~$85B/yr per NIEER
    unit: "years",
    unitLabel: "yrs",
  },
  {
    id: "college",
    label: "Years of free public college tuition (all students)",
    annualCost: 79_000_000_000, // ~$79B/yr per College Board / CBO estimates
    unit: "years",
    unitLabel: "yrs",
  },
  {
    id: "roads",
    label: "Years of full federal highway & bridge program",
    annualCost: 65_000_000_000, // ~$65B/yr FHWA
    unit: "years",
    unitLabel: "yrs",
  },
  {
    id: "va",
    label: "Years of full VA healthcare budget",
    annualCost: 119_000_000_000, // FY2025 VA enacted
    unit: "years",
    unitLabel: "yrs",
  },
  {
    id: "nih",
    label: "Years of full NIH research budget",
    annualCost: 47_000_000_000,
    unit: "years",
    unitLabel: "yrs",
  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────

function fmt(n, decimals = 1) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtB(n) {
  return `$${n.toLocaleString()}B`;
}

// ── Line chart ────────────────────────────────────────────────────────────────

function DeficitChart() {
  const canvasRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const SERIES = [
    { key: "baseline", label: "Pre-OBBBA baseline (CBO Jan 2025)", color: "#3987e5" },
    { key: "actual", label: "OBBBA enacted path (CBO Sept 2026)", color: "#d95926" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    function draw() {
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      const PAD = { top: 24, right: 40, bottom: 40, left: 60 };
      const cW = W - PAD.left - PAD.right;
      const cH = H - PAD.top - PAD.bottom;

      const allVals = DEFICIT_DATA.flatMap((d) => [d.baseline, d.actual]);
      const minV = Math.min(...allVals) * 0.9;
      const maxV = Math.max(...allVals) * 1.05;

      const xOf = (i) => PAD.left + (i / (DEFICIT_DATA.length - 1)) * cW;
      const yOf = (v) => PAD.top + cH - ((v - minV) / (maxV - minV)) * cH;

      // Surface
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, W, H);

      // Gridlines (hairline, 1px, recessive)
      const gridVals = [1000, 1500, 2000, 2500, 3000, 3500].filter(
        (v) => v >= minV && v <= maxV
      );
      gridVals.forEach((v) => {
        const y = yOf(v);
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(PAD.left + cW, y);
        ctx.strokeStyle = "#2c2c2a";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#898781";
        ctx.font = "11px system-ui,-apple-system,sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`$${v / 1000}T`, PAD.left - 8, y + 4);
      });

      // X-axis labels
      DEFICIT_DATA.forEach((d, i) => {
        ctx.fillStyle = "#898781";
        ctx.font = "11px system-ui,-apple-system,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(d.year, xOf(i), H - 10);
      });

      // Lines (2px, round join/cap) — baseline first so actual is on top
      SERIES.forEach(({ key, color }) => {
        ctx.beginPath();
        DEFICIT_DATA.forEach((d, i) => {
          const x = xOf(i);
          const y = yOf(d[key]);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();
      });

      // End-markers (>=8px, filled with series color, 2px surface ring)
      SERIES.forEach(({ key, color }) => {
        const last = DEFICIT_DATA[DEFICIT_DATA.length - 1];
        const x = xOf(DEFICIT_DATA.length - 1);
        const y = yOf(last[key]);
        // Surface ring
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#111111";
        ctx.fill();
        // Marker
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      // End labels (stagger to avoid collision)
      const lastIdx = DEFICIT_DATA.length - 1;
      const bY = yOf(DEFICIT_DATA[lastIdx].baseline);
      const aY = yOf(DEFICIT_DATA[lastIdx].actual);
      const gap = Math.abs(bY - aY);
      const bLabelY = gap < 18 ? bY + 14 : bY + 5;
      const aLabelY = gap < 18 ? aY - 6 : aY + 5;

      ctx.font = "bold 11px system-ui,-apple-system,sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#f0efec";
      ctx.fillText(fmtB(DEFICIT_DATA[lastIdx].actual), xOf(lastIdx) + 8, aLabelY);

      ctx.fillStyle = "#9e9c96";
      ctx.fillText(fmtB(DEFICIT_DATA[lastIdx].baseline), xOf(lastIdx) + 8, bLabelY);
    }

    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // Hover crosshair tooltip
  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const PAD = { left: 60, right: 40 };
    const cW = rect.width - PAD.left - PAD.right;
    const rawIdx = ((mx - PAD.left) / cW) * (DEFICIT_DATA.length - 1);
    const idx = Math.round(rawIdx);
    if (idx < 0 || idx >= DEFICIT_DATA.length) {
      setTooltip(null);
      return;
    }
    const d = DEFICIT_DATA[idx];
    const xPx = PAD.left + (idx / (DEFICIT_DATA.length - 1)) * cW;
    setTooltip({ d, xPx, clientY: e.clientY, rect });
  }

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: 280, display: "block", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: Math.min(tooltip.xPx + 12, tooltip.rect.width - 160),
            top: 24,
            background: "#1e1e1c",
            border: "1px solid #2c2c2a",
            borderRadius: 6,
            padding: "8px 12px",
            pointerEvents: "none",
            minWidth: 150,
          }}
        >
          <div style={{ color: "#9e9c96", fontSize: 11, marginBottom: 6 }}>
            {tooltip.d.year}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 12, height: 2, background: "#d95926", display: "inline-block", borderRadius: 1 }} />
            <span style={{ color: "#f0efec", fontSize: 13 }}>
              OBBBA path: <strong>{fmtB(tooltip.d.actual)}</strong>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ width: 12, height: 2, background: "#3987e5", display: "inline-block", borderRadius: 1 }} />
            <span style={{ color: "#9e9c96", fontSize: 13 }}>
              Baseline: {fmtB(tooltip.d.baseline)}
            </span>
          </div>
          <div style={{ color: "#d95926", fontSize: 12, marginTop: 4, borderTop: "1px solid #2c2c2a", paddingTop: 4 }}>
            +{fmtB(tooltip.d.actual - tooltip.d.baseline)} added by OBBBA
          </div>
        </div>
      )}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────

function ChartLegend() {
  const items = [
    { color: "#d95926", label: "OBBBA enacted path (CBO Sept 2026)" },
    { color: "#3987e5", label: "Pre-OBBBA baseline (CBO Jan 2025)" },
  ];
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 12 }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 20,
              height: 2,
              background: color,
              display: "inline-block",
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#9e9c96", fontSize: 12 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function HouseholdTile({ tile }) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #2c2c2a",
        borderRadius: 8,
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{tile.icon}</span>
        <span style={{ color: "#9e9c96", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {tile.label}
        </span>
      </div>

      {/* Actual (the OBBBA-enacted reality) */}
      <div>
        <div style={{ color: "#898781", fontSize: 11, marginBottom: 3 }}>Reality (OBBBA enacted)</div>
        <div style={{ color: "#d95926", fontSize: 14, fontWeight: 600 }}>{tile.actual}</div>
      </div>

      {/* Counterfactual */}
      <div>
        <div style={{ color: "#898781", fontSize: 11, marginBottom: 3 }}>What could have been</div>
        <div style={{ color: "#3987e5", fontSize: 14, fontWeight: 600 }}>{tile.counterfactual}</div>
      </div>

      {/* Delta */}
      <div
        style={{
          background: "#1a1a18",
          borderRadius: 4,
          padding: "6px 10px",
          color: "#f0efec",
          fontSize: 12,
        }}
      >
        {tile.delta}
      </div>
    </div>
  );
}

// ── Opportunity cost ──────────────────────────────────────────────────────────

function OpportunityCost({ trackerTotal }) {
  const total = trackerTotal || 7_440_000_000_000; // fallback if not passed

  return (
    <div>
      <p style={{ color: "#9e9c96", fontSize: 13, margin: "0 0 16px" }}>
        The tracker total of <strong style={{ color: "#f0efec" }}>{fmt(total)}</strong> could instead fund:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {OPPORTUNITY_ITEMS.map((item) => {
          const years = total / item.annualCost;
          const display =
            years >= 100
              ? `${Math.round(years / 10) * 10}+ years`
              : years >= 10
              ? `${Math.round(years)} years`
              : `${years.toFixed(1)} years`;

          const barPct = Math.min((years / 100) * 100, 100);

          return (
            <div
              key={item.id}
              style={{
                background: "#111111",
                border: "1px solid #2c2c2a",
                borderRadius: 6,
                padding: "12px 14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ color: "#9e9c96", fontSize: 13 }}>{item.label}</span>
                <span style={{ color: "#f0efec", fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0, marginLeft: 12 }}>
                  {display}
                </span>
              </div>
              {/* Bar (sequential blue ramp, capped at 100 units = 100%) */}
              <div style={{ height: 4, background: "#2c2c2a", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${barPct}%`,
                    background: "#3987e5",
                    borderRadius: "2px 0 0 2px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div style={{ color: "#898781", fontSize: 11, marginTop: 5 }}>
                Annual cost: {fmt(item.annualCost)}/yr
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CounterfactualTab({ trackerTotal }) {
  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "0 0 48px",
        fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif",
      }}
    >
      {/* Intro */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "#9e9c96", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          The fiscal and human costs tracked on this site reflect choices that were made. Below is
          what the numbers looked like before those choices, and what the same dollars could
          alternatively fund. All figures are sourced from CBO, federal agencies, and peer-reviewed
          research.
        </p>
      </div>

      {/* Section 1: Deficit trajectory */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ color: "#f0efec", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
          Federal deficit trajectory, FY2025–2034
        </h2>
        <p style={{ color: "#898781", fontSize: 12, margin: "0 0 16px" }}>
          Annual deficit in billions. Source: Congressional Budget Office (Jan 2025 baseline; Sept 2026 updated projection).
        </p>

        <div
          style={{
            background: "#111111",
            border: "1px solid #2c2c2a",
            borderRadius: 8,
            padding: "20px 16px 12px",
          }}
        >
          <DeficitChart />
          <ChartLegend />
        </div>

        <div
          style={{
            marginTop: 12,
            background: "#1a1210",
            border: "1px solid #3d2010",
            borderRadius: 6,
            padding: "10px 14px",
          }}
        >
          <span style={{ color: "#d95926", fontWeight: 600, fontSize: 13 }}>
            Total added to deficit by OBBBA over 10 years:
          </span>{" "}
          <span style={{ color: "#f0efec", fontSize: 13 }}>
            $4.1T (CBO dynamic score, Sept 2026). National debt-to-GDP projected to rise from 162%
            to 190%+ over 35 years.
          </span>
        </div>
      </section>

      {/* Section 2: Household impact */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ color: "#f0efec", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
          Household impact: reality vs what could have been
        </h2>
        <p style={{ color: "#898781", fontSize: 12, margin: "0 0 16px" }}>
          Per median US household. Sources: CBO, Food Research and Action Center, Tax Policy Center, Urban Institute.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {HOUSEHOLD_TILES.map((tile) => (
            <HouseholdTile key={tile.id} tile={tile} />
          ))}
        </div>
      </section>

      {/* Section 3: Opportunity cost */}
      <section>
        <h2 style={{ color: "#f0efec", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
          Opportunity cost
        </h2>
        <p style={{ color: "#898781", fontSize: 12, margin: "0 0 16px" }}>
          Based on live tracker total. Annual program cost sources: NIEER, College Board/CBO, FHWA, VA budget, NIH budget.
        </p>

        <OpportunityCost trackerTotal={trackerTotal} />
      </section>

      {/* Methodology note */}
      <div
        style={{
          marginTop: 32,
          borderTop: "1px solid #2c2c2a",
          paddingTop: 16,
          color: "#898781",
          fontSize: 11,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "#9e9c96" }}>Methodology:</strong> Deficit projections use CBO's January 2025 extended
        baseline as the pre-OBBBA counterfactual and CBO's September 2026 updated projection as the enacted path.
        Household figures are from CBO distributional analysis, Tax Policy Center microsimulation, and program
        enrollment data. Opportunity cost uses publicly reported annual program costs; bars scale to 100 years.
        All figures are rounded for readability; see primary sources for precision.
      </div>
    </div>
  );
}
