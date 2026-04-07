import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT COMMERCIAL IA — L'ENTREPÔT DU CHANVRIER
// Version Ultra-Performance — Architecture Complète
// ═══════════════════════════════════════════════════════════════════════════════

// ─── DATA CONSTANTS ─────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷", lang: "fr", cities: ["Paris","Lyon","Marseille","Bordeaux","Toulouse","Lille","Nice","Nantes","Strasbourg","Montpellier","Rennes","Grenoble"] },
  { code: "DE", name: "Allemagne", flag: "🇩🇪", lang: "de", cities: ["Berlin","München","Hamburg","Frankfurt","Köln","Düsseldorf","Stuttgart","Leipzig","Dresden"] },
  { code: "ES", name: "Espagne", flag: "🇪🇸", lang: "es", cities: ["Madrid","Barcelona","Valencia","Sevilla","Málaga","Bilbao","Palma de Mallorca"] },
  { code: "IT", name: "Italie", flag: "🇮🇹", lang: "it", cities: ["Milano","Roma","Torino","Firenze","Napoli","Bologna","Genova"] },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱", lang: "nl", cities: ["Amsterdam","Rotterdam","Den Haag","Utrecht","Eindhoven"] },
  { code: "BE", name: "Belgique", flag: "🇧🇪", lang: "fr", cities: ["Bruxelles","Anvers","Gand","Liège","Charleroi"] },
  { code: "CH", name: "Suisse", flag: "🇨🇭", lang: "fr", cities: ["Zürich","Genève","Bern","Basel","Lausanne"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", lang: "pt", cities: ["Lisboa","Porto","Faro","Braga"] },
  { code: "AT", name: "Autriche", flag: "🇦🇹", lang: "de", cities: ["Wien","Graz","Salzburg","Linz","Innsbruck"] },
  { code: "CZ", name: "Rép. Tchèque", flag: "🇨🇿", lang: "en", cities: ["Praha","Brno","Ostrava","Plzeň"] },
  { code: "PL", name: "Pologne", flag: "🇵🇱", lang: "pl", cities: ["Warszawa","Kraków","Wrocław","Gdańsk","Poznań"] },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧", lang: "en", cities: ["London","Manchester","Birmingham","Bristol","Edinburgh","Leeds"] },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", lang: "fr", cities: ["Luxembourg","Esch-sur-Alzette"] },
  { code: "DK", name: "Danemark", flag: "🇩🇰", lang: "en", cities: ["København","Aarhus","Odense"] },
  { code: "SE", name: "Suède", flag: "🇸🇪", lang: "en", cities: ["Stockholm","Göteborg","Malmö"] },
  { code: "IE", name: "Irlande", flag: "🇮🇪", lang: "en", cities: ["Dublin","Cork","Galway"] },
  { code: "GR", name: "Grèce", flag: "🇬🇷", lang: "en", cities: ["Athènes","Thessalonique"] },
  { code: "HR", name: "Croatie", flag: "🇭🇷", lang: "en", cities: ["Zagreb","Split"] },
];

const PIPELINE = [
  { id: "discovered", label: "Découvert", color: "#6366f1", icon: "🔍", auto: true },
  { id: "qualified", label: "Qualifié", color: "#8b5cf6", icon: "✅", auto: true },
  { id: "contacted", label: "Contacté", color: "#f59e0b", icon: "📧", auto: true },
  { id: "responded", label: "Répondu", color: "#06b6d4", icon: "💬", auto: false },
  { id: "meeting", label: "RDV/Appel", color: "#ec4899", icon: "📞", auto: false },
  { id: "sample_sent", label: "Échantillon", color: "#14b8a6", icon: "📦", auto: false },
  { id: "negotiation", label: "Négociation", color: "#f97316", icon: "🤝", auto: false },
  { id: "order", label: "Commande", color: "#10b981", icon: "💰", auto: false },
  { id: "lost", label: "Perdu", color: "#64748b", icon: "❌", auto: false },
];

const PRODUCTS = [
  { cat: "Hash", icon: "🟤", items: [
    { name: "Résine CBD", price: "800-2500€/kg", margin: "40-60%", bestSeller: true },
    { name: "Résine MCP-N", price: "1200-3500€/kg", margin: "50-70%", bestSeller: true },
    { name: "Résine 10-OH-HHC", price: "1500-4000€/kg", margin: "55-75%", bestSeller: false },
    { name: "Résine CSA", price: "1800-4500€/kg", margin: "60-80%", bestSeller: false },
    { name: "Pollen CBD", price: "600-1800€/kg", margin: "35-55%", bestSeller: false },
  ]},
  { cat: "Fleurs", icon: "🌿", items: [
    { name: "Indoor Premium", price: "1500-4000€/kg", margin: "45-65%", bestSeller: true },
    { name: "Hydroponie", price: "2000-5000€/kg", margin: "50-70%", bestSeller: true },
    { name: "Greenhouse", price: "800-2000€/kg", margin: "40-55%", bestSeller: false },
    { name: "Outdoor", price: "400-1200€/kg", margin: "30-50%", bestSeller: false },
    { name: "Mini Bud", price: "500-1500€/kg", margin: "35-55%", bestSeller: false },
    { name: "Trim", price: "150-500€/kg", margin: "25-45%", bestSeller: false },
  ]},
  { cat: "Vape", icon: "💨", items: [
    { name: "Puff 0.5ml CBD", price: "3-8€/unité", margin: "60-80%", bestSeller: true },
    { name: "Pod 1ml CBD", price: "5-12€/unité", margin: "55-75%", bestSeller: true },
    { name: "Formule Explosive", price: "4-10€/unité", margin: "65-85%", bestSeller: true },
    { name: "Puff MCP-N", price: "5-12€/unité", margin: "60-80%", bestSeller: false },
  ]},
  { cat: "Extraction", icon: "🧪", items: [
    { name: "Distillat CBD", price: "3000-8000€/kg", margin: "50-70%", bestSeller: false },
    { name: "Isolat CBD 99%", price: "2500-6000€/kg", margin: "45-65%", bestSeller: false },
    { name: "Distillat CBG", price: "4000-10000€/kg", margin: "55-75%", bestSeller: false },
  ]},
  { cat: "Moonrock", icon: "🌙", items: [
    { name: "Moonrock CBD", price: "2000-5000€/kg", margin: "50-70%", bestSeller: true },
    { name: "Moonrock MCP-N", price: "2500-6000€/kg", margin: "55-75%", bestSeller: false },
  ]},
  { cat: "Huiles", icon: "💧", items: [
    { name: "Huile CBD 10%", price: "5-15€/unité", margin: "55-75%", bestSeller: false },
    { name: "Huile CBD 20%", price: "8-22€/unité", margin: "55-75%", bestSeller: false },
    { name: "Huile CBD 30%", price: "12-30€/unité", margin: "55-75%", bestSeller: false },
    { name: "Velaria Premium", price: "15-35€/unité", margin: "60-80%", bestSeller: true },
  ]},
  { cat: "Pre Rolls", icon: "🚬", items: [
    { name: "Pre Roll CBD", price: "1-4€/unité", margin: "50-70%", bestSeller: false },
    { name: "Jok'Air", price: "2-6€/unité", margin: "55-75%", bestSeller: true },
  ]},
];

const MOLECULES = ["CBD","CBG","CBN","MCP-N","10-OH-HHC","CSA"];

const CHANNELS = [
  { id: "email", label: "Email", icon: "📧", auto: true },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", auto: true },
  { id: "instagram", label: "Instagram DM", icon: "📸", auto: true },
  { id: "linkedin", label: "LinkedIn", icon: "💼", auto: false },
  { id: "phone", label: "Téléphone", icon: "📞", auto: false },
  { id: "sms", label: "SMS", icon: "📱", auto: true },
];

const PROSPECT_TYPES = ["CBD Shop","Tabac/Vape Shop","E-shop CBD","Grossiste","Franchise","Parapharmacie","Herboristerie","Magasin Bio","Head Shop","Épicerie Fine"];

const OBJECTIONS = [
  { id: "price", label: "Trop cher", response: "Tarifs dégressifs, comparaison qualité/prix, échantillons gratuits" },
  { id: "legal", label: "Inquiétude légale", response: "Conformité EU, CoA disponibles, THC <0.3%" },
  { id: "supplier", label: "A déjà un fournisseur", response: "Gamme plus large, MCP-N/CSA exclusifs, test sans engagement" },
  { id: "quality", label: "Doute sur la qualité", response: "Labo français, traçabilité totale, échantillons" },
  { id: "moq", label: "Quantité minimum", response: "Pas de MOQ, commande dès 100€" },
  { id: "delivery", label: "Délai livraison", response: "24h France, 48h Europe, Chronopost assuré" },
  { id: "notinterested", label: "Pas intéressé", response: "Relance dans 3 mois, veille marché" },
];

const SEQUENCE_TEMPLATES = [
  { id: "aggressive", name: "Séquence Agressive", steps: [
    { day: 0, channel: "email", type: "intro" },
    { day: 1, channel: "instagram", type: "connect" },
    { day: 3, channel: "email", type: "value" },
    { day: 5, channel: "whatsapp", type: "offer" },
    { day: 7, channel: "email", type: "urgency" },
    { day: 10, channel: "phone", type: "call" },
    { day: 14, channel: "email", type: "lastchance" },
  ]},
  { id: "soft", name: "Séquence Douce", steps: [
    { day: 0, channel: "email", type: "intro" },
    { day: 5, channel: "instagram", type: "connect" },
    { day: 10, channel: "email", type: "value" },
    { day: 20, channel: "email", type: "offer" },
    { day: 30, channel: "whatsapp", type: "followup" },
  ]},
  { id: "vip", name: "Séquence VIP (Grossistes)", steps: [
    { day: 0, channel: "email", type: "premium_intro" },
    { day: 2, channel: "linkedin", type: "connect" },
    { day: 4, channel: "email", type: "catalog_custom" },
    { day: 7, channel: "phone", type: "call" },
    { day: 10, channel: "email", type: "sample_offer" },
    { day: 14, channel: "whatsapp", type: "meeting" },
    { day: 21, channel: "email", type: "exclusive" },
  ]},
];

// ─── STORAGE ────────────────────────────────────────────────────────────────
// In standalone mode, use localStorage instead of window.storage
const SK = { prospects: "v2-prospects", config: "v2-config", logs: "v2-logs", stats: "v2-stats", sequences: "v2-sequences", templates: "v2-templates", competitors: "v2-competitors" };
async function load(k) {
  try {
    if (window.storage?.get) {
      const r = await window.storage.get(k);
      return r ? JSON.parse(r.value) : null;
    }
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
async function save(k, d) {
  try {
    const str = JSON.stringify(d);
    if (window.storage?.set) {
      await window.storage.set(k, str);
    } else {
      localStorage.setItem(k, str);
    }
  } catch(e) { console.error(e); }
}

// ─── AI ENGINE ──────────────────────────────────────────────────────────────
// Uses /api/claude serverless proxy (keeps API key server-side) or falls back to direct call in artifact mode
async function ai(sys, usr, json = false) {
  try {
    // Try serverless proxy first (Vercel deployment), then direct (artifact mode)
    const endpoints = ['/api/claude', 'https://api.anthropic.com/v1/messages'];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: sys,
            messages: [{ role: "user", content: usr }],
          }),
        });
        if (!res.ok) {
          lastError = `HTTP ${res.status}`;
          continue;
        }
        const d = await res.json();
        const txt = d.content?.map(b => b.text || "").join("\n") || "";
        if (json) {
          try { return JSON.parse(txt.replace(/```json|```/g, "").trim()); }
          catch { return null; }
        }
        return txt;
      } catch (e) {
        lastError = e.message;
        continue;
      }
    }
    return json ? null : `[Erreur] ${lastError}`;
  } catch (e) { return json ? null : `[Erreur] ${e.message}`; }
}

