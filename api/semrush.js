// Vercel Serverless — Proxy SEMrush API
// Analyse de domaine : trafic, mots-clés, autorité, pub

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.SEMRUSH_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'SEMRUSH_API_KEY not configured' });

  try {
    const { domain, database } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain required' });

    const db = database || 'fr';
    const cleanDomain = domain.replace(/https?:\/\//,'').replace(/\/.*/,'').replace(/^www\./,'');
    const results = {};

    // 1. Domain Overview — traffic, keywords, authority
    try {
      const url = `https://api.semrush.com/?type=domain_ranks&key=${API_KEY}&export_columns=Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${cleanDomain}&database=${db}`;
      const r = await fetch(url);
      const text = await r.text();
      if (!text.includes('ERROR')) {
        const lines = text.trim().split('\n');
        if (lines.length >= 2) {
          const headers = lines[0].split(';');
          const values = lines[1].split(';');
          const data = {};
          headers.forEach((h, i) => { data[h.trim()] = values[i]?.trim() || ''; });
          results.overview = {
            domain: data['Domain'] || cleanDomain,
            authorityScore: parseInt(data['Authority Score']) || 0,
            organicKeywords: parseInt(data['Organic Keywords']) || 0,
            organicTraffic: parseInt(data['Organic Traffic']) || 0,
            organicCost: parseFloat(data['Organic Cost']) || 0,
            paidKeywords: parseInt(data['Adwords Keywords']) || 0,
            paidTraffic: parseInt(data['Adwords Traffic']) || 0,
            paidCost: parseFloat(data['Adwords Cost']) || 0,
          };
        }
      }
    } catch {}

    // 2. Domain organic keywords (top 10)
    try {
      const url = `https://api.semrush.com/?type=domain_organic&key=${API_KEY}&export_columns=Ph,Po,Nq,Cp,Ur,Tr&domain=${cleanDomain}&database=${db}&display_limit=10&display_sort=tr_desc`;
      const r = await fetch(url);
      const text = await r.text();
      if (!text.includes('ERROR')) {
        const lines = text.trim().split('\n');
        if (lines.length >= 2) {
          const headers = lines[0].split(';').map(h => h.trim());
          results.topKeywords = lines.slice(1).map(line => {
            const vals = line.split(';');
            return {
              keyword: vals[0]?.trim() || '',
              position: parseInt(vals[1]) || 0,
              searchVolume: parseInt(vals[2]) || 0,
              cpc: parseFloat(vals[3]) || 0,
              url: vals[4]?.trim() || '',
              trafficPercent: parseFloat(vals[5]) || 0,
            };
          });
        }
      }
    } catch {}

    // 3. Traffic history (last 12 months)
    try {
      const url = `https://api.semrush.com/?type=domain_organic_organic&key=${API_KEY}&export_columns=Dt,Or,Ot&domain=${cleanDomain}&database=${db}&display_limit=12&display_sort=dt_desc`;
      const r = await fetch(url);
      const text = await r.text();
      if (!text.includes('ERROR')) {
        const lines = text.trim().split('\n');
        if (lines.length >= 2) {
          results.trafficHistory = lines.slice(1).map(line => {
            const vals = line.split(';');
            return {
              date: vals[0]?.trim() || '',
              keywords: parseInt(vals[1]) || 0,
              traffic: parseInt(vals[2]) || 0,
            };
          });
        }
      }
    } catch {}

    // 4. Competitors
    try {
      const url = `https://api.semrush.com/?type=domain_organic_organic&key=${API_KEY}&export_columns=Dn,Np,Or,Ot,Oc&domain=${cleanDomain}&database=${db}&display_limit=5`;
      const r = await fetch(url);
      const text = await r.text();
      if (!text.includes('ERROR')) {
        const lines = text.trim().split('\n');
        if (lines.length >= 2) {
          results.competitors = lines.slice(1).map(line => {
            const vals = line.split(';');
            return {
              domain: vals[0]?.trim() || '',
              commonKeywords: parseInt(vals[1]) || 0,
              organicKeywords: parseInt(vals[2]) || 0,
              organicTraffic: parseInt(vals[3]) || 0,
            };
          });
        }
      }
    } catch {}

    return res.status(200).json({
      domain: cleanDomain,
      ...results,
      hasData: !!results.overview,
    });
  } catch (error) {
    console.error('SEMrush proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
