module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate");

  try {
    const fields = "classification_desc,current_month_gross_outly_amt,current_fytd_gross_outly_amt,prior_fytd_gross_outly_amt,record_date";

    // Fetch both pages to cover all agencies
    const [r1, r2] = await Promise.all([
      fetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?fields=${fields}&sort=-record_date&page[number]=1&page[size]=100`, { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(12000) }),
      fetch(`https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?fields=${fields}&sort=-record_date&page[number]=2&page[size]=100`, { headers: { "Accept": "application/json" }, signal: AbortSignal.timeout(12000) }),
    ]);

    const [j1, j2] = await Promise.all([r1.json(), r2.json()]);
    const rows = [...(j1.data || []), ...(j2.data || [])];

    if (rows.length === 0) throw new Error("No data returned");

    const latestDate = rows[0]?.record_date || null;
    const latest = rows.filter(r => r.record_date === latestDate);

    const find = (name) => latest.find(r => r.classification_desc === name);

    const parse = (row) => {
      if (!row) return null;
      const ytd = parseFloat(row.current_fytd_gross_outly_amt);
      const prior = parseFloat(row.prior_fytd_gross_outly_amt);
      const month = parseFloat(row.current_month_gross_outly_amt);
      return {
        agency: row.classification_desc,
        currentFiscalYearToDate: isNaN(ytd) ? null : ytd,
        priorFiscalYearToDate: isNaN(prior) ? null : prior,
        currentMonthActual: isNaN(month) ? null : month,
        recordDate: row.record_date,
      };
    };

    // Use exact names from Treasury
    const dhsRow = find("Total--Department of Homeland Security");
    const dodRow = find("Total--Department of Defense--Military Programs") ||
                   find("Total--Department of Defense") ||
                   find("Total--Military Personnel"); // fallback
    const hhsRow = find("Total--Department of Health and Human Services") ||
                   find("Total--Centers for Medicare and Medicaid Services");
    const usdaRow = find("Total--Department of Agriculture");
    const dojRow = find("Total--Department of Justice");

    const agencies = {
      dhs: parse(dhsRow),
      dod: parse(dodRow),
      hhs: parse(hhsRow),
      usda: parse(usdaRow),
      doj: parse(dojRow),
    };

    return res.status(200).json({
      success: true,
      asOf: latestDate,
      fetchedAt: new Date().toISOString(),
      agencies,
      computed: {
        dhsEnforcementSurge:
          agencies.dhs?.currentFiscalYearToDate && agencies.dhs?.priorFiscalYearToDate
            ? agencies.dhs.currentFiscalYearToDate - agencies.dhs.priorFiscalYearToDate
            : null,
      },
      note: "Values are actual outlays in USD. Source: US Treasury MTS Table 5.",
    });

  } catch (error) {
    console.error("Treasury error:", error.message);
    return res.status(200).json({
      success: false,
      error: error.message,
      asOf: null,
      fetchedAt: new Date().toISOString(),
      agencies: {},
      computed: {},
      note: "Treasury data temporarily unavailable. Displaying estimated figures.",
    });
  }
};
