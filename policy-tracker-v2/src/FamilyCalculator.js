import { useState, useRef, useEffect, useCallback } from "react";

// ─── Data sources ─────────────────────────────────────────────────────────────
// Tax cut / tariff figures: Tax Policy Center microsimulation + Peterson Institute
//   tariff pass-through + Yale Budget Lab state-level estimates (2026).
// Medicaid eligibility thresholds: CBO distributional analysis + KFF state tracker.
// SNAP eligibility: USDA FNS + Food Research and Action Center (FRAC) Aug 2026.
// Debt share: $4.1T / 130M US households (Census 2025).
// ─────────────────────────────────────────────────────────────────────────────

// Income quintile breakpoints (annual household income, 2026 $)
// Quintile 1: < $35K  Quintile 2: $35K–$65K  Quintile 3: $65K–$105K
// Quintile 4: $105K–$175K  Quintile 5: > $175K
// Top 1%: > $500K

const INCOME_TIERS = [
  { id: "q1", label: "Under $35,000", quintile: 1 },
  { id: "q2", label: "$35,000 – $65,000", quintile: 2 },
  { id: "q3", label: "$65,000 – $105,000", quintile: 3 },
  { id: "q4", label: "$105,000 – $175,000", quintile: 4 },
  { id: "q5", label: "$175,000 – $500,000", quintile: 5 },
  { id: "top1", label: "Over $500,000", quintile: 6 },
];

const HOUSEHOLD_SIZES = [
  { id: "1", label: "1 person" },
  { id: "2", label: "2 people" },
  { id: "3", label: "3 people" },
  { id: "4", label: "4 people" },
  { id: "5plus", label: "5 or more" },
];

// States with expanded Medicaid (as of Sept 2026, 41 states + DC)
const MEDICAID_EXPANSION_STATES = new Set([
  "AK","AZ","AR","CA","CO","CT","DC","DE","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SD","UT","VA",
  "VT","WA","WV","WI",
]);

// States with highest SNAP penetration / largest SNAP cuts impact
const HIGH_SNAP_IMPACT_STATES = new Set([
  "MS","NM","WV","AR","LA","KY","AL","SC","TN","OK","AZ","NV","GA","NC",
]);

// ── Tax cut / tariff net impact by income quintile (annual, per household)
// Positive = net gain  Negative = net loss
// Source: Tax Policy Center 2026 distributional table + Peterson/Yale tariff offset
// Tariff cost: Q1 ~$2,200/yr, Q2 ~$2,900/yr, Q3 ~$3,400/yr, Q4 ~$4,100/yr, Q5 ~$5,800/yr, Top1 ~$9,200/yr
// Tax cut benefit: Q1 ~$330/yr, Q2 ~$980/yr, Q3 ~$2,100/yr, Q4 ~$4,800/yr, Q5 ~$14,200/yr, Top1 ~$61,000/yr
const TAX_DATA = {
  q1:   { taxCutBenefit: 330,    tariffCost: 2200,  net: -1870 },
  q2:   { taxCutBenefit: 980,    tariffCost: 2900,  net: -1920 },
  q3:   { taxCutBenefit: 2100,   tariffCost: 3400,  net: -1300 },
  q4:   { taxCutBenefit: 4800,   tariffCost: 4100,  net: 700   },
  q5:   { taxCutBenefit: 14200,  tariffCost: 5800,  net: 8400  },
  top1: { taxCutBenefit: 61000,  tariffCost: 9200,  net: 51800 },
};

// ── Confidence intervals on tax / tariff estimates (CBO range)
const TAX_RANGES = {
  q1:   { taxLow: 200,   taxHigh: 500,   tariffLow: 1800,  tariffHigh: 2700 },
  q2:   { taxLow: 700,   taxHigh: 1300,  tariffLow: 2400,  tariffHigh: 3500 },
  q3:   { taxLow: 1600,  taxHigh: 2700,  tariffLow: 2900,  tariffHigh: 4100 },
  q4:   { taxLow: 3800,  taxHigh: 6000,  tariffLow: 3400,  tariffHigh: 5000 },
  q5:   { taxLow: 10500, taxHigh: 18000, tariffLow: 4700,  tariffHigh: 7200 },
  top1: { taxLow: 48000, taxHigh: 75000, tariffLow: 7500,  tariffHigh: 11500 },
};

