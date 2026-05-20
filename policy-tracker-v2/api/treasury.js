module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate");

  try {
    const fields = "classification_desc,current_month_gross_outly_amt,current_fytd_gross_outly_amt,prior_fytd_gross_outly_amt,record_date";
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?fields=${fields}&sort=-record_date&page[number]=1&page[size]=100`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Treasury API ${response.status}`);
    }

    const json = await response.json();
    const rows = json.data || [];

    if (rows.length === 0) {
      throw new Error("No data rows returned");
    }

    const latestDate = rows[0]?.record_date || null;
    const latestRows = rows.filter(r => r.record_date === latestDate);

    // Show ALL rows with their values so we can find which ones have actual data
    const allRows = latestRows.map(r => ({
      desc: r.classification_desc,
      ytd: r.current_fytd_gross_outly_amt,
      month: r.current_month_gross_outly_amt,
    }));

    // Also specifically find rows that have non-null ytd values
    const rowsWithData = allRows.filter(r => r.ytd !== null && r.ytd !== "null");

    return res.status(200).json({
      success: true,
      debug: true,
      asOf: latestDate,
      totalRows: latestRows.length,
      rowsWithData: rowsWithData,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error.message,
      fetchedAt: new Date().toISOString(),
    });
  }
};
