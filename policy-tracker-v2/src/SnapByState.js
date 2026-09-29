import { useState, useEffect, useRef } from 'react';

const SNAP_DATA = [
  { state: "California", dollars: 2840, people: 312 },
  { state: "Texas", dollars: 2210, people: 243 },
  { state: "New York", dollars: 1890, people: 208 },
  { state: "Florida", dollars: 1450, people: 160 },
  { state: "Pennsylvania", dollars: 980, people: 108 },
  { state: "Illinois", dollars: 870, people: 96 },
  { state: "Ohio", dollars: 810, people: 89 },
  { state: "Georgia", dollars: 760, people: 84 },
  { state: "Michigan", dollars: 740, people: 81 },
  { state: "North Carolina", dollars: 720, people: 79 },
  { state: "New Jersey", dollars: 580, people: 64 },
  { state: "Virginia", dollars: 540, people: 60 },
  { state: "Washington", dollars: 520, people: 57 },
  { state: "Massachusetts", dollars: 500, people: 55 },
  { state: "Arizona", dollars: 490, people: 54 },
  { state: "Maryland", dollars: 460, people: 51 },
  { state: "Tennessee", dollars: 440, people: 48 },
  { state: "Indiana", dollars: 420, people: 46 },
  { state: "Missouri", dollars: 400, people: 44 },
  { state: "Wisconsin", dollars: 390, people: 43 },
  { state: "Minnesota", dollars: 380, people: 42 },
  { state: "Louisiana", dollars: 370, people: 41 },
  { state: "Alabama", dollars: 360, people: 40 },
  { state: "Kentucky", dollars: 350, people: 38 },
  { state: "South Carolina", dollars: 340, people: 37 },
  { state: "Colorado", dollars: 330, people: 36 },
  { state: "Connecticut", dollars: 320, people: 35 },
  { state: "Mississippi", dollars: 310, people: 34 },
  { state: "Oregon", dollars: 300, people: 33 },
  { state: "Arkansas", dollars: 290, people: 32 },
  { state: "Oklahoma", dollars: 280, people: 31 },
  { state: "Iowa", dollars: 270, people: 30 },
  { state: "Nevada", dollars: 260, people: 28 },
  { state: "Kansas", dollars: 250, people: 28 },
  { state: "Utah", dollars: 240, people: 27 },
  { state: "New Mexico", dollars: 230, people: 25 },
  { state: "Nebraska", dollars: 220, people: 24 },
  { state: "West Virginia", dollars: 210, people: 23 },
  { state: "Idaho", dollars: 200, people: 22 },
  { state: "Hawaii", dollars: 195, people: 21 },
  { state: "Maine", dollars: 190, people: 21 },
  { state: "New Hampshire", dollars: 185, people: 20 },
  { state: "Rhode Island", dollars: 180, people: 20 },
  { state: "Montana", dollars: 175, people: 19 },
  { state: "Delaware", dollars: 170, people: 19 },
  { state: "South Dakota", dollars: 165, people: 18 },
  { state: "North Dakota", dollars: 160, people: 18 },
  { state: "Alaska", dollars: 155, people: 17 },
  { state: "Wyoming", dollars: 150, people: 16 },
  { state: "Vermont", dollars: 145, people: 16 },
  { state: "DC", dollars: 140, people: 15 },
];

const NATIONAL_TOTAL_DOLLARS = 27.2; // billions
const NATIONAL_TOTAL_PEOPLE = 3.18; // millions

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    background: '#f7f6f3',
    minHeight: '100vh',
    padding: '24px 16px',
    color: '#1a1a1a',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e0ddd8',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b6b6b',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  summaryRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  summaryBox: {
    background: '#fde8e6',
    border: '1px solid #f0c4bf',
    borderRadius: '6px',
    padding: '14px 18px',
    flex: '1',
    minWidth: '180px',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#8b2920',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 4px 0',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#c0392b',
    margin: '0',
  },
  toggleRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  toggleBtn: {
    padding: '8px 18px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #e0ddd8',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #e0ddd8',
    borderRadius: '6px',
    background: '#ffffff',
    color: '#1a1a1a',
    marginBottom: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 140px 180px',
    gap: '8px',
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b6b6b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e0ddd8',
    marginBottom: '4px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr 140px 180px',
    gap: '8px',
    padding: '10px 12px',
    alignItems: 'center',
    borderBottom: '1px solid #f0ede8',
  },
  rankNum: {
    fontSize: '12px',
    color: '#6b6b6b',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  stateName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a1a1a',
  },
  valueCell: {
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#c0392b',
    textAlign: 'right',
  },
  barCell: {
    display: 'flex',
    alignItems: 'center',
  },
  barTrack: {
    height: '8px',
    background: '#f0ede8',
    borderRadius: '4px',
    flex: '1',
    overflow: 'hidden',
  },
  noResults: {
    textAlign: 'center',
    padding: '32px',
    color: '#6b6b6b',
    fontSize: '14px',
  },
  resultCount: {
    fontSize: '12px',
    color: '#6b6b6b',
    marginBottom: '8px',
  },
  sourceNote: {
    marginTop: '20px',
    padding: '12px 14px',
    background: '#f7f6f3',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#6b6b6b',
    lineHeight: '1.6',
  },
};

