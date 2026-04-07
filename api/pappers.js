// Vercel Serverless — Proxy Pappers API
// Enrichissement entreprises françaises : SIRET, CA, dirigeant, effectif

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_KEY = process.env.PAPPERS_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'PAPPERS_API_KEY not configured' });

  try {
    const { query, siret, siren } = req.body;

    let url;
    if (siret || siren) {
      // Direct lookup by SIRET/SIREN
      const id = siret || siren;
      url = `https://api.pappers.fr/v2/entreprise?api_token=${API_KEY}&${siret ? 'siret' : 'siren'}=${id}`;
    } else if (query) {
      // Search by name
      url = `https://api.pappers.fr/v2/recherche?api_token=${API_KEY}&q=${encodeURIComponent(query)}&par_page=5`;
    } else {
      return res.status(400).json({ error: 'Provide query, siret, or siren' });
    }

    const r = await fetch(url);
    const data = await r.json();

    if (siret || siren) {
      // Single company result
      const c = data;
      return res.status(200).json({
        found: !!c.siren,
        company: c.siren ? {
          siren: c.siren,
          siret: c.siege?.siret || '',
          nom: c.nom_entreprise || c.denomination || '',
          formeJuridique: c.forme_juridique || '',
          dateCreation: c.date_creation || '',
          dirigeant: c.representants?.[0] ? `${c.representants[0].prenom || ''} ${c.representants[0].nom || ''}`.trim() : '',
          dirigeantFonction: c.representants?.[0]?.qualite || '',
          effectif: c.effectif || c.tranche_effectif || '',
          chiffreAffaires: c.derniers_comptes?.chiffre_affaires || '',
          resultat: c.derniers_comptes?.resultat || '',
          capital: c.capital || '',
          adresse: c.siege?.adresse_ligne_1 || '',
          codePostal: c.siege?.code_postal || '',
          ville: c.siege?.ville || '',
          codeNAF: c.code_naf || '',
          activite: c.libelle_code_naf || '',
          statut: c.statut_rcs || '',
        } : null,
      });
    } else {
      // Search results
      const results = (data.resultats || []).map(c => ({
        siren: c.siren,
        siret: c.siege?.siret || '',
        nom: c.nom_entreprise || c.denomination || '',
        dirigeant: c.representants?.[0] ? `${c.representants[0].prenom || ''} ${c.representants[0].nom || ''}`.trim() : '',
        ville: c.siege?.ville || '',
        codeNAF: c.code_naf || '',
        activite: c.libelle_code_naf || '',
      }));
      return res.status(200).json({ results, total: data.total || 0 });
    }
  } catch (error) {
    console.error('Pappers proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