// ── Diverging chart data (also derived from TAX_DATA above)
const QUINTILE_CHART_DATA = [
  { id: "q1",   net: -1870,  label: "Under $35K" },
  { id: "q2",   net: -1920,  label: "$35K–$65K" },
  { id: "q3",   net: -1300,  label: "$65K–$105K" },
  { id: "q4",   net:  700,   label: "$105K–$175K" },
  { id: "q5",   net:  8400,  label: "$175K–$500K" },
  { id: "top1", net:  51800, label: "Over $500K" },
];

// ── State-level Medicaid federal match loss (millions, 10-year projection)
// Source: KFF State Health Facts + CBO distributional analysis
const MEDICAID_MATCH_LOSS = {
  CA: 187400, NY: 112300, TX: 89200,  FL: 71800,  IL: 52100,
  PA: 48900,  OH: 41200,  MI: 38700,  NC: 35400,  GA: 28900,
  NJ: 27600,  VA: 26800,  WA: 25100,  AZ: 24700,  MA: 24200,
  TN: 22800,  IN: 21400,  MO: 20900,  WI: 19800,  MN: 19200,
  CO: 18700,  MD: 18100,  AL: 17600,  SC: 16900,  KY: 16400,
  OR: 15800,  LA: 15200,  CT: 14100,  OK: 13800,  AR: 12900,
  MS: 12400,  KS: 11200,  NV: 10800,  UT: 10200,  NM: 9800,
  NE: 8900,   WV: 8400,   ID: 7600,   HI: 7100,   ME: 6800,
  NH: 6200,   RI: 5900,   MT: 5400,   DE: 4900,   SD: 4200,
  ND: 3800,   AK: 3600,   VT: 3200,   WY: 2800,   DC: 9400,
};

// ── Medicaid risk assessment
// Returns: { atRisk, reason, severity }
function medicaidRisk(state, incomeId, householdId) {
  const inExpansionState = MEDICAID_EXPANSION_STATES.has(state);
  const size = householdId === "5plus" ? 5 : parseInt(householdId, 10);

  // FPL income thresholds (2026 approximate): 100% FPL * size
  // Expansion Medicaid covers up to 138% FPL
  // CBO: 11.8M lose coverage — primarily those near Medicaid/ACA cliff
  // OBBBA: work requirements, 80-hr/month mandate, redeterminations every 6 months

  if (incomeId === "q1") {
    if (inExpansionState) {
      return {
        atRisk: true,
        severity: "high",
        reason: `In ${state}, expansion Medicaid covers incomes up to ~$20,000 (single) or ~$41,000 (family of 4). Work requirement of 80 hrs/month takes effect Jan 2027. CBO projects ${size <= 2 ? "you are" : "households like yours are"} in the highest-risk group for losing coverage.`,
        before: "Medicaid eligible",
        after: "At risk: work requirements + 6-month redeterminations begin Jan 2027",
      };
    } else {
      return {
        atRisk: true,
        severity: "high",
        reason: `${state} did not expand Medicaid. Low-income households in non-expansion states face the coverage gap: too high for traditional Medicaid, too low for ACA subsidies. OBBBA does not close this gap and adds work requirements.`,
        before: "Limited or no Medicaid coverage (non-expansion state)",
        after: "No change in eligibility — coverage gap remains",
      };
    }
  }

  if (incomeId === "q2" && (size >= 3)) {
    return {
      atRisk: true,
      severity: "moderate",
      reason: `Larger households at $35K–$65K income may be near the Medicaid/CHIP eligibility line for children and dependents. Work requirements apply to adults 18–64; if any adult in the household has an irregular work history or caregiving role, coverage may be interrupted.`,
      before: "Children/dependents likely CHIP or Medicaid eligible",
      after: "Moderate risk: work requirements and redetermination burden",
    };
  }

  return {
    atRisk: false,
    severity: "low",
    reason: "At this income level, Medicaid coverage is unlikely to apply. ACA marketplace plans are your primary coverage vehicle. Premium subsidies are unchanged by OBBBA.",
    before: "Not Medicaid eligible — ACA marketplace",
    after: "No change in Medicaid eligibility",
  };
}

