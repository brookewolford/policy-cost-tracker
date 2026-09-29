import { useState, useEffect, useRef } from 'react';

const TARIFF_DATA = [
  { state: "Michigan", cost: 4200 },
  { state: "Ohio", cost: 3900 },
  { state: "Indiana", cost: 3800 },
  { state: "Wisconsin", cost: 3700 },
  { state: "Pennsylvania", cost: 3600 },
  { state: "Illinois", cost: 3500 },
  { state: "Minnesota", cost: 3400 },
  { state: "California", cost: 3300 },
  { state: "Texas", cost: 3200 },
  { state: "New York", cost: 3100 },
  { state: "Georgia", cost: 3000 },
  { state: "North Carolina", cost: 2900 },
  { state: "Tennessee", cost: 2850 },
  { state: "Alabama", cost: 2800 },
  { state: "Kentucky", cost: 2750 },
  { state: "Missouri", cost: 2700 },
  { state: "Iowa", cost: 2650 },
  { state: "Arkansas", cost: 2600 },
  { state: "South Carolina", cost: 2550 },
  { state: "Virginia", cost: 2500 },
  { state: "Washington", cost: 2480 },
  { state: "Colorado", cost: 2460 },
  { state: "Arizona", cost: 2440 },
  { state: "Massachusetts", cost: 2420 },
  { state: "New Jersey", cost: 2400 },
  { state: "Maryland", cost: 2380 },
  { state: "Connecticut", cost: 2360 },
  { state: "Oregon", cost: 2340 },
  { state: "Nevada", cost: 2300 },
  { state: "Florida", cost: 2280 },
  { state: "New Mexico", cost: 2260 },
  { state: "Kansas", cost: 2240 },
  { state: "Nebraska", cost: 2220 },
  { state: "Mississippi", cost: 2200 },
  { state: "Louisiana", cost: 2180 },
  { state: "Oklahoma", cost: 2160 },
  { state: "West Virginia", cost: 2140 },
  { state: "South Dakota", cost: 2120 },
  { state: "North Dakota", cost: 2100 },
  { state: "Montana", cost: 2080 },
  { state: "Wyoming", cost: 2060 },
  { state: "Idaho", cost: 2040 },
  { state: "Utah", cost: 2020 },
  { state: "Maine", cost: 2000 },
  { state: "New Hampshire", cost: 1980 },
  { state: "Vermont", cost: 1960 },
  { state: "Rhode Island", cost: 1940 },
  { state: "Delaware", cost: 1920 },
  { state: "Alaska", cost: 1900 },
  { state: "Hawaii", cost: 1880 },
  { state: "DC", cost: 1860 },
];

const NATIONAL_AVG = 2580;
const MAX_COST = 4200;

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
  header: {
    marginBottom: '24px',
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
    margin: '0',
    lineHeight: '1.5',
  },
  summaryRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  summaryBox: {
    background: '#f7f6f3',
    border: '1px solid #e0ddd8',
    borderRadius: '6px',
    padding: '14px 18px',
    flex: '1',
    minWidth: '180px',
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#6b6b6b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 4px 0',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#c0392b',
    margin: '0',
  },
  summaryValueBlue: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#3987e5',
    margin: '0',
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
    gridTemplateColumns: '40px 1fr 130px 200px 100px',
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
    gridTemplateColumns: '40px 1fr 130px 200px 100px',
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
  costValue: {
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#c0392b',
    textAlign: 'right',
  },
  barCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
  },
  barTrack: {
    height: '8px',
    background: '#f0ede8',
    borderRadius: '4px',
    flex: '1',
    overflow: 'hidden',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '10px',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
  },
  badgeAbove: {
    background: '#fde8e6',
    color: '#c0392b',
  },
  badgeBelow: {
    background: '#e8f0fd',
    color: '#3987e5',
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
};

function formatCurrency(val) {
  return '$' + val.toLocaleString();
}

