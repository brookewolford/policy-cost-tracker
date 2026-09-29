import { useState, useEffect, useRef } from 'react';

const HOUSING_PROGRAMS = [
  {
    name: "Section 8 Housing Choice Vouchers",
    agency: "HUD",
    cutAmount: 26_800_000_000,
    priorFunding: 32_400_000_000,
    percentCut: 17.3,
    householdsAffected: 198_000,
    description: "OBBBA reduced voucher funding and added work requirements eliminating households with adult members not meeting the 20-hour/week threshold. The voucher program serves 2.3 million households; this cut represents the single largest reduction in federal rental assistance in program history.",
    source: "HUD FY2027 Budget Justification; CBO score of OBBBA Sec. 40301",
    sourceUrl: "https://www.hud.gov/sites/dfiles/CFO/documents/FY2027BudgetJustification.pdf",
    type: "voucher",
  },
  {
    name: "Community Development Block Grant (CDBG)",
    agency: "HUD",
    cutAmount: 2_100_000_000,
    priorFunding: 3_300_000_000,
    percentCut: 36.4,
    householdsAffected: 0,
    description: "OBBBA proposed full elimination; Congress preserved a reduced appropriation at 63.6% of prior funding. The 36.4% cut eliminates housing rehabilitation, lead abatement, and community infrastructure grants for low-income communities across all 50 states. Communities lose a flexible, locally-controlled tool with no substitute program.",
    source: "HUD FY2026 Appropriations Act",
    sourceUrl: "https://www.hud.gov/program_offices/comm_planning/cdbg",
    type: "community",
  },
  {
    name: "Public Housing Capital Fund",
    agency: "HUD",
    cutAmount: 1_800_000_000,
    priorFunding: 3_200_000_000,
    percentCut: 43.8,
    householdsAffected: 680_000,
    description: "Capital funding for public housing maintenance and modernization. A 43.8% cut deepens an already critical $70B+ deferred maintenance backlog across 900,000+ public housing units. Without capital infusion, public housing authorities will be forced to demolish or dispose of units they cannot afford to maintain, permanently reducing the supply of deeply affordable housing.",
    source: "HUD; National Low Income Housing Coalition FY2026 Outlook",
    sourceUrl: "https://nlihc.org/resource/national-low-income-housing-coalition-fy2026-budget-outlook",
    type: "public",
  },
  {
    name: "HOME Investment Partnerships",
    agency: "HUD",
    cutAmount: 1_250_000_000,
    priorFunding: 1_500_000_000,
    percentCut: 16.7,
    householdsAffected: 32_000,
    description: "HOME is the largest federal block grant for state and local governments to produce and preserve affordable housing. A 16.7% cut in FY2026 appropriations, compounded by OBBBA restrictions on eligible uses, significantly reduces the gap-filling role HOME plays in LIHTC transactions. HOME is frequently the subordinate soft loan that makes LIHTC deals pencil; reduced HOME availability will kill or delay projects in high-cost markets.",
    source: "HUD FY2026 Appropriations; National Council of State Housing Agencies",
    sourceUrl: "https://www.ncsha.org/resource/fy2026-hud-appropriations/",
    type: "production",
  },
  {
    name: "Emergency Solutions Grant (ESG)",
    agency: "HUD",
    cutAmount: 320_000_000,
    priorFunding: 490_000_000,
    percentCut: 65.3,
    householdsAffected: 44_000,
    description: "ESG funds rapid rehousing and homelessness prevention. The 65.3% reduction is the largest proportional cut in the federal housing portfolio. Most states will be unable to maintain current rapid rehousing placements. Rapid rehousing -- short-term rental assistance with services -- is the most cost-effective intervention for people experiencing homelessness; gutting ESG will increase shelter system demand and street homelessness.",
    source: "HUD FY2027 Budget; National Alliance to End Homelessness",
    sourceUrl: "https://endhomelessness.org/resource/fy2027-budget-analysis/",
    type: "homelessness",
  },
  {
    name: "Section 202 Supportive Housing for the Elderly",
    agency: "HUD",
    cutAmount: 420_000_000,
    priorFunding: 1_100_000_000,
    percentCut: 38.2,
    householdsAffected: 8_400,
    description: "Section 202 provides capital advances and project-based rental assistance for senior affordable housing. OBBBA eliminated new capital advances entirely; only renewals of existing project-based rental assistance remain funded. This is a program wind-down in practice: no new units can be built, and the senior affordable housing pipeline will drain within 3-5 years. The senior population needing affordable housing is growing fastest of any demographic cohort.",
    source: "HUD FY2027 Budget; LeadingAge",
    sourceUrl: "https://www.leadingage.org/housing-policy",
    type: "senior",
  },
  {
    name: "Rural Housing Service (Section 515 / 521)",
    agency: "USDA",
    cutAmount: 390_000_000,
    priorFunding: 650_000_000,
    percentCut: 60.0,
    householdsAffected: 11_000,
    description: "USDA Rural Development Section 515 loans and Section 521 Rental Assistance are the primary federal tools for affordable rental housing in rural America. A 60% cut is a de facto wind-down: no new Section 515 loans will be funded; only Section 521 rental assistance renewals are appropriated. Rural areas have no alternative affordable housing programs; HUD vouchers and LIHTC are largely inaccessible in markets without sufficient rents to support tax credit equity.",
    source: "USDA RD FY2026 Appropriations",
    sourceUrl: "https://www.rd.usda.gov/programs-services/multi-family-housing-programs",
    type: "rural",
  },
  {
    name: "Section 811 Supportive Housing for Persons with Disabilities",
    agency: "HUD",
    cutAmount: 280_000_000,
    priorFunding: 400_000_000,
    percentCut: 30.0,
    householdsAffected: 4_200,
    description: "Section 811 provides capital advance financing and project-based rental assistance for people with disabilities. New production is effectively halted under OBBBA; only renewal of existing project-based assistance is funded. People with disabilities face the most severe affordable housing shortage of any population segment; the integration mandate of the ADA requires community-based housing, which this cut undermines.",
    source: "HUD FY2027 Budget",
    sourceUrl: "https://www.hud.gov/program_offices/housing/mfh/progdesc/disab811",
    type: "disability",
  },
  {
    name: "Housing Opportunities for Persons With AIDS (HOPWA)",
    agency: "HUD",
    cutAmount: 110_000_000,
    priorFunding: 450_000_000,
    percentCut: 24.4,
    householdsAffected: 5_800,
    description: "HOPWA provides stable housing and support services to people living with HIV/AIDS. A 24.4% cut will force many metropolitan grantees to reduce placements or exit the program. Housing stability is a proven HIV treatment adherence factor; housing disruption leads directly to poorer health outcomes and increased transmission risk. Many HOPWA grantees have no substitute funding source.",
    source: "HUD FY2027 Budget; AIDS United",
    sourceUrl: "https://www.aidsunited.org/policy",
    type: "special",
  },
  {
    name: "LIHTC (Low-Income Housing Tax Credit)",
    agency: "Treasury / IRS",
    cutAmount: 0,
    priorFunding: 13_500_000_000,
    percentCut: 0,
    householdsAffected: 0,
    description: "LIHTC survived OBBBA intact with no direct cuts. However, the program faces significant indirect headwinds. Rising Treasury yields from OBBBA-added deficit spending reduce the present value of tax credit equity, effectively increasing the per-unit financing gap by 8-12%. Tariff pass-through on steel, lumber, and HVAC systems adds $12,000-$22,000 in hard costs per unit. The combination is squeezing deals that were underwritten before 2025 and making new LIHTC applications more difficult to close without additional subsidy sources.",
    source: "Novogradac; National Housing and Rehabilitation Association",
    sourceUrl: "https://www.novoco.com/notes-from-novogradac/what-obbba-means-for-lihtc",
    type: "lihtc",
    note: "indirect_impact",
  },
];

