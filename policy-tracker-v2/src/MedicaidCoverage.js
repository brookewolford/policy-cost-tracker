import { useState, useRef } from 'react';

const COVERAGE_DATA = [
  { state: "California", people: 1420, fmap: 187400 },
  { state: "Texas", people: 1180, fmap: 89200 },
  { state: "New York", people: 890, fmap: 112300 },
  { state: "Florida", people: 760, fmap: 67800 },
  { state: "Louisiana", people: 430, fmap: 44600 },
  { state: "Georgia", people: 430, fmap: 41800 },
  { state: "Pennsylvania", people: 520, fmap: 54200 },
  { state: "Illinois", people: 480, fmap: 48900 },
  { state: "Ohio", people: 440, fmap: 43200 },
  { state: "Michigan", people: 390, fmap: 38700 },
  { state: "Mississippi", people: 380, fmap: 39200 },
  { state: "North Carolina", people: 370, fmap: 36400 },
  { state: "Arkansas", people: 340, fmap: 35100 },
  { state: "Alabama", people: 320, fmap: 33100 },
  { state: "Kentucky", people: 310, fmap: 32400 },
  { state: "New Jersey", people: 290, fmap: 31200 },
  { state: "South Carolina", people: 290, fmap: 29800 },
  { state: "West Virginia", people: 290, fmap: 29500 },
  { state: "Oklahoma", people: 290, fmap: 29900 },
  { state: "Virginia", people: 270, fmap: 28900 },
  { state: "Washington", people: 260, fmap: 27600 },
  { state: "Massachusetts", people: 250, fmap: 26400 },
  { state: "Arizona", people: 240, fmap: 25100 },
  { state: "Maryland", people: 220, fmap: 23800 },
  { state: "Tennessee", people: 210, fmap: 22400 },
  { state: "Oregon", people: 210, fmap: 21600 },
  { state: "Indiana", people: 200, fmap: 21100 },
  { state: "Colorado", people: 200, fmap: 20800 },
  { state: "Missouri", people: 195, fmap: 20500 },
  { state: "Wisconsin", people: 190, fmap: 19800 },
  { state: "Nevada", people: 190, fmap: 19400 },
  { state: "Minnesota", people: 185, fmap: 19200 },
  { state: "New Mexico", people: 170, fmap: 17400 },
  { state: "Connecticut", people: 160, fmap: 16400 },
  { state: "Iowa", people: 140, fmap: 14200 },
  { state: "Idaho", people: 130, fmap: 13200 },
  { state: "Kansas", people: 130, fmap: 13100 },
  { state: "Utah", people: 120, fmap: 12200 },
  { state: "Montana", people: 110, fmap: 11200 },
  { state: "Nebraska", people: 110, fmap: 11200 },
  { state: "Maine", people: 90, fmap: 9200 },
  { state: "Hawaii", people: 80, fmap: 8100 },
  { state: "Rhode Island", people: 75, fmap: 7600 },
  { state: "New Hampshire", people: 70, fmap: 7100 },
  { state: "Vermont", people: 60, fmap: 6100 },
  { state: "South Dakota", people: 60, fmap: 6100 },
  { state: "DC", people: 55, fmap: 5600 },
  { state: "North Dakota", people: 55, fmap: 5600 },
  { state: "Alaska", people: 50, fmap: 5100 },
  { state: "Wyoming", people: 45, fmap: 4600 },
  { state: "Delaware", people: 65, fmap: 6600 },
];

const PEOPLE_SORTED = [...COVERAGE_DATA].sort((a, b) => b.people - a.people);
const FMAP_SORTED = [...COVERAGE_DATA].sort((a, b) => b.fmap - a.fmap);

function getTierByRank(rank) {
  if (rank <= 10) return { label: 'CRITICAL', color: '#c0392b', bg: '#fdf0ef' };
  if (rank <= 25) return { label: 'HIGH', color: '#d95926', bg: '#fdf3ee' };
  return { label: 'MODERATE', color: '#4a4a4a', bg: '#f0efec' };
}