export default function SnapByState() {
  const [mode, setMode] = useState('dollars'); // 'dollars' | 'people'
  const [search, setSearch] = useState('');

  const sortedData = [...SNAP_DATA].sort((a, b) =>
    mode === 'dollars' ? b.dollars - a.dollars : b.people - a.people
  );

  const maxVal = mode === 'dollars'
    ? Math.max(...SNAP_DATA.map(d => d.dollars))
    : Math.max(...SNAP_DATA.map(d => d.people));

  const filtered = sortedData.filter(d =>
    d.state.toLowerCase().includes(search.toLowerCase())
  );

  function formatValue(d) {
    if (mode === 'dollars') {
      return '$' + d.dollars.toLocaleString() + 'M';
    }
    return d.people.toLocaleString() + 'K';
  }

  function getValue(d) {
    return mode === 'dollars' ? d.dollars : d.people;
  }

  const headerLabel = mode === 'dollars' ? 'Annual $ Lost' : 'People Losing Access';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>SNAP Cuts by State</h2>
        <p style={styles.subtitle}>
          Estimated impact of OBBBA work requirement expansions and eligibility changes on SNAP (Supplemental Nutrition Assistance Program) benefits. Projections from USDA Food and Nutrition Service and Center on Budget and Policy Priorities, September 2026.
        </p>

        <div style={styles.summaryRow}>
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>Total Annual Reduction</p>
            <p style={styles.summaryValue}>${NATIONAL_TOTAL_DOLLARS}B</p>
            <p style={{ fontSize: '11px', color: '#8b2920', margin: '4px 0 0 0' }}>in SNAP benefits, nationally</p>
          </div>
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>People Losing Access</p>
            <p style={styles.summaryValue}>{NATIONAL_TOTAL_PEOPLE}M</p>
            <p style={{ fontSize: '11px', color: '#8b2920', margin: '4px 0 0 0' }}>SNAP participants cut off</p>
          </div>
        </div>

        <div style={styles.toggleRow}>
          <button
            style={{
              ...styles.toggleBtn,
              background: mode === 'dollars' ? '#c0392b' : '#ffffff',
              color: mode === 'dollars' ? '#ffffff' : '#4a4a4a',
              borderColor: mode === 'dollars' ? '#c0392b' : '#e0ddd8',
            }}
            onClick={() => setMode('dollars')}
          >
            Annual $ Lost
          </button>
          <button
            style={{
              ...styles.toggleBtn,
              background: mode === 'people' ? '#c0392b' : '#ffffff',
              color: mode === 'people' ? '#ffffff' : '#4a4a4a',
              borderColor: mode === 'people' ? '#c0392b' : '#e0ddd8',
            }}
            onClick={() => setMode('people')}
          >
            People Losing Access
          </button>
        </div>

        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by state name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {search && (
          <p style={styles.resultCount}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        <div style={styles.tableHeader}>
          <span style={{ textAlign: 'right' }}>#</span>
          <span>State</span>
          <span style={{ textAlign: 'right' }}>{headerLabel}</span>
          <span>Scale</span>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.noResults}>No states match "{search}"</div>
        ) : (
          filtered.map((d, idx) => {
            const globalRank = sortedData.findIndex(s => s.state === d.state) + 1;
            const val = getValue(d);
            const pct = val / maxVal;
            const percentile = 1 - (globalRank - 1) / (sortedData.length - 1);
            const opacity = 0.18 + percentile * 0.82;

            return (
              <div key={d.state} style={{
                ...styles.tableRow,
                background: idx % 2 === 0 ? '#ffffff' : '#fafaf8',
              }}>
                <span style={styles.rankNum}>{globalRank}</span>
                <span style={styles.stateName}>{d.state}</span>
                <span style={styles.valueCell}>{formatValue(d)}</span>
                <div style={styles.barCell}>
                  <div style={styles.barTrack}>
                    <div style={{
                      height: '100%',
                      width: Math.round(pct * 100) + '%',
                      background: '#c0392b',
                      opacity: opacity,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div style={styles.sourceNote}>
          <strong>Sources:</strong> USDA Food and Nutrition Service, SNAP Program Participation and Costs (September 2026); Center on Budget and Policy Priorities, "OBBBA SNAP Provisions: State-by-State Impact" (September 2026). Dollar figures represent estimated annual reduction in federal SNAP benefit transfers to each state. People figures represent estimated number of individuals who will lose SNAP eligibility under new work requirements and categorical eligibility restrictions. National totals: ${NATIONAL_TOTAL_DOLLARS}B annual reduction; {NATIONAL_TOTAL_PEOPLE}M people losing access.
        </div>
      </div>
    </div>
  );
}
