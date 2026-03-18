// Google Search Console connector
// Fetches keyword/page data from GSC API

export interface GSCRow {
  query: string;
  page: string;
  country: string;
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
}

export async function fetchGSCData(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  startRow = 0,
  rowLimit = 5000
): Promise<GSCRow[]> {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page', 'country', 'device', 'date'],
        rowLimit,
        startRow,
        dataState: 'final',
      }),
    }
  );

  const data = await res.json();
  if (!data.rows) return [];

  return data.rows.map((row: any) => ({
    query: row.keys[0],
    page: row.keys[1],
    country: row.keys[2],
    device: row.keys[3],
    date: row.keys[4],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}

export async function fetchGSCSites(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  return data.siteEntry || [];
}