// ── SNAP risk assessment
function snapRisk(state, incomeId, householdId) {
  const size = householdId === "5plus" ? 5 : parseInt(householdId, 10);
  const highImpact = HIGH_SNAP_IMPACT_STATES.has(state);

  // SNAP eligibility: gross income at or below 130% FPL
  // OBBBA: work requirements extended to age 65 (was 50), 3-month time limit tightened
  // Average monthly SNAP benefit: ~$188/person (FY2025)
  const avgMonthlyBenefit = 188 * size;
  const annualBenefit = avgMonthlyBenefit * 12;

  if (incomeId === "q1") {
    return {
      atRisk: true,
      severity: "high",
      avgMonthlyBenefit,
      annualBenefit,
      reason: `At under $35K household income, SNAP eligibility likely applies. OBBBA extends work requirements to adults up to age 65 and tightens the 3-month time limit for able-bodied adults. FRAC reports 5.8M people have already lost access nationally as of Aug 2026.${highImpact ? ` ${state} is among the states with the highest SNAP enrollment and largest cuts impact.` : ""}`,
      before: `Estimated SNAP benefit: ~$${avgMonthlyBenefit.toLocaleString()}/month ($${annualBenefit.toLocaleString()}/yr)`,
      after: "At risk of losing benefits under new work requirements or time limits",
    };
  }

  if (incomeId === "q2" && size >= 4) {
    return {
      atRisk: true,
      severity: "moderate",
      avgMonthlyBenefit: Math.round(avgMonthlyBenefit * 0.4),
      annualBenefit: Math.round(annualBenefit * 0.4),
      reason: `Larger families at $35K–$65K may qualify for partial SNAP benefits depending on deductions. Work requirement changes affect adults 18–65 without dependents under 7.`,
      before: "Possibly eligible for partial SNAP benefit",
      after: "Moderate risk if any household member does not meet work requirement",
    };
  }

  return {
    atRisk: false,
    severity: "low",
    reason: "At this income level, SNAP eligibility is unlikely. No direct impact from cuts.",
    before: "Not SNAP eligible",
    after: "No change",
  };
}

// ── Debt share (per household, proportional)
const TOTAL_DEBT_ADDED = 4_100_000_000_000;
const TOTAL_HOUSEHOLDS = 130_000_000;
const DEBT_PER_HOUSEHOLD = Math.round(TOTAL_DEBT_ADDED / TOTAL_HOUSEHOLDS);

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDollar(n, sign = false) {
  const abs = Math.abs(n);
  const prefix = sign ? (n >= 0 ? "+" : "-") : n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${prefix}$${(abs / 1_000_000).toFixed(1)}M`;
  return `${prefix}$${abs.toLocaleString()}`;
}

function fmtMillions(m) {
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m}M`;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }) {
  const styles = {
    high: { background: "#fff0f0", color: "#b02020", border: "1px solid #f0c0c0" },
    moderate: { background: "#fffbeb", color: "#a06800", border: "1px solid #f0d080" },
    low: { background: "#f0faf0", color: "#1a6e1a", border: "1px solid #b0dab0" },
  };
  const labels = { high: "HIGH RISK", moderate: "MODERATE RISK", low: "NOT AFFECTED" };
  return (
    <span style={{
      ...styles[severity],
      fontFamily: "monospace",
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 3,
      letterSpacing: "0.08em",
    }}>
      {labels[severity]}
    </span>
  );
}

