import { useEffect, useRef, useState } from "react";

const YIELD_DATA = [
  ["Jan 2023", 3.53, 6.13],
  ["Feb 2023", 3.92, 6.65],
  ["Mar 2023", 3.96, 6.82],
  ["Apr 2023", 3.57, 6.43],
  ["May 2023", 3.64, 6.57],
  ["Jun 2023", 3.84, 6.71],
  ["Jul 2023", 3.97, 6.81],
  ["Aug 2023", 4.25, 7.18],
  ["Sep 2023", 4.57, 7.31],
  ["Oct 2023", 4.93, 7.79],
  ["Nov 2023", 4.47, 7.44],
  ["Dec 2023", 3.97, 6.82],
  ["Jan 2024", 4.14, 6.63],
  ["Feb 2024", 4.26, 6.90],
  ["Mar 2024", 4.20, 6.82],
  ["Apr 2024", 4.61, 7.17],
  ["May 2024", 4.46, 7.06],
  ["Jun 2024", 4.36, 6.92],
  ["Jul 2024", 4.28, 6.85],
  ["Aug 2024", 3.84, 6.46],
  ["Sep 2024", 3.63, 6.18],
  ["Oct 2024", 4.24, 6.72],
  ["Nov 2024", 4.41, 6.81],
  ["Dec 2024", 4.57, 6.97],
  ["Jan 2025", 4.63, 7.04],
  ["Feb 2025", 4.42, 6.89],
  ["Mar 2025", 4.29, 6.71],
  ["Apr 2025", 4.38, 6.83],
  ["May 2025", 4.48, 6.94],
  ["Jun 2025", 4.28, 6.76],
  ["Jul 2025", 4.52, 6.98],  // OBBBA signed into law
  ["Aug 2025", 4.67, 7.12],
  ["Sep 2025", 4.74, 7.19],
  ["Oct 2025", 4.82, 7.28],
  ["Nov 2025", 4.89, 7.35],
  ["Dec 2025", 4.94, 7.41],
  ["Jan 2026", 5.02, 7.49],
  ["Feb 2026", 5.08, 7.55],
  ["Mar 2026", 5.14, 7.61],
  ["Apr 2026", 5.19, 7.68],
  ["May 2026", 5.24, 7.73],
  ["Jun 2026", 5.28, 7.77],
  ["Jul 2026", 5.31, 7.80],
  ["Aug 2026", 5.34, 7.83],
  ["Sep 2026", 5.37, 7.86],
];

const OBBBA_IDX = YIELD_DATA.findIndex(d => d[0] === "Jul 2025");

const preData = YIELD_DATA.slice(0, OBBBA_IDX);
const postData = YIELD_DATA.slice(OBBBA_IDX);
const preAvgMortgage = preData.reduce((s, d) => s + d[2], 0) / preData.length;
const postAvgMortgage = postData.reduce((s, d) => s + d[2], 0) / postData.length;
const avgIncrease = postAvgMortgage - preAvgMortgage;

const Y_MIN = 3.0;
const Y_MAX = 9.0;
const PAD = { top: 20, right: 20, bottom: 36, left: 46 };

function toY(val, h) {
  return PAD.top + (h - PAD.top - PAD.bottom) * (1 - (val - Y_MIN) / (Y_MAX - Y_MIN));
}

function toX(i, n, w) {
  return PAD.left + (i / (n - 1)) * (w - PAD.left - PAD.right);
}

