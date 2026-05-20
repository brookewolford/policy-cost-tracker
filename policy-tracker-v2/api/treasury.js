const AGENCY_MAP = {
  dhs: "Homeland Security",
  dod: "Defense-Military Programs",
  hhs: "Health and Human Services",
  usda: "Agriculture",
  doj: "Justice",
};

const CACHE_SECONDS = 6 * 60 * 60;

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate`);

  try {
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?fields=classification_desc,current_fiscal_year_to_date,prior_fiscal_year_to_date,record_date,current_month_actual&sort=-record_date&page%5Bsize%5D=100";

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Treasury API returned ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const rows = json.data || [];

    if (rows.length === 0) {
      throw new Error("No data returned from Treasury API");
    }

    const latestDate = rows[0]?.record_date || null;
    const results = {};

    for (const [key, agencyName] of Object.entries(AGENCY_MAP)) {
      const row = rows.find(
        (r) =>
          r.record_date === latestDate &&
          r.classification_desc &&
          r.classification_desc.includes(agencyName)
      );

      if (row) {
        const ytd = parseFloat(row.current_fiscal_year_to_date) * 1_000_000;
        const priorYtd = parseFloat(row.prior_fiscal_year_to_date) * 1_000_000;
        const monthActual = parseFloat(row.current_month_actual) * 1_000_000;

        results[key] = {
          agency: row.classification_desc,
          currentFiscalYearToDate: isNaN(ytd) ? null : ytd,
          priorFiscalYearToDate: isNaN(priorYtd) ? null : priorYtd,
          currentMonthActual: isNaN(monthActual) ? null : monthActual,
          recordDate: row.record_date,
        };
      } else {
        results[key] = null;
      }
    }

    const dhsYoYIncrease =
      results.dhs?.currentFiscalYearToDate && results.dhs?.priorFiscalYearToDate
        ? results.dhs.currentFiscalYearToDate - results.dhs.priorFiscalYearToDate
        : null;

    return res.status(200).json({
      success: true,
      asOf: latestDate,
      fetchedAt: new Date().toISOString(),
      agencies: results,
      computed: { dhsEnforcementSurge: dhsYoYIncrease },
      note: "Values are actual outlays in USD. Source: US Treasury MTS Table 5.",
    });

  } catch (error) {
    console.error("Treasury API error:", error.message);

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