const FILTER_TABS = [
  { key: 'all', label: 'All Programs' },
  { key: 'voucher', label: 'Vouchers' },
  { key: 'production', label: 'Production' },
  { key: 'public', label: 'Public Housing' },
  { key: 'senior_disability', label: 'Senior / Disability' },
  { key: 'rural', label: 'Rural' },
  { key: 'homelessness', label: 'Homelessness' },
  { key: 'lihtc', label: 'LIHTC' },
];

const TYPE_TO_FILTER = {
  voucher: 'voucher',
  production: 'production',
  community: 'production',
  public: 'public',
  senior: 'senior_disability',
  disability: 'senior_disability',
  rural: 'rural',
  homelessness: 'homelessness',
  special: 'homelessness',
  lihtc: 'lihtc',
};

const AGENCY_COLORS = {
  HUD: { bg: '#e8f0fd', text: '#2a5cb8' },
  'Treasury / IRS': { bg: '#fef4e6', text: '#a05c10' },
  USDA: { bg: '#e6f4ea', text: '#2a7a3a' },
};

function formatDollars(n) {
  if (n >= 1_000_000_000) {
    return '$' + (n / 1_000_000_000).toFixed(1) + 'B';
  }
  if (n >= 1_000_000) {
    return '$' + (n / 1_000_000).toFixed(0) + 'M';
  }
  return '$' + n.toLocaleString();
}

