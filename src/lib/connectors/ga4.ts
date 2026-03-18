// Google Analytics 4 connector
// Uses GA4 Data API (v1beta)

export interface GA4Row {
  date: string;
  metricType: string;
  dimensionName: string;
  dimensionValue: string;
  value: number;
}

export async function fetchGA4Data(
  accessToken: string,
  propertyId: string,
  startDate: string,
  endDate: string,
  metrics: string[],
  dimensions: string[]
): Promise<GA4Row[]> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: metrics.map(m => ({ name: m })),
        dimensions: dimensions.map(d => ({ name: d })),
        limit: 10000,
      }),
    }
  );

  const data = await res.json();
  if (!data.rows) return [];

  const results: GA4Row[] = [];
  const metricHeaders = data.metricHeaders || [];
  const dimHeaders = data.dimensionHeaders || [];

  for (const row of data.rows) {
    const dimValues = row.dimensionValues || [];
    const metricValues = row.metricValues || [];

    // Find date dimension index
    const dateIdx = dimHeaders.findIndex((h: any) => h.name === 'date');
    const date = dateIdx >= 0 ? dimValues[dateIdx]?.value : '';

    // For each non-date dimension
    for (let di = 0; di < dimHeaders.length; di++) {
      if (dimHeaders[di].name === 'date') continue;

      for (let mi = 0; mi < metricHeaders.length; mi++) {
        results.push({
          date: date ? `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}` : '',
          metricType: metricHeaders[mi].name,
          dimensionName: dimHeaders[di].name,
          dimensionValue: dimValues[di]?.value || '(not set)',
          value: parseFloat(metricValues[mi]?.value || '0'),
        });
      }
    }

    // If no non-date dimensions, just output metrics with date
    if (dimHeaders.length <= 1) {
      for (let mi = 0; mi < metricHeaders.length; mi++) {
        results.push({
          date: date ? `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}` : '',
          metricType: metricHeaders[mi].name,
          dimensionName: 'total',
          dimensionValue: 'total',
          value: parseFloat(metricValues[mi]?.value || '0'),
        });
      }
    }
  }

  return results;
}

export async function fetchGA4Properties(accessToken: string) {
  const res = await fetch(
    'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  
  const properties: { id: string; name: string; account: string }[] = [];
  for (const account of data.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      properties.push({
        id: prop.property.replace('properties/', ''),
        name: prop.displayName,
        account: account.displayName,
      });
    }
  }
  return properties;
}

// Standard report configs
export const GA4_REPORTS = {
  trafficOverview: {
    metrics: ['sessions', 'totalUsers', 'screenPageViews', 'averageSessionDuration', 'bounceRate'],
    dimensions: ['date'],
  },
  trafficSources: {
    metrics: ['sessions', 'totalUsers', 'conversions'],
    dimensions: ['date', 'sessionSource', 'sessionMedium'],
  },
  topPages: {
    metrics: ['screenPageViews', 'averageSessionDuration', 'bounceRate'],
    dimensions: ['pagePath'],
  },
  conversions: {
    metrics: ['conversions', 'totalRevenue'],
    dimensions: ['date', 'eventName'],
  },
  devices: {
    metrics: ['sessions', 'totalUsers'],
    dimensions: ['date', 'deviceCategory'],
  },
  countries: {
    metrics: ['sessions', 'totalUsers'],
    dimensions: ['country'],
  },
};
