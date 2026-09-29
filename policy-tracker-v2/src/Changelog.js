import { useState } from "react";

const CHANGELOG = [
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Recession Risk Indicator rebuilt",
    detail: "8 named leading indicators replace the prior composite. Composite score: 69/100. New historical comparison to 2001, 2008, 2020 recessions.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Income quintile comparison chart added to Family Calculator",
    detail: "Diverging bar chart shows OBBBA tax and tariff impact by income quintile. Source: Tax Policy Center microsimulation.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "DOGE verified vs. claimed savings added",
    detail: "GAO and independent auditors have verified $12.4B of $160B+ in claimed savings (7.8%). Source: GAO-26-106361.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Debt interest cost tracker added",
    detail: "$820B to $1.05T in additional interest over 10 years from OBBBA-added debt, accruing at $2,963/second. Source: CBO Long-Term Budget Outlook 2026.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Federal housing program cuts added",
    detail: "$33.47B in annual direct cuts across 10 HUD and USDA housing programs. 983,400 households directly affected. LIHTC indirect impact from rising rates documented.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "State tariff burden table added",
    detail: "Annual per-household tariff cost increase by state. Michigan ($4,200) and Ohio ($3,900) bear the highest burden. Source: Peterson Institute, Yale Budget Lab.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Federal jobs cut tracker added",
    detail: "271,800 federal and contractor positions eliminated across 15 agencies. USAID (64,000) and IRS (24,200) among the largest. Source: OPM, DOGE.gov.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Medicaid coverage loss by state added",
    detail: "14.3M people projected to lose Medicaid coverage nationally. Louisiana, Mississippi, and West Virginia face the highest per-capita loss rates. Source: KFF.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "SNAP cuts by state added",
    detail: "$27.2B annual reduction in food assistance. 3.18M people projected to lose SNAP access. Source: USDA FNS, CBPP.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Student loan repayment calculator added",
    detail: "Shows payment increase from SAVE plan elimination and OBBBA IDR changes. Source: Department of Education, CBO.",
  },
  {
    date: "September 29, 2026",
    category: "NEW",
    title: "Mortgage rate / Treasury yield chart added",
    detail: "Post-OBBBA mortgage rates averaging 7.72% vs. 6.85% pre-OBBBA. Source: Federal Reserve, Freddie Mac.",
  },
  {
    date: "September 2026",
    category: "UPDATED",
    title: "Tariff cost estimate revised upward",
    detail: "Average household tariff burden increased from $2,100 to $2,580 following updated Yale Budget Lab pass-through analysis incorporating steel and aluminum tariff expansions.",
  },
  {
    date: "August 2026",
    category: "UPDATED",
    title: "SNAP cut projections updated",
    detail: "CBPP revised SNAP participation loss estimate upward following first-wave state implementation data from Texas, Florida, and Georgia.",
  },
  {
    date: "July 2026",
    category: "UPDATED",
    title: "DOGE savings claims updated",
    detail: "GAO released updated audit (GAO-26-106361) confirming verified savings remain below 8% of claimed figure.",
  },
  {
    date: "July 2026",
    category: "LAUNCH",
    title: "Policy Cost Tracker launched",
    detail: "Initial launch with federal spending categories, live accrual tickers, and family impact calculator.",
  },
];

const BADGE_STYLES = {
  NEW: { background: "#3987e5", color: "#fff" },
  UPDATED: { background: "#a06800", color: "#fff" },
  LAUNCH: { background: "#1a6e1a", color: "#fff" },
};

const s = {
  wrap: {
    fontFamily: "system-ui, sans-serif",
    background: "#f7f6f3",
    padding: "24px",
    borderRadius: "12px",
    maxWidth: "720px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "16px",
  },
  heading: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1a1a1a",
  },
  lastUpdated: {
    fontSize: "11px",
    color: "#6b6b6b",
    fontFamily: "monospace",
  },
  filterRow: {
    display: "flex",
    gap: "6px",
    marginBottom: "20px",
  },
  filterBtn: (active) => ({
    fontSize: "11px",
    fontWeight: active ? "700" : "400",
    color: active ? "#fff" : "#4a4a4a",
    background: active ? "#1a1a1a" : "#fff",
    border: "1px solid #e0ddd8",
    borderRadius: "20px",
    padding: "4px 12px",
    cursor: "pointer",
  }),
  timeline: {
    position: "relative",
    paddingLeft: "18px",
  },
  rail: {
    position: "absolute",
    left: "6px",
    top: "8px",
    bottom: "8px",
    width: "2px",
    background: "#e0ddd8",
    borderRadius: "1px",
  },
  entry: {
    position: "relative",
    paddingLeft: "16px",
    paddingBottom: "20px",
  },
  dot: {
    position: "absolute",
    left: "-13px",
    top: "6px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#e0ddd8",
    border: "2px solid #f7f6f3",
  },
  entryInner: {
    background: "#fff",
    border: "1px solid #e0ddd8",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
    flexWrap: "wrap",
  },
  badge: (cat) => ({
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.06em",
    padding: "2px 7px",
    borderRadius: "3px",
    ...BADGE_STYLES[cat],
  }),
  date: {
    fontSize: "11px",
    color: "#6b6b6b",
    fontFamily: "monospace",
  },
  title: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "4px",
  },
  detail: {
    fontSize: "12px",
    color: "#4a4a4a",
    lineHeight: "1.5",
  },
};

export default function Changelog() {
  const [filter, setFilter] = useState("ALL");

  const filters = ["ALL", "NEW", "UPDATED"];

  const visible = filter === "ALL"
    ? CHANGELOG
    : CHANGELOG.filter(e => e.category === filter);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.heading}>What's New</div>
        <div style={s.lastUpdated}>Last updated: September 29, 2026</div>
      </div>

      <div style={s.filterRow}>
        {filters.map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div style={s.timeline}>
        <div style={s.rail} />
        {visible.map((entry, i) => (
          <div key={i} style={s.entry}>
            <div style={s.dot} />
            <div style={s.entryInner}>
              <div style={s.topRow}>
                <span style={s.badge(entry.category)}>{entry.category}</span>
                <span style={s.date}>{entry.date}</span>
              </div>
              <div style={s.title}>{entry.title}</div>
              <div style={s.detail}>{entry.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