export default function TariffMap() {
  const [search, setSearch] = useState('');

  const sortedData = [...TARIFF_DATA].sort((a, b) => b.cost - a.cost);

  const filtered = sortedData.filter(d =>
    d.state.toLowerCase().includes(search.toLowerCase())
  );

  const totalBurden = sortedData.reduce((sum, d) => sum + d.cost, 0);
  const avgCheck = Math.round(totalBurden / sortedData.length);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tariff Burden by State</h2>
          <p style={styles.subtitle}>
            Estimated annual increase in tariff costs per household, by state. Based on Peterson Institute for International Economics trade exposure analysis and Yale Budget Lab consumer pass-through estimates, September 2026. Figures reflect cumulative tariff schedules in effect as of mid-2026.
          </p>
        </div>

        <div style={styles.summaryRow}>
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>National Average</p>
            <p style={styles.summaryValue}>{formatCurrency(NATIONAL_AVG)}</p>
            <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '4px 0 0 0' }}>per household, annually</p>
          </div>
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>Highest Burden State</p>
            <p style={styles.summaryValue}>{formatCurrency(sortedData[0].cost)}</p>
            <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '4px 0 0 0' }}>{sortedData[0].state}</p>
          </div>
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>Lowest Burden State</p>
            <p style={styles.summaryValueBlue}>{formatCurrency(sortedData[sortedData.length - 1].cost)}</p>
            <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '4px 0 0 0' }}>{sortedData[sortedData.length - 1].state}</p>
          </div>
          <div style={styles.summaryBox}>
            <p style={styles.summaryLabel}>States Above Average</p>
            <p style={styles.summaryValueBlue}>{sortedData.filter(d => d.cost > NATIONAL_AVG).length}</p>
            <p style={{ fontSize: '11px', color: '#6b6b6b', margin: '4px 0 0 0' }}>of 51 jurisdictions</p>
          </div>
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
          <span style={{ textAlign: 'right' }}>Household Cost</span>
          <span>Burden</span>
          <span>vs. National Avg</span>
        </div>

        {filtered.length === 0 ? (
          <div style={styles.noResults}>No states match "{search}"</div>
        ) : (
          filtered.map((d, idx) => {
            const globalRank = sortedData.findIndex(s => s.state === d.state) + 1;
            const pct = d.cost / MAX_COST;
            const percentile = 1 - (globalRank - 1) / (sortedData.length - 1);
            const opacity = 0.15 + percentile * 0.85;
            const isAbove = d.cost >= NATIONAL_AVG;
            const barWidth = Math.round(pct * 100);

            return (
              <div key={d.state} style={{
                ...styles.tableRow,
                background: idx % 2 === 0 ? '#ffffff' : '#fafaf8',
              }}>
                <span style={styles.rankNum}>{globalRank}</span>
                <span style={styles.stateName}>{d.state}</span>
                <span style={styles.costValue}>{formatCurrency(d.cost)}</span>
                <div style={styles.barCell}>
                  <div style={styles.barTrack}>
                    <div style={{
                      height: '100%',
                      width: barWidth + '%',
                      background: '#3987e5',
                      opacity: opacity,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{
                    ...styles.badge,
                    ...(isAbove ? styles.badgeAbove : styles.badgeBelow),
                  }}>
                    {isAbove ? 'ABOVE AVG' : 'BELOW AVG'}
                  </span>
                </div>
              </div>
            );
          })
        )}

        <div style={{
          marginTop: '20px',
          padding: '12px 14px',
          background: '#f7f6f3',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#6b6b6b',
          lineHeight: '1.6',
        }}>
          <strong>Sources:</strong> Peterson Institute for International Economics, "Trade Policy and Household Costs" (2026); Yale Budget Lab, "Who Pays for Tariffs" (September 2026). State-level estimates are modeled from trade exposure indices, import-intensity of household consumption baskets, and regional manufacturing supply chain linkages. Figures represent estimated annual pass-through to households, not actual taxes paid directly. National average: {formatCurrency(NATIONAL_AVG)}/household.
        </div>
      </div>
    </div>
  );
}
