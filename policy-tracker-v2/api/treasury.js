/**
 * Vercel Serverless Function: /api/treasury
 *
 * Fetches real outlay data from the US Treasury Fiscal Data API
 * (MTS Table 5 — Outlays by Agency) and returns structured figures
 * for DHS (ICE/immigration), DoD (Iran war), HHS (Medicaid), and USDA (SNAP).
 *
 * Treasury API is free, requires no API key, and returns JSON.
 * MTS is published ~8th business day of each month.
 *
 * Endpoint: https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5
 * Fields used: classification_desc, current_fiscal_year_to_date, record_date
 */

// Agency names exactly as they appear in Treasury MTS Table 5
const AGENCY_MAP = {
  dhs: "Homeland Security",           // Contains ICE, CBP, USCIS
  dod: "Defense-Military Programs",   // Contains all DoD/Iran war spending
  hhs: "Health and Human Services",   // Contains Medicaid, Medicare, ACA
  usda: "Agriculture",                // Contains SNAP/food stamps
  doj: "Justice",                     // Contains DOJ programs
};

// Cache duration: 6 hours (Treasury data only updates monthly anyway)
const CACHE_SECONDS = 6 * 60 * 60;

export default async function handler(req, res) {
  // CORS headers so the React frontend can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate`);

  try {
    const BASE = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service";
    const endpoint = "/v1/accounting/mts/mts_table_5";

    // Fetch the most recent MTS data, sorted by date descending
    // We want current_fiscal_year_to_date for each major agency
    const params = new URLSearchParams({
      fields: "classification_desc,current_fiscal_year_to_date,prior_fiscal_year_to_date,record_date,current_month_actual",
      sort: "-record_date",
      "page[size]": "100",  // Get enough rows to find all agencies
    });

    const url = `${BASE}${endpoint}?${params}`;
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Treasury API returned ${response.status}`);
    }

    const json = await response.json();
    const rows = json.data || [];

    if (rows.length === 0) {
      throw new Error("No data returned from Treasury API");
    }

    // The most recent record_date across all rows
    const latestDate = rows[0]?.record_date || null;

    // Find each agency row — match on classification_desc
    const results = {};

    for (const [key, agencyName] of Object.entries(AGENCY_MAP)) {
      // Find the row for this agency in the most recent month
      const row = rows.find(
        (r) =>
          r.record_date === latestDate &&
          r.classification_desc?.includes(agencyName)
      );

      if (row) {
        // Values are in millions of dollars — convert to dollars
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

    // Calculate year-over-year increase for DHS (immigration enforcement surge)
    const dhsYoYIncrease =
      results.dhs?.currentFiscalYearToDate && results.dhs?.priorFiscalYearToDate
        ? results.dhs.currentFiscalYearToDate - results.dhs.priorFiscalYearToDate
        : null;

    return res.status(200).json({
      success: true,
      asOf: latestDate,
      fetchedAt: new Date().toISOString(),
      agencies: results,
      computed: {
        // How much MORE DHS is spending vs same period last year (the Trump enforcement surge)
        dhsEnforcementSurge: dhsYoYIncrease,
      },
      note: "Values are actual outlays (money paid out) in USD. Source: US Treasury MTS Table 5.",
    });

  } catch (error) {
    console.error("Treasury API error:", error.message);

    // Return a graceful fallback so the frontend never breaks
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
}