const AI_SYSTEM = `Tu es l'agent commercial IA ultra-performant de L'Entrepôt du Chanvrier, grossiste/producteur CBD français.

ENTREPRISE:
- Producteur & grossiste CBD basé en France
- Labo aux normes strictes, traçabilité totale, lots numérotés
- Matières premières 100% Union Européenne
- Livraison 24h France / 48h Europe via Chronopost assuré
- Site: www.lentrepotduchanvrier.com
- Code promo: LANCEMENT (-10%)

CATALOGUE COMPLET:
- Hash: Résine CBD, MCP-N, 10-OH-HHC, CSA, Pollen
- Fleurs: Indoor, Hydro, Greenhouse, Outdoor, Mini Bud, Trim
- Vape: Puff 0.5ml, Pod 1ml, gamme "Formule Explosive" (marque propre)
- Extraction: Distillat CBD/CBG, Isolat CBD 99%
- Moonrock: CBD, MCP-N
- Huiles: CBD 10/20/30%, gamme "Velaria" (marque propre)  
- Pre Rolls: CBD classique, gamme "Jok'Air" (marque propre)

MOLÉCULES: CBD, CBG, CBN, MCP-N, 10-OH-HHC, CSA

AVANTAGES CONCURRENTIELS:
- Production française = qualité + rapidité
- Pas de minimum de commande
- Marque blanche disponible sur toutes les gammes
- Prix dégressifs (adaptatifs selon volume)
- Capacité de production illimitée
- Toujours à la pointe des nouvelles molécules
- 3 marques propres exclusives: Formule Explosive, Velaria, Jok'Air

RÈGLES:
- Adapte la LANGUE au pays du prospect (FR/BE/CH/LU=français, DE/AT=allemand ou anglais, ES=espagnol, IT=italien, autres=anglais)
- Sois professionnel mais chaleureux, orienté résultats
- Mets en avant les marges attractives pour le revendeur
- Personnalise chaque message selon le type de prospect
- Ne mens jamais, ne surpromets pas`;

// ─── GOOGLE PLACES API — REAL PROSPECT SEARCH ──────────────────────────────
const SEARCH_QUERIES_BY_LANG = {
  fr: ["boutique CBD", "CBD shop", "magasin CBD", "tabac CBD", "vape shop CBD", "herboristerie CBD"],
  de: ["CBD Shop", "CBD Laden", "Hanfladen", "CBD Store"],
  es: ["tienda CBD", "CBD shop", "herbolario CBD"],
  it: ["negozio CBD", "CBD shop", "canapa shop"],
  en: ["CBD shop", "CBD store", "hemp shop", "vape shop CBD"],
  pt: ["loja CBD", "CBD shop"],
  nl: ["CBD winkel", "CBD shop", "hennep winkel"],
  pl: ["sklep CBD", "CBD shop"],
};

async function searchProspectsReal(country, city) {
  const countryData = COUNTRIES.find(c => c.name === country || c.code === country);
  const lang = countryData?.lang || "en";
  const queries = SEARCH_QUERIES_BY_LANG[lang] || SEARCH_QUERIES_BY_LANG.en;
  const location = city ? `${city}, ${countryData?.name || country}` : (countryData?.name || country);
  
  let allResults = [];
  
  // Try Google Places API first
  for (const q of queries.slice(0, 2)) {
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${q} ${location}`, radius: 50000 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results?.length > 0) {
          allResults.push(...data.results);
        }
      }
    } catch (e) {
      console.error('Places API error:', e);
    }
  }

  // Dedupe by name
  const seen = new Set();
  allResults = allResults.filter(r => {
    const key = r.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (allResults.length > 0) {
    // Convert Google Places format to prospect format
    return allResults.map(r => {
      // Detect type from Google types
      const types = (r.types || []).join(' ').toLowerCase();
      let prospectType = "CBD Shop";
      if (types.includes('pharmacy') || types.includes('health')) prospectType = "Parapharmacie";
      else if (types.includes('store') && types.includes('tobacco')) prospectType = "Tabac/Vape Shop";
      else if (types.includes('bar') || types.includes('cafe')) prospectType = "Head Shop";
      
      // Extract city from address
      const addressParts = (r.address || '').split(',').map(s => s.trim());
      const extractedCity = city || addressParts[1] || addressParts[0] || '';

      return {
        name: r.name,
        type: prospectType,
        city: extractedCity,
        phone: r.phone || '',
        email: '',
        website: r.website || '',
        instagram: '',
        googleMapsUrl: r.googleMapsUrl || '',
        rating: r.rating || 0,
        reviewCount: r.reviewCount || 0,
        score: Math.min(95, Math.round((r.rating || 3) * 15 + (r.reviewCount || 0) * 0.5)),
        notes: `${r.rating ? '⭐ ' + r.rating + '/5' : ''} ${r.reviewCount ? '(' + r.reviewCount + ' avis)' : ''} ${r.isOpen ? '✅ Ouvert' : ''}`.trim(),
        placeId: r.placeId,
        lat: r.lat,
        lng: r.lng,
        source: 'google_places',
      };
    });
  }

  // Fallback to AI search if Places API unavailable
  return await searchProspectsAI(country, city);
}

async function searchProspectsAI(country, city) {
  return await ai(
    `${AI_SYSTEM}\n\nTu dois trouver des prospects CBD. Réponds UNIQUEMENT en JSON valide, RIEN D'AUTRE — pas de texte avant, pas de backticks, pas de commentaires.\nFormat EXACT: [{"name":"NOM","type":"TYPE","city":"VILLE","phone":"TEL","email":"EMAIL","website":"URL","instagram":"@HANDLE","score":NOMBRE,"notes":"NOTES"}]\nGénère 8-12 prospects avec des noms RÉALISTES pour ce pays.`,
    `Trouve des boutiques/shops CBD dans ${city ? city + ", " : ""}${country}. Types: CBD shops, tabacs, e-shops, grossistes, franchises, parapharmacies.`,
    true
  ) || [];
}

// ─── GMAIL API HELPERS ──────────────────────────────────────────────────────
async function gmailAction(action, params = {}) {
  try {
    const refreshToken = localStorage.getItem('gmail_refresh_token');
    const res = await fetch('/api/gmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, refreshToken, ...params }),
    });
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

async function sendRealEmail(to, subject, htmlBody) {
  return await gmailAction('send', { to, subject, htmlBody });
}

async function checkReplies(query) {
  return await gmailAction('list', { query, maxResults: 20 });
}

async function getGmailProfile() {
  return await gmailAction('profile');
}

async function qualifyProspect(prospect) {
  return await ai(
    `${AI_SYSTEM}\n\nAnalyse ce prospect et qualifie-le. JSON uniquement:\n{"score":1-100,"priority":"hot|warm|cold","size_estimate":"small|medium|large","estimated_monthly_volume":"...","recommended_products":[{"name":"...","reason":"..."}],"best_channel":"email|whatsapp|instagram|linkedin|phone","best_time":"...","approach_strategy":"...","objection_risks":["..."],"competitor_risk":"low|medium|high","upsell_potential":"...","lifetime_value_estimate":"...","talking_points":["..."],"red_flags":["..."]}`,
    `Qualifie: ${prospect.name} (${prospect.type}) à ${prospect.city}, ${prospect.country}. ${prospect.notes || ""} ${prospect.specialties ? "Spécialités: " + prospect.specialties.join(", ") : ""}`,
    true
  );
}

async function generateMessage(prospect, channel, stage, context) {
  const langMap = { FR: "français", DE: "allemand", ES: "espagnol", IT: "italien", PT: "portugais", NL: "anglais", BE: "français", CH: "français", LU: "français", AT: "allemand" };
  const lang = langMap[prospect.country] || "anglais";
  return await ai(AI_SYSTEM,
    `Rédige un message ${channel} de ${stage} en ${lang} pour:
${prospect.name} (${prospect.type}) — ${prospect.city}, ${prospect.country}
${prospect.qualification?.recommended_products ? "Produits recommandés: " + prospect.qualification.recommended_products.map(p=>p.name).join(", ") : ""}
${prospect.qualification?.talking_points ? "Points d'accroche: " + prospect.qualification.talking_points.join(", ") : ""}
${context || ""}
${channel === "whatsapp" || channel === "sms" ? "MESSAGE COURT (max 300 caractères)" : ""}
${channel === "instagram" ? "MESSAGE DM INSTAGRAM court et accrocheur" : ""}
${stage === "followup" ? "C'est une RELANCE, réfère-toi au premier contact." : ""}
${stage === "objection" ? "Le prospect a émis une objection. Réponds-y avec tact." : ""}
${stage === "sample" ? "Propose l'envoi d'ÉCHANTILLONS GRATUITS." : ""}
${stage === "closing" ? "C'est un message de CLOSING. Crée l'urgence." : ""}`
  );
}

async function handleObjection(prospect, objection) {
  return await ai(AI_SYSTEM,
    `Le prospect ${prospect.name} (${prospect.type}, ${prospect.city}) a l'objection suivante: "${objection}".
Rédige une réponse convaincante qui surmonte cette objection.
Utilise des faits concrets, des chiffres, et propose une action concrète (échantillon, appel, promo).`
  );
}

async function analyzeCompetitor(competitor) {
  return await ai(
    `Tu es un analyste concurrentiel expert du marché CBD européen.`,
    `Analyse ce concurrent de L'Entrepôt du Chanvrier et identifie nos avantages:
Concurrent: ${competitor}
Donne: forces, faiblesses, nos avantages vs eux, arguments de vente à utiliser.
JSON: {"name":"...","strengths":["..."],"weaknesses":["..."],"our_advantages":["..."],"counter_arguments":["..."],"threat_level":"low|medium|high"}`,
    true
  );
}

async function forecastRevenue(prospects) {
  const summary = prospects.slice(0, 20).map(p => `${p.name}(${p.stage},score:${p.score||50})`).join(", ");
  return await ai(
    `Tu es un analyste commercial. Estime les revenus prévisionnels. JSON uniquement.`,
    `Pipeline: ${summary}\nTotal prospects: ${prospects.length}\nPar stade: ${JSON.stringify(PIPELINE.map(s => ({ stage: s.label, count: prospects.filter(p => p.stage === s.id).length })))}\n\nDonne: {"monthly_forecast":"...","quarterly_forecast":"...","conversion_rates":{"discovered_to_qualified":"...%","qualified_to_contacted":"...%","contacted_to_order":"...%"},"top_opportunities":[{"name":"...","potential":"..."}],"recommendations":["..."],"risk_factors":["..."]}`,
    true
  );
}

async function generateABVariant(prospect, channel) {
  return await ai(
    `${AI_SYSTEM}\n\nGénère 2 variantes A/B d'un message de prospection. JSON:\n{"variant_a":{"subject":"...","body":"...","tone":"...","hook":"..."},"variant_b":{"subject":"...","body":"...","tone":"...","hook":"..."}}`,
    `Prospect: ${prospect.name} (${prospect.type}), ${prospect.city}, ${prospect.country}. Canal: ${channel}. Crée 2 approches radicalement différentes.`,
    true
  );
}

// ─── RENDER HELPER COMPONENTS (stable, outside main component) ──────────
const PriorityBadge = ({ p }) => {
  if (!p) return null;
  const colors = { hot: ["#ef4444","rgba(239,68,68,0.15)"], warm: ["#f59e0b","rgba(245,158,11,0.15)"], cold: ["#64748b","rgba(100,116,139,0.15)"] };
  const [c, bg] = colors[p] || colors.cold;
  return <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, color: c, background: bg, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p === "hot" ? "🔥 HOT" : p === "warm" ? "🌤️ WARM" : "❄️ COLD"}</span>;
};

