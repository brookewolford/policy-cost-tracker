module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate");

  try {
    // Step 1: Fetch with NO fields filter so we get everything back
    // This lets us discover whatever field names Treasury actually uses
    const url = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_5?sort=-record_date&page[number]=1&page[size]=5";

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`Treasury API ${response.status}: ${await response.text().then(t => t.slice(0,300))}`);
    }

    const json = await response.json();
    const rows = json.data || [];

    if (rows.length === 0) {
      throw new Error("No data rows returned");
    }

    // Return the raw first row so we can see all actual field names
    return res.status(200).json({
      success: true,
      debug: true,
      message: "Field discovery mode — showing raw Treasury response",
      availableFields: Object.keys(rows[0]),
      sampleRow: rows[0],
      totalRows: json.meta?.total_count,
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