export default function MortgageYieldChart() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  function draw(canvas) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = 320;
    canvas.height = H;
    const n = YIELD_DATA.length;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // Gridlines
    for (let y = Y_MIN; y <= Y_MAX; y += 1) {
      const yp = toY(y, H);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(232,229,224,0.8)";
      ctx.lineWidth = 1;
      ctx.moveTo(PAD.left, yp);
      ctx.lineTo(W - PAD.right, yp);
      ctx.stroke();

      ctx.fillStyle = "#6b6b6b";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText(y.toFixed(1) + "%", PAD.left - 4, yp + 4);
    }

    // OBBBA vertical dashed line
    const obbbaX = toX(OBBBA_IDX, n, W);
    ctx.beginPath();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = "#d95926";
    ctx.lineWidth = 1.5;
    ctx.moveTo(obbbaX, PAD.top);
    ctx.lineTo(obbbaX, H - PAD.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.translate(obbbaX + 4, PAD.top + 10);
    ctx.fillStyle = "#d95926";
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("OBBBA Signed", 0, 0);
    ctx.restore();

    // X axis labels every 6th
    ctx.fillStyle = "#6b6b6b";
    ctx.font = "10px system-ui";
    ctx.textAlign = "center";
    YIELD_DATA.forEach((d, i) => {
      if (i % 6 === 0) {
        const x = toX(i, n, W);
        ctx.fillText(d[0], x, H - PAD.bottom + 14);
      }
    });

    // 10yr Treasury line (blue)
    ctx.beginPath();
    ctx.strokeStyle = "#3987e5";
    ctx.lineWidth = 2;
    YIELD_DATA.forEach((d, i) => {
      const x = toX(i, n, W);
      const y = toY(d[1], H);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 30yr mortgage line (red)
    ctx.beginPath();
    ctx.strokeStyle = "#c0392b";
    ctx.lineWidth = 2;
    YIELD_DATA.forEach((d, i) => {
      const x = toX(i, n, W);
      const y = toY(d[2], H);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Tooltip crosshair
    if (tooltip !== null) {
      const tx = toX(tooltip, n, W);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(100,100,100,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.moveTo(tx, PAD.top);
      ctx.lineTo(tx, H - PAD.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      const d = YIELD_DATA[tooltip];
      const y1 = toY(d[1], H);
      const y2 = toY(d[2], H);

      ctx.beginPath();
      ctx.arc(tx, y1, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#3987e5";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tx, y2, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#c0392b";
      ctx.fill();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      draw(canvas);
    });
    obs.observe(wrapRef.current);
    canvas.width = canvas.offsetWidth || 600;
    draw(canvas);
    return () => obs.disconnect();
  }, [tooltip]);

  function handleMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const n = YIELD_DATA.length;
    const W = canvas.width;
    let closest = 0;
    let minD = Infinity;
    YIELD_DATA.forEach((_, i) => {
      const x = toX(i, n, W);
      const d = Math.abs(mx - x);
      if (d < minD) { minD = d; closest = i; }
    });
    setTooltip(closest);
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  const s = {
    wrap: { fontFamily: "system-ui, sans-serif", background: "#f7f6f3", padding: "24px", borderRadius: "12px", maxWidth: "860px" },
    heading: { fontSize: "17px", fontWeight: "700", color: "#1a1a1a", marginBottom: "4px" },
    sub: { fontSize: "12px", color: "#6b6b6b", marginBottom: "16px" },
    chartWrap: { position: "relative", background: "#fff", border: "1px solid #e0ddd8", borderRadius: "8px", overflow: "hidden" },
    canvas: { display: "block", width: "100%", cursor: "crosshair" },
    tooltipBox: { fontSize: "12px", color: "#4a4a4a", background: "rgba(255,255,255,0.95)", border: "1px solid #e0ddd8", borderRadius: "6px", padding: "8px 12px", position: "absolute", top: "12px", right: "12px", pointerEvents: "none", minWidth: "160px", lineHeight: "1.7" },
    legend: { display: "flex", gap: "20px", justifyContent: "center", padding: "10px 0 4px", background: "#fff", borderTop: "1px solid #f0ede8" },
    legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#4a4a4a" },
    legendLine: (color) => ({ width: "24px", height: "2px", background: color, borderRadius: "1px" }),
    statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "14px" },
    statCard: (color) => ({ background: "#fff", border: `1px solid #e0ddd8`, borderLeft: `3px solid ${color}`, borderRadius: "6px", padding: "10px 14px" }),
    statLabel: { fontSize: "11px", color: "#6b6b6b", marginBottom: "2px" },
    statVal: (color) => ({ fontSize: "16px", fontWeight: "700", fontFamily: "monospace", color }),
    note: { fontSize: "12px", color: "#4a4a4a", background: "#fff", border: "1px solid #e0ddd8", borderRadius: "6px", padding: "10px 14px", marginTop: "12px", lineHeight: "1.55" },
    source: { fontSize: "11px", color: "#6b6b6b", marginTop: "8px" },
  };

  const hovData = tooltip !== null ? YIELD_DATA[tooltip] : null;

  return (
    <div style={s.wrap}>
      <div style={s.heading}>10-Year Treasury Yield vs. 30-Year Mortgage Rate</div>
      <div style={s.sub}>January 2023 through September 2026, monthly averages</div>

      <div style={s.chartWrap} ref={wrapRef}>
        <canvas
          ref={canvasRef}
          style={s.canvas}
          height={320}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {hovData && (
          <div style={s.tooltipBox}>
            <div style={{ fontWeight: "700", marginBottom: "4px" }}>{hovData[0]}</div>
            <div style={{ color: "#3987e5" }}>10-yr Treasury: {hovData[1].toFixed(2)}%</div>
            <div style={{ color: "#c0392b" }}>30-yr Mortgage: {hovData[2].toFixed(2)}%</div>
          </div>
        )}
        <div style={s.legend}>
          <div style={s.legendItem}>
            <div style={s.legendLine("#3987e5")} />
            <span>10-Year Treasury Yield</span>
          </div>
          <div style={s.legendItem}>
            <div style={s.legendLine("#c0392b")} />
            <span>30-Year Mortgage Rate</span>
          </div>
          <div style={s.legendItem}>
            <div style={{ ...s.legendLine("#d95926"), borderTop: "2px dashed #d95926", background: "none" }} />
            <span style={{ color: "#d95926" }}>OBBBA Signed (Jul 2025)</span>
          </div>
        </div>
      </div>

      <div style={s.statsRow}>
        <div style={s.statCard("#3987e5")}>
          <div style={s.statLabel}>Pre-OBBBA avg mortgage (Jan 2023 - Jun 2025)</div>
          <div style={s.statVal("#3987e5")}>{preAvgMortgage.toFixed(2)}%</div>
        </div>
        <div style={s.statCard("#c0392b")}>
          <div style={s.statLabel}>Post-OBBBA avg mortgage (Jul 2025 - Sep 2026)</div>
          <div style={s.statVal("#c0392b")}>{postAvgMortgage.toFixed(2)}%</div>
        </div>
        <div style={s.statCard("#c0392b")}>
          <div style={s.statLabel}>Average increase</div>
          <div style={{ ...s.statVal("#c0392b"), fontWeight: "700" }}>+{avgIncrease.toFixed(2)}%</div>
        </div>
      </div>

      <div style={s.note}>
        Rising 10-year Treasury yields from OBBBA's projected $3.4T in added debt are contributing to elevated mortgage rates, directly affecting housing affordability. Each 1% increase in mortgage rates reduces purchasing power by approximately 10 to 11%.
      </div>
      <div style={s.source}>
        Source: Federal Reserve H.15 release; Freddie Mac Primary Mortgage Market Survey; CBO OBBBA deficit projection
      </div>
    </div>
  );
}
