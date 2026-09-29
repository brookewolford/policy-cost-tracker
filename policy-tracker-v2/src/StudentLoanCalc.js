import { useState, useRef } from "react";

const FPL_BY_FAMILY = {
  1: 15060,
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
};

function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
}

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtDec(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const styles = {
  wrap: {
    fontFamily: "system-ui, sans-serif",
    background: "#f7f6f3",
    padding: "24px",
    borderRadius: "12px",
    maxWidth: "860px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  sub: {
    fontSize: "13px",
    color: "#6b6b6b",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#4a4a4a",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  slider: {
    flex: 1,
    accentColor: "#3987e5",
  },
  numInput: {
    width: "90px",
    border: "1px solid #e0ddd8",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "13px",
    fontFamily: "monospace",
    color: "#1a1a1a",
    background: "#fff",
  },
  select: {
    border: "1px solid #e0ddd8",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    color: "#1a1a1a",
    background: "#fff",
    width: "100%",
  },
  resultsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  card: (accent) => ({
    background: "#fff",
    border: `1px solid #e0ddd8`,
    borderTop: `3px solid ${accent}`,
    borderRadius: "8px",
    padding: "14px 16px",
  }),
  cardLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b6b6b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  planName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "2px",
  },
  planSub: {
    fontSize: "11px",
    color: "#6b6b6b",
    marginBottom: "10px",
  },
  stat: {
    marginBottom: "4px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#6b6b6b",
  },
  statVal: {
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "monospace",
    color: "#1a1a1a",
  },
  diffBox: {
    background: "#fdf2f2",
    border: "1px solid #f0cece",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "14px",
  },
  diffRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2px",
  },
  diffLabel: {
    fontSize: "12px",
    color: "#4a4a4a",
  },
  diffVal: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#c0392b",
    fontFamily: "monospace",
  },
  diffBig: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#c0392b",
    fontFamily: "monospace",
  },
  note: {
    fontSize: "12px",
    color: "#4a4a4a",
    background: "#fff",
    border: "1px solid #e0ddd8",
    borderRadius: "6px",
    padding: "10px 14px",
    marginBottom: "10px",
    lineHeight: "1.5",
  },
  source: {
    fontSize: "11px",
    color: "#6b6b6b",
    marginBottom: "12px",
  },
  exportBtn: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    background: "#3987e5",
    border: "none",
    borderRadius: "6px",
    padding: "7px 14px",
    cursor: "pointer",
  },
  segmented: {
    display: "flex",
    gap: "0",
    border: "1px solid #e0ddd8",
    borderRadius: "6px",
    overflow: "hidden",
    width: "fit-content",
  },
  segBtn: (active) => ({
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: active ? "700" : "400",
    color: active ? "#fff" : "#4a4a4a",
    background: active ? "#3987e5" : "#fff",
    border: "none",
    cursor: "pointer",
    borderRight: "1px solid #e0ddd8",
  }),
};

