// Vercel Serverless — Proxy Hunter.io / Email Finder
// Trouve les emails à partir d'un nom de domaine ou d'un nom de personne

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.HUNTER_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'HUNTER_API_KEY not configured' });

  try {
    const { action, domain, company, firstName, lastName } = req.body;

    if (action === 'domain_search' && domain) {
      // Find all emails for a domain
      const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${API_KEY}`;
      const r = await fetch(url);
      const data = await r.json();
      const emails = (data.data?.emails || []).map(e => ({
        email: e.value,
        firstName: e.first_name || '',
        lastName: e.last_name || '',
        position: e.position || '',
        confidence: e.confidence || 0,
        type: e.type || '',
      }));
      return res.status(200).json({
        emails,
        pattern: data.data?.pattern || '',
        organization: data.data?.organization || '',
        total: data.meta?.results || 0,
      });
    }

    if (action === 'email_finder') {
      // Find specific person's email
      const params = new URLSearchParams({ api_key: API_KEY });
      if (domain) params.append('domain', domain);
      if (company) params.append('company', company);
      if (firstName) params.append('first_name', firstName);
      if (lastName) params.append('last_name', lastName);

      const url = `https://api.hunter.io/v2/email-finder?${params}`;
      const r = await fetch(url);
      const data = await r.json();
      return res.status(200).json({
        email: data.data?.email || '',
        confidence: data.data?.confidence || 0,
        firstName: data.data?.first_name || '',
        lastName: data.data?.last_name || '',
        position: data.data?.position || '',
      });
    }

    if (action === 'verify' && req.body.email) {
      // Verify an email
      const url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(req.body.email)}&api_key=${API_KEY}`;
      const r = await fetch(url);
      const data = await r.json();
      return res.status(200).json({
        email: data.data?.email || '',
        status: data.data?.status || 'unknown',
        score: data.data?.score || 0,
        result: data.data?.result || '',
      });
    }

    return res.status(400).json({ error: 'Unknown action. Use: domain_search, email_finder, verify' });
  } catch (error) {
    console.error('Hunter proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
