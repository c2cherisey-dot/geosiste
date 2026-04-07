// Vercel Serverless — Google Custom Search API
// Recherche web de CBD shops — plus de résultats que Places API

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY; // Same key works for Custom Search
  const CX = process.env.GOOGLE_SEARCH_CX; // Custom Search Engine ID
  if (!API_KEY) return res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY not configured' });
  if (!CX) return res.status(500).json({ error: 'GOOGLE_SEARCH_CX not configured. Create one at programmablesearchengine.google.com' });

  try {
    const { query, country, start } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    const countryMap = { FR:'countryFR',DE:'countryDE',ES:'countryES',IT:'countryIT',NL:'countryNL',
      BE:'countryBE',CH:'countryCH',PT:'countryPT',AT:'countryAT',CZ:'countryCZ',PL:'countryPL',
      GB:'countryGB',DK:'countryDK',SE:'countrySE',IE:'countryIE',GR:'countryGR',HR:'countryHR',LU:'countryLU' };

    const params = new URLSearchParams({
      key: API_KEY, cx: CX, q: query,
      num: '10', start: (start || 1).toString(),
    });
    if (country && countryMap[country]) params.append('cr', countryMap[country]);

    const r = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
    const data = await r.json();

    if (data.error) return res.status(400).json({ error: data.error.message });

    const results = (data.items || []).map(item => {
      // Extract domain for website
      const url = item.link || '';
      const domain = url.replace(/https?:\/\//,'').split('/')[0];
      
      // Try to extract phone from snippet
      const phoneMatch = (item.snippet || '').match(/(?:\+\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}/);
      
      // Try to extract city from snippet or title
      const title = item.title || '';
      
      return {
        name: title.replace(/ - .*$/, '').replace(/ \| .*$/, '').trim(),
        website: url,
        domain,
        phone: phoneMatch ? phoneMatch[0].trim() : '',
        snippet: item.snippet || '',
        source: 'google_search',
      };
    }).filter(r => r.name && r.website);

    return res.status(200).json({
      results,
      total: data.searchInformation?.totalResults || 0,
      nextStart: (start || 1) + 10,
    });
  } catch (error) {
    console.error('Custom Search proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