export default function StudentLoanCalc() {
  const [balance, setBalance] = useState(35000);
  const [income, setIncome] = useState(55000);
  const [loanType, setLoanType] = useState("undergrad");
  const [familySize, setFamilySize] = useState(1);
  const canvasRef = useRef(null);

  const fpl = FPL_BY_FAMILY[familySize] || 15060;

  // SAVE (eliminated)
  const savePct = loanType === "undergrad" ? 0.05 : 0.10;
  const saveThresh = 2.25 * fpl;
  const saveMonthly = Math.max(0, (income - saveThresh) * savePct / 12);

  // REPAYE/OBBBA
  const repayeThresh = 1.5 * fpl;
  const repayeMonthly = Math.max(0, (income - repayeThresh) * 0.10 / 12);

  // Standard 10-year
  const rate = 0.0654 / 12;
  const stdMonthly = pmt(rate, 120, balance);
  const stdTotal = stdMonthly * 120;

  const save20 = saveMonthly * 12 * 20;
  const repaye20 = repayeMonthly * 12 * 20;

  const monthlyDiff = repayeMonthly - saveMonthly;
  const annualDiff = monthlyDiff * 12;
  const diff20 = repaye20 - save20;

  function handleExport() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = 600, H = 320;
    canvas.width = W;
    canvas.height = H;

    ctx.fillStyle = "#f7f6f3";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 15px system-ui";
    ctx.fillText("Student Loan Repayment: OBBBA Impact", 20, 32);

    ctx.fillStyle = "#6b6b6b";
    ctx.font = "11px system-ui";
    ctx.fillText(`Income: ${fmt(income)}  |  Balance: ${fmt(balance)}  |  ${loanType === "undergrad" ? "Undergrad" : "Grad"}  |  Family size: ${familySize}`, 20, 52);

    const plans = [
      { name: "SAVE (eliminated)", sub: "Undergrad: 5% above 225% FPL", monthly: saveMonthly, color: "#6b6b6b" },
      { name: "REPAYE/OBBBA", sub: "10% above 150% FPL", monthly: repayeMonthly, color: "#c0392b" },
      { name: "Standard 10-year", sub: "6.54% fixed, 120 months", monthly: stdMonthly, color: "#3987e5" },
    ];

    plans.forEach((p, i) => {
      const x = 20 + i * 190;
      const y = 75;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#e0ddd8";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, 175, 165, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = p.color;
      ctx.fillRect(x, y, 175, 4);

      ctx.fillStyle = "#1a1a1a";
      ctx.font = "bold 12px system-ui";
      ctx.fillText(p.name, x + 10, y + 24);

      ctx.fillStyle = "#6b6b6b";
      ctx.font = "10px system-ui";
      ctx.fillText(p.sub, x + 10, y + 40);

      const rows = [
        ["Monthly", fmtDec(p.monthly)],
        ["Annual", fmt(p.monthly * 12)],
        ["20-year total", fmt(p.monthly * 12 * 20)],
      ];
      rows.forEach(([lbl, val], ri) => {
        ctx.fillStyle = "#6b6b6b";
        ctx.font = "10px system-ui";
        ctx.fillText(lbl, x + 10, y + 68 + ri * 34);
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "bold 13px monospace";
        ctx.fillText(val, x + 10, y + 84 + ri * 34);
      });
    });

    ctx.fillStyle = "#fdf2f2";
    ctx.strokeStyle = "#f0cece";
    ctx.lineWidth = 1;
    roundRect(ctx, 20, 252, 560, 46, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c0392b";
    ctx.font = "bold 12px system-ui";
    ctx.fillText(`Monthly increase (REPAYE vs SAVE): +${fmtDec(monthlyDiff)}`, 30, 272);
    ctx.fillText(`20-year increase: +${fmt(diff20)}`, 30, 288);

    ctx.fillStyle = "#6b6b6b";
    ctx.font = "10px system-ui";
    ctx.fillText("Source: Dept. of Education, OBBBA Title III, CBO score", 20, 312);

    const link = document.createElement("a");
    link.download = "student-loan-obbba.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.heading}>Student Loan Repayment Calculator</div>
      <div style={styles.sub}>OBBBA IDR changes: SAVE eliminated, REPAYE payment requirements increased</div>

      <div style={styles.grid}>
        <div>
          <div style={styles.label}>Loan Balance: {fmt(balance)}</div>
          <div style={styles.inputRow}>
            <input
              type="range" min={5000} max={200000} step={1000}
              value={balance} onChange={e => setBalance(Number(e.target.value))}
              style={styles.slider}
            />
            <input
              type="number" min={5000} max={200000}
              value={balance} onChange={e => setBalance(Number(e.target.value))}
              style={styles.numInput}
            />
          </div>
        </div>
        <div>
          <div style={styles.label}>Annual Income: {fmt(income)}</div>
          <div style={styles.inputRow}>
            <input
              type="range" min={20000} max={200000} step={1000}
              value={income} onChange={e => setIncome(Number(e.target.value))}
              style={styles.slider}
            />
            <input
              type="number" min={20000} max={200000}
              value={income} onChange={e => setIncome(Number(e.target.value))}
              style={styles.numInput}
            />
          </div>
        </div>
        <div>
          <div style={styles.label}>Loan Type</div>
          <div style={styles.segmented}>
            <button style={styles.segBtn(loanType === "undergrad")} onClick={() => setLoanType("undergrad")}>Undergraduate</button>
            <button style={{ ...styles.segBtn(loanType === "grad"), borderRight: "none" }} onClick={() => setLoanType("grad")}>Graduate</button>
          </div>
        </div>
        <div>
          <div style={styles.label}>Family Size</div>
          <select value={familySize} onChange={e => setFamilySize(Number(e.target.value))} style={styles.select}>
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>{n} person{n > 1 ? "s" : ""} (FPL: {fmt(FPL_BY_FAMILY[n])})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.resultsRow}>
        <div style={styles.card("#6b6b6b")}>
          <div style={styles.cardLabel}>Plan 1</div>
          <div style={styles.planName}>SAVE (eliminated)</div>
          <div style={styles.planSub}>{loanType === "undergrad" ? "5%" : "10%"} above 225% FPL ({fmt(saveThresh)})</div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Monthly payment</div>
            <div style={styles.statVal}>{fmtDec(saveMonthly)}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Annual payment</div>
            <div style={styles.statVal}>{fmt(saveMonthly * 12)}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>20-year total</div>
            <div style={styles.statVal}>{fmt(save20)}</div>
          </div>
        </div>

        <div style={styles.card("#c0392b")}>
          <div style={styles.cardLabel}>Plan 2</div>
          <div style={styles.planName}>REPAYE / OBBBA</div>
          <div style={styles.planSub}>10% above 150% FPL ({fmt(repayeThresh)})</div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Monthly payment</div>
            <div style={{ ...styles.statVal, color: repayeMonthly > saveMonthly ? "#c0392b" : "#1a1a1a" }}>{fmtDec(repayeMonthly)}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Annual payment</div>
            <div style={{ ...styles.statVal, color: repayeMonthly > saveMonthly ? "#c0392b" : "#1a1a1a" }}>{fmt(repayeMonthly * 12)}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>20-year total</div>
            <div style={{ ...styles.statVal, color: repayeMonthly > saveMonthly ? "#c0392b" : "#1a1a1a" }}>{fmt(repaye20)}</div>
          </div>
        </div>

        <div style={styles.card("#3987e5")}>
          <div style={styles.cardLabel}>Plan 3</div>
          <div style={styles.planName}>Standard 10-Year</div>
          <div style={styles.planSub}>6.54% fixed rate, 120 months</div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Monthly payment</div>
            <div style={styles.statVal}>{fmtDec(stdMonthly)}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Annual payment</div>
            <div style={styles.statVal}>{fmt(stdMonthly * 12)}</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statLabel}>Total paid</div>
            <div style={styles.statVal}>{fmt(stdTotal)}</div>
          </div>
        </div>
      </div>

      {monthlyDiff !== 0 && (
        <div style={styles.diffBox}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#c0392b", marginBottom: "6px" }}>OBBBA Impact (REPAYE vs SAVE)</div>
          <div style={styles.diffRow}>
            <span style={styles.diffLabel}>Monthly payment increase</span>
            <span style={styles.diffVal}>+{fmtDec(monthlyDiff)}</span>
          </div>
          <div style={styles.diffRow}>
            <span style={styles.diffLabel}>Annual increase</span>
            <span style={styles.diffVal}>+{fmt(annualDiff)}</span>
          </div>
          <div style={{ ...styles.diffRow, marginTop: "4px", paddingTop: "6px", borderTop: "1px solid #f0cece" }}>
            <span style={{ ...styles.diffLabel, fontWeight: "700" }}>20-year total increase</span>
            <span style={styles.diffBig}>+{fmt(diff20)}</span>
          </div>
        </div>
      )}

      <div style={styles.note}>
        Under SAVE, very low income borrowers could have $0 monthly payments. OBBBA's higher payment percentage and lower income threshold increase payments for most borrowers earning above $22,590.
      </div>
      <div style={styles.source}>
        Source: Department of Education, OBBBA Title III, CBO score
      </div>

      <button style={styles.exportBtn} onClick={handleExport}>Export as PNG</button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
