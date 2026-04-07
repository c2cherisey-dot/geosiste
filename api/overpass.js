// Vercel Serverless — OpenStreetMap Overpass API
// Recherche de CBD shops dans toute l'Europe — GRATUIT et ILLIMITÉ

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { country, city, bbox } = req.body;

    // Country bounding boxes (approximate)
    const countryBboxes = {
      FR: [41.3,-5.1,51.1,9.6], DE: [47.3,5.9,55.1,15.0], ES: [36.0,-9.3,43.8,3.3],
      IT: [36.6,6.6,47.1,18.5], NL: [50.8,3.4,53.5,7.1], BE: [49.5,2.5,51.5,6.4],
      CH: [45.8,5.9,47.8,10.5], PT: [36.9,-9.5,42.2,-6.2], AT: [46.4,9.5,49.0,17.2],
      CZ: [48.6,12.1,51.1,18.9], PL: [49.0,14.1,54.8,24.1], GB: [49.9,-8.2,60.9,1.8],
      LU: [49.4,5.7,50.2,6.5], DK: [54.6,8.1,57.8,12.7], SE: [55.3,11.1,69.1,24.2],
      IE: [51.4,-10.5,55.4,-5.9], GR: [34.8,19.4,41.8,29.6], HR: [42.4,13.5,46.6,19.4],
    };

    let area;
    if (bbox) {
      area = `(${bbox.join(',')})`;
    } else if (city) {
      // Search by city name using area
      area = `(area["name"="${city}"]->.searchArea)`;
    } else if (country && countryBboxes[country]) {
      const b = countryBboxes[country];
      area = `(${b[0]},${b[1]},${b[2]},${b[3]})`;
    } else {
      // All Europe
      area = '(34.0,-11.0,71.0,30.0)';
    }

    // Overpass query for CBD-related shops
    const isAreaQuery = area.includes('searchArea');
    const searchArea = isAreaQuery ? '(area.searchArea)' : area;
    
    const query = `
[out:json][timeout:60];
${isAreaQuery ? area + ';' : ''}
(
  node["name"~"[Cc][Bb][Dd]"]${searchArea};
  node["shop"="cannabis"]${searchArea};
  node["shop"="cbd"]${searchArea};
  node["name"~"[Cc]hanvre"]${searchArea};
  node["name"~"[Hh]emp"]${searchArea};
  node["name"~"[Cc]annabis"]${searchArea};
  way["name"~"[Cc][Bb][Dd]"]${searchArea};
  way["shop"="cannabis"]${searchArea};
  way["shop"="cbd"]${searchArea};
);
out center body qt 500;
`;

    const r = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Overpass API error: ${r.status}` });
    }

    const data = await r.json();
    const elements = data.elements || [];

    const results = elements.map(el => {
      const tags = el.tags || {};
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;
      
      return {
        name: tags.name || tags['name:fr'] || tags['name:en'] || 'CBD Shop',
        address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ') || '',
        city: tags['addr:city'] || tags['addr:municipality'] || '',
        postcode: tags['addr:postcode'] || '',
        phone: tags.phone || tags['contact:phone'] || '',
        website: tags.website || tags['contact:website'] || tags.url || '',
        email: tags.email || tags['contact:email'] || '',
        instagram: tags['contact:instagram'] || '',
        facebook: tags['contact:facebook'] || '',
        openingHours: tags.opening_hours || '',
        shopType: tags.shop || '',
        lat,
        lon,
        osmId: el.id,
        source: 'openstreetmap',
      };
    }).filter(r => r.name && r.name !== 'CBD Shop' || r.website || r.phone);

    // Dedupe by name
    const seen = new Set();
    const unique = results.filter(r => {
      const key = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.status(200).json({
      results: unique,
      total: unique.length,
      rawTotal: elements.length,
    });
  } catch (error) {
    console.error('Overpass proxy error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
