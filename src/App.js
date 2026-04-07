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

async function searchProspects(country, city) {
  return await ai(
    `${AI_SYSTEM}\n\nTu dois trouver des prospects CBD. Réponds UNIQUEMENT en JSON valide sans backticks.\nFormat: [{"name":"...","type":"...","city":"...","phone":"...","email":"...","website":"...","instagram":"...","linkedin":"...","score":1-100,"size":"small|medium|large","estimated_revenue":"...","notes":"...","specialties":["..."]}]\nGénère 8-15 prospects réalistes avec des noms crédibles pour le pays.`,
    `Prospects CBD dans ${city ? city + ", " : ""}${country}. Types: CBD shops, tabacs, e-shops, grossistes, franchises, parapharmacies, herboristeries. Noms et détails réalistes.`,
    true
  ) || [];
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

  // Init
  useEffect(() => {
    (async () => {
      const [p, l, c, s] = await Promise.all([load(SK.prospects), load(SK.logs), load(SK.competitors), load(SK.sequences)]);
      if (p) setProspects(p);
      if (l) setLogs(l);
      if (c) setCompetitors(c);
      if (s) setSequences(s);
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
    const results = await searchProspects(c.name, searchForm.city);
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

  // ─── AUTONOMOUS AGENT ────────────────────────────────────────────────────
  const runAgent = async () => {
    agentRef.current.running = true;
    setAgentRunning(true);
    setAgentLog([]);
    log("🤖", "Agent autonome démarré — Mode Full Auto");

    const targetCountries = COUNTRIES.slice(0, 8);
    for (const country of targetCountries) {
      if (!agentRef.current.running) break;

      // Phase 1: Discovery
      log("🌍", `Phase 1 — Scan ${country.flag} ${country.name}`);
      const topCities = country.cities.slice(0, 3);
      for (const city of topCities) {
        if (!agentRef.current.running) break;
        log("🔍", `Scan: ${city}, ${country.name}`);
        const results = await searchProspects(country.name, city);
        if (Array.isArray(results) && results.length > 0) {
          const news = results.map(r => ({
            ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
            stage: "discovered", country: country.code, countryName: country.name, flag: country.flag,
            addedAt: new Date().toISOString(), interactions: [], score: r.score || 50,
          }));
          // Dedupe
          setProspects(prev => {
            const existing = new Set(prev.map(p => p.name.toLowerCase()));
            const unique = news.filter(n => !existing.has(n.name.toLowerCase()));
            return [...prev, ...unique];
          });
          log("✅", `+${results.length} prospects à ${city}`);
        }
      }

      // Phase 2: Qualification (top prospects)
      if (!agentRef.current.running) break;
      log("🧠", `Phase 2 — Qualification ${country.flag}`);
      // Read current state via ref-like pattern, then qualify sequentially
      const toQualifyPromise = new Promise((resolve) => {
        setProspects(current => {
          const toQualify = current.filter(p => p.country === country.code && !p.qualification).slice(0, 5);
          resolve(toQualify);
          return current; // no mutation
        });
      });
      const toQualify = await toQualifyPromise;
      for (const p of toQualify) {
        if (!agentRef.current.running) break;
        const q = await qualifyProspect(p);
        if (q) {
          setProspects(prev => prev.map(x => x.id === p.id ? { ...x, qualification: q, score: q.score, stage: "qualified" } : x));
          log("📊", `${p.name}: ${q.priority} (${q.score}/100)`);
        }
      }

      // Phase 3: Outreach (hot/warm leads)
      if (!agentRef.current.running) break;
      log("📧", `Phase 3 — Prospection ${country.flag}`);
      const toContactPromise = new Promise((resolve) => {
        setProspects(current => {
          const toContact = current.filter(p =>
            p.country === country.code &&
            p.qualification?.priority !== "cold" &&
            p.stage === "qualified" &&
            (p.score || 0) >= 50
          ).slice(0, 3);
          resolve(toContact);
          return current;
        });
      });
      const toContact = await toContactPromise;
      for (const p of toContact) {
        if (!agentRef.current.running) break;
        const bestChannel = p.qualification?.best_channel || "email";
        const msg = await generateMessage(p, bestChannel, "intro", "");
        setProspects(prev => prev.map(x => x.id === p.id ? {
          ...x, stage: "contacted", lastContact: new Date().toISOString(),
          interactions: [...(x.interactions || []), { type: bestChannel, stage: "intro", date: new Date().toISOString(), content: msg }],
        } : x));
        log("✉️", `→ ${p.name} via ${bestChannel}`);
      }
    }

    // Phase 4: Follow-ups
    if (agentRef.current.running) {
      log("🔄", "Phase 4 — Relances automatiques");
      const followupPromise = new Promise((resolve) => {
        setProspects(current => {
          const needFollowup = current.filter(p => {
            if (p.stage !== "contacted") return false;
            const lastContact = p.lastContact ? new Date(p.lastContact) : null;
            if (!lastContact) return true;
            const daysSince = (Date.now() - lastContact.getTime()) / (1000*60*60*24);
            return daysSince >= 3;
          }).slice(0, 5);
          resolve(needFollowup);
          return current;
        });
      });
      const needFollowup = await followupPromise;
      for (const p of needFollowup) {
        if (!agentRef.current.running) break;
        const msg = await generateMessage(p, "email", "followup", "Relance après premier contact sans réponse.");
        setProspects(prev => prev.map(x => x.id === p.id ? {
          ...x, interactions: [...(x.interactions || []), { type: "email", stage: "followup", date: new Date().toISOString(), content: msg }],
          lastContact: new Date().toISOString(),
        } : x));
        log("🔄", `Relance: ${p.name}`);
      }
    }

    log("🏁", "Cycle agent terminé !");
    agentRef.current.running = false;
    setAgentRunning(false);
  };

  const stopAgent = () => { agentRef.current.running = false; setAgentRunning(false); log("⏹️", "Agent arrêté"); };

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
            {agentRunning && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#10b981", fontFamily: "'JetBrains Mono'" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite" }} />AGENT ACTIF
            </span>}
            <button className="g-btn" onClick={agentRunning ? stopAgent : runAgent} style={{
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
                <button className="g-btn g-success" onClick={agentRunning ? stopAgent : runAgent} style={{ width: "100%", justifyContent: "center" }}>🤖 Agent Auto</button>
                <button className="g-btn g-ghost" onClick={doForecast} disabled={!!loading} style={{ width: "100%", justifyContent: "center" }}>📊 Prévisions</button>
                <button className="g-btn g-ghost" onClick={exportCSV} style={{ width: "100%", justifyContent: "center" }}>📥 Export CSV</button>
                <button className="g-btn g-ghost" onClick={() => setView("intel")} style={{ width: "100%", justifyContent: "center" }}>🧠 Veille Concur.</button>
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
            <div className="g-card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>🔍 Recherche de Prospects CBD en Europe</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: "0 0 220px" }}>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Pays</label>
                  <select className="g-select" style={{ width: "100%" }} value={searchForm.country} onChange={e => setSearchForm(p => ({ ...p, country: e.target.value }))}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ fontSize: 10, color: "#64748b", display: "block", marginBottom: 3 }}>Ville</label>
                  <input className="g-input" value={searchForm.city} onChange={e => setSearchForm(p => ({ ...p, city: e.target.value }))} placeholder="Toutes les villes principales..." />
                </div>
                <button className="g-btn g-primary" onClick={doSearch} disabled={!!loading} style={{ height: 38 }}>
                  {loading === "search" ? <LoadingDots /> : "🔍 Rechercher"}
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
            </div>

            {/* Multi-country scan */}
            <div className="g-card" style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>Scan Multi-Pays Rapide</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {COUNTRIES.map(c => (
                  <button key={c.code} className="g-btn g-ghost" style={{ padding: "6px 12px" }}
                    onClick={async () => {
                      setSearchForm({ country: c.code, city: "" });
                      setLoading("search");
                      log("🔍", `Scan rapide: ${c.name}`);
                      const results = await searchProspects(c.name, "");
                      if (Array.isArray(results)) {
                        const news = results.map(r => ({ ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`, stage: "discovered", country: c.code, countryName: c.name, flag: c.flag, addedAt: new Date().toISOString(), interactions: [], score: r.score || 50 }));
                        setProspects(prev => {
                          const existing = new Set(prev.map(p => p.name.toLowerCase()));
                          return [...prev, ...news.filter(n => !existing.has(n.name.toLowerCase()))];
                        });
                        log("✅", `+${results.length} prospects en ${c.name}`);
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
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>🤖 Agent Commercial Autonome</h3>
                  <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>Cycle complet: Scan → Qualification → Outreach → Suivi automatique</p>
                </div>
                <button className="g-btn" onClick={agentRunning ? stopAgent : runAgent} style={{
                  background: agentRunning ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#059669,#10b981)",
                  color: "#fff", padding: "12px 28px", fontSize: 14,
                }}>{agentRunning ? "⏹ Arrêter" : "▶ Lancer Cycle Complet"}</button>
              </div>

              {/* Workflow Steps */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
                {[
                  { n: "1", label: "Scan", desc: "18 pays EU", icon: "🌍", color: "#6366f1" },
                  { n: "2", label: "Identification", desc: "10 types de cibles", icon: "🎯", color: "#8b5cf6" },
                  { n: "3", label: "Qualification", desc: "Scoring + Priorité", icon: "🧠", color: "#ec4899" },
                  { n: "4", label: "Prospection", desc: "Multi-canal IA", icon: "📧", color: "#f59e0b" },
                  { n: "5", label: "Relance", desc: "Séquences auto", icon: "🔄", color: "#06b6d4" },
                  { n: "6", label: "Closing", desc: "Négociation IA", icon: "🤝", color: "#10b981" },
                ].map(s => (
                  <div key={s.n} style={{ background: `${s.color}08`, borderRadius: 10, padding: 12, textAlign: "center", border: `1px solid ${s.color}15` }}>
                    <div style={{ fontSize: 22, marginBottom: 3 }}>{s.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.n}. {s.label}</div>
                    <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

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
      </main>
    </div>
  );
}
