// Vercel Serverless — Proxy Google Places API
// Recherche de prospects CBD via Google Maps

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!GOOGLE_API_KEY) return res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY not configured' });

  try {
    const { query, location, radius, pageToken } = req.body;

    // Use Text Search API (new) for better results
    const params = new URLSearchParams({
      query: query || 'CBD shop',
      key: GOOGLE_API_KEY,
      language: 'fr',
    });
    if (location) params.append('location', location);
    if (radius) params.append('radius', radius.toString());
    if (pageToken) params.append('pagetoken', pageToken);

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
      return res.status(400).json({ error: searchData.status, message: searchData.error_message });
    }

    // Enrich with Place Details for phone, website, etc.
    const enriched = [];
    const places = (searchData.results || []).slice(0, 15);

    for (const place of places) {
      try {
        const detailParams = new URLSearchParams({
          place_id: place.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,types,business_status,opening_hours',
          language: 'fr',
        });
        const detailRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${detailParams}`);
        const detailData = await detailRes.json();
        const d = detailData.result || {};

        enriched.push({
          name: d.name || place.name,
          address: d.formatted_address || place.formatted_address,
          phone: d.international_phone_number || d.formatted_phone_number || '',
          website: d.website || '',
          googleMapsUrl: d.url || '',
          rating: d.rating || place.rating || 0,
          reviewCount: d.user_ratings_total || place.user_ratings_total || 0,
          types: d.types || place.types || [],
          isOpen: d.business_status === 'OPERATIONAL',
          placeId: place.place_id,
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
        });
      } catch {
        // If detail fetch fails, use basic data
        enriched.push({
          name: place.name,
          address: place.formatted_address,
          phone: '',
          website: '',
          googleMapsUrl: '',
          rating: place.rating || 0,
          reviewCount: place.user_ratings_total || 0,
          types: place.types || [],
          isOpen: place.business_status === 'OPERATIONAL',
          placeId: place.place_id,
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
        });
      }
    }

    return res.status(200).json({
      results: enriched,
      nextPageToken: searchData.next_page_token || null,
      total: enriched.length,
    });
  } catch (error) {
    console.error('Places proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