export default function MedicaidCoverage() {
  const [mode, setMode] = useState('people');
  const [search, setSearch] = useState('');

  const sorted = mode === 'people' ? PEOPLE_SORTED : FMAP_SORTED;
  const maxVal = sorted[0][mode === 'people' ? 'people' : 'fmap'];

  const filtered = sorted
    .map((row, i) => ({ ...row, rank: i + 1 }))
    .filter(row => row.state.toLowerCase().includes(search.toLowerCase()));

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
      color: '#1a1a1a',
    },
    subtitle: {
      fontSize: '13px',
      color: '#6b6b6b',
      margin: '0 0 20px 0',
    },
    toggleWrap: {
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
    },
    toggleBtn: (active) => ({
      padding: '8px 16px',
      border: '1px solid',
      borderColor: active ? '#c0392b' : '#e0ddd8',
      borderRadius: '6px',
      background: active ? '#c0392b' : '#ffffff',
      color: active ? '#ffffff' : '#4a4a4a',
      fontSize: '13px',
      fontWeight: active ? '600' : '400',
      cursor: 'pointer',
    }),
    callout: {
      background: '#fdf0ef',
      border: '1px solid #f0c5c0',
      borderRadius: '8px',
      padding: '14px 18px',
      marginBottom: '20px',
    },
    calloutNum: {
      fontFamily: 'monospace',
      fontSize: '22px',
      fontWeight: '700',
      color: '#c0392b',
      display: 'block',
      marginBottom: '2px',
    },
    calloutLabel: {
      fontSize: '13px',
      color: '#4a4a4a',
    },
    searchInput: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #e0ddd8',
      borderRadius: '6px',
      fontSize: '14px',
      background: '#f7f6f3',
      color: '#1a1a1a',
      boxSizing: 'border-box',
      marginBottom: '16px',
      outline: 'none',
    },
    tableHead: {
      display: 'grid',
      gridTemplateColumns: '36px 1fr 110px 140px 90px',
      gap: '8px',
      padding: '8px 12px',
      borderBottom: '1px solid #e0ddd8',
      fontSize: '11px',
      fontWeight: '600',
      color: '#6b6b6b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '36px 1fr 110px 140px 90px',
      gap: '8px',
      padding: '10px 12px',
      borderBottom: '1px solid #f0efec',
      alignItems: 'center',
    },
    rank: {
      fontSize: '12px',
      color: '#6b6b6b',
      fontFamily: 'monospace',
    },
    stateName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1a1a1a',
    },
    value: {
      fontFamily: 'monospace',
      fontSize: '14px',
      fontWeight: '700',
      color: '#c0392b',
      textAlign: 'right',
    },
    barWrap: {
      height: '8px',
      background: '#f0efec',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    tierBadge: (tier) => ({
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.04em',
      color: tier.color,
      background: tier.bg,
      border: `1px solid ${tier.color}33`,
    }),
    methNote: {
      fontSize: '12px',
      color: '#6b6b6b',
      lineHeight: '1.6',
      marginBottom: '10px',
    },
    sourceLink: {
      fontSize: '12px',
      color: '#3987e5',
    },
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.h1}>Medicaid Coverage Loss by State</h2>
        <p style={styles.subtitle}>OBBBA Medicaid provisions, projected impact</p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ ...styles.callout, flex: '1', minWidth: '180px' }}>
            <span style={styles.calloutNum}>14.3M</span>
            <span style={styles.calloutLabel}>people projected to lose Medicaid coverage nationally</span>
          </div>
          <div style={{ ...styles.callout, flex: '1', minWidth: '180px' }}>
            <span style={styles.calloutNum}>$1.47T</span>
            <span style={styles.calloutLabel}>federal match losses over 10 years</span>
          </div>
        </div>

        <div style={styles.toggleWrap}>
          <button style={styles.toggleBtn(mode === 'people')} onClick={() => setMode('people')}>
            People Losing Coverage
          </button>
          <button style={styles.toggleBtn(mode === 'fmap')} onClick={() => setMode('fmap')}>
            Federal Match Loss (10yr)
          </button>
        </div>

        <input
          style={styles.searchInput}
          placeholder="Search by state..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div style={styles.tableHead}>
          <span>#</span>
          <span>State</span>
          <span style={{ textAlign: 'right' }}>{mode === 'people' ? 'People (000s)' : 'Loss ($M)'}</span>
          <span>Volume</span>
          <span>Tier</span>
        </div>

        {filtered.map(row => {
          const val = mode === 'people' ? row.people : row.fmap;
          const pct = (val / maxVal) * 100;
          const tier = getTierByRank(row.rank);
          const opacity = 0.35 + (val / maxVal) * 0.65;
          return (
            <div key={row.state} style={styles.row}>
              <span style={styles.rank}>{row.rank}</span>
              <span style={styles.stateName}>{row.state}</span>
              <span style={styles.value}>
                {mode === 'people'
                  ? row.people.toLocaleString()
                  : '$' + row.fmap.toLocaleString()}
              </span>
              <div style={styles.barWrap}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: `rgba(192,57,43,${opacity})`,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={styles.tierBadge(tier)}>{tier.label}</span>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: '#6b6b6b', fontSize: '14px' }}>
            No states match "{search}"
          </div>
        )}
      </div>

      <div style={{ ...styles.card, paddingTop: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>Methodology</p>
        <p style={styles.methNote}>
          Projections based on KFF analysis of OBBBA work requirement provisions, Medicaid eligibility restrictions, and enhanced FMAP phase-down. Actual losses depend on state implementation choices.
        </p>
        <p style={{ fontSize: '12px', color: '#4a4a4a', margin: '0' }}>
          Source: <a href="https://www.kff.org/medicaid/issue-brief/medicaid-and-obbba/" target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>KFF Health Policy, September 2026</a>
        </p>
      </div>
    </div>
  );
}