function CompareRow({ label, before, after, highlight }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      padding: "10px 0",
      borderBottom: "1px solid #eeeae4",
    }}>
      <div>
        <div style={{ color: "#6b6b6b", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
          Before OBBBA
        </div>
        <div style={{ color: "#4a4a4a", fontSize: 13 }}>{before}</div>
      </div>
      <div>
        <div style={{ color: "#6b6b6b", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
          After OBBBA
        </div>
        <div style={{ color: highlight === "bad" ? "#c0392b" : highlight === "good" ? "#1a6e1a" : "#1a1a1a", fontSize: 13, fontWeight: highlight ? 600 : 400 }}>
          {after}
        </div>
      </div>
    </div>
  );
}

function ImpactCard({ title, icon, severity, children }) {
  const borderColors = {
    high: "#f0c0c0",
    moderate: "#f0d080",
    low: "#c0e0c0",
  };
  return (
    <div style={{
      background: "#ffffff",
      border: `1px solid ${borderColors[severity] || "#e0ddd8"}`,
      borderRadius: 8,
      padding: "16px 18px",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <span style={{ color: "#1a1a1a", fontSize: 14, fontWeight: 700 }}>{title}</span>
        </div>
        <SeverityBadge severity={severity} />
      </div>
      {children}
    </div>
  );
}

// ── QuintileChart: diverging horizontal bar chart rendered on canvas ──────────

function QuintileChart({ selectedIncome }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = container.clientWidth;
    const cssHeight = 240;

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    // Layout constants
    const titleH = 32;
    const subtitleH = 18;
    const topPad = titleH + subtitleH + 8;
    const bottomPad = 16;
    const leftColW = 140;
    const rightPad = 60;
    const chartLeft = leftColW + 4;
    const chartRight = cssWidth - rightPad;
    const chartW = chartRight - chartLeft;

    const rows = QUINTILE_CHART_DATA.length;
    const barH = 22;
    const barGap = 8;
    const totalBarArea = cssHeight - topPad - bottomPad;
    const rowH = barH + barGap;

    // Zero baseline x position (proportional to max absolute value)
    const maxAbs = Math.max(...QUINTILE_CHART_DATA.map(d => Math.abs(d.net)));
    // Give losses more visual room (they're smaller in absolute terms)
    // Center the zero line at 30% from left of chart area
    const zeroFrac = 0.30;
    const zeroX = chartLeft + chartW * zeroFrac;
    const rightScale = chartW * (1 - zeroFrac) / maxAbs;
    const leftScale  = chartW * zeroFrac / Math.abs(Math.min(...QUINTILE_CHART_DATA.map(d => d.net)));

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Title
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 13px system-ui,-apple-system,sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("Who gains and who loses: net annual impact per household", 12, 10);

    // Subtitle
    ctx.fillStyle = "#6b6b6b";
    ctx.font = "11px system-ui,-apple-system,sans-serif";
    ctx.fillText("Tax cut benefit minus tariff cost. Source: Tax Policy Center + Peterson Institute / Yale Budget Lab.", 12, 10 + titleH - 8);

    // "$0" label at top of baseline
    ctx.fillStyle = "#9b9b9b";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("$0", zeroX, topPad - 12);
    ctx.textAlign = "left";

    // Vertical dashed zero line
    ctx.save();
    ctx.strokeStyle = "#c0c0c0";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(zeroX, topPad - 6);
    ctx.lineTo(zeroX, cssHeight - bottomPad);
    ctx.stroke();
    ctx.restore();

    // Draw bars
    QUINTILE_CHART_DATA.forEach((d, i) => {
      const y = topPad + i * rowH;
      const isSelected = d.id === selectedIncome;
      const isGain = d.net >= 0;
      const baseColor = isGain ? "#1a6e1a" : "#c0392b";
      const alpha = isSelected ? 1.0 : 0.72;

      // Bar width and x
      let barW, barX;
      if (isGain) {
        barW = d.net * rightScale;
        barX = zeroX;
      } else {
        barW = Math.abs(d.net) * leftScale;
        barX = zeroX - barW;
      }

      // Draw bar
      ctx.globalAlpha = alpha;
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(barX, y, barW, barH, 2)
        : ctx.rect(barX, y, barW, barH);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // "YOU ARE HERE" label for selected — always draws right of bar end
      if (isSelected) {
        const labelX = barX + barW + 4;
        ctx.textAlign = "left";
        ctx.fillStyle = baseColor;
        ctx.font = "bold 9px monospace";
        ctx.fillText("YOU ARE HERE ▶", labelX, y + barH / 2 - 5);
        ctx.textAlign = "left";
      }

      // Value label: always outside the bar, never overlapping the income label
      const valText = (isGain ? "+" : "") + "$" + Math.abs(d.net).toLocaleString();
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = baseColor;
      const labelY = isSelected ? y + barH / 2 + 5 : y + barH / 2 + 4;
      if (isGain) {
        // Draw to the right of the bar (into the right padding area)
        ctx.textAlign = "left";
        ctx.fillText(valText, barX + barW + 6, labelY);
      } else {
        // Draw to the RIGHT of the bar end (between bar left edge and zero line)
        // so it never bleeds into the income label column
        ctx.textAlign = "left";
        ctx.fillText(valText, barX + barW + 4, labelY);
      }
      ctx.textAlign = "left";

      // Left column: income label
      ctx.fillStyle = "#4a4a4a";
      ctx.font = "12px monospace";
      ctx.textAlign = "right";
      ctx.fillText(d.label, chartLeft - 6, y + barH / 2 + 4);
      ctx.textAlign = "left";
    });

    // Horizontal axis line at bottom of bars area
    ctx.strokeStyle = "#e0ddd8";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(chartLeft, topPad + rows * rowH + 2);
    ctx.lineTo(chartRight, topPad + rows * rowH + 2);
    ctx.stroke();
  }, [selectedIncome]);

  useEffect(() => {
    draw();
    const obs = new ResizeObserver(draw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [draw]);

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e0ddd8",
      borderRadius: 8,
      padding: "16px",
      marginBottom: 24,
    }}>
      <div ref={containerRef} style={{ width: "100%" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
      </div>
    </div>
  );
}

// ── exportResultCard: draws a 600x340 @2x canvas and triggers download ───────

function exportResultCard(stateCode, incomeId, householdSizeId, taxData, medicaid, snap) {
  const W = 600, H = 340, DPR = 2;
  const canvas = document.createElement("canvas");
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext("2d");
  ctx.scale(DPR, DPR);

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Top border bar
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(0, 0, W, 6);

  // Title
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 15px system-ui,-apple-system,sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("How OBBBA affects your household", 24, 22);

  // Subtitle
  const incomeLabel  = INCOME_TIERS.find(t => t.id === incomeId)?.label || incomeId;
  const sizeLabel    = HOUSEHOLD_SIZES.find(h => h.id === householdSizeId)?.label || householdSizeId;
  ctx.fillStyle = "#6b6b6b";
  ctx.font = "12px system-ui,-apple-system,sans-serif";
  ctx.fillText(`${stateCode} · ${incomeLabel} · ${sizeLabel}`, 24, 46);

  // Divider
  ctx.strokeStyle = "#e0ddd8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 68);
  ctx.lineTo(W - 24, 68);
  ctx.stroke();

  // Stat row 1: tax cuts vs tariffs
  const net = taxData.net;
  const netColor = net >= 0 ? "#1a6e1a" : "#c0392b";
  const netText  = (net >= 0 ? "+" : "") + "$" + Math.abs(net).toLocaleString() + "/yr";
  ctx.fillStyle = "#4a4a4a";
  ctx.font = "14px system-ui,-apple-system,sans-serif";
  ctx.fillText("Tax cuts vs. tariffs:", 24, 92);
  ctx.fillStyle = netColor;
  ctx.font = "bold 18px system-ui,-apple-system,sans-serif";
  ctx.fillText(netText, 220, 88);

  // Stat row 2: Medicaid
  ctx.fillStyle = "#4a4a4a";
  ctx.font = "14px system-ui,-apple-system,sans-serif";
  ctx.fillText("Medicaid:", 24, 130);
  const medicaidStatus = medicaid.atRisk ? "At risk" : "Not affected";
  const medicaidColor  = medicaid.atRisk ? "#c0392b" : "#1a6e1a";
  ctx.fillStyle = medicaidColor;
  ctx.font = "bold 14px system-ui,-apple-system,sans-serif";
  ctx.fillText(medicaidStatus, 220, 130);

  // Stat row 3: SNAP
  ctx.fillStyle = "#4a4a4a";
  ctx.font = "14px system-ui,-apple-system,sans-serif";
  ctx.fillText("SNAP:", 24, 162);
  const snapStatus = snap.atRisk ? "At risk" : "Not affected";
  const snapColor  = snap.atRisk ? "#c0392b" : "#1a6e1a";
  ctx.fillStyle = snapColor;
  ctx.font = "bold 14px system-ui,-apple-system,sans-serif";
  ctx.fillText(snapStatus, 220, 162);

  // Second divider
  ctx.strokeStyle = "#e0ddd8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 190);
  ctx.lineTo(W - 24, 190);
  ctx.stroke();

  // Small note below divider
  ctx.fillStyle = "#6b6b6b";
  ctx.font = "11px system-ui,-apple-system,sans-serif";
  const note = "Net financial impact is direct cash flow only. Medicaid and SNAP exposure are assessed separately.";
  ctx.fillText(note, 24, 204);
  const note2 = "Figures based on CBO distributional analysis, Tax Policy Center, Peterson Institute, and Yale Budget Lab.";
  ctx.fillText(note2, 24, 220);

  // Footer divider
  ctx.strokeStyle = "#e0ddd8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, H - 36);
  ctx.lineTo(W - 24, H - 36);
  ctx.stroke();

  // Footer text
  ctx.fillStyle = "#6b6b6b";
  ctx.font = "11px system-ui,-apple-system,sans-serif";
  ctx.fillText("policy-cost-tracker.vercel.app · Uncommon Gathering Group", 24, H - 22);

  // Download
  const link = document.createElement("a");
  link.download = `my-obbba-impact-${stateCode}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FamilyCalculator() {
  const [state, setState] = useState("");
  const [income, setIncome] = useState("");
  const [householdSize, setHouseholdSize] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready = state && income && householdSize;

  function handleSubmit(e) {
    e.preventDefault();
    if (ready) setSubmitted(true);
  }

  function handleReset() {
    setSubmitted(false);
  }

  const taxData = income ? TAX_DATA[income] : null;
  const taxRange = income ? TAX_RANGES[income] : null;
  const medicaid = state && income && householdSize ? medicaidRisk(state, income, householdSize) : null;
  const snap = state && income && householdSize ? snapRisk(state, income, householdSize) : null;

  const inputStyle = {
    background: "#ffffff",
    border: "1px solid #d8d5d0",
    borderRadius: 5,
    color: "#1a1a1a",
    fontSize: 13,
    padding: "9px 12px",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif",
    appearance: "none",
  };

  const labelStyle = {
    color: "#4a4a4a",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    display: "block",
    marginBottom: 6,
  };

  const shareButtonStyle = {
    background: "#c0392b",
    color: "#ffffff",
    border: "none",
    borderRadius: 5,
    padding: "10px 24px",
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: 700,
    letterSpacing: "0.08em",
    cursor: "pointer",
    marginTop: 12,
    display: "inline-block",
  };

  return (
    <div style={{
      background: "#f7f6f3",
      border: "1px solid #e0ddd8",
      borderRadius: 10,
      padding: "24px",
      marginTop: 40,
      fontFamily: "system-ui,-apple-system,'Segoe UI',sans-serif",
    }}>

      {/* ── QuintileChart always visible at top ── */}
      <QuintileChart selectedIncome={submitted ? income : null} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.1em", color: "#e05555", fontWeight: 700, marginBottom: 6 }}>
          PERSONALIZED IMPACT
        </div>
        <h2 style={{ color: "#1a1a1a", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>
          How Does This Affect Your Family?
        </h2>
        <p style={{ color: "#4a4a4a", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          Enter your household details for a before-and-after analysis based on CBO distributional data,
          Tax Policy Center microsimulation, and USDA SNAP enrollment figures.
        </p>
      </div>

      {/* Form */}
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>

            <div>
              <label style={labelStyle}>Your state</label>
              <select style={inputStyle} value={state} onChange={(e) => setState(e.target.value)} required>
                <option value="">Select state</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Household income</label>
              <select style={inputStyle} value={income} onChange={(e) => setIncome(e.target.value)} required>
                <option value="">Select range</option>
                {INCOME_TIERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Household size</label>
              <select style={inputStyle} value={householdSize} onChange={(e) => setHouseholdSize(e.target.value)} required>
                <option value="">Select size</option>
                {HOUSEHOLD_SIZES.map((h) => <option key={h.id} value={h.id}>{h.label}</option>)}
              </select>
            </div>

          </div>

          <button
            type="submit"
            disabled={!ready}
            style={{
              background: ready ? "#c0392b" : "#e8e5e0",
              color: ready ? "#fff" : "#999999",
              border: "none",
              borderRadius: 5,
              padding: "11px 28px",
              fontSize: 13,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.08em",
              cursor: ready ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            SHOW MY BEFORE &amp; AFTER
          </button>
        </form>
      ) : (
        <div>
          {/* Profile summary bar */}
          <div style={{
            background: "#f5f4f1",
            border: "1px solid #e0ddd8",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}>
            <span style={{ color: "#4a4a4a", fontSize: 13 }}>
              <strong style={{ color: "#1a1a1a" }}>{state}</strong> · {INCOME_TIERS.find(t => t.id === income)?.label} · {HOUSEHOLD_SIZES.find(h => h.id === householdSize)?.label}
            </span>
            <button
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "1px solid #d8d5d0",
                borderRadius: 4,
                color: "#6b6b6b",
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 600,
                padding: "4px 10px",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              CHANGE
            </button>
          </div>

          {/* ── Card 1: Tax cuts & tariffs ── */}
          <ImpactCard
            title="Tax cuts and tariff costs"
            icon="📋"
            severity={taxData.net < 0 ? "high" : taxData.net > 5000 ? "low" : "moderate"}
          >
            <CompareRow
              before="Pre-OBBBA tax rates and no broad tariffs"
              after={
                taxData.net < 0
                  ? `Net loss of ${fmtDollar(Math.abs(taxData.net))}/year — tariff costs exceed your tax cut`
                  : `Net gain of ${fmtDollar(taxData.net)}/year — tax cut exceeds your tariff cost`
              }
              highlight={taxData.net < 0 ? "bad" : "good"}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
              <div style={{ background: "#f5f4f1", borderRadius: 5, padding: "10px 12px" }}>
                <div style={{ color: "#1a6e1a", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>Tax cut benefit</div>
                <div style={{ color: "#1a1a1a", fontSize: 15, fontWeight: 700 }}>{fmtDollar(taxData.taxCutBenefit, true)}/yr</div>
              </div>
              <div style={{ background: "#f5f4f1", borderRadius: 5, padding: "10px 12px" }}>
                <div style={{ color: "#c0392b", fontSize: 12, fontWeight: 600, marginBottom: 3 }}>Tariff cost (estimated)</div>
                <div style={{ color: "#1a1a1a", fontSize: 15, fontWeight: 700 }}>{fmtDollar(-taxData.tariffCost, true)}/yr</div>
              </div>
            </div>

            {/* ── Confidence interval note ── */}
            {taxRange && (
              <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 10, fontFamily: "monospace" }}>
                CBO range for this income group: tax cut ${taxRange.taxLow.toLocaleString()}–${taxRange.taxHigh.toLocaleString()}/yr · tariff cost ${taxRange.tariffLow.toLocaleString()}–${taxRange.tariffHigh.toLocaleString()}/yr
              </div>
            )}

            <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 8 }}>
              Source: Tax Policy Center 2026 distributional analysis; Peterson Institute and Yale Budget Lab tariff pass-through estimates. Individual results vary by deductions and filing status.
            </div>
          </ImpactCard>

          {/* ── Card 2: Medicaid ── */}
          <ImpactCard title="Medicaid coverage" icon="⚕" severity={medicaid.severity}>
            <CompareRow before={medicaid.before} after={medicaid.after} highlight={medicaid.atRisk ? "bad" : null} />
            <div style={{ color: "#4a4a4a", fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
              {medicaid.reason}
            </div>

            {/* ── State Medicaid federal match loss ── */}
            {MEDICAID_MATCH_LOSS[state] && (
              <div style={{
                background: "#fff0f0",
                border: "1px solid #f0c0c0",
                borderRadius: 5,
                padding: "10px 12px",
                marginTop: 10,
                color: "#b02020",
                fontSize: 13,
              }}>
                <strong>{state} projected federal Medicaid match loss: {fmtMillions(MEDICAID_MATCH_LOSS[state])} over 10 years</strong>
                <div style={{ color: "#b02020", fontSize: 11, marginTop: 5, lineHeight: 1.55, fontWeight: 400 }}>
                  When federal Medicaid is cut, states lose their matching dollars. Some states will reduce their own programs rather than backfill the gap. Source: KFF State Health Facts, CBO distributional analysis.
                </div>
              </div>
            )}

            <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 8 }}>
              Source: CBO, KFF State Health Facts, OBBBA work requirement provisions (effective Jan 2027).
            </div>
          </ImpactCard>

          {/* ── Card 3: SNAP ── */}
          <ImpactCard title="SNAP food assistance" icon="🌾" severity={snap.severity}>
            <CompareRow before={snap.before} after={snap.after} highlight={snap.atRisk ? "bad" : null} />
            {snap.atRisk && snap.annualBenefit > 0 && (
              <div style={{
                background: "#fffbeb",
                border: "1px solid #f0d080",
                borderRadius: 5,
                padding: "10px 12px",
                marginTop: 10,
                color: "#a06800",
                fontSize: 13,
                fontWeight: 600,
              }}>
                Estimated annual benefit at risk: {fmtDollar(snap.annualBenefit)}/yr (~{fmtDollar(snap.avgMonthlyBenefit)}/month)
              </div>
            )}
            <div style={{ color: "#4a4a4a", fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>
              {snap.reason}
            </div>
            <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 8 }}>
              Source: USDA FNS benefit tables; Food Research and Action Center Aug 2026 report; OBBBA SNAP provisions.
            </div>
          </ImpactCard>

          {/* ── Card 4: Debt share ── */}
          <ImpactCard title="Your share of new national debt" icon="📈" severity="moderate">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div style={{ background: "#f5f4f1", borderRadius: 5, padding: "12px 14px" }}>
                <div style={{ color: "#6b6b6b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Before OBBBA</div>
                <div style={{ color: "#4a4a4a", fontSize: 15, fontWeight: 700 }}>$0 added</div>
                <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 4 }}>CBO Jan 2025 baseline trajectory</div>
              </div>
              <div style={{ background: "#f5f4f1", borderRadius: 5, padding: "12px 14px" }}>
                <div style={{ color: "#6b6b6b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>After OBBBA</div>
                <div style={{ color: "#c0392b", fontSize: 15, fontWeight: 700 }}>{fmtDollar(DEBT_PER_HOUSEHOLD)} added</div>
                <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 4 }}>Per household, proportional share of $4.1T</div>
              </div>
            </div>
            <div style={{ color: "#4a4a4a", fontSize: 12, lineHeight: 1.6 }}>
              The $4.1T CBO-projected deficit increase divides to approximately {fmtDollar(DEBT_PER_HOUSEHOLD)} per US household. This represents additional debt service cost spread across the next 10 years, ultimately paid through future taxes or reduced public services. National debt-to-GDP is projected to rise from 162% to 190%+ over 35 years.
            </div>
            <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 8 }}>
              Source: CBO dynamic score Sept 2026; Census Bureau 2025 household count (130M households).
            </div>
          </ImpactCard>

          {/* Net summary bar */}
          {taxData && (
            <div style={{
              background: taxData.net < 0 ? "#fff5f5" : "#f0faf0",
              border: `1px solid ${taxData.net < 0 ? "#f0c0c0" : "#b0e0b0"}`,
              borderRadius: 8,
              padding: "14px 18px",
              marginTop: 4,
            }}>
              <div style={{ color: "#6b6b6b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                Direct net financial impact (tax cuts minus tariff cost)
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: taxData.net < 0 ? "#c0392b" : "#1a6e1a", fontVariantNumeric: "tabular-nums" }}>
                  {fmtDollar(taxData.net, true)}/year
                </span>
                <span style={{ color: "#4a4a4a", fontSize: 13 }}>
                  {taxData.net < 0
                    ? "on net, your household loses more to tariffs than it gains from the tax cut"
                    : "on net, your household gains more from the tax cut than it pays in tariff costs"}
                </span>
              </div>
              <div style={{ color: "#6b6b6b", fontSize: 11, marginTop: 8 }}>
                This is the direct cash flow estimate only. It does not include Medicaid or SNAP exposure, debt share, or longer-term effects on public services and interest rates.
              </div>

              {/* ── Share button ── */}
              <button
                style={shareButtonStyle}
                onClick={() => exportResultCard(state, income, householdSize, taxData, medicaid, snap)}
              >
                ↓ SHARE MY NUMBERS
              </button>
            </div>
          )}

          {/* Methodology */}
          <div style={{ marginTop: 16, color: "#6b6b6b", fontSize: 11, lineHeight: 1.7 }}>
            <strong style={{ color: "#4a4a4a" }}>Methodology:</strong> Tax cut estimates from Tax Policy Center 2026 distributional microsimulation by income quintile. Tariff cost estimates from Peterson Institute and Yale Budget Lab household-level pass-through analysis. Medicaid eligibility based on CBO analysis and KFF state expansion status. SNAP benefit estimates use USDA FNS average benefit tables by household size. State Medicaid match loss figures from KFF State Health Facts and CBO distributional analysis. Confidence intervals represent the CBO scoring range across modeling assumptions. Figures are averages for the income and household-size group; individual situations vary. This tool is for informational purposes and does not constitute tax or legal advice.
          </div>
        </div>
      )}
    </div>
  );
}
