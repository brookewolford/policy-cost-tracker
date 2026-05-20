module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate");

  try {
    const fields = "classification_desc,current_month_gross_outly_amt,current_fytd_gross_outly_amt,prior_fytd_gross_outly_amt,record_date";
    
    // Fetch page 2 this time to find Defense and DHS totals
    const url = `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?fields=${fields}&sort=-record_date&page[number]=2&page[size]=100`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(12000),
    });

    const json = await response.json();
    const rows = json.data || [];
    const latestDate = rows[0]?.record_date || null;
    const latestRows = rows.filter(r => r.record_date === latestDate);
    const rowsWithData = latestRows
      .filter(r => r.current_fytd_gross_outly_amt !== null && r.current_fytd_gross_outly_amt !== "null")
      .map(r => ({ desc: r.classification_desc, ytd: r.current_fytd_gross_outly_amt }));

    return res.status(200).json({
      success: true,
      debug: true,
      asOf: latestDate,
      page: 2,
      rowsWithData,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(200).json({ success: false, error: error.message });
  }
};