function formatHouseholds(n) {
  if (n === 0) return null;
  return n.toLocaleString();
}

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
  alertRed: {
    background: '#fde8e6',
    border: '1px solid #f0c4bf',
    borderLeft: '4px solid #c0392b',
    borderRadius: '6px',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  alertAmber: {
    background: '#fef4e6',
    border: '1px solid #f0d8a0',
    borderLeft: '4px solid #d95926',
    borderRadius: '6px',
    padding: '16px 20px',
    marginBottom: '20px',
  },
  alertTitle: {
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px 0',
  },
  alertBody: {
    fontSize: '14px',
    margin: '0',
    lineHeight: '1.6',
  },
  alertNumbers: {
    display: 'flex',
    gap: '24px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  alertStat: {
    fontSize: '11px',
    color: '#8b2920',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  alertStatValue: {
    display: 'block',
    fontSize: '22px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#c0392b',
    lineHeight: '1.2',
  },
  tabRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  tab: {
    padding: '6px 14px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid #e0ddd8',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: '#ffffff',
    color: '#4a4a4a',
  },
  programCard: {
    border: '1px solid #e0ddd8',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '12px',
    background: '#ffffff',
  },
  programCardLIHTC: {
    border: '1px solid #e0ddd8',
    borderLeft: '4px solid #d95926',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '12px',
    background: '#fffdf7',
  },
  programHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  programName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
    flex: '1',
    minWidth: '200px',
  },
  agencyBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  metaRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '12px',
    alignItems: 'flex-start',
  },
  metaBlock: {
    minWidth: '100px',
  },
  metaLabel: {
    fontSize: '10px',
    color: '#6b6b6b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
    margin: '0 0 2px 0',
  },
  metaValue: {
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#c0392b',
    margin: '0',
  },
  metaValueMuted: {
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'monospace',
    color: '#6b6b6b',
    margin: '0',
  },
  metaValueGreen: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#2a7a3a',
    background: '#e6f4ea',
    padding: '3px 10px',
    borderRadius: '10px',
    display: 'inline-block',
    margin: '0',
  },
  barSection: {
    marginBottom: '12px',
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#6b6b6b',
    marginBottom: '4px',
  },
  barTrack: {
    height: '6px',
    background: '#f0ede8',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  description: {
    fontSize: '13px',
    color: '#4a4a4a',
    lineHeight: '1.65',
    margin: '0 0 12px 0',
  },
  sourceLink: {
    fontSize: '11px',
    color: '#3987e5',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  sourceText: {
    fontSize: '11px',
    color: '#6b6b6b',
  },
  noResults: {
    textAlign: 'center',
    padding: '32px',
    color: '#6b6b6b',
    fontSize: '14px',
  },
  divider: {
    borderTop: '1px solid #e0ddd8',
    margin: '12px 0',
  },
  footerNote: {
    marginTop: '8px',
    padding: '12px 14px',
    background: '#f7f6f3',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#6b6b6b',
    lineHeight: '1.6',
  },
};

const MAX_PCT = 65.3;

export default function HousingCuts() {
  const [activeFilter, setActiveFilter] = useState('all');

  const sorted = [...HOUSING_PROGRAMS].sort((a, b) => b.cutAmount - a.cutAmount);

  const filtered = sorted.filter(p => {
    if (activeFilter === 'all') return true;
    return TYPE_TO_FILTER[p.type] === activeFilter;
  });

  const directCutTotal = HOUSING_PROGRAMS.filter(p => p.cutAmount > 0)
    .reduce((sum, p) => sum + p.cutAmount, 0);

  const householdsTotal = HOUSING_PROGRAMS
    .reduce((sum, p) => sum + p.householdsAffected, 0);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Federal Housing Program Cuts</h2>
        <p style={styles.subtitle}>
          Impact of the One Big Beautiful Budget Act (OBBBA) and FY2026 appropriations on federal affordable housing programs. Data from HUD, USDA Rural Development, CBO, NLIHC, and program advocacy organizations. September 2026.
        </p>

        <div style={styles.alertRed}>
          <p style={{ ...styles.alertTitle, color: '#8b2920' }}>Direct Program Cuts</p>
          <div style={styles.alertNumbers}>
            <div>
              <span style={styles.alertStat}>Total Annual Reduction</span>
              <span style={styles.alertStatValue}>{formatDollars(directCutTotal)}</span>
            </div>
            <div>
              <span style={styles.alertStat}>Households Directly Affected</span>
              <span style={styles.alertStatValue}>{householdsTotal.toLocaleString()}</span>
            </div>
            <div>
              <span style={styles.alertStat}>Programs with Cuts</span>
              <span style={styles.alertStatValue}>9 of 10</span>
            </div>
          </div>
          <p style={{ ...styles.alertBody, color: '#8b2920', marginTop: '10px', fontSize: '12px' }}>
            Figures represent direct annual funding reductions only. Community-level impacts (CDBG) and households in public housing affected by deferred maintenance are included where applicable. LIHTC indirect impacts are not reflected in household totals.
          </p>
        </div>

        <div style={styles.alertAmber}>
          <p style={{ ...styles.alertTitle, color: '#a05c10' }}>LIHTC: No Direct Cut, but Significant Indirect Headwinds</p>
          <p style={{ ...styles.alertBody, color: '#5c3d10' }}>
            LIHTC survived OBBBA with no direct funding cut, but is facing indirect pressure on two fronts. Rising Treasury yields from OBBBA-added deficit spending are reducing the present value of tax credit equity, increasing the per-unit financing gap by 8-12% in deals underwritten at lower rates. Simultaneously, tariff pass-through on steel, lumber, and HVAC adds $12,000-$22,000 in hard construction costs per unit. The result: deals that penciled 18 months ago no longer close without additional subsidy, and the affordable pipeline is slowing even where the credit itself is intact.
          </p>
        </div>

        <div style={styles.tabRow}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.tab,
                background: activeFilter === tab.key ? '#1a1a1a' : '#ffffff',
                color: activeFilter === tab.key ? '#ffffff' : '#4a4a4a',
                borderColor: activeFilter === tab.key ? '#1a1a1a' : '#e0ddd8',
              }}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={styles.noResults}>No programs match this filter.</div>
        )}

        {filtered.map(p => {
          const isLIHTC = p.type === 'lihtc';
          const agencyStyle = AGENCY_COLORS[p.agency] || { bg: '#f0ede8', text: '#4a4a4a' };
          const barPct = (p.percentCut / MAX_PCT) * 100;

          return (
            <div key={p.name} style={isLIHTC ? styles.programCardLIHTC : styles.programCard}>
              <div style={styles.programHeader}>
                <div style={{ flex: 1 }}>
                  <p style={styles.programName}>{p.name}</p>
                  <span style={{
                    ...styles.agencyBadge,
                    background: agencyStyle.bg,
                    color: agencyStyle.text,
                  }}>
                    {p.agency}
                  </span>
                </div>
              </div>

              <div style={styles.metaRow}>
                <div style={styles.metaBlock}>
                  <p style={styles.metaLabel}>Cut Amount</p>
                  {isLIHTC ? (
                    <p style={styles.metaValueGreen}>NO DIRECT CUT</p>
                  ) : (
                    <p style={styles.metaValue}>{formatDollars(p.cutAmount)}</p>
                  )}
                </div>
                <div style={styles.metaBlock}>
                  <p style={styles.metaLabel}>Prior Funding</p>
                  <p style={styles.metaValueMuted}>{formatDollars(p.priorFunding)}</p>
                </div>
                {p.householdsAffected > 0 && (
                  <div style={styles.metaBlock}>
                    <p style={styles.metaLabel}>Households Affected</p>
                    <p style={{ ...styles.metaValueMuted, color: '#c0392b' }}>
                      {formatHouseholds(p.householdsAffected)}
                    </p>
                  </div>
                )}
                {p.householdsAffected === 0 && !isLIHTC && (
                  <div style={styles.metaBlock}>
                    <p style={styles.metaLabel}>Impact</p>
                    <p style={{ ...styles.metaValueMuted, fontSize: '12px' }}>Community-level</p>
                  </div>
                )}
              </div>

              {!isLIHTC && p.percentCut > 0 && (
                <div style={styles.barSection}>
                  <div style={styles.barLabel}>
                    <span>Percent cut from prior funding</span>
                    <span style={{ fontWeight: '700', color: '#c0392b', fontFamily: 'monospace' }}>
                      {p.percentCut.toFixed(1)}%
                    </span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{
                      height: '100%',
                      width: barPct + '%',
                      background: '#c0392b',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#9b9b9b', marginTop: '3px', textAlign: 'right' }}>
                    bar scaled to largest cut (ESG: 65.3%)
                  </div>
                </div>
              )}

              {isLIHTC && (
                <div style={styles.barSection}>
                  <div style={styles.barLabel}>
                    <span>Direct percent cut</span>
                    <span style={{ fontWeight: '700', color: '#2a7a3a', fontFamily: 'monospace' }}>0%</span>
                  </div>
                  <div style={{ ...styles.barTrack, background: '#e6f4ea' }}>
                    <div style={{ height: '100%', width: '1px', background: '#d95926' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#9b9b9b', marginTop: '3px' }}>
                    Indirect deal-level impact: 8-12% equity pricing reduction
                  </div>
                </div>
              )}

              <p style={styles.description}>{p.description}</p>

              <div style={styles.divider} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={styles.sourceText}>Source:</span>
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.sourceLink}
                >
                  {p.source}
                  <span style={{ fontSize: '10px' }}>&#8599;</span>
                </a>
              </div>
            </div>
          );
        })}

        <div style={styles.footerNote}>
          <strong>Methodology note:</strong> Cut amounts represent the difference between FY2025 enacted levels and FY2026 appropriations or OBBBA-authorized funding, on an annualized basis. Where OBBBA provisions take effect on a delayed schedule, projected steady-state impact is shown. Household figures are point-in-time estimates of direct program participants affected by funding reductions or new eligibility restrictions; they do not capture secondary or induced effects. LIHTC is shown as a tax expenditure (annual revenue cost to Treasury) rather than an appropriation. All figures from publicly available federal budget documents, CBO scores, and program advocacy research.
        </div>
      </div>
    </div>
  );
}
