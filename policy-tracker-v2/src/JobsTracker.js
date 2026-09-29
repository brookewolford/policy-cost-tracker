import { useState } from 'react';

const AGENCY_CUTS = [
  { agency: "Department of Education", directJobs: 4200, contractorJobs: 8900, totalBudgetCut: 12_400_000_000, note: "Department effectively dismantled; functions partially transferred to states. Title I, special education staffing eliminated at federal level.", status: "eliminated" },
  { agency: "USAID", directJobs: 10_000, contractorJobs: 54_000, totalBudgetCut: 44_000_000_000, note: "Agency terminated. Largest single workforce reduction. Global health, development, and emergency response programs ended.", status: "eliminated" },
  { agency: "Consumer Financial Protection Bureau", directJobs: 1_700, contractorJobs: 800, totalBudgetCut: 680_000_000, note: "Effectively dismantled via executive order and court battles. Enforcement of consumer financial protections halted.", status: "eliminated" },
  { agency: "Environmental Protection Agency", directJobs: 6_800, contractorJobs: 12_400, totalBudgetCut: 8_200_000_000, note: "Major program eliminations: clean air enforcement, climate programs, environmental justice office. 41% of workforce.", status: "major_cut" },
  { agency: "Department of Housing and Urban Development", directJobs: 2_900, contractorJobs: 4_100, totalBudgetCut: 34_200_000_000, note: "Significant reductions alongside budget cuts. Fair housing enforcement, community planning, policy research staff cut deeply.", status: "major_cut" },
  { agency: "Internal Revenue Service", directJobs: 18_000, contractorJobs: 6_200, totalBudgetCut: 20_400_000_000, note: "Enforcement division reduced by 30%+. Estimated $68B in uncollected tax revenue annually from reduced audit capacity.", status: "major_cut" },
  { agency: "Department of Veterans Affairs", directJobs: 9_400, contractorJobs: 3_200, totalBudgetCut: 11_200_000_000, note: "Community care program reductions, benefits processing backlogs increasing. VBA claims adjudication understaffed.", status: "major_cut" },
  { agency: "Social Security Administration", directJobs: 7_200, contractorJobs: 1_800, totalBudgetCut: 1_400_000_000, note: "Field office closures and reduced staffing creating 4-6 month claims processing backlogs. Phone wait times exceed 2 hours.", status: "major_cut" },
  { agency: "Department of Agriculture", directJobs: 5_600, contractorJobs: 8_800, totalBudgetCut: 18_900_000_000, note: "SNAP administration, rural development, food safety inspection reductions. Forest Service and farm service agencies cut.", status: "major_cut" },
  { agency: "Department of Health and Human Services", directJobs: 11_200, contractorJobs: 9_400, totalBudgetCut: 163_000_000_000, note: "CDC, NIH, and CMS staff reductions. NIH grants program suspended for 4 months; 1,400 researchers affected.", status: "major_cut" },
  { agency: "National Institutes of Health", directJobs: 3_800, contractorJobs: 14_200, totalBudgetCut: 18_200_000_000, note: "Research grant freeze, lab closures, and contractor eliminations. Estimated 18-24 month setback on active clinical trials.", status: "major_cut" },
  { agency: "Federal Emergency Management Agency", directJobs: 2_100, contractorJobs: 6_400, totalBudgetCut: 4_800_000_000, note: "Proposed consolidation into DHS. Disaster readiness and response capacity reduced ahead of 2026 hurricane season.", status: "restructured" },
  { agency: "Department of State", directJobs: 4_800, contractorJobs: 18_200, totalBudgetCut: 26_200_000_000, note: "Diplomatic corps reduced by 21%. Embassy closures in 31 countries. Visa processing delays up to 18 months.", status: "major_cut" },
  { agency: "Department of Energy", directJobs: 3_100, contractorJobs: 21_400, totalBudgetCut: 15_800_000_000, note: "Clean energy programs eliminated. National lab contractor reductions. Nuclear security and Hanford cleanup unaffected.", status: "mixed" },
  { agency: "Department of Transportation", directJobs: 2_400, contractorJobs: 4_800, totalBudgetCut: 9_400_000_000, note: "FAA safety inspectors reduced by 8%. Rail safety, transit grants, and urban infrastructure programs cut.", status: "major_cut" },
];