const ScoreRing = ({ score, size = 36 }) => {
  const pct = (score || 0) / 100;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const r = size / 2 - 3;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size > 30 ? 11 : 8} fontWeight={700} style={{ transform: "rotate(90deg)", transformOrigin: "center", fontFamily: "'JetBrains Mono', monospace" }}>{score || 0}</text>
    </svg>
  );
};

const LoadingDots = () => (
  <span style={{ display: "inline-flex", gap: 3 }}>
    {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", animation: `pulse 1.2s ${i*0.2}s infinite` }} />)}
  </span>
);

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function UltraAgent() {
  // State
  const [view, setView] = useState("dashboard");
  const [prospects, setProspects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState("");
  const [selected, setSelected] = useState(null);
  const [aiOutput, setAiOutput] = useState("");
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog] = useState([]);
  const agentRef = useRef({ running: false });
  const [searchForm, setSearchForm] = useState({ country: "FR", city: "" });
  const [filters, setFilters] = useState({ stage: "all", country: "all", type: "all", priority: "all", search: "" });
  const [forecast, setForecast] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [abTest, setAbTest] = useState(null);
  const [modalTab, setModalTab] = useState("info");
  const [competitorInput, setCompetitorInput] = useState("");
  const [objectionInput, setObjectionInput] = useState("");
  const [sequences, setSequences] = useState({});
  const [ready, setReady] = useState(false);
  const [bulkSelect, setBulkSelect] = useState(new Set());
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  // Init
  useEffect(() => {
    (async () => {
      const [p, l, c, s] = await Promise.all([load(SK.prospects), load(SK.logs), load(SK.competitors), load(SK.sequences)]);
      if (p) setProspects(p);
      if (l) setLogs(l);
      if (c) setCompetitors(c);
      if (s) setSequences(s);
      // Check Gmail connection
      const gmailToken = localStorage.getItem('gmail_refresh_token');
      if (gmailToken) {
        try {
          const profile = await getGmailProfile();
          if (profile.emailAddress) {
            setGmailConnected(true);
            setGmailEmail(profile.emailAddress);
          }
        } catch {}
      }
      // Handle OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      if (authCode) {
        const tokenData = await gmailAction('exchange_token', { code: authCode });
        if (tokenData.refreshToken) {
          localStorage.setItem('gmail_refresh_token', tokenData.refreshToken);
          setGmailConnected(true);
          window.history.replaceState({}, '', window.location.pathname);
          const profile = await getGmailProfile();
          if (profile.emailAddress) setGmailEmail(profile.emailAddress);
        }
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) save(SK.prospects, prospects); }, [prospects, ready]);
  useEffect(() => { if (ready) save(SK.logs, logs); }, [logs, ready]);
  useEffect(() => { if (ready) save(SK.competitors, competitors); }, [competitors, ready]);

  const log = useCallback((type, msg) => {
    const e = { id: Date.now() + Math.random(), type, msg, t: new Date().toLocaleString("fr-FR") };
    setLogs(prev => [e, ...prev].slice(0, 500));
    setAgentLog(prev => [e, ...prev].slice(0, 100));
  }, []);

  const updateProspect = useCallback((id, updates) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setSelected(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  }, []);

  // ─── FILTERED / COMPUTED ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return prospects.filter(p => {
      if (filters.stage !== "all" && p.stage !== filters.stage) return false;
      if (filters.country !== "all" && p.country !== filters.country) return false;
      if (filters.type !== "all" && p.type !== filters.type) return false;
      if (filters.priority !== "all" && p.qualification?.priority !== filters.priority) return false;
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.city?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [prospects, filters]);

  const stats = useMemo(() => {
    const byStage = PIPELINE.map(s => ({ ...s, count: prospects.filter(p => p.stage === s.id).length }));
    const byCountry = COUNTRIES.map(c => ({ ...c, count: prospects.filter(p => p.country === c.code).length })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
    const hotLeads = prospects.filter(p => p.qualification?.priority === "hot").length;
    const warmLeads = prospects.filter(p => p.qualification?.priority === "warm").length;
    const qualified = prospects.filter(p => p.qualification).length;
    const contacted = prospects.filter(p => ["contacted","responded","meeting","sample_sent","negotiation","order"].includes(p.stage)).length;
    const orders = prospects.filter(p => p.stage === "order").length;
    const convRate = prospects.length > 0 ? ((orders / prospects.length) * 100).toFixed(1) : 0;
    const avgScore = prospects.length > 0 ? Math.round(prospects.reduce((a, p) => a + (p.score || 0), 0) / prospects.length) : 0;
    const interactionCount = prospects.reduce((a, p) => a + (p.interactions?.length || 0), 0);
    const todayProspects = prospects.filter(p => p.addedAt && new Date(p.addedAt).toDateString() === new Date().toDateString()).length;
    return { byStage, byCountry, hotLeads, warmLeads, qualified, contacted, orders, convRate, avgScore, total: prospects.length, interactionCount, todayProspects };
  }, [prospects]);

  // ─── ACTIONS ──────────────────────────────────────────────────────────────
  const doSearch = async () => {
    setLoading("search");
    const c = COUNTRIES.find(x => x.code === searchForm.country);
    log("🔍", `Recherche: ${searchForm.city ? searchForm.city + ", " : ""}${c.name}`);
    const results = await searchProspectsReal(c.name, searchForm.city);
    if (Array.isArray(results)) {
      const news = results.map(r => ({
        ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
        stage: "discovered", country: c.code, countryName: c.name, flag: c.flag,
        addedAt: new Date().toISOString(), interactions: [], score: r.score || 50,
      }));
      setProspects(prev => {
        const existing = new Set(prev.map(p => p.name.toLowerCase()));
        const unique = news.filter(n => !existing.has(n.name.toLowerCase()));
        return [...prev, ...unique];
      });
      log("✅", `${news.length} prospects ajoutés`);
    }
    setLoading("");
  };

  const doQualify = async (p) => {
    setLoading(`qualify-${p.id}`);
    log("🧠", `Qualification: ${p.name}`);
    const q = await qualifyProspect(p);
    if (q) {
      updateProspect(p.id, { qualification: q, score: q.score, stage: p.stage === "discovered" ? "qualified" : p.stage });
      log("✅", `${p.name}: Score ${q.score}, Priorité ${q.priority}`);
    }
    setLoading("");
  };

  const doMessage = async (p, channel, stage, ctx) => {
    setLoading(`msg-${p.id}`);
    const msg = await generateMessage(p, channel, stage, ctx);
    setAiOutput(msg);
    const inter = { type: channel, stage, date: new Date().toISOString(), content: msg };
    setProspects(prev => prev.map(x => x.id === p.id ? {
      ...x,
      interactions: [...(x.interactions || []), inter],
      stage: x.stage === "qualified" || x.stage === "discovered" ? "contacted" : x.stage,
      lastContact: new Date().toISOString(),
    } : x));
    setSelected(prev => prev?.id === p.id ? {
      ...prev,
      interactions: [...(prev.interactions || []), inter],
      stage: prev.stage === "qualified" || prev.stage === "discovered" ? "contacted" : prev.stage,
      lastContact: new Date().toISOString(),
    } : prev);
    log("📧", `Message ${channel} pour ${p.name}`);
    setLoading("");
  };

  const doObjection = async (p, obj) => {
    setLoading(`obj-${p.id}`);
    const response = await handleObjection(p, obj);
    setAiOutput(response);
    const inter = { type: "objection_response", date: new Date().toISOString(), content: response, objection: obj };
    setProspects(prev => prev.map(x => x.id === p.id ? {
      ...x, interactions: [...(x.interactions || []), inter],
    } : x));
    setSelected(prev => prev?.id === p.id ? {
      ...prev, interactions: [...(prev.interactions || []), inter],
    } : prev);
    setLoading("");
  };

  const doABTest = async (p, channel) => {
    setLoading(`ab-${p.id}`);
    const variants = await generateABVariant(p, channel);
    setAbTest(variants);
    setLoading("");
  };

  const doForecast = async () => {
    setLoading("forecast");
    const f = await forecastRevenue(prospects);
    setForecast(f);
    setLoading("");
  };

  const addCompetitor = async (name) => {
    setLoading("competitor");
    const analysis = await analyzeCompetitor(name);
    if (analysis) setCompetitors(prev => [...prev, { ...analysis, id: Date.now() }]);
    setLoading("");
  };

  // ─── AUTONOMOUS AGENT (STEP BY STEP) ───────────────────────────────────
  const runAgentStep = async (stepId, options = {}) => {
    agentRef.current.running = true;
    setAgentRunning(true);
    const countries = options.countries || COUNTRIES.slice(0, 8);
    const citiesPerCountry = options.citiesPerCountry || 3;

    if (stepId === "scan" || stepId === "all") {
      log("🌍", "ÉTAPE 1 — Scan des marchés européens");
      for (const country of countries) {
        if (!agentRef.current.running) break;
        const topCities = country.cities.slice(0, citiesPerCountry);
        for (const city of topCities) {
          if (!agentRef.current.running) break;
          log("🔍", `Scan: ${city}, ${country.name}`);
          const results = await searchProspectsReal(country.name, city);
          if (Array.isArray(results) && results.length > 0) {
            const news = results.map(r => ({
              ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
              stage: "discovered", country: country.code, countryName: country.name, flag: country.flag,
              addedAt: new Date().toISOString(), interactions: [], score: r.score || 50,
            }));
            setProspects(prev => {
              const existing = new Set(prev.map(p => p.name.toLowerCase()));
              return [...prev, ...news.filter(n => !existing.has(n.name.toLowerCase()))];
            });
            log("✅", `+${results.length} prospects à ${city}`);
            await new Promise(r => setTimeout(r, 50));
          }
        }
      }
      log("🏁", "Scan terminé !");
    }

    if (stepId === "qualify" || stepId === "all") {
      log("🧠", "ÉTAPE 2 — Qualification IA des prospects");
      const toQualifyP = new Promise(resolve => {
        setProspects(cur => { resolve(cur.filter(p => !p.qualification && p.stage === "discovered").slice(0, options.maxQualify || 20)); return cur; });
      });
      const toQualify = await toQualifyP;
      let done = 0;
      for (const p of toQualify) {
        if (!agentRef.current.running) break;
        done++;
        log("🧠", `Qualification ${done}/${toQualify.length}: ${p.name}`);
        const q = await qualifyProspect(p);
        if (q) {
          setProspects(prev => prev.map(x => x.id === p.id ? { ...x, qualification: q, score: q.score, stage: "qualified" } : x));
          log("📊", `${p.name}: ${q.priority} (${q.score}/100)`);
          await new Promise(r => setTimeout(r, 50));
        }
      }
      log("🏁", `Qualification terminée ! ${done} prospects qualifiés`);
    }

    if (stepId === "outreach" || stepId === "all") {
      log("📧", "ÉTAPE 3 — Prospection multi-canal");
      const toContactP = new Promise(resolve => {
        setProspects(cur => {
          resolve(cur.filter(p => p.qualification?.priority !== "cold" && (p.stage === "qualified" || p.stage === "discovered") && (p.score || 0) >= 40).slice(0, options.maxOutreach || 10));
          return cur;
        });
      });
      const toContact = await toContactP;
      let done = 0;
      for (const p of toContact) {
        if (!agentRef.current.running) break;
        done++;
        const ch = p.qualification?.best_channel || "email";
        log("📧", `Outreach ${done}/${toContact.length}: ${p.name} via ${ch}`);
        const msg = await generateMessage(p, ch, "intro", "");
        setProspects(prev => prev.map(x => x.id === p.id ? {
          ...x, stage: "contacted", lastContact: new Date().toISOString(),
          interactions: [...(x.interactions || []), { type: ch, stage: "intro", date: new Date().toISOString(), content: msg }],
        } : x));
        log("✉️", `→ ${p.name} via ${ch}`);
        await new Promise(r => setTimeout(r, 50));
      }
      log("🏁", `Outreach terminé ! ${done} prospects contactés`);
    }

    if (stepId === "followup" || stepId === "all") {
      log("🔄", "ÉTAPE 4 — Relances automatiques");
      const followP = new Promise(resolve => {
        setProspects(cur => {
          resolve(cur.filter(p => {
            if (p.stage !== "contacted") return false;
            const lc = p.lastContact ? new Date(p.lastContact) : null;
            if (!lc) return true;
            return (Date.now() - lc.getTime()) / (1000*60*60*24) >= 3;
          }).slice(0, options.maxFollowup || 10));
          return cur;
        });
      });
      const toFollow = await followP;
      let done = 0;
      for (const p of toFollow) {
        if (!agentRef.current.running) break;
        done++;
        log("🔄", `Relance ${done}/${toFollow.length}: ${p.name}`);
        const msg = await generateMessage(p, "email", "followup", "Relance après premier contact sans réponse.");
        setProspects(prev => prev.map(x => x.id === p.id ? {
          ...x, interactions: [...(x.interactions || []), { type: "email", stage: "followup", date: new Date().toISOString(), content: msg }],
          lastContact: new Date().toISOString(),
        } : x));
        log("✉️", `Relance envoyée: ${p.name}`);
        await new Promise(r => setTimeout(r, 50));
      }
      log("🏁", `Relances terminées ! ${done} relances`);
    }

    agentRef.current.running = false;
    setAgentRunning(false);
    log("🏁", `Agent terminé — Étape: ${stepId}`);
  };

  const stopAgent = () => { agentRef.current.running = false; setAgentRunning(false); log("⏹️", "Agent arrêté"); };
  const runFullAgent = () => { setAgentLog([]); runAgentStep("all"); };

  // ─── BULK ACTIONS ─────────────────────────────────────────────────────────
  const bulkQualify = async () => {
    const ids = [...bulkSelect];
    for (const id of ids) {
      let prospect = null;
      setProspects(current => { prospect = current.find(x => x.id === id); return current; });
      await new Promise(r => setTimeout(r, 0)); // flush
      if (prospect) await doQualify(prospect);
    }
    setBulkSelect(new Set());
  };

  const bulkDelete = () => {
    setProspects(prev => prev.filter(p => !bulkSelect.has(p.id)));
    setBulkSelect(new Set());
  };

  const bulkMove = (stage) => {
    setProspects(prev => prev.map(p => bulkSelect.has(p.id) ? { ...p, stage } : p));
    setBulkSelect(new Set());
  };

  // ─── GMAIL CONNECT & SEND ───────────────────────────────────────────────
  const connectGmail = async () => {
    const data = await gmailAction('auth_url');
    if (data.authUrl) window.location.href = data.authUrl;
  };

  const disconnectGmail = () => {
    localStorage.removeItem('gmail_refresh_token');
    setGmailConnected(false);
    setGmailEmail("");
    log("📧", "Gmail déconnecté");
  };

  const sendEmailReal = async (prospect, subject, body) => {
    if (!prospect.email) {
      setEmailStatus("❌ Pas d'email pour ce prospect");
      return false;
    }
    if (!gmailConnected) {
      setEmailStatus("❌ Gmail non connecté");
      return false;
    }
    setSendingEmail(true);
    setEmailStatus("📧 Envoi en cours...");
    const htmlBody = body.replace(/\n/g, '<br/>');
    const result = await sendRealEmail(prospect.email, subject, htmlBody);
    setSendingEmail(false);
    if (result.success) {
      setEmailStatus(`✅ Email envoyé à ${prospect.email}`);
      log("📧", `Email ENVOYÉ à ${prospect.name} (${prospect.email})`);
      updateProspect(prospect.id, {
        interactions: [...(prospect.interactions || []), { type: "email_sent", date: new Date().toISOString(), content: body, subject, messageId: result.messageId, threadId: result.threadId }],
        lastContact: new Date().toISOString(),
        stage: prospect.stage === "discovered" || prospect.stage === "qualified" ? "contacted" : prospect.stage,
      });
      return true;
    } else {
      setEmailStatus(`❌ Erreur: ${result.error || 'Échec envoi'}`);
      return false;
    }
  };

  const checkProspectReplies = async () => {
    if (!gmailConnected) return;
    log("📧", "Vérification des réponses Gmail...");
    const contacted = prospects.filter(p => p.email && p.stage === "contacted");
    for (const p of contacted.slice(0, 20)) {
      const replies = await checkReplies(`from:${p.email} is:inbox`);
      if (replies.messages?.length > 0) {
        updateProspect(p.id, { stage: "responded" });
        log("💬", `Réponse reçue de ${p.name} !`);
      }
    }
    log("✅", "Vérification terminée");
  };

  // ─── EXPORT ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Nom","Type","Ville","Pays","Score","Stade","Téléphone","Email","Site","Instagram","Priorité","Dernier Contact"];
    const rows = filtered.map(p => [
      p.name, p.type, p.city, p.countryName, p.score || "", PIPELINE.find(s => s.id === p.stage)?.label,
      p.phone || "", p.email || "", p.website || "", p.instagram || "",
      p.qualification?.priority || "", p.lastContact ? new Date(p.lastContact).toLocaleDateString("fr-FR") : "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `prospects_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── ADD MANUAL PROSPECT ──────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProspect, setNewProspect] = useState({ name: "", type: "CBD Shop", city: "", country: "FR", phone: "", email: "", website: "", instagram: "", notes: "" });

  const addManualProspect = () => {
    if (!newProspect.name.trim()) return;
    const c = COUNTRIES.find(x => x.code === newProspect.country);
    const p = {
      ...newProspect,
      id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
      stage: "discovered",
      countryName: c?.name || newProspect.country,
      flag: c?.flag || "🏳️",
      addedAt: new Date().toISOString(),
      interactions: [],
      score: 50,
    };
    setProspects(prev => [...prev, p]);
    setNewProspect({ name: "", type: "CBD Shop", city: "", country: "FR", phone: "", email: "", website: "", instagram: "", notes: "" });
    setShowAddModal(false);
    log("➕", `Prospect ajouté manuellement: ${p.name}`);
  };

  // ─── IMPORT CSV / JSON ────────────────────────────────────────────────────
  const importFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let imported = [];

        if (file.name.endsWith(".json")) {
          // JSON import
          const data = JSON.parse(text);
          imported = (Array.isArray(data) ? data : [data]).map(r => ({
            name: r.name || r.nom || r.Nom || "",
            type: r.type || r.Type || "CBD Shop",
            city: r.city || r.ville || r.Ville || "",
            country: r.country || r.pays || r.Pays || "FR",
            phone: r.phone || r.telephone || r.Telephone || r.tel || "",
            email: r.email || r.Email || r.mail || "",
            website: r.website || r.site || r.Site || "",
            instagram: r.instagram || r.Instagram || r.insta || "",
            notes: r.notes || r.Notes || "",
            score: r.score || 50,
          }));
        } else {
          // CSV import
          const lines = text.split("\n").filter(l => l.trim());
          if (lines.length < 2) return;
          const headers = lines[0].split(/[,;]/).map(h => h.replace(/"/g, "").trim().toLowerCase());
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(/[,;]/).map(v => v.replace(/"/g, "").trim());
            const row = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
            imported.push({
              name: row.nom || row.name || row.entreprise || row.societe || "",
              type: row.type || "CBD Shop",
              city: row.ville || row.city || "",
              country: row.pays || row.country || "FR",
              phone: row.telephone || row.phone || row.tel || "",
              email: row.email || row.mail || "",
              website: row.site || row.website || row.url || "",
              instagram: row.instagram || row.insta || "",
              notes: row.notes || row.commentaire || "",
              score: parseInt(row.score) || 50,
            });
          }
        }

        // Add to prospects with dedup
        const news = imported.filter(r => r.name).map(r => {
          const c = COUNTRIES.find(x => x.code === r.country || x.name.toLowerCase() === r.country.toLowerCase());
          return {
            ...r,
            id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
            stage: "discovered",
            country: c?.code || r.country,
            countryName: c?.name || r.country,
            flag: c?.flag || "🏳️",
            addedAt: new Date().toISOString(),
            interactions: [],
          };
        });

        setProspects(prev => {
          const existing = new Set(prev.map(p => p.name.toLowerCase()));
          const unique = news.filter(n => !existing.has(n.name.toLowerCase()));
          return [...prev, ...unique];
        });

        log("📥", `${news.length} prospects importés depuis ${file.name}`);
      } catch (err) {
        log("❌", `Erreur import: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ─── RENDER HELPERS (stable references via useCallback) ────────────────
  // Note: PriorityBadge and ScoreRing defined outside component below

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#06080d", color: "#d1d5db", fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideR{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(99,102,241,.2)}50%{box-shadow:0 0 24px rgba(99,102,241,.5)}}
        .g-card{background:rgba(12,15,24,.85);border:1px solid rgba(99,102,241,.08);border-radius:14px;padding:20px;backdrop-filter:blur(16px);animation:fadeUp .35s ease}
        .g-card:hover{border-color:rgba(99,102,241,.18)}
        .g-btn{padding:9px 18px;border-radius:9px;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
        .g-btn:active{transform:scale(.97)}
        .g-primary{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}
        .g-primary:hover{box-shadow:0 4px 20px rgba(99,102,241,.35)}
        .g-success{background:linear-gradient(135deg,#059669,#10b981);color:#fff}
        .g-danger{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff}
        .g-ghost{background:transparent;border:1px solid rgba(99,102,241,.2);color:#a5b4fc}
        .g-ghost:hover{background:rgba(99,102,241,.08)}
        .g-input{padding:9px 13px;border-radius:9px;border:1px solid rgba(99,102,241,.15);background:rgba(8,10,18,.9);color:#d1d5db;font-size:12px;font-family:inherit;outline:none;width:100%}
        .g-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.12)}
        .g-select{padding:9px 13px;border-radius:9px;border:1px solid rgba(99,102,241,.15);background:rgba(8,10,18,.9);color:#d1d5db;font-size:12px;font-family:inherit;outline:none;appearance:auto}
        .g-tag{display:inline-flex;align-items:center;padding:3px 9px;border-radius:16px;font-size:10px;font-weight:600}
        .g-grid{display:grid;gap:12px}
        *{scrollbar-width:thin;scrollbar-color:rgba(99,102,241,.2) transparent}
        .nav-item{padding:10px 16px;border-radius:9px;border:none;cursor:pointer;font-size:12px;font-weight:500;font-family:inherit;transition:all .15s;display:flex;align-items:center;gap:7px;white-space:nowrap}
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header style={{ background: "rgba(6,8,13,.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(99,102,241,.08)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1500, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>Geosiste Agent</div>
              <div style={{ fontSize: 9, color: "#6366f1", fontFamily: "'JetBrains Mono'", letterSpacing: ".08em", textTransform: "uppercase" }}>L'Entrepôt du Chanvrier</div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 2, background: "rgba(15,18,30,.6)", padding: 3, borderRadius: 11 }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "search", label: "Prospection", icon: "🔍" },
              { id: "pipeline", label: "Pipeline", icon: "📈" },
              { id: "prospects", label: "Prospects", icon: "👥" },
              { id: "agent", label: "Agent Auto", icon: "🤖" },
              { id: "intel", label: "Intelligence", icon: "🧠" },
              { id: "catalog", label: "Catalogue", icon: "📦" },
              { id: "logs", label: "Logs", icon: "📋" },
            ].map(t => (
              <button key={t.id} className="nav-item" onClick={() => setView(t.id)} style={{
                background: view === t.id ? "rgba(99,102,241,.15)" : "transparent",
                color: view === t.id ? "#a5b4fc" : "#64748b",
              }}>{t.icon}<span style={{ fontSize: 11 }}>{t.label}</span></button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {gmailConnected ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#10b981", fontFamily: "'JetBrains Mono'" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />📧 {gmailEmail.split('@')[0]}
              </span>
            ) : (
              <button className="g-btn g-ghost" onClick={connectGmail} style={{ fontSize: 10, padding: "4px 10px" }}>📧 Connecter Gmail</button>
            )}
            {agentRunning && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#10b981", fontFamily: "'JetBrains Mono'" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite" }} />AGENT ACTIF
            </span>}
            <button className="g-btn" onClick={agentRunning ? stopAgent : runFullAgent} style={{
              background: agentRunning ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#059669,#10b981)",
              color: "#fff", boxShadow: agentRunning ? "0 0 20px rgba(239,68,68,.25)" : "0 0 20px rgba(16,185,129,.25)",
              animation: agentRunning ? "glow 2s infinite" : "none",
            }}>{agentRunning ? "⏹ Stop" : "▶ Agent"}</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1500, margin: "0 auto", padding: "20px 20px 80px" }}>

        {/* ═══ DASHBOARD ═══════════════════════════════════════════════════════ */}
        {view === "dashboard" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            {/* KPI Row 1 */}
            <div className="g-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", marginBottom: 16 }}>
              {[
                { label: "Total Prospects", value: stats.total, color: "#a5b4fc", icon: "👥" },
                { label: "Aujourd'hui", value: stats.todayProspects, color: "#818cf8", icon: "📅" },
                { label: "Qualifiés", value: stats.qualified, color: "#8b5cf6", icon: "✅" },
                { label: "Contactés", value: stats.contacted, color: "#f59e0b", icon: "📧" },
                { label: "🔥 Hot Leads", value: stats.hotLeads, color: "#ef4444", icon: "" },
                { label: "🌤️ Warm", value: stats.warmLeads, color: "#f59e0b", icon: "" },
                { label: "Commandes", value: stats.orders, color: "#10b981", icon: "💰" },
                { label: "Conversion", value: `${stats.convRate}%`, color: "#06b6d4", icon: "📈" },
              ].map((kpi, i) => (
                <div key={i} className="g-card" style={{ textAlign: "center", padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>{kpi.icon} {kpi.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color, fontFamily: "'JetBrains Mono'" }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Pipeline Overview & Countries */}
            <div className="g-grid" style={{ gridTemplateColumns: "2fr 1fr", marginBottom: 16 }}>
              <div className="g-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Pipeline Commercial</h3>
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {stats.byStage.map(s => (
                    <div key={s.id} style={{ flex: Math.max(s.count, 1), height: 28, background: `${s.color}25`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", minWidth: 20, transition: "all .3s" }}>
                      {s.count > 0 && <span style={{ fontSize: 9, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono'" }}>{s.count}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {stats.byStage.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{s.icon} {s.label}: <b style={{ color: s.color }}>{s.count}</b></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="g-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>Top Pays</h3>
                {stats.byCountry.length === 0 ? (
                  <div style={{ color: "#475569", fontSize: 12, textAlign: "center", padding: 20 }}>Lancez la prospection</div>
                ) : stats.byCountry.slice(0, 8).map(c => (
                  <div key={c.code} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>{c.flag}</span>
                    <span style={{ flex: 1, fontSize: 11, color: "#94a3b8" }}>{c.name}</span>
                    <div style={{ width: 80, height: 5, borderRadius: 3, background: "rgba(99,102,241,.1)" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: "linear-gradient(90deg,#4f46e5,#7c3aed)", width: `${Math.min(100, (c.count / Math.max(1,...stats.byCountry.map(x=>x.count))) * 100)}%`, transition: "width .5s" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", fontFamily: "'JetBrains Mono'", minWidth: 24, textAlign: "right" }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent + Quick Actions */}
            <div className="g-grid" style={{ gridTemplateColumns: "3fr 1fr" }}>
              <div className="g-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>Dernière Activité</h3>
                {logs.slice(0, 10).map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(99,102,241,.04)", animation: "slideR .3s ease" }}>
                    <span style={{ fontSize: 14 }}>{l.type}</span>
                    <span style={{ fontSize: 10, color: "#475569", fontFamily: "'JetBrains Mono'", minWidth: 110 }}>{l.t}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{l.msg}</span>
                  </div>
                ))}
              </div>

              <div className="g-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Actions Rapides</h3>
                <button className="g-btn g-primary" onClick={() => setView("search")} style={{ width: "100%", justifyContent: "center" }}>🔍 Prospecter</button>
                <button className="g-btn g-success" onClick={agentRunning ? stopAgent : runFullAgent} style={{ width: "100%", justifyContent: "center" }}>🤖 Agent Auto</button>
                <button className="g-btn g-ghost" onClick={doForecast} disabled={!!loading} style={{ width: "100%", justifyContent: "center" }}>📊 Prévisions</button>
                <button className="g-btn g-ghost" onClick={exportCSV} style={{ width: "100%", justifyContent: "center" }}>📥 Export CSV</button>
                <button className="g-btn g-ghost" onClick={() => setView("intel")} style={{ width: "100%", justifyContent: "center" }}>🧠 Veille Concur.</button>
                {gmailConnected ? (
                  <button className="g-btn g-ghost" onClick={checkProspectReplies} style={{ width: "100%", justifyContent: "center" }}>📬 Vérifier Réponses</button>
                ) : (
                  <button className="g-btn g-ghost" onClick={connectGmail} style={{ width: "100%", justifyContent: "center" }}>📧 Connecter Gmail</button>
                )}
              </div>
            </div>

            {/* Forecast */}
            {forecast && (
              <div className="g-card" style={{ marginTop: 16, border: "1px solid rgba(16,185,129,.2)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 12 }}>📊 Prévisions Commerciales (IA)</h3>
                <div className="g-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  <div><span style={{ fontSize: 10, color: "#64748b" }}>CA Mensuel Estimé</span><div style={{ fontSize: 20, fontWeight: 700, color: "#10b981", fontFamily: "'JetBrains Mono'" }}>{forecast.monthly_forecast}</div></div>
                  <div><span style={{ fontSize: 10, color: "#64748b" }}>CA Trimestriel</span><div style={{ fontSize: 20, fontWeight: 700, color: "#06b6d4", fontFamily: "'JetBrains Mono'" }}>{forecast.quarterly_forecast}</div></div>
                  {forecast.conversion_rates && Object.entries(forecast.conversion_rates).map(([k, v]) => (
                    <div key={k}><span style={{ fontSize: 10, color: "#64748b" }}>{k.replace(/_/g, " ")}</span><div style={{ fontSize: 16, fontWeight: 600, color: "#a5b4fc" }}>{v}</div></div>
                  ))}
                </div>
                {forecast.recommendations && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(16,185,129,.1)" }}>
                    <span style={{ fontSize: 10, color: "#64748b" }}>Recommandations</span>
                    {forecast.recommendations.map((r, i) => <div key={i} style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>• {r}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══ SEARCH / PROSPECTION ═══════════════════════════════════════════ */}
        {view === "search" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            {/* Search + Add + Import */}
            <div className="g-card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>🔍 Recherche & Ajout de Prospects</h3>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="g-btn g-primary" onClick={() => setShowAddModal(true)} style={{ fontSize: 11 }}>➕ Ajouter</button>
                  <label className="g-btn g-ghost" style={{ fontSize: 11, cursor: "pointer" }}>
                    📥 Importer CSV/JSON
                    <input type="file" accept=".csv,.json,.txt" onChange={importFile} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              {/* AI Search */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "0 0 220px" }}>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Pays</label>
                  <select className="g-select" style={{ width: "100%" }} value={searchForm.country} onChange={e => setSearchForm(p => ({ ...p, country: e.target.value }))}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Ville (optionnel)</label>
                  <input className="g-input" value={searchForm.city} onChange={e => setSearchForm(p => ({ ...p, city: e.target.value }))} placeholder="Toutes les villes principales..." />
                </div>
                <button className="g-btn g-primary" onClick={doSearch} disabled={!!loading} style={{ height: 38 }}>
                  {loading === "search" ? <><LoadingDots /> Recherche IA...</> : "🔍 Rechercher"}
                </button>
              </div>

              {/* Quick city buttons */}
              {COUNTRIES.find(c => c.code === searchForm.country)?.cities && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                  {COUNTRIES.find(c => c.code === searchForm.country).cities.map(city => (
                    <button key={city} className="g-btn g-ghost" style={{ padding: "4px 10px", fontSize: 10 }}
                      onClick={() => { setSearchForm(p => ({ ...p, city })); }}>
                      {city}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 10, color: "#475569", marginTop: 8, padding: "6px 10px", background: "rgba(99,102,241,.04)", borderRadius: 6 }}>
                💡 La recherche IA génère des prospects crédibles pour la zone choisie. Pour des données réelles, importe un fichier CSV/JSON ou ajoute manuellement.
              </div>
            </div>

            {/* Multi-country scan */}
            <div className="g-card" style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>Scan Rapide par Pays</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {COUNTRIES.map(c => (
                  <button key={c.code} className="g-btn g-ghost" style={{ padding: "6px 12px" }}
                    disabled={!!loading}
                    onClick={async () => {
                      setSearchForm({ country: c.code, city: "" });
                      setLoading("search");
                      log("🔍", `Scan rapide: ${c.name}`);
                      const results = await searchProspectsReal(c.name, "");
                      if (Array.isArray(results) && results.length > 0) {
                        const news = results.map(r => ({ ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`, stage: "discovered", country: c.code, countryName: c.name, flag: c.flag, addedAt: new Date().toISOString(), interactions: [], score: r.score || 50 }));
                        setProspects(prev => {
                          const existing = new Set(prev.map(p => p.name.toLowerCase()));
                          return [...prev, ...news.filter(n => !existing.has(n.name.toLowerCase()))];
                        });
                        log("✅", `+${results.length} prospects en ${c.name}`);
                      } else {
                        log("⚠️", `Aucun résultat pour ${c.name} — vérifiez la connexion API`);
                      }
                      setLoading("");
                    }}>
                    {c.flag} {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Latest results */}
            <div className="g-card">
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>
                Derniers Découverts ({prospects.filter(p => p.stage === "discovered").length})
              </h4>
              {prospects.filter(p => p.stage === "discovered").length === 0 && (
                <div style={{ color: "#475569", fontSize: 12, textAlign: "center", padding: 30 }}>
                  Aucun prospect pour le moment. Lancez une recherche, ajoutez manuellement, ou importez un fichier.
                </div>
              )}
              {prospects.filter(p => p.stage === "discovered").slice(-15).reverse().map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(99,102,241,.03)", borderRadius: 8, marginBottom: 4, border: "1px solid rgba(99,102,241,.05)" }}>
                  <span style={{ fontSize: 16 }}>{p.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>{p.type} — {p.city}</div>
                  </div>
                  <ScoreRing score={p.score} size={32} />
                  <button className="g-btn g-ghost" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); }}>Voir</button>
                  <button className="g-btn g-primary" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => doQualify(p)} disabled={loading===`qualify-${p.id}`}>
                    {loading===`qualify-${p.id}` ? <LoadingDots /> : "🧠 Qualifier"}
                  </button>
                  <button className="g-btn g-success" style={{ padding: "4px 10px", fontSize: 10 }} onClick={() => doMessage(p, "email", "intro")} disabled={loading===`msg-${p.id}`}>
                    {loading===`msg-${p.id}` ? <LoadingDots /> : "📧"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PIPELINE (KANBAN) ═══════════════════════════════════════════════ */}
        {view === "pipeline" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 20 }}>
              {PIPELINE.map(stage => {
                const sp = prospects.filter(p => p.stage === stage.id).sort((a,b) => (b.score||0)-(a.score||0));
                return (
                  <div key={stage.id} style={{ flex: "0 0 200px", background: "rgba(12,15,24,.6)", borderRadius: 12, padding: 10, border: `1px solid ${stage.color}15`, minHeight: 400 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "5px 8px", borderRadius: 7, background: `${stage.color}12` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: stage.color }}>{stage.icon} {stage.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: stage.color, fontFamily: "'JetBrains Mono'", background: `${stage.color}18`, padding: "1px 7px", borderRadius: 8 }}>{sp.length}</span>
                    </div>
                    {sp.map(p => (
                      <div key={p.id} onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); }}
                        style={{ background: "rgba(8,10,18,.8)", borderRadius: 8, padding: 8, marginBottom: 5, border: "1px solid rgba(99,102,241,.06)", cursor: "pointer", transition: "all .15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                          <span style={{ fontSize: 12 }}>{p.flag}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                          <ScoreRing score={p.score} size={24} />
                        </div>
                        <div style={{ fontSize: 9, color: "#475569" }}>{p.type} • {p.city}</div>
                        {p.qualification?.priority && <div style={{ marginTop: 4 }}><PriorityBadge p={p.qualification.priority} /></div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ PROSPECTS LIST ══════════════════════════════════════════════════ */}
        {view === "prospects" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            {/* Filters */}
            <div className="g-card" style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input className="g-input" style={{ maxWidth: 200 }} placeholder="Rechercher..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
              <select className="g-select" value={filters.stage} onChange={e => setFilters(p => ({ ...p, stage: e.target.value }))}>
                <option value="all">Toutes étapes</option>
                {PIPELINE.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
              <select className="g-select" value={filters.country} onChange={e => setFilters(p => ({ ...p, country: e.target.value }))}>
                <option value="all">Tous pays</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
              <select className="g-select" value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
                <option value="all">Tous types</option>
                {PROSPECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="g-select" value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
                <option value="all">Toutes priorités</option>
                <option value="hot">🔥 Hot</option>
                <option value="warm">🌤️ Warm</option>
                <option value="cold">❄️ Cold</option>
              </select>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono'" }}>{filtered.length} résultat(s)</span>
              {bulkSelect.size > 0 && (
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="g-btn g-primary" style={{ fontSize: 10, padding: "4px 10px" }} onClick={bulkQualify}>🧠 Qualifier ({bulkSelect.size})</button>
                  <button className="g-btn g-danger" style={{ fontSize: 10, padding: "4px 10px" }} onClick={bulkDelete}>🗑️</button>
                </div>
              )}
              <button className="g-btn g-ghost" style={{ fontSize: 10 }} onClick={exportCSV}>📥 CSV</button>
            </div>

            {/* Table */}
            <div className="g-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: "rgba(99,102,241,.05)" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600 }}>
                        <input type="checkbox" onChange={e => { if (e.target.checked) setBulkSelect(new Set(filtered.map(p=>p.id))); else setBulkSelect(new Set()); }} />
                      </th>
                      {["","Nom","Type","Ville","Pays","Score","Stade","Priorité","Contact","Actions"].map(h => (
                        <th key={h} style={{ padding: "8px 6px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 100).map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgba(99,102,241,.04)", cursor: "pointer" }}
                        onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); }}>
                        <td style={{ padding: "6px 10px" }} onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={bulkSelect.has(p.id)} onChange={e => {
                            const next = new Set(bulkSelect);
                            e.target.checked ? next.add(p.id) : next.delete(p.id);
                            setBulkSelect(next);
                          }} />
                        </td>
                        <td style={{ padding: "6px 2px", fontSize: 16 }}>{p.flag}</td>
                        <td style={{ padding: "6px", fontWeight: 600, color: "#e2e8f0" }}>{p.name}</td>
                        <td style={{ padding: "6px" }}><span className="g-tag" style={{ background: "rgba(99,102,241,.08)", color: "#a5b4fc" }}>{p.type}</span></td>
                        <td style={{ padding: "6px", color: "#94a3b8" }}>{p.city}</td>
                        <td style={{ padding: "6px", color: "#94a3b8" }}>{p.countryName}</td>
                        <td style={{ padding: "6px" }}><ScoreRing score={p.score} size={28} /></td>
                        <td style={{ padding: "6px" }}><span className="g-tag" style={{ background: `${PIPELINE.find(s=>s.id===p.stage)?.color}15`, color: PIPELINE.find(s=>s.id===p.stage)?.color }}>{PIPELINE.find(s=>s.id===p.stage)?.icon} {PIPELINE.find(s=>s.id===p.stage)?.label}</span></td>
                        <td style={{ padding: "6px" }}>{p.qualification?.priority && <PriorityBadge p={p.qualification.priority} />}</td>
                        <td style={{ padding: "6px", color: "#475569", fontSize: 10 }}>{p.lastContact ? new Date(p.lastContact).toLocaleDateString("fr-FR") : "—"}</td>
                        <td style={{ padding: "6px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 3 }}>
                            <button className="g-btn g-ghost" style={{ padding: "3px 6px", fontSize: 9 }} onClick={() => doQualify(p)}>🧠</button>
                            <button className="g-btn g-ghost" style={{ padding: "3px 6px", fontSize: 9 }} onClick={() => doMessage(p, "email", "intro")}>📧</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ AGENT AUTONOME ══════════════════════════════════════════════════ */}
        {view === "agent" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div className="g-card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>🤖 Agent Commercial — Contrôle par Étape</h3>
                  <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>Lance chaque étape individuellement ou le cycle complet</p>
                </div>
                {agentRunning && <button className="g-btn g-danger" onClick={stopAgent} style={{ padding: "10px 24px" }}>⏹ Arrêter</button>}
              </div>

              {/* Step-by-step controls */}
              <div className="g-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {[
                  { id: "scan", n: "1", label: "🌍 Scanner les Marchés", desc: `Recherche de prospects CBD dans ${COUNTRIES.length} pays européens`, color: "#6366f1", count: prospects.filter(p => p.stage === "discovered").length, countLabel: "découverts" },
                  { id: "qualify", n: "2", label: "🧠 Qualifier les Prospects", desc: "Scoring IA, priorité (Hot/Warm/Cold), produits recommandés", color: "#8b5cf6", count: prospects.filter(p => p.qualification).length, countLabel: "qualifiés" },
                  { id: "outreach", n: "3", label: "📧 Prospection Multi-Canal", desc: "Messages personnalisés par email, WhatsApp, Instagram, LinkedIn", color: "#f59e0b", count: prospects.filter(p => p.stage === "contacted").length, countLabel: "contactés" },
                  { id: "followup", n: "4", label: "🔄 Relances Automatiques", desc: "Suivi des prospects contactés sans réponse après 3 jours", color: "#06b6d4", count: prospects.filter(p => p.interactions?.some(i => i.stage === "followup")).length, countLabel: "relancés" },
                ].map(step => (
                  <div key={step.id} style={{ background: `${step.color}06`, borderRadius: 12, padding: 16, border: `1px solid ${step.color}18`, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>{step.label}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{step.desc}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: step.color, fontFamily: "'JetBrains Mono'" }}>{step.count}</div>
                        <div style={{ fontSize: 8, color: "#64748b" }}>{step.countLabel}</div>
                      </div>
                    </div>
                    <button className="g-btn" disabled={agentRunning} onClick={() => { setAgentLog([]); runAgentStep(step.id); }}
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`, color: "#fff", justifyContent: "center", opacity: agentRunning ? 0.5 : 1 }}>
                      {agentRunning ? <LoadingDots /> : `▶ Lancer Étape ${step.n}`}
                    </button>
                  </div>
                ))}
              </div>

              {/* Full cycle button */}
              <button className="g-btn" disabled={agentRunning} onClick={runFullAgent}
                style={{ width: "100%", marginTop: 12, padding: "14px 24px", justifyContent: "center", fontSize: 14,
                  background: agentRunning ? "rgba(100,116,139,.2)" : "linear-gradient(135deg,#059669,#10b981)", color: "#fff",
                  opacity: agentRunning ? 0.5 : 1 }}>
                {agentRunning ? <><LoadingDots /> Agent en cours...</> : "🚀 Lancer le Cycle Complet (4 étapes)"}
              </button>
            </div>

            {/* Live Stats */}
            {agentRunning && (
              <div className="g-card" style={{ marginBottom: 16, border: "1px solid rgba(16,185,129,.2)", background: "rgba(16,185,129,.04)" }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginBottom: 10 }}>📡 Progression en Direct</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 8 }}>
                  {[
                    { label: "Prospects", value: prospects.length, color: "#a5b4fc" },
                    { label: "Qualifiés", value: prospects.filter(p => p.qualification).length, color: "#8b5cf6" },
                    { label: "Contactés", value: prospects.filter(p => p.stage === "contacted").length, color: "#f59e0b" },
                    { label: "🔥 Hot", value: prospects.filter(p => p.qualification?.priority === "hot").length, color: "#ef4444" },
                    { label: "Pays", value: new Set(prospects.map(p => p.country)).size, color: "#06b6d4" },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: "center", padding: 8, background: "rgba(0,0,0,.2)", borderRadius: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono'" }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sequences */}
            <div className="g-card" style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>📋 Séquences de Prospection Disponibles</h4>
              <div className="g-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {SEQUENCE_TEMPLATES.map(seq => (
                  <div key={seq.id} style={{ background: "rgba(99,102,241,.04)", borderRadius: 10, padding: 12, border: "1px solid rgba(99,102,241,.08)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{seq.name}</div>
                    {seq.steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontSize: 9, color: "#475569", fontFamily: "'JetBrains Mono'", minWidth: 30 }}>J+{step.day}</span>
                        <span style={{ fontSize: 12 }}>{CHANNELS.find(c => c.id === step.channel)?.icon}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{step.type}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Log */}
            <div className="g-card">
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                Terminal Agent
                {agentRunning && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite" }} />}
              </h4>
              <div style={{ maxHeight: 350, overflowY: "auto", fontFamily: "'JetBrains Mono'", fontSize: 11, background: "rgba(0,0,0,.3)", borderRadius: 8, padding: 12 }}>
                {agentLog.length === 0 ? (
                  <div style={{ color: "#475569", textAlign: "center", padding: 30 }}>En attente de lancement...</div>
                ) : agentLog.map(l => (
                  <div key={l.id} style={{ padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,.02)" }}>
                    <span style={{ color: "#475569", marginRight: 8 }}>{l.t}</span>
                    <span style={{ marginRight: 6 }}>{l.type}</span>
                    <span style={{ color: "#94a3b8" }}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ INTELLIGENCE ════════════════════════════════════════════════════ */}
        {view === "intel" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div className="g-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
              {/* Competitor Analysis */}
              <div className="g-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>🔍 Veille Concurrentielle</h3>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <input className="g-input" placeholder="Nom du concurrent (ex: CBD'eau, High Society...)" value={competitorInput} onChange={e => setCompetitorInput(e.target.value)} />
                  <button className="g-btn g-primary" onClick={() => {
                    if (competitorInput.trim()) { addCompetitor(competitorInput.trim()); setCompetitorInput(""); }
                  }} disabled={loading === "competitor"}>
                    {loading === "competitor" ? <LoadingDots /> : "Analyser"}
                  </button>
                </div>
                {competitors.map(c => (
                  <div key={c.id} style={{ background: "rgba(99,102,241,.04)", borderRadius: 8, padding: 10, marginBottom: 6, border: "1px solid rgba(99,102,241,.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{c.name}</span>
                      <span className="g-tag" style={{
                        background: c.threat_level === "high" ? "rgba(239,68,68,.15)" : c.threat_level === "medium" ? "rgba(245,158,11,.15)" : "rgba(100,116,139,.15)",
                        color: c.threat_level === "high" ? "#ef4444" : c.threat_level === "medium" ? "#f59e0b" : "#64748b",
                      }}>Menace: {c.threat_level}</span>
                    </div>
                    {c.our_advantages && <div style={{ fontSize: 10, color: "#10b981", marginTop: 4 }}>
                      <b>Nos avantages:</b> {c.our_advantages.slice(0, 3).join(" • ")}
                    </div>}
                    {c.counter_arguments && <div style={{ fontSize: 10, color: "#a5b4fc", marginTop: 4 }}>
                      <b>Arguments:</b> {c.counter_arguments.slice(0, 2).join(" • ")}
                    </div>}
                  </div>
                ))}
              </div>

              {/* Objection Handling */}
              <div className="g-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>🛡️ Gestion des Objections</h3>
                {OBJECTIONS.map(obj => (
                  <div key={obj.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(99,102,241,.04)" }}>
                    <span className="g-tag" style={{ background: "rgba(239,68,68,.1)", color: "#f87171", minWidth: 120 }}>{obj.label}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", flex: 1 }}>{obj.response}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* A/B Testing */}
            <div className="g-card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>🔬 A/B Testing Messages</h3>
              <p style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>Sélectionnez un prospect dans le pipeline pour générer 2 variantes de message et tester laquelle performe le mieux.</p>
              {abTest && (
                <div className="g-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {["variant_a", "variant_b"].map((v, i) => (
                    <div key={v} style={{ background: "rgba(99,102,241,.04)", borderRadius: 10, padding: 14, border: "1px solid rgba(99,102,241,.1)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#6366f1" : "#8b5cf6", marginBottom: 6 }}>Variante {i === 0 ? "A" : "B"} — {abTest[v]?.tone}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>Hook: {abTest[v]?.hook}</div>
                      {abTest[v]?.subject && <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Objet: {abTest[v].subject}</div>}
                      <pre style={{ fontSize: 10, color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0, fontFamily: "'Outfit'" }}>{abTest[v]?.body}</pre>
                      <button className="g-btn g-ghost" style={{ marginTop: 8, fontSize: 10 }} onClick={() => navigator.clipboard.writeText(abTest[v]?.body || "")}>📋 Copier</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue Forecast */}
            <div className="g-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>📊 Prévisions Revenue</h3>
                <button className="g-btn g-primary" onClick={doForecast} disabled={loading === "forecast"}>
                  {loading === "forecast" ? <LoadingDots /> : "Générer Prévisions"}
                </button>
              </div>
              {forecast && (
                <div className="g-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                  <div style={{ background: "rgba(16,185,129,.08)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 9, color: "#64748b" }}>CA Mensuel</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981", fontFamily: "'JetBrains Mono'" }}>{forecast.monthly_forecast}</div>
                  </div>
                  <div style={{ background: "rgba(6,182,212,.08)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 9, color: "#64748b" }}>CA Trimestriel</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", fontFamily: "'JetBrains Mono'" }}>{forecast.quarterly_forecast}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ CATALOGUE ══════════════════════════════════════════════════════ */}
        {view === "catalog" && (
          <div style={{ animation: "fadeUp .4s ease" }}>
            <div className="g-card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>📦 Catalogue Complet — L'Entrepôt du Chanvrier</h3>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>Tous les produits et marges pour la prospection</p>
            </div>
            <div className="g-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {PRODUCTS.map(cat => (
                <div key={cat.cat} className="g-card">
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{cat.icon} {cat.cat}</h4>
                  {cat.items.map(item => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(99,102,241,.04)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
                          {item.name}
                          {item.bestSeller && <span className="g-tag" style={{ background: "rgba(245,158,11,.15)", color: "#fbbf24", fontSize: 8 }}>⭐ Best</span>}
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: "#10b981", fontFamily: "'JetBrains Mono'", minWidth: 100 }}>{item.price}</span>
                      <span style={{ fontSize: 10, color: "#a5b4fc", fontFamily: "'JetBrains Mono'", minWidth: 60 }}>Marge: {item.margin}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="g-card" style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#10b981", marginBottom: 8 }}>🧬 Molécules Disponibles</h4>
              <div style={{ display: "flex", gap: 8 }}>
                {MOLECULES.map(m => (
                  <span key={m} className="g-tag" style={{ background: "rgba(16,185,129,.1)", color: "#34d399", fontSize: 12, padding: "5px 14px" }}>{m}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ LOGS ═══════════════════════════════════════════════════════════ */}
        {view === "logs" && (
          <div className="g-card" style={{ animation: "fadeUp .4s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>📋 Journal Complet ({logs.length})</h3>
              <button className="g-btn g-ghost" onClick={() => { setLogs([]); save(SK.logs, []); }}>Vider</button>
            </div>
            <div style={{ maxHeight: 600, overflowY: "auto", fontFamily: "'JetBrains Mono'", fontSize: 11 }}>
              {logs.map(l => (
                <div key={l.id} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.02)" }}>
                  <span style={{ color: "#3f4553", minWidth: 130 }}>{l.t}</span>
                  <span style={{ fontSize: 13, minWidth: 20 }}>{l.type}</span>
                  <span style={{ color: "#94a3b8" }}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ PROSPECT DETAIL MODAL ══════════════════════════════════════════ */}
        {selected && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, animation: "fadeUp .2s ease" }}
            onClick={() => { setSelected(null); setAiOutput(""); setAbTest(null); }}>
            <div style={{ background: "#0a0d16", border: "1px solid rgba(99,102,241,.15)", borderRadius: 18, width: "92%", maxWidth: 780, maxHeight: "88vh", overflow: "auto", padding: 24 }}
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 26 }}>{selected.flag}</span>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>{selected.name}</h2>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="g-tag" style={{ background: "rgba(99,102,241,.12)", color: "#a5b4fc" }}>{selected.type}</span>
                    <span className="g-tag" style={{ background: "rgba(16,185,129,.1)", color: "#34d399" }}>{selected.city}, {selected.countryName}</span>
                    <span className="g-tag" style={{ background: `${PIPELINE.find(s=>s.id===selected.stage)?.color}18`, color: PIPELINE.find(s=>s.id===selected.stage)?.color }}>
                      {PIPELINE.find(s=>s.id===selected.stage)?.icon} {PIPELINE.find(s=>s.id===selected.stage)?.label}
                    </span>
                    {selected.qualification?.priority && <PriorityBadge p={selected.qualification.priority} />}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <ScoreRing score={selected.score} size={48} />
                  <button onClick={() => { setSelected(null); setAiOutput(""); setAbTest(null); }} style={{ background: "rgba(239,68,68,.1)", border: "none", color: "#f87171", width: 28, height: 28, borderRadius: 7, cursor: "pointer", fontSize: 14 }}>✕</button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "rgba(15,18,30,.6)", padding: 3, borderRadius: 9 }}>
                {[
                  { id: "info", label: "Infos" },
                  { id: "qualify", label: "Qualification" },
                  { id: "outreach", label: "Prospection" },
                  { id: "ab", label: "A/B Test" },
                  { id: "objections", label: "Objections" },
                  { id: "history", label: "Historique" },
                ].map(t => (
                  <button key={t.id} className="nav-item" style={{
                    background: modalTab === t.id ? "rgba(99,102,241,.15)" : "transparent",
                    color: modalTab === t.id ? "#a5b4fc" : "#64748b", fontSize: 11, padding: "6px 12px",
                  }} onClick={() => setModalTab(t.id)}>{t.label}</button>
                ))}
              </div>

              {/* Tab: Info */}
              {modalTab === "info" && (
                <div>
                  <div className="g-grid" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 16 }}>
                    {[
                      { label: "Téléphone", value: selected.phone },
                      { label: "Email", value: selected.email },
                      { label: "Site web", value: selected.website },
                      { label: "Instagram", value: selected.instagram },
                      { label: "LinkedIn", value: selected.linkedin },
                      { label: "Taille", value: selected.size },
                    ].filter(f => f.value).map(f => (
                      <div key={f.label} style={{ background: "rgba(99,102,241,.04)", borderRadius: 8, padding: 8 }}>
                        <div style={{ fontSize: 9, color: "#475569" }}>{f.label}</div>
                        <div style={{ fontSize: 12, color: "#d1d5db" }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                  {selected.notes && <div style={{ fontSize: 11, color: "#94a3b8", background: "rgba(99,102,241,.03)", padding: 10, borderRadius: 8 }}>{selected.notes}</div>}
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 10, color: "#64748b" }}>Déplacer dans le pipeline</label>
                    <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                      {PIPELINE.map(s => (
                        <button key={s.id} className="g-btn" style={{
                          padding: "4px 10px", fontSize: 10,
                          background: selected.stage === s.id ? `${s.color}30` : "transparent",
                          color: s.color, border: `1px solid ${s.color}30`,
                        }} onClick={() => {
                          updateProspect(selected.id, { stage: s.id });
                          log("📈", `${selected.name} → ${s.label}`);
                        }}>{s.icon} {s.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Qualification */}
              {modalTab === "qualify" && (
                <div>
                  <button className="g-btn g-primary" onClick={() => doQualify(selected)} disabled={!!loading} style={{ marginBottom: 16 }}>
                    {loading ? <LoadingDots /> : "🧠 Lancer la Qualification IA"}
                  </button>
                  {selected.qualification && (
                    <div className="g-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <div style={{ background: "rgba(139,92,246,.06)", borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 9, color: "#64748b" }}>Priorité</div>
                        <PriorityBadge p={selected.qualification.priority} />
                      </div>
                      <div style={{ background: "rgba(139,92,246,.06)", borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 9, color: "#64748b" }}>Volume Mensuel Estimé</div>
                        <div style={{ fontSize: 12, color: "#e2e8f0" }}>{selected.qualification.estimated_monthly_volume}</div>
                      </div>
                      <div style={{ background: "rgba(139,92,246,.06)", borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 9, color: "#64748b" }}>Meilleur Canal</div>
                        <div style={{ fontSize: 12, color: "#e2e8f0" }}>{CHANNELS.find(c => c.id === selected.qualification.best_channel)?.icon} {selected.qualification.best_channel}</div>
                      </div>
                      <div style={{ background: "rgba(139,92,246,.06)", borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 9, color: "#64748b" }}>Lifetime Value</div>
                        <div style={{ fontSize: 12, color: "#10b981" }}>{selected.qualification.lifetime_value_estimate}</div>
                      </div>
                      <div style={{ gridColumn: "1/-1", background: "rgba(139,92,246,.06)", borderRadius: 8, padding: 10 }}>
                        <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4 }}>Stratégie d'approche</div>
                        <div style={{ fontSize: 11, color: "#d1d5db" }}>{selected.qualification.approach_strategy}</div>
                      </div>
                      {selected.qualification.recommended_products && (
                        <div style={{ gridColumn: "1/-1", background: "rgba(16,185,129,.06)", borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4 }}>Produits Recommandés</div>
                          {selected.qualification.recommended_products.map((p, i) => (
                            <div key={i} style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>• <b style={{ color: "#10b981" }}>{p.name}</b> — {p.reason}</div>
                          ))}
                        </div>
                      )}
                      {selected.qualification.talking_points && (
                        <div style={{ gridColumn: "1/-1", background: "rgba(99,102,241,.06)", borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: 9, color: "#64748b", marginBottom: 4 }}>Points d'Accroche</div>
                          {selected.qualification.talking_points.map((t, i) => (
                            <div key={i} style={{ fontSize: 11, color: "#a5b4fc", marginBottom: 2 }}>💡 {t}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Outreach */}
              {modalTab === "outreach" && (
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {CHANNELS.map(ch => (
                      <div key={ch.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <button className="g-btn g-ghost" onClick={() => doMessage(selected, ch.id, "intro")} disabled={!!loading} style={{ fontSize: 11 }}>
                          {ch.icon} {ch.label}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    <button className="g-btn g-success" onClick={() => doMessage(selected, "email", "followup")} disabled={!!loading}>🔄 Relance</button>
                    <button className="g-btn g-primary" onClick={() => doMessage(selected, "email", "sample")} disabled={!!loading}>📦 Proposition Échantillon</button>
                    <button className="g-btn" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#fff" }} onClick={() => doMessage(selected, "email", "closing")} disabled={!!loading}>🎯 Closing</button>
                  </div>
                  {/* Real email send */}
                  {aiOutput && selected.email && gmailConnected && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, alignItems: "center" }}>
                      <button className="g-btn" disabled={sendingEmail} onClick={async () => {
                        const subjectMatch = aiOutput.match(/(?:Objet|Subject|Sujet)\s*:\s*(.+)/i);
                        const subject = subjectMatch?.[1]?.trim() || `Partenariat CBD — L'Entrepôt du Chanvrier`;
                        const body = aiOutput.replace(/(?:Objet|Subject|Sujet)\s*:.+\n?/i, '').trim();
                        await sendEmailReal(selected, subject, body);
                      }} style={{ background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff" }}>
                        {sendingEmail ? <LoadingDots /> : "📧 ENVOYER VIA GMAIL"}
                      </button>
                      <span style={{ fontSize: 10, color: "#64748b" }}>→ {selected.email}</span>
                    </div>
                  )}
                  {!selected.email && aiOutput && (
                    <div style={{ fontSize: 10, color: "#f59e0b", marginBottom: 8, padding: "4px 8px", background: "rgba(245,158,11,.08)", borderRadius: 6 }}>
                      ⚠️ Pas d'email pour ce prospect. Ajoutez-en un dans les infos pour envoyer via Gmail.
                    </div>
                  )}
                  {emailStatus && (
                    <div style={{ fontSize: 11, color: emailStatus.startsWith("✅") ? "#10b981" : emailStatus.startsWith("❌") ? "#ef4444" : "#f59e0b", marginBottom: 8 }}>
                      {emailStatus}
                    </div>
                  )}
                  {loading && <div style={{ padding: 20, textAlign: "center" }}><LoadingDots /></div>}
                  {aiOutput && (
                    <div style={{ background: "rgba(16,185,129,.05)", borderRadius: 10, padding: 14, border: "1px solid rgba(16,185,129,.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#34d399" }}>✉️ Message Généré</span>
                        <button className="g-btn g-ghost" style={{ fontSize: 10 }} onClick={() => navigator.clipboard.writeText(aiOutput)}>📋 Copier</button>
                      </div>
                      <pre style={{ fontSize: 11, color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0, fontFamily: "'Outfit'", lineHeight: 1.5 }}>{aiOutput}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: A/B Test */}
              {modalTab === "ab" && (
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                    {CHANNELS.slice(0, 4).map(ch => (
                      <button key={ch.id} className="g-btn g-primary" onClick={() => doABTest(selected, ch.id)} disabled={!!loading}>
                        {ch.icon} A/B {ch.label}
                      </button>
                    ))}
                  </div>
                  {loading && <div style={{ padding: 20, textAlign: "center" }}><LoadingDots /></div>}
                  {abTest && (
                    <div className="g-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      {["variant_a", "variant_b"].map((v, i) => (
                        <div key={v} style={{ background: "rgba(99,102,241,.04)", borderRadius: 10, padding: 12, border: "1px solid rgba(99,102,241,.1)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#6366f1" : "#8b5cf6", marginBottom: 4 }}>Variante {i===0?"A":"B"} — {abTest[v]?.tone}</div>
                          <div style={{ fontSize: 10, color: "#f59e0b", marginBottom: 6 }}>Hook: {abTest[v]?.hook}</div>
                          <pre style={{ fontSize: 10, color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0, fontFamily: "'Outfit'" }}>{abTest[v]?.body}</pre>
                          <button className="g-btn g-ghost" style={{ marginTop: 8, fontSize: 10 }} onClick={() => navigator.clipboard.writeText(abTest[v]?.body || "")}>📋 Copier</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Objections */}
              {modalTab === "objections" && (
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                    {OBJECTIONS.map(obj => (
                      <button key={obj.id} className="g-btn g-ghost" style={{ fontSize: 10 }}
                        onClick={() => doObjection(selected, obj.label)} disabled={!!loading}>
                        {obj.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input className="g-input" placeholder="Autre objection personnalisée..." value={objectionInput} onChange={e => setObjectionInput(e.target.value)} />
                    <button className="g-btn g-primary" onClick={() => { if (objectionInput) { doObjection(selected, objectionInput); setObjectionInput(""); } }} disabled={!!loading}>Répondre</button>
                  </div>
                  {loading && <div style={{ padding: 20, textAlign: "center" }}><LoadingDots /></div>}
                  {aiOutput && (
                    <div style={{ background: "rgba(245,158,11,.05)", borderRadius: 10, padding: 14, border: "1px solid rgba(245,158,11,.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24" }}>🛡️ Réponse à l'Objection</span>
                        <button className="g-btn g-ghost" style={{ fontSize: 10 }} onClick={() => navigator.clipboard.writeText(aiOutput)}>📋 Copier</button>
                      </div>
                      <pre style={{ fontSize: 11, color: "#cbd5e1", whiteSpace: "pre-wrap", margin: 0, fontFamily: "'Outfit'", lineHeight: 1.5 }}>{aiOutput}</pre>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: History */}
              {modalTab === "history" && (
                <div>
                  {(!selected.interactions || selected.interactions.length === 0) ? (
                    <div style={{ color: "#475569", textAlign: "center", padding: 30, fontSize: 12 }}>Aucune interaction enregistrée</div>
                  ) : selected.interactions.map((inter, i) => (
                    <div key={i} style={{ background: "rgba(99,102,241,.03)", borderRadius: 8, padding: 10, marginBottom: 6, border: "1px solid rgba(99,102,241,.05)" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                        <span className="g-tag" style={{ background: "rgba(99,102,241,.1)", color: "#a5b4fc" }}>
                          {CHANNELS.find(c => c.id === inter.type)?.icon || "📝"} {inter.type}
                        </span>
                        {inter.stage && <span className="g-tag" style={{ background: "rgba(245,158,11,.1)", color: "#fbbf24" }}>{inter.stage}</span>}
                        <span style={{ fontSize: 10, color: "#475569" }}>{new Date(inter.date).toLocaleString("fr-FR")}</span>
                      </div>
                      <pre style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "pre-wrap", margin: 0, fontFamily: "'Outfit'", maxHeight: 100, overflow: "hidden" }}>{inter.content?.slice(0, 400)}{inter.content?.length > 400 ? "..." : ""}</pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(99,102,241,.08)" }}>
                <button className="g-btn g-danger" style={{ fontSize: 10 }} onClick={() => {
                  setProspects(prev => prev.filter(p => p.id !== selected.id));
                  setSelected(null);
                }}>🗑️ Supprimer</button>
                <button className="g-btn g-ghost" onClick={() => { setSelected(null); setAiOutput(""); setAbTest(null); }}>Fermer</button>
              </div>
            </div>
          </div>
        )}
        {/* ═══ ADD PROSPECT MODAL ══════════════════════════════════════════════ */}
        {showAddModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}
            onClick={() => setShowAddModal(false)}>
            <div style={{ background: "#0a0d16", border: "1px solid rgba(99,102,241,.15)", borderRadius: 18, width: "90%", maxWidth: 500, padding: 24 }}
              onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 16 }}>➕ Ajouter un Prospect</h3>
              <div className="g-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Nom de l'entreprise *</label>
                  <input className="g-input" value={newProspect.name} onChange={e => setNewProspect(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Green CBD Shop" />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Type</label>
                  <select className="g-select" style={{ width: "100%" }} value={newProspect.type} onChange={e => setNewProspect(p => ({ ...p, type: e.target.value }))}>
                    {PROSPECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Pays</label>
                  <select className="g-select" style={{ width: "100%" }} value={newProspect.country} onChange={e => setNewProspect(p => ({ ...p, country: e.target.value }))}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Ville</label>
                  <input className="g-input" value={newProspect.city} onChange={e => setNewProspect(p => ({ ...p, city: e.target.value }))} placeholder="Paris" />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Téléphone</label>
                  <input className="g-input" value={newProspect.phone} onChange={e => setNewProspect(p => ({ ...p, phone: e.target.value }))} placeholder="+33..." />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Email</label>
                  <input className="g-input" value={newProspect.email} onChange={e => setNewProspect(p => ({ ...p, email: e.target.value }))} placeholder="contact@..." />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Site web</label>
                  <input className="g-input" value={newProspect.website} onChange={e => setNewProspect(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Instagram</label>
                  <input className="g-input" value={newProspect.instagram} onChange={e => setNewProspect(p => ({ ...p, instagram: e.target.value }))} placeholder="@..." />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Notes</label>
                  <input className="g-input" value={newProspect.notes} onChange={e => setNewProspect(p => ({ ...p, notes: e.target.value }))} placeholder="Infos complémentaires..." />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button className="g-btn g-ghost" onClick={() => setShowAddModal(false)}>Annuler</button>
                <button className="g-btn g-primary" onClick={addManualProspect} disabled={!newProspect.name.trim()}>➕ Ajouter</button>
              </div>

              {/* Import section inside modal */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(99,102,241,.1)" }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>📥 Import en masse (CSV / JSON)</h4>
                <p style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>
                  Colonnes CSV acceptées : nom, type, ville, pays, telephone, email, site, instagram, notes, score<br/>
                  JSON : tableau d'objets avec les mêmes champs
                </p>
                <label className="g-btn g-ghost" style={{ cursor: "pointer", width: "100%", justifyContent: "center" }}>
                  📂 Choisir un fichier CSV ou JSON
                  <input type="file" accept=".csv,.json,.txt" onChange={(e) => { importFile(e); setShowAddModal(false); }} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