const STATUS_CONFIG = {
  eliminated: { label: 'ELIMINATED', color: '#c0392b', bg: '#fdf0ef', border: '#f0c5c0' },
  major_cut:  { label: 'MAJOR CUT',  color: '#d95926', bg: '#fdf3ee', border: '#f5c9b0' },
  restructured: { label: 'RESTRUCTURED', color: '#b8860b', bg: '#fdf9ee', border: '#ede0a0' },
  mixed:      { label: 'MIXED',       color: '#4a6a8a', bg: '#eff4fa', border: '#b0c8e0' },
};

const FILTER_TABS = [
  { key: 'all', label: 'ALL' },
  { key: 'eliminated', label: 'ELIMINATED' },
  { key: 'major_cut', label: 'MAJOR CUTS' },
  { key: 'restructured', label: 'RESTRUCTURED' },
  { key: 'mixed', label: 'MIXED' },
];

function fmtBudget(n) {
  if (n >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(0) + 'M';
  return '$' + n.toLocaleString();
}

function fmtJobs(n) {
  return n.toLocaleString();
}

export default function JobsTracker() {
  const [filter, setFilter] = useState('all');

  const sorted = [...AGENCY_CUTS].sort(
    (a, b) => (b.directJobs + b.contractorJobs) - (a.directJobs + a.contractorJobs)
  );

  const visible = filter === 'all' ? sorted : sorted.filter(a => a.status === filter);

  const styles = {
    wrap: {
      fontFamily: 'system-ui, sans-serif',
      background: '#f7f6f3',
      minHeight: '100vh',
      padding: '24px 16px',
      color: '#1a1a1a',
    },
    card: {
      background: '#ffffff',
      border: '1px solid #e0ddd8',
      borderRadius: '10px',
      padding: '20px 24px',
      marginBottom: '16px',
    },
    h1: {
      fontSize: '20px',
      fontWeight: '700',
      margin: '0 0 4px 0',
    },
    subtitle: {
      fontSize: '13px',
      color: '#6b6b6b',
      margin: '0 0 18px 0',
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '20px',
    },
    statBox: {
      background: '#f7f6f3',
      border: '1px solid #e0ddd8',
      borderRadius: '8px',
      padding: '12px 14px',
    },
    statNum: {
      fontFamily: 'monospace',
      fontSize: '20px',
      fontWeight: '700',
      color: '#c0392b',
      display: 'block',
    },
    statNumOrange: {
      fontFamily: 'monospace',
      fontSize: '20px',
      fontWeight: '700',
      color: '#d95926',
      display: 'block',
    },
    statNumDark: {
      fontFamily: 'monospace',
      fontSize: '20px',
      fontWeight: '700',
      color: '#1a1a1a',
      display: 'block',
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b6b6b',
      marginTop: '2px',
    },
    filterRow: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      marginBottom: '20px',
    },
    filterBtn: (active, key) => {
      const cfg = key !== 'all' ? STATUS_CONFIG[key] : null;
      return {
        padding: '6px 12px',
        border: '1px solid',
        borderColor: active ? (cfg ? cfg.color : '#1a1a1a') : '#e0ddd8',
        borderRadius: '5px',
        background: active ? (cfg ? cfg.bg : '#1a1a1a') : '#ffffff',
        color: active ? (cfg ? cfg.color : '#ffffff') : '#4a4a4a',
        fontSize: '12px',
        fontWeight: active ? '700' : '400',
        letterSpacing: '0.03em',
        cursor: 'pointer',
      };
    },
    agencyCard: {
      background: '#ffffff',
      border: '1px solid #e0ddd8',
      borderRadius: '8px',
      padding: '16px 18px',
      marginBottom: '10px',
    },
    agencyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '10px',
      flexWrap: 'wrap',
    },
    agencyName: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#1a1a1a',
      flex: '1',
    },
    badge: (status) => {
      const cfg = STATUS_CONFIG[status];
      return {
        display: 'inline-block',
        padding: '3px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.05em',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      };
    },
    jobsRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '10px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    jobItem: {
      display: 'flex',
      flexDirection: 'column',
    },
    jobVal: (color) => ({
      fontFamily: 'monospace',
      fontSize: '16px',
      fontWeight: '700',
      color,
    }),
    jobLabel: {
      fontSize: '11px',
      color: '#6b6b6b',
    },
    budgetLine: {
      fontSize: '13px',
      color: '#4a4a4a',
      marginBottom: '8px',
    },
    budgetVal: {
      fontWeight: '700',
      color: '#1a1a1a',
    },
    note: {
      fontSize: '13px',
      color: '#4a4a4a',
      lineHeight: '1.55',
      marginBottom: '10px',
    },
    barWrap: {
      height: '10px',
      background: '#f0efec',
      borderRadius: '5px',
      overflow: 'hidden',
      display: 'flex',
    },
    callout: {
      background: '#fdf9ee',
      border: '1px solid #ede0a0',
      borderRadius: '8px',
      padding: '14px 18px',
      marginBottom: '0',
    },
    calloutText: {
      fontSize: '13px',
      color: '#4a4a4a',
      lineHeight: '1.6',
      margin: '0 0 8px 0',
    },
    calloutHighlight: {
      fontWeight: '700',
      color: '#b8860b',
    },
    sourceNote: {
      fontSize: '11px',
      color: '#6b6b6b',
    },
  };

  const maxTotal = sorted[0].directJobs + sorted[0].contractorJobs;

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.h1}>Federal Workforce Reductions</h2>
        <p style={styles.subtitle}>DOGE and OBBBA workforce provisions, OPM and independent analysis, September 2026</p>

        <div style={styles.summaryGrid}>
          <div style={styles.statBox}>
            <span style={styles.statNum}>97,200</span>
            <span style={styles.statLabel}>direct federal jobs cut</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumOrange}>174,600</span>
            <span style={styles.statLabel}>contractor positions cut</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNumDark}>271,800</span>
            <span style={styles.statLabel}>total positions eliminated</span>
          </div>
          <div style={styles.statBox}>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: '700', color: '#4a6a8a', display: 'block' }}>$388.9B</span>
            <span style={styles.statLabel}>agency budget cuts listed</span>
          </div>
        </div>

        <div style={styles.filterRow}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              style={styles.filterBtn(filter === tab.key, tab.key)}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {visible.map(agency => {
          const total = agency.directJobs + agency.contractorJobs;
          const directPct = (agency.directJobs / total) * 100;
          const contractorPct = 100 - directPct;
          const barWidth = (total / maxTotal) * 100;

          return (
            <div key={agency.agency} style={styles.agencyCard}>
              <div style={styles.agencyHeader}>
                <span style={styles.agencyName}>{agency.agency}</span>
                <span style={styles.badge(agency.status)}>
                  {STATUS_CONFIG[agency.status].label}
                </span>
              </div>

              <div style={styles.jobsRow}>
                <div style={styles.jobItem}>
                  <span style={styles.jobVal('#c0392b')}>{fmtJobs(agency.directJobs)}</span>
                  <span style={styles.jobLabel}>direct jobs</span>
                </div>
                <div style={styles.jobItem}>
                  <span style={styles.jobVal('#d95926')}>{fmtJobs(agency.contractorJobs)}</span>
                  <span style={styles.jobLabel}>contractor jobs</span>
                </div>
                <div style={styles.jobItem}>
                  <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
                    {fmtJobs(total)}
                  </span>
                  <span style={styles.jobLabel}>total positions</span>
                </div>
              </div>

              <p style={styles.budgetLine}>
                Budget cut: <span style={styles.budgetVal}>{fmtBudget(agency.totalBudgetCut)}</span>
              </p>

              <p style={styles.note}>{agency.note}</p>

              <div style={styles.barWrap}>
                <div style={{
                  width: `${(directPct / 100) * barWidth}%`,
                  background: '#c0392b',
                  opacity: 0.75,
                }} />
                <div style={{
                  width: `${(contractorPct / 100) * barWidth}%`,
                  background: '#d95926',
                  opacity: 0.65,
                }} />
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '5px' }}>
                <span style={{ fontSize: '10px', color: '#c0392b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#c0392b', borderRadius: '2px', opacity: 0.75 }} />
                  Direct
                </span>
                <span style={{ fontSize: '10px', color: '#d95926', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#d95926', borderRadius: '2px', opacity: 0.65 }} />
                  Contractor
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.callout}>
        <p style={styles.calloutText}>
          <span style={styles.calloutHighlight}>IRS workforce reductions are estimated to cost $68B annually in uncollected tax revenue,</span> more than 3x the annual savings from the cuts themselves.
        </p>
        <p style={styles.sourceNote}>Source: Tax Policy Center, 2026</p>
      </div>

      <div style={{ marginTop: '12px', padding: '0 4px' }}>
        <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '0' }}>
          Source: OPM workforce data, DOGE.gov reporting, independent agency analysis, September 2026
        </p>
      </div>
    </div>
  );
}
