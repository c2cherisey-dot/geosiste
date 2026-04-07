import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// GEOSISTE CRM — L'ENTREPÔT DU CHANVRIER
// CRM Multi-Utilisateurs + Agent IA + Devis + Suivi Commercial
// ═══════════════════════════════════════════════════════════════════════════════

// ─── DATA ───────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "FR", name: "France", flag: "🇫🇷", lang: "fr", cities: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Montpellier","Strasbourg","Bordeaux","Lille","Rennes","Reims","Saint-Étienne","Le Havre","Toulon","Grenoble","Dijon","Angers","Nîmes","Clermont-Ferrand","Le Mans","Aix-en-Provence","Brest","Tours","Amiens","Limoges","Perpignan","Metz","Besançon","Orléans","Rouen","Mulhouse","Caen","Nancy","Avignon","Poitiers","Pau","La Rochelle","Bayonne","Cannes","Antibes","Ajaccio","Colmar","Troyes","Valence","Chambéry","Annecy","Saint-Nazaire","Cholet","Chartres","Beauvais","Saint-Brieuc","Agen","Brive","Carcassonne"] },
  { code: "DE", name: "Allemagne", flag: "🇩🇪", lang: "de", cities: ["Berlin","Hamburg","München","Köln","Frankfurt","Stuttgart","Düsseldorf","Leipzig","Dortmund","Essen","Bremen","Dresden","Hannover","Nürnberg","Bonn","Münster","Mannheim","Karlsruhe","Augsburg","Wiesbaden","Aachen","Braunschweig","Kiel","Freiburg","Mainz","Erfurt","Rostock","Kassel","Potsdam","Saarbrücken","Heidelberg","Darmstadt","Regensburg","Würzburg","Ulm","Trier","Konstanz"] },
  { code: "ES", name: "Espagne", flag: "🇪🇸", lang: "es", cities: ["Madrid","Barcelona","Valencia","Sevilla","Zaragoza","Málaga","Murcia","Palma de Mallorca","Bilbao","Alicante","Córdoba","Valladolid","Granada","San Sebastián","Salamanca","Marbella","Ibiza"] },
  { code: "IT", name: "Italie", flag: "🇮🇹", lang: "it", cities: ["Roma","Milano","Napoli","Torino","Palermo","Genova","Bologna","Firenze","Bari","Venezia","Verona","Padova","Trieste","Brescia","Parma","Modena","Perugia","Rimini","Pescara","Bergamo","Trento","Bolzano","Lecce","Salerno"] },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱", lang: "nl", cities: ["Amsterdam","Rotterdam","Den Haag","Utrecht","Eindhoven","Groningen","Tilburg","Breda","Nijmegen","Arnhem","Haarlem","Maastricht","Leiden","Delft","Leeuwarden"] },
  { code: "BE", name: "Belgique", flag: "🇧🇪", lang: "fr", cities: ["Bruxelles","Anvers","Gand","Charleroi","Liège","Bruges","Namur","Louvain","Mons","Courtrai","Hasselt","Ostende","Arlon"] },
  { code: "CH", name: "Suisse", flag: "🇨🇭", lang: "fr", cities: ["Zürich","Genève","Basel","Lausanne","Bern","Luzern","St. Gallen","Lugano","Fribourg","Sion","Neuchâtel","Montreux"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", lang: "pt", cities: ["Lisboa","Porto","Braga","Coimbra","Faro","Aveiro","Évora","Leiria","Portimão"] },
  { code: "AT", name: "Autriche", flag: "🇦🇹", lang: "de", cities: ["Wien","Graz","Linz","Salzburg","Innsbruck","Klagenfurt","Villach","Wels","Bregenz"] },
  { code: "CZ", name: "Rép. Tchèque", flag: "🇨🇿", lang: "en", cities: ["Praha","Brno","Ostrava","Plzeň","Liberec","Olomouc","Karlovy Vary"] },
  { code: "PL", name: "Pologne", flag: "🇵🇱", lang: "pl", cities: ["Warszawa","Kraków","Wrocław","Poznań","Gdańsk","Szczecin","Lublin","Katowice","Białystok","Toruń"] },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧", lang: "en", cities: ["London","Birmingham","Manchester","Leeds","Glasgow","Liverpool","Bristol","Edinburgh","Cardiff","Belfast","Brighton","Oxford","Cambridge","Bath","York","Norwich"] },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", lang: "fr", cities: ["Luxembourg","Esch-sur-Alzette"] },
  { code: "DK", name: "Danemark", flag: "🇩🇰", lang: "en", cities: ["København","Aarhus","Odense","Aalborg"] },
  { code: "SE", name: "Suède", flag: "🇸🇪", lang: "en", cities: ["Stockholm","Göteborg","Malmö","Uppsala"] },
  { code: "IE", name: "Irlande", flag: "🇮🇪", lang: "en", cities: ["Dublin","Cork","Galway","Limerick"] },
  { code: "GR", name: "Grèce", flag: "🇬🇷", lang: "en", cities: ["Athènes","Thessalonique","Patras","Héraklion"] },
  { code: "HR", name: "Croatie", flag: "🇭🇷", lang: "en", cities: ["Zagreb","Split","Rijeka","Dubrovnik"] },
];

const PIPELINE = [
  { id: "new", label: "Nouveau", color: "#6366f1", icon: "🆕" },
  { id: "contacted", label: "Contacté", color: "#f59e0b", icon: "📧" },
  { id: "meeting", label: "RDV/Appel", color: "#ec4899", icon: "📞" },
  { id: "quote_sent", label: "Devis Envoyé", color: "#8b5cf6", icon: "📄" },
  { id: "negotiation", label: "Négociation", color: "#f97316", icon: "🤝" },
  { id: "won", label: "Gagné", color: "#10b981", icon: "✅" },
  { id: "lost", label: "Perdu", color: "#64748b", icon: "❌" },
];

const PRODUCTS = [
  { cat: "Hash", items: [
    { id: "h1", name: "Résine CBD", unit: "kg", price: 1500 },
    { id: "h2", name: "Résine MCP-N", unit: "kg", price: 2500 },
    { id: "h3", name: "Résine 10-OH-HHC", unit: "kg", price: 3000 },
    { id: "h4", name: "Résine CSA", unit: "kg", price: 3500 },
    { id: "h5", name: "Pollen CBD", unit: "kg", price: 1200 },
  ]},
  { cat: "Fleurs", items: [
    { id: "f1", name: "Indoor Premium", unit: "kg", price: 2500 },
    { id: "f2", name: "Hydroponie", unit: "kg", price: 3500 },
    { id: "f3", name: "Greenhouse", unit: "kg", price: 1500 },
    { id: "f4", name: "Mini Bud", unit: "kg", price: 1000 },
    { id: "f5", name: "Trim", unit: "kg", price: 300 },
  ]},
  { cat: "Vape", items: [
    { id: "v1", name: "Puff 0.5ml CBD", unit: "unité", price: 5 },
    { id: "v2", name: "Pod 1ml CBD", unit: "unité", price: 8 },
    { id: "v3", name: "Formule Explosive", unit: "unité", price: 7 },
  ]},
  { cat: "Extraction", items: [
    { id: "e1", name: "Distillat CBD", unit: "kg", price: 5000 },
    { id: "e2", name: "Isolat CBD 99%", unit: "kg", price: 4000 },
  ]},
  { cat: "Moonrock", items: [
    { id: "m1", name: "Moonrock CBD", unit: "kg", price: 3500 },
    { id: "m2", name: "Moonrock MCP-N", unit: "kg", price: 4500 },
  ]},
  { cat: "Huiles", items: [
    { id: "o1", name: "Huile CBD 10%", unit: "unité", price: 10 },
    { id: "o2", name: "Huile CBD 20%", unit: "unité", price: 16 },
    { id: "o3", name: "Huile CBD 30%", unit: "unité", price: 22 },
    { id: "o4", name: "Velaria Premium", unit: "unité", price: 25 },
  ]},
  { cat: "Pre Rolls", items: [
    { id: "p1", name: "Pre Roll CBD", unit: "unité", price: 2 },
    { id: "p2", name: "Jok'Air", unit: "unité", price: 4 },
  ]},
];
const ALL_PRODUCTS = PRODUCTS.flatMap(c => c.items);
const PROSPECT_TYPES = ["CBD Shop","Tabac/Vape Shop","E-shop CBD","Grossiste","Franchise","Parapharmacie","Herboristerie","Magasin Bio","Head Shop"];

// ─── STORAGE ────────────────────────────────────────────────────────────────
const LS = {
  get: (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

// ─── AI ENGINE ──────────────────────────────────────────────────────────────
async function ai(sys, usr, json = false) {
  try {
    const endpoints = ['/api/claude', 'https://api.anthropic.com/v1/messages'];
    for (const ep of endpoints) {
      try {
        const r = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: [{ role: "user", content: usr }] }) });
        if (!r.ok) continue;
        const d = await r.json();
        const t = d.content?.map(b => b.text || "").join("\n") || "";
        if (json) { try { return JSON.parse(t.replace(/```json|```/g, "").trim()); } catch { return null; } }
        return t;
      } catch { continue; }
    }
    return json ? null : "[Erreur API]";
  } catch { return json ? null : "[Erreur]"; }
}

const AI_SYS = `Tu es l'assistant commercial IA de L'Entrepôt du Chanvrier, grossiste CBD français.
Catalogue: Hash (CBD/MCP-N/CSA), Fleurs (Indoor/Hydro/Greenhouse), Vape (Formule Explosive), Moonrock, Huiles (Velaria), Pre Rolls (Jok'Air).
Molécules: CBD, CBG, CBN, MCP-N, 10-OH-HHC, CSA.
Avantages: Production française, livraison 24h, pas de MOQ, marque blanche dispo, traçabilité totale.
Site: www.lentrepotduchanvrier.com`;

// ─── GOOGLE PLACES SEARCH ───────────────────────────────────────────────────
const QUERIES = {
  fr: ["boutique CBD","CBD shop","magasin CBD","tabac CBD"],
  de: ["CBD Shop","CBD Laden","Hanfladen","Hemp Shop"],
  es: ["tienda CBD","CBD shop","herbolario CBD"],
  it: ["negozio CBD","CBD shop","canapa shop"],
  en: ["CBD shop","CBD store","hemp shop","vape CBD"],
  pt: ["loja CBD","CBD shop"], nl: ["CBD winkel","CBD shop"], pl: ["sklep CBD","CBD shop"],
};

async function searchPlaces(country, city) {
  const cd = COUNTRIES.find(c => c.name === country || c.code === country);
  const lang = cd?.lang || "en";
  const qs = QUERIES[lang] || QUERIES.en;
  const loc = city ? `${city}, ${cd?.name || country}` : (cd?.name || country);
  let all = [];
  for (const q of qs.slice(0, 3)) {
    try {
      const r = await fetch('/api/places', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `${q} ${loc}`, radius: 50000 }) });
      if (r.ok) {
        const d = await r.json();
        if (d.results?.length > 0) all.push(...d.results);
        if (d.nextPageToken) {
          await new Promise(r => setTimeout(r, 2000));
          try {
            const r2 = await fetch('/api/places', { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pageToken: d.nextPageToken }) });
            if (r2.ok) { const d2 = await r2.json(); if (d2.results?.length > 0) all.push(...d2.results); }
          } catch {}
        }
      }
    } catch {}
  }
  const seen = new Set();
  all = all.filter(r => { const k = r.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  return all.map(r => {
    const addr = (r.address || '').split(',').map(s => s.trim());
    return {
      name: r.name, type: "CBD Shop", city: city || addr[1] || '', phone: r.phone || '', email: '',
      website: r.website || '', instagram: '', googleMapsUrl: r.googleMapsUrl || '',
      rating: r.rating || 0, reviewCount: r.reviewCount || 0,
      score: Math.min(95, Math.round((r.rating || 3) * 15 + (r.reviewCount || 0) * 0.3)),
      notes: `${r.rating ? '⭐' + r.rating : ''} ${r.reviewCount ? '(' + r.reviewCount + ' avis)' : ''}`.trim(),
      placeId: r.placeId, source: 'google_places',
    };
  });
}

// ─── GMAIL HELPERS ──────────────────────────────────────────────────────────
async function gmailAction(action, params = {}) {
  try {
    const rt = localStorage.getItem('gmail_refresh_token');
    const r = await fetch('/api/gmail', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, refreshToken: rt, ...params }) });
    return await r.json();
  } catch (e) { return { error: e.message }; }
}

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 32 }) => {
  const s = score || 0, pct = s / 100;
  const col = s >= 70 ? "#10b981" : s >= 40 ? "#f59e0b" : "#ef4444";
  const r = size / 2 - 3, c = 2 * Math.PI * r;
  return <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={3}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={3} strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"/>
    <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={col} fontSize={size>28?10:8} fontWeight={700} style={{ transform:"rotate(90deg)", transformOrigin:"center", fontFamily:"'JetBrains Mono'" }}>{s}</text>
  </svg>;
};
const Dots = () => <span style={{ display:"inline-flex",gap:3 }}>{[0,1,2].map(i=><span key={i} style={{ width:5,height:5,borderRadius:"50%",background:"#6366f1",animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}</span>;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function GeosisteCRM() {
  // ─── AUTH STATE ───────────────────────────────────────────────────────────
  const [user, setUser] = useState(null); // { id, name, email, role: 'admin'|'employee' }
  const [users, setUsers] = useState([]); // all users (admin sees all)
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [authError, setAuthError] = useState("");

  // ─── CRM STATE ────────────────────────────────────────────────────────────
  const [view, setView] = useState("dashboard");
  const [prospects, setProspects] = useState([]);
  const [activities, setActivities] = useState([]); // { id, userId, userName, prospectId, prospectName, type, comment, date }
  const [quotes, setQuotes] = useState([]); // { id, prospectId, prospectName, userId, items:[{productId,qty,price}], total, status, date, sageRef }
  const [loading, setLoading] = useState("");
  const [selected, setSelected] = useState(null);
  const [modalTab, setModalTab] = useState("info");
  const [aiOutput, setAiOutput] = useState("");
  const [searchForm, setSearchForm] = useState({ country: "FR", city: "" });
  const [filters, setFilters] = useState({ stage: "all", country: "all", assignee: "all", search: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [newProspect, setNewProspect] = useState({ name:"",type:"CBD Shop",city:"",country:"FR",phone:"",email:"",website:"",instagram:"",notes:"" });
  const [quoteItems, setQuoteItems] = useState([{ productId: "", qty: 1 }]);
  const [commentText, setCommentText] = useState("");
  const [gmailOk, setGmailOk] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const agentRef = useRef({ running: false });
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog] = useState([]);
  const [adminTab, setAdminTab] = useState("team"); // team | activity | prospects

  // ─── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const u = LS.get("crm_user");
    if (u) setUser(u);
    setUsers(LS.get("crm_users") || [
      { id: "admin1", name: "Carl", email: "admin@chanvrier.com", password: "admin", role: "admin", createdAt: new Date().toISOString() }
    ]);
    setProspects(LS.get("crm_prospects") || []);
    setActivities(LS.get("crm_activities") || []);
    setQuotes(LS.get("crm_quotes") || []);
    // Gmail
    const gt = localStorage.getItem('gmail_refresh_token');
    if (gt) {
      gmailAction('profile').then(p => { if (p.emailAddress) { setGmailOk(true); setGmailEmail(p.emailAddress); } });
    }
    // OAuth callback
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      gmailAction('exchange_token', { code }).then(d => {
        if (d.refreshToken) {
          localStorage.setItem('gmail_refresh_token', d.refreshToken);
          setGmailOk(true);
          window.history.replaceState({}, '', window.location.pathname);
        }
      });
    }
  }, []);

  // Save on change
  useEffect(() => { if (user) { LS.set("crm_prospects", prospects); } }, [prospects]);
  useEffect(() => { if (user) { LS.set("crm_activities", activities); } }, [activities]);
  useEffect(() => { if (user) { LS.set("crm_quotes", quotes); } }, [quotes]);
  useEffect(() => { LS.set("crm_users", users); }, [users]);

  // ─── AUTH FUNCTIONS ───────────────────────────────────────────────────────
  const doLogin = () => {
    const found = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (!found) { setAuthError("Email ou mot de passe incorrect"); return; }
    setUser(found); LS.set("crm_user", found); setAuthError("");
  };

  const doRegister = () => {
    if (!loginForm.name || !loginForm.email || !loginForm.password) { setAuthError("Remplissez tous les champs"); return; }
    if (users.find(u => u.email === loginForm.email)) { setAuthError("Cet email existe déjà"); return; }
    const newUser = { id: `u${Date.now()}`, name: loginForm.name, email: loginForm.email, password: loginForm.password, role: "employee", createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser); LS.set("crm_user", newUser); setAuthError("");
  };

  const doLogout = () => { setUser(null); LS.del("crm_user"); setView("dashboard"); };

  const isAdmin = user?.role === "admin";

  // ─── CRM FUNCTIONS ────────────────────────────────────────────────────────
  const addActivity = useCallback((prospectId, prospectName, type, comment) => {
    if (!user) return;
    const act = { id: `a${Date.now()}${Math.random().toString(36).slice(2,5)}`, userId: user.id, userName: user.name,
      prospectId, prospectName, type, comment, date: new Date().toISOString() };
    setActivities(prev => [act, ...prev].slice(0, 2000));
  }, [user]);

  const moveStage = useCallback((id, newStage, comment) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, stage: newStage, lastUpdate: new Date().toISOString() } : p));
    const p = prospects.find(x => x.id === id);
    if (p) addActivity(id, p.name, `Pipeline → ${PIPELINE.find(s=>s.id===newStage)?.label}`, comment || "");
  }, [prospects, addActivity]);

  const assignProspect = useCallback((id, userId) => {
    const assignee = users.find(u => u.id === userId);
    setProspects(prev => prev.map(p => p.id === id ? { ...p, assignedTo: userId, assignedName: assignee?.name || "" } : p));
    const p = prospects.find(x => x.id === id);
    if (p) addActivity(id, p.name, "Assigné", `Assigné à ${assignee?.name}`);
  }, [prospects, users, addActivity]);

  const addManualProspect = () => {
    if (!newProspect.name.trim()) return;
    const c = COUNTRIES.find(x => x.code === newProspect.country);
    const p = { ...newProspect, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
      stage: "new", countryName: c?.name || "", flag: c?.flag || "🏳️",
      addedAt: new Date().toISOString(), addedBy: user?.id, addedByName: user?.name,
      assignedTo: user?.id, assignedName: user?.name,
      interactions: [], score: 50, lastUpdate: new Date().toISOString() };
    setProspects(prev => [...prev, p]);
    addActivity(p.id, p.name, "Créé", "Prospect ajouté manuellement");
    setNewProspect({ name:"",type:"CBD Shop",city:"",country:"FR",phone:"",email:"",website:"",instagram:"",notes:"" });
    setShowAddModal(false);
  };

  const validateContact = (prospect, comment) => {
    if (!comment.trim()) return;
    moveStage(prospect.id, prospect.stage === "new" ? "contacted" : prospect.stage, comment);
    const inter = { type: "contact", date: new Date().toISOString(), by: user?.name, comment };
    setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, interactions: [...(p.interactions||[]), inter] } : p));
    setSelected(prev => prev?.id === prospect.id ? { ...prev, interactions: [...(prev.interactions||[]), inter] } : prev);
    addActivity(prospect.id, prospect.name, "Contact validé", comment);
    setCommentText("");
  };

  // ─── QUOTE FUNCTIONS ──────────────────────────────────────────────────────
  const createQuote = (prospect) => {
    const items = quoteItems.filter(i => i.productId && i.qty > 0).map(i => {
      const prod = ALL_PRODUCTS.find(p => p.id === i.productId);
      return { productId: i.productId, name: prod?.name || "", unit: prod?.unit || "", qty: i.qty, unitPrice: prod?.price || 0, total: (prod?.price || 0) * i.qty };
    });
    if (items.length === 0) return;
    const total = items.reduce((a, i) => a + i.total, 0);
    const q = { id: `q${Date.now()}`, prospectId: prospect.id, prospectName: prospect.name,
      userId: user?.id, userName: user?.name, items, total, status: "draft",
      date: new Date().toISOString(), sageRef: "" };
    setQuotes(prev => [...prev, q]);
    moveStage(prospect.id, "quote_sent", `Devis #${q.id.slice(-6)} — ${total.toLocaleString()}€`);
    addActivity(prospect.id, prospect.name, "Devis créé", `${total.toLocaleString()}€ — ${items.length} produit(s)`);
    setQuoteItems([{ productId: "", qty: 1 }]);
    setShowQuoteModal(false);
  };

  // ─── IMPORT CSV/JSON ──────────────────────────────────────────────────────
  const importFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let imported = [];
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(text);
          imported = (Array.isArray(data) ? data : [data]).map(r => ({
            name: r.name||r.nom||"", type: r.type||"CBD Shop", city: r.city||r.ville||"",
            country: r.country||r.pays||"FR", phone: r.phone||r.telephone||r.tel||"",
            email: r.email||r.mail||"", website: r.website||r.site||"", instagram: r.instagram||"",
            notes: r.notes||"", score: r.score||50,
          }));
        } else {
          const lines = text.split("\n").filter(l => l.trim());
          if (lines.length < 2) return;
          const hdr = lines[0].split(/[,;]/).map(h => h.replace(/"/g,"").trim().toLowerCase());
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(/[,;]/).map(v => v.replace(/"/g,"").trim());
            const row = {}; hdr.forEach((h,idx) => { row[h] = vals[idx]||""; });
            imported.push({
              name: row.nom||row.name||row.entreprise||"", type: row.type||"CBD Shop",
              city: row.ville||row.city||"", country: row.pays||row.country||"FR",
              phone: row.telephone||row.phone||row.tel||"", email: row.email||row.mail||"",
              website: row.site||row.website||"", instagram: row.instagram||"",
              notes: row.notes||"", score: parseInt(row.score)||50,
            });
          }
        }
        const news = imported.filter(r => r.name).map(r => {
          const c = COUNTRIES.find(x => x.code===r.country || x.name.toLowerCase()===r.country.toLowerCase());
          return { ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
            stage: "new", country: c?.code||r.country, countryName: c?.name||r.country, flag: c?.flag||"🏳️",
            addedAt: new Date().toISOString(), addedBy: user?.id, addedByName: user?.name,
            assignedTo: null, assignedName: "", interactions: [], lastUpdate: new Date().toISOString() };
        });
        setProspects(prev => {
          const ex = new Set(prev.map(p => p.name.toLowerCase()));
          return [...prev, ...news.filter(n => !ex.has(n.name.toLowerCase()))];
        });
        addActivity("import", "Import", "Import fichier", `${news.length} prospects depuis ${file.name}`);
      } catch {}
    };
    reader.readAsText(file); e.target.value = "";
  };

  // ─── EXPORT CSV ───────────────────────────────────────────────────────────
  const exportCSV = () => {
    const h = ["Nom","Type","Ville","Pays","Score","Stade","Assigné à","Téléphone","Email","Site","Dernier Update"];
    const rows = filtered.map(p => [p.name,p.type,p.city,p.countryName,p.score||"",PIPELINE.find(s=>s.id===p.stage)?.label,
      p.assignedName||"",p.phone||"",p.email||"",p.website||"",p.lastUpdate?new Date(p.lastUpdate).toLocaleDateString("fr-FR"):""]);
    const csv = [h,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`prospects_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── AGENT SCAN ───────────────────────────────────────────────────────────
  const runScan = async (countries) => {
    agentRef.current.running = true; setAgentRunning(true); setAgentLog([]);
    const targets = countries || COUNTRIES;
    for (const country of targets) {
      if (!agentRef.current.running) break;
      for (const city of country.cities) {
        if (!agentRef.current.running) break;
        setAgentLog(prev => [{ id: Date.now(), msg: `🔍 ${city}, ${country.name}` }, ...prev].slice(0,100));
        const results = await searchPlaces(country.name, city);
        if (results.length > 0) {
          const news = results.map(r => ({ ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
            stage: "new", country: country.code, countryName: country.name, flag: country.flag,
            addedAt: new Date().toISOString(), addedBy: user?.id, addedByName: user?.name,
            assignedTo: null, assignedName: "", interactions: [], lastUpdate: new Date().toISOString() }));
          setProspects(prev => {
            const ex = new Set(prev.map(p => p.name.toLowerCase()));
            return [...prev, ...news.filter(n => !ex.has(n.name.toLowerCase()))];
          });
          setAgentLog(prev => [{ id: Date.now()+1, msg: `✅ +${results.length} à ${city}` }, ...prev].slice(0,100));
        }
        await new Promise(r => setTimeout(r, 50));
      }
    }
    agentRef.current.running = false; setAgentRunning(false);
    setAgentLog(prev => [{ id: Date.now(), msg: "🏁 Scan terminé !" }, ...prev]);
  };

  // ─── FILTERED & STATS ─────────────────────────────────────────────────────
  const myProspects = useMemo(() => isAdmin ? prospects : prospects.filter(p => p.assignedTo === user?.id || !p.assignedTo), [prospects, user, isAdmin]);

  const filtered = useMemo(() => {
    return myProspects.filter(p => {
      if (filters.stage !== "all" && p.stage !== filters.stage) return false;
      if (filters.country !== "all" && p.country !== filters.country) return false;
      if (filters.assignee !== "all" && p.assignedTo !== filters.assignee) return false;
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.city?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [myProspects, filters]);

  const stats = useMemo(() => ({
    total: myProspects.length,
    byStage: PIPELINE.map(s => ({ ...s, count: myProspects.filter(p => p.stage === s.id).length })),
    byCountry: COUNTRIES.map(c => ({ ...c, count: myProspects.filter(p => p.country === c.code).length })).filter(c => c.count > 0).sort((a,b) => b.count - a.count),
    won: myProspects.filter(p => p.stage === "won").length,
    quotesTotal: quotes.reduce((a, q) => a + q.total, 0),
    todayActivities: activities.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length,
  }), [myProspects, quotes, activities]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#06080d", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{ background:"rgba(12,15,24,.9)", border:"1px solid rgba(99,102,241,.15)", borderRadius:20, padding:36, width:"90%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 12px" }}>⚡</div>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#f1f5f9",margin:0 }}>Geosiste CRM</h1>
          <p style={{ fontSize:11,color:"#6366f1",margin:"4px 0 0",fontFamily:"'JetBrains Mono'",letterSpacing:".08em" }}>L'ENTREPÔT DU CHANVRIER</p>
        </div>
        <div style={{ display:"flex",gap:2,marginBottom:20,background:"rgba(15,18,30,.6)",padding:3,borderRadius:9 }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }}
              style={{ flex:1,padding:"8px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",
                background:authMode===m?"rgba(99,102,241,.15)":"transparent",color:authMode===m?"#a5b4fc":"#64748b" }}>
              {m === "login" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>
        {authMode === "register" && (
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:3 }}>Nom complet</label>
            <input style={{ width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid rgba(99,102,241,.15)",background:"rgba(8,10,18,.9)",color:"#d1d5db",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }}
              value={loginForm.name} onChange={e => setLoginForm(p=>({...p,name:e.target.value}))} placeholder="Jean Dupont"/>
          </div>
        )}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:3 }}>Email</label>
          <input style={{ width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid rgba(99,102,241,.15)",background:"rgba(8,10,18,.9)",color:"#d1d5db",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }}
            value={loginForm.email} onChange={e => setLoginForm(p=>({...p,email:e.target.value}))} placeholder="email@exemple.com"
            onKeyDown={e => e.key === "Enter" && (authMode === "login" ? doLogin() : doRegister())}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:3 }}>Mot de passe</label>
          <input type="password" style={{ width:"100%",padding:"10px 13px",borderRadius:9,border:"1px solid rgba(99,102,241,.15)",background:"rgba(8,10,18,.9)",color:"#d1d5db",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }}
            value={loginForm.password} onChange={e => setLoginForm(p=>({...p,password:e.target.value}))} placeholder="••••••"
            onKeyDown={e => e.key === "Enter" && (authMode === "login" ? doLogin() : doRegister())}/>
        </div>
        {authError && <div style={{ fontSize:11,color:"#ef4444",marginBottom:12,textAlign:"center" }}>{authError}</div>}
        <button onClick={authMode === "login" ? doLogin : doRegister}
          style={{ width:"100%",padding:"12px",borderRadius:10,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",
            background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"#fff" }}>
          {authMode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
        <p style={{ fontSize:10,color:"#475569",textAlign:"center",marginTop:16 }}>
          Admin par défaut : admin@chanvrier.com / admin
        </p>
      </div>
    </div>
  );

  // ─── MAIN CRM ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh",background:"#06080d",color:"#d1d5db",fontFamily:"'Outfit',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .C{background:rgba(12,15,24,.85);border:1px solid rgba(99,102,241,.08);border-radius:14px;padding:20px;backdrop-filter:blur(16px);animation:fadeUp .3s ease}
        .B{padding:9px 18px;border-radius:9px;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
        .B:active{transform:scale(.97)}
        .BP{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}
        .BS{background:linear-gradient(135deg,#059669,#10b981);color:#fff}
        .BD{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff}
        .BG{background:transparent;border:1px solid rgba(99,102,241,.2);color:#a5b4fc}
        .BG:hover{background:rgba(99,102,241,.08)}
        .I{padding:9px 13px;border-radius:9px;border:1px solid rgba(99,102,241,.15);background:rgba(8,10,18,.9);color:#d1d5db;font-size:12px;font-family:inherit;outline:none;width:100%;box-sizing:border-box}
        .I:focus{border-color:#6366f1}
        .S{padding:9px 13px;border-radius:9px;border:1px solid rgba(99,102,241,.15);background:rgba(8,10,18,.9);color:#d1d5db;font-size:12px;font-family:inherit;outline:none}
        .T{display:inline-flex;align-items:center;padding:3px 9px;border-radius:16px;font-size:10px;font-weight:600}
        *{scrollbar-width:thin;scrollbar-color:rgba(99,102,241,.2) transparent}
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header style={{ background:"rgba(6,8,13,.92)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(99,102,241,.08)",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ maxWidth:1500,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,padding:"0 16px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>⚡</div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#f1f5f9" }}>Geosiste CRM</div>
              <div style={{ fontSize:8,color:"#6366f1",fontFamily:"'JetBrains Mono'",letterSpacing:".08em",textTransform:"uppercase" }}>L'Entrepôt du Chanvrier</div>
            </div>
          </div>

          <nav style={{ display:"flex",gap:2,background:"rgba(15,18,30,.6)",padding:2,borderRadius:9 }}>
            {[
              { id:"dashboard",label:"Dashboard",icon:"📊" },
              { id:"prospects",label:"Prospects",icon:"👥" },
              { id:"pipeline",label:"Pipeline",icon:"📈" },
              { id:"scan",label:"Scanner",icon:"🔍" },
              { id:"quotes",label:"Devis",icon:"📄" },
              ...(isAdmin ? [{ id:"admin",label:"Admin",icon:"👑" }] : []),
            ].map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                style={{ padding:"7px 12px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"inherit",
                  display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",
                  background:view===t.id?"rgba(99,102,241,.15)":"transparent",color:view===t.id?"#a5b4fc":"#64748b" }}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {agentRunning && <span style={{ display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#10b981",fontFamily:"'JetBrains Mono'" }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#10b981",animation:"pulse 1s infinite" }}/>SCAN
            </span>}
            <span style={{ fontSize:11,color:"#94a3b8" }}>👤 {user.name}</span>
            {isAdmin && <span className="T" style={{ background:"rgba(245,158,11,.15)",color:"#fbbf24" }}>Admin</span>}
            <button className="B BG" onClick={doLogout} style={{ padding:"5px 10px",fontSize:10 }}>Déconnexion</button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1500,margin:"0 auto",padding:"16px 16px 60px" }}>

        {/* ═══ DASHBOARD ═══════════════════════════════════════════════════════ */}
        {view === "dashboard" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))",gap:12,marginBottom:16 }}>
              {[
                { label:"Total Prospects",value:stats.total,color:"#a5b4fc" },
                ...stats.byStage.map(s => ({ label:s.label,value:s.count,color:s.color })),
                { label:"CA Devis",value:`${(stats.quotesTotal/1000).toFixed(1)}k€`,color:"#10b981" },
                { label:"Activités Aujourd'hui",value:stats.todayActivities,color:"#06b6d4" },
              ].map((k,i) => (
                <div key={i} className="C" style={{ textAlign:"center",padding:14 }}>
                  <div style={{ fontSize:9,color:"#64748b",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4 }}>{k.label}</div>
                  <div style={{ fontSize:24,fontWeight:800,color:k.color,fontFamily:"'JetBrains Mono'" }}>{k.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:16 }}>
              <div className="C">
                <h3 style={{ fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:12 }}>Activité Récente</h3>
                {activities.slice(0,12).map(a => (
                  <div key={a.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(99,102,241,.04)",fontSize:11 }}>
                    <span style={{ color:"#475569",fontFamily:"'JetBrains Mono'",fontSize:9,minWidth:80 }}>{new Date(a.date).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
                    <span className="T" style={{ background:"rgba(99,102,241,.1)",color:"#a5b4fc" }}>{a.userName}</span>
                    <span style={{ color:"#94a3b8" }}>{a.type} — {a.prospectName}</span>
                    {a.comment && <span style={{ color:"#64748b",fontStyle:"italic" }}>"{a.comment.slice(0,40)}"</span>}
                  </div>
                ))}
                {activities.length === 0 && <div style={{ color:"#475569",textAlign:"center",padding:20,fontSize:12 }}>Aucune activité</div>}
              </div>
              <div className="C" style={{ display:"flex",flexDirection:"column",gap:8 }}>
                <h3 style={{ fontSize:13,fontWeight:700,color:"#f1f5f9" }}>Actions</h3>
                <button className="B BP" onClick={() => setView("scan")} style={{ width:"100%",justifyContent:"center" }}>🔍 Scanner des Prospects</button>
                <button className="B BS" onClick={() => setShowAddModal(true)} style={{ width:"100%",justifyContent:"center" }}>➕ Ajouter Prospect</button>
                <button className="B BG" onClick={() => setView("quotes")} style={{ width:"100%",justifyContent:"center" }}>📄 Créer un Devis</button>
                <button className="B BG" onClick={exportCSV} style={{ width:"100%",justifyContent:"center" }}>📥 Export CSV</button>
                <label className="B BG" style={{ width:"100%",justifyContent:"center",cursor:"pointer",boxSizing:"border-box" }}>
                  📂 Importer CSV/JSON<input type="file" accept=".csv,.json" onChange={importFile} style={{ display:"none" }}/>
                </label>
              </div>
            </div>

            {stats.byCountry.length > 0 && (
              <div className="C">
                <h3 style={{ fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:12 }}>Répartition par Pays</h3>
                <div style={{ display:"flex",flexWrap:"wrap",gap:12 }}>
                  {stats.byCountry.slice(0,12).map(c => (
                    <div key={c.code} style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:16 }}>{c.flag}</span>
                      <span style={{ fontSize:11,color:"#94a3b8" }}>{c.name}</span>
                      <span style={{ fontSize:12,fontWeight:700,color:"#a5b4fc",fontFamily:"'JetBrains Mono'" }}>{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ PROSPECTS LIST ══════════════════════════════════════════════════ */}
        {view === "prospects" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div className="C" style={{ marginBottom:12,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
              <input className="I" style={{ maxWidth:180 }} placeholder="Rechercher..." value={filters.search} onChange={e => setFilters(p=>({...p,search:e.target.value}))}/>
              <select className="S" value={filters.stage} onChange={e => setFilters(p=>({...p,stage:e.target.value}))}>
                <option value="all">Toutes étapes</option>
                {PIPELINE.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
              <select className="S" value={filters.country} onChange={e => setFilters(p=>({...p,country:e.target.value}))}>
                <option value="all">Tous pays</option>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </select>
              {isAdmin && <select className="S" value={filters.assignee} onChange={e => setFilters(p=>({...p,assignee:e.target.value}))}>
                <option value="all">Tous employés</option>
                <option value="">Non assigné</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>}
              <span style={{ marginLeft:"auto",fontSize:11,color:"#64748b",fontFamily:"'JetBrains Mono'" }}>{filtered.length}</span>
              <button className="B BS" onClick={() => setShowAddModal(true)} style={{ fontSize:10,padding:"6px 12px" }}>➕</button>
              <button className="B BG" onClick={exportCSV} style={{ fontSize:10,padding:"6px 12px" }}>📥</button>
            </div>

            <div className="C" style={{ padding:0,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:11 }}>
                <thead><tr style={{ background:"rgba(99,102,241,.05)" }}>
                  {["","Nom","Type","Ville","Pays","Score","Stade","Assigné","Dernier Update"].map(h => (
                    <th key={h} style={{ padding:"8px 6px",textAlign:"left",color:"#64748b",fontWeight:600,fontSize:10 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.slice(0,100).map(p => (
                    <tr key={p.id} style={{ borderBottom:"1px solid rgba(99,102,241,.04)",cursor:"pointer" }}
                      onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); setCommentText(""); }}>
                      <td style={{ padding:"6px",fontSize:14 }}>{p.flag}</td>
                      <td style={{ padding:"6px",fontWeight:600,color:"#e2e8f0" }}>{p.name}</td>
                      <td style={{ padding:"6px" }}><span className="T" style={{ background:"rgba(99,102,241,.08)",color:"#a5b4fc" }}>{p.type}</span></td>
                      <td style={{ padding:"6px",color:"#94a3b8" }}>{p.city}</td>
                      <td style={{ padding:"6px",color:"#94a3b8" }}>{p.countryName}</td>
                      <td style={{ padding:"6px" }}><ScoreRing score={p.score} size={26}/></td>
                      <td style={{ padding:"6px" }}><span className="T" style={{ background:`${PIPELINE.find(s=>s.id===p.stage)?.color}15`,color:PIPELINE.find(s=>s.id===p.stage)?.color }}>{PIPELINE.find(s=>s.id===p.stage)?.icon} {PIPELINE.find(s=>s.id===p.stage)?.label}</span></td>
                      <td style={{ padding:"6px",color:"#94a3b8",fontSize:10 }}>{p.assignedName || "—"}</td>
                      <td style={{ padding:"6px",color:"#475569",fontSize:10 }}>{p.lastUpdate ? new Date(p.lastUpdate).toLocaleDateString("fr-FR") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ PIPELINE ═══════════════════════════════════════════════════════ */}
        {view === "pipeline" && (
          <div style={{ animation:"fadeUp .4s ease",display:"flex",gap:8,overflowX:"auto",paddingBottom:20 }}>
            {PIPELINE.map(stage => {
              const sp = myProspects.filter(p => p.stage === stage.id).sort((a,b) => (b.score||0)-(a.score||0));
              return (
                <div key={stage.id} style={{ flex:"0 0 190px",background:"rgba(12,15,24,.6)",borderRadius:12,padding:10,border:`1px solid ${stage.color}15`,minHeight:400 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,padding:"5px 8px",borderRadius:7,background:`${stage.color}12` }}>
                    <span style={{ fontSize:11,fontWeight:700,color:stage.color }}>{stage.icon} {stage.label}</span>
                    <span style={{ fontSize:10,fontWeight:700,color:stage.color,fontFamily:"'JetBrains Mono'",background:`${stage.color}18`,padding:"1px 7px",borderRadius:8 }}>{sp.length}</span>
                  </div>
                  {sp.map(p => (
                    <div key={p.id} onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); setCommentText(""); }}
                      style={{ background:"rgba(8,10,18,.8)",borderRadius:8,padding:8,marginBottom:5,border:"1px solid rgba(99,102,241,.06)",cursor:"pointer" }}>
                      <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:3 }}>
                        <span style={{ fontSize:11 }}>{p.flag}</span>
                        <span style={{ fontSize:10,fontWeight:600,color:"#e2e8f0",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</span>
                        <ScoreRing score={p.score} size={22}/>
                      </div>
                      <div style={{ fontSize:8,color:"#475569" }}>{p.city} • {p.assignedName || "Non assigné"}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ SCANNER ════════════════════════════════════════════════════════ */}
        {view === "scan" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div className="C" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:12 }}>🔍 Scanner — Google Places API</h3>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end",marginBottom:10 }}>
                <div style={{ flex:"0 0 200px" }}>
                  <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:3 }}>Pays</label>
                  <select className="S" style={{ width:"100%" }} value={searchForm.country} onChange={e => setSearchForm(p=>({...p,country:e.target.value}))}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex:1,minWidth:160 }}>
                  <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:3 }}>Ville</label>
                  <input className="I" value={searchForm.city} onChange={e => setSearchForm(p=>({...p,city:e.target.value}))} placeholder="Optionnel..."/>
                </div>
                <button className="B BP" disabled={!!loading || agentRunning} onClick={async () => {
                  setLoading("search");
                  const c = COUNTRIES.find(x => x.code === searchForm.country);
                  const results = await searchPlaces(c.name, searchForm.city);
                  if (results.length > 0) {
                    const news = results.map(r => ({ ...r, id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
                      stage:"new", country:c.code, countryName:c.name, flag:c.flag,
                      addedAt:new Date().toISOString(), addedBy:user?.id, addedByName:user?.name,
                      assignedTo:null, assignedName:"", interactions:[], lastUpdate:new Date().toISOString() }));
                    setProspects(prev => {
                      const ex = new Set(prev.map(p => p.name.toLowerCase()));
                      return [...prev, ...news.filter(n => !ex.has(n.name.toLowerCase()))];
                    });
                  }
                  setLoading("");
                }}>{loading === "search" ? <Dots/> : "🔍 Rechercher"}</button>
                <button className="B BS" disabled={agentRunning} onClick={() => {
                  const c = COUNTRIES.find(x => x.code === searchForm.country);
                  runScan([c]);
                }}>{agentRunning ? <Dots/> : `🚀 Scan ${COUNTRIES.find(x=>x.code===searchForm.country)?.name} complet`}</button>
              </div>
              {COUNTRIES.find(c => c.code === searchForm.country)?.cities && (
                <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                  {COUNTRIES.find(c => c.code === searchForm.country).cities.slice(0,20).map(city => (
                    <button key={city} className="B BG" style={{ padding:"3px 8px",fontSize:9 }}
                      onClick={() => setSearchForm(p=>({...p,city}))}>{city}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Full Europe scan */}
            <div className="C" style={{ marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8" }}>Scan Europe Complet ({COUNTRIES.reduce((a,c)=>a+c.cities.length,0)} villes)</h4>
                {agentRunning ? <button className="B BD" onClick={() => { agentRef.current.running=false; setAgentRunning(false); }}>⏹ Stop</button>
                  : <button className="B BS" onClick={() => runScan()}>🌍 Lancer Scan Europe</button>}
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                {COUNTRIES.map(c => (
                  <button key={c.code} className="B BG" style={{ padding:"4px 10px",fontSize:10 }} disabled={agentRunning}
                    onClick={() => runScan([c])}>{c.flag} {c.name} ({c.cities.length})</button>
                ))}
              </div>
            </div>

            {/* Agent Log */}
            {agentLog.length > 0 && (
              <div className="C">
                <h4 style={{ fontSize:12,fontWeight:600,color:"#f1f5f9",marginBottom:8 }}>Terminal — {prospects.length} prospects au total</h4>
                <div style={{ maxHeight:250,overflowY:"auto",fontFamily:"'JetBrains Mono'",fontSize:10,background:"rgba(0,0,0,.3)",borderRadius:8,padding:10 }}>
                  {agentLog.map(l => <div key={l.id} style={{ padding:"2px 0",color:"#94a3b8" }}>{l.msg}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ QUOTES / DEVIS ═════════════════════════════════════════════════ */}
        {view === "quotes" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div className="C" style={{ marginBottom:16 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <h3 style={{ fontSize:15,fontWeight:700,color:"#f1f5f9" }}>📄 Devis</h3>
                <div style={{ fontSize:13,fontWeight:700,color:"#10b981",fontFamily:"'JetBrains Mono'" }}>Total: {stats.quotesTotal.toLocaleString()}€</div>
              </div>
              {quotes.length === 0 ? (
                <div style={{ color:"#475569",textAlign:"center",padding:30,fontSize:12 }}>Aucun devis. Ouvrez un prospect → onglet Devis pour en créer un.</div>
              ) : quotes.sort((a,b) => new Date(b.date)-new Date(a.date)).map(q => (
                <div key={q.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(99,102,241,.04)" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{q.prospectName}</div>
                    <div style={{ fontSize:10,color:"#64748b" }}>{q.items.length} produit(s) — par {q.userName} — {new Date(q.date).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <div style={{ fontSize:16,fontWeight:700,color:"#10b981",fontFamily:"'JetBrains Mono'" }}>{q.total.toLocaleString()}€</div>
                  <span className="T" style={{ background:q.status==="draft"?"rgba(245,158,11,.15)":"rgba(16,185,129,.15)",color:q.status==="draft"?"#fbbf24":"#10b981" }}>{q.status==="draft"?"Brouillon":"Envoyé"}</span>
                  {q.sageRef && <span className="T" style={{ background:"rgba(99,102,241,.1)",color:"#a5b4fc" }}>Sage: {q.sageRef}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ ADMIN PANEL ════════════════════════════════════════════════════ */}
        {view === "admin" && isAdmin && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ display:"flex",gap:2,marginBottom:16,background:"rgba(15,18,30,.6)",padding:3,borderRadius:9,width:"fit-content" }}>
              {[{id:"team",label:"👥 Équipe"},{id:"activity",label:"📋 Activité"},{id:"prospects",label:"📊 Prospects"}].map(t => (
                <button key={t.id} onClick={() => setAdminTab(t.id)}
                  style={{ padding:"8px 16px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit",
                    background:adminTab===t.id?"rgba(99,102,241,.15)":"transparent",color:adminTab===t.id?"#a5b4fc":"#64748b" }}>{t.label}</button>
              ))}
            </div>

            {adminTab === "team" && (
              <div className="C">
                <h3 style={{ fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:16 }}>👥 Gestion de l'Équipe</h3>
                {users.map(u => {
                  const uProspects = prospects.filter(p => p.assignedTo === u.id);
                  const uActivities = activities.filter(a => a.userId === u.id);
                  const uWon = uProspects.filter(p => p.stage === "won").length;
                  return (
                    <div key={u.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid rgba(99,102,241,.04)" }}>
                      <div style={{ width:36,height:36,borderRadius:9,background:u.role==="admin"?"linear-gradient(135deg,#f59e0b,#f97316)":"linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:700 }}>{u.name[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{u.name} {u.role==="admin" && <span className="T" style={{ background:"rgba(245,158,11,.15)",color:"#fbbf24",marginLeft:6 }}>Admin</span>}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{u.email} — Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div style={{ textAlign:"center",padding:"0 12px" }}>
                        <div style={{ fontSize:18,fontWeight:700,color:"#a5b4fc",fontFamily:"'JetBrains Mono'" }}>{uProspects.length}</div>
                        <div style={{ fontSize:8,color:"#64748b" }}>Prospects</div>
                      </div>
                      <div style={{ textAlign:"center",padding:"0 12px" }}>
                        <div style={{ fontSize:18,fontWeight:700,color:"#10b981",fontFamily:"'JetBrains Mono'" }}>{uWon}</div>
                        <div style={{ fontSize:8,color:"#64748b" }}>Gagnés</div>
                      </div>
                      <div style={{ textAlign:"center",padding:"0 12px" }}>
                        <div style={{ fontSize:18,fontWeight:700,color:"#06b6d4",fontFamily:"'JetBrains Mono'" }}>{uActivities.length}</div>
                        <div style={{ fontSize:8,color:"#64748b" }}>Actions</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {adminTab === "activity" && (
              <div className="C">
                <h3 style={{ fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:12 }}>📋 Historique Complet ({activities.length})</h3>
                <div style={{ maxHeight:500,overflowY:"auto" }}>
                  {activities.slice(0,100).map(a => (
                    <div key={a.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid rgba(99,102,241,.04)",fontSize:11 }}>
                      <span style={{ color:"#475569",fontFamily:"'JetBrains Mono'",fontSize:9,minWidth:100 }}>{new Date(a.date).toLocaleString("fr-FR")}</span>
                      <span className="T" style={{ background:"rgba(99,102,241,.1)",color:"#a5b4fc",minWidth:60,justifyContent:"center" }}>{a.userName}</span>
                      <span className="T" style={{ background:"rgba(245,158,11,.1)",color:"#fbbf24" }}>{a.type}</span>
                      <span style={{ color:"#e2e8f0",fontWeight:500 }}>{a.prospectName}</span>
                      {a.comment && <span style={{ color:"#64748b" }}>— {a.comment.slice(0,50)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminTab === "prospects" && (
              <div className="C">
                <h3 style={{ fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:12 }}>📊 Tous les Prospects ({prospects.length})</h3>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:10,marginBottom:16 }}>
                  {users.map(u => {
                    const up = prospects.filter(p => p.assignedTo === u.id);
                    return (
                      <div key={u.id} style={{ background:"rgba(99,102,241,.04)",borderRadius:10,padding:12,border:"1px solid rgba(99,102,241,.08)" }}>
                        <div style={{ fontSize:12,fontWeight:600,color:"#e2e8f0",marginBottom:6 }}>{u.name}</div>
                        {PIPELINE.map(s => {
                          const c = up.filter(p => p.stage === s.id).length;
                          return c > 0 ? <div key={s.id} style={{ display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2 }}>
                            <span style={{ color:"#94a3b8" }}>{s.icon} {s.label}</span>
                            <span style={{ color:s.color,fontWeight:700,fontFamily:"'JetBrains Mono'" }}>{c}</span>
                          </div> : null;
                        })}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize:10,color:"#475569" }}>Non assignés: {prospects.filter(p => !p.assignedTo).length}</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ PROSPECT DETAIL MODAL ══════════════════════════════════════════ */}
        {selected && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}
            onClick={() => setSelected(null)}>
            <div style={{ background:"#0a0d16",border:"1px solid rgba(99,102,241,.15)",borderRadius:18,width:"92%",maxWidth:750,maxHeight:"88vh",overflow:"auto",padding:24 }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <span style={{ fontSize:24 }}>{selected.flag}</span>
                    <h2 style={{ fontSize:17,fontWeight:800,color:"#f1f5f9",margin:0 }}>{selected.name}</h2>
                    <ScoreRing score={selected.score} size={32}/>
                  </div>
                  <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                    <span className="T" style={{ background:"rgba(99,102,241,.12)",color:"#a5b4fc" }}>{selected.type}</span>
                    <span className="T" style={{ background:"rgba(16,185,129,.1)",color:"#34d399" }}>{selected.city}, {selected.countryName}</span>
                    <span className="T" style={{ background:`${PIPELINE.find(s=>s.id===selected.stage)?.color}18`,color:PIPELINE.find(s=>s.id===selected.stage)?.color }}>
                      {PIPELINE.find(s=>s.id===selected.stage)?.icon} {PIPELINE.find(s=>s.id===selected.stage)?.label}</span>
                    {selected.assignedName && <span className="T" style={{ background:"rgba(245,158,11,.1)",color:"#fbbf24" }}>👤 {selected.assignedName}</span>}
                    {selected.qualification?.priority && <span className="T" style={{
                      background: selected.qualification.priority==="hot"?"rgba(239,68,68,.15)":selected.qualification.priority==="warm"?"rgba(245,158,11,.15)":"rgba(100,116,139,.15)",
                      color: selected.qualification.priority==="hot"?"#ef4444":selected.qualification.priority==="warm"?"#f59e0b":"#64748b" }}>
                      {selected.qualification.priority==="hot"?"🔥 HOT":selected.qualification.priority==="warm"?"🌤️ WARM":"❄️ COLD"}
                    </span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background:"rgba(239,68,68,.1)",border:"none",color:"#f87171",width:28,height:28,borderRadius:7,cursor:"pointer",fontSize:14 }}>✕</button>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex",gap:2,marginBottom:14,background:"rgba(15,18,30,.6)",padding:2,borderRadius:8 }}>
                {["info","qualify","action","quote","history"].map(t => (
                  <button key={t} style={{ flex:1,padding:"7px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"inherit",
                    background:modalTab===t?"rgba(99,102,241,.15)":"transparent",color:modalTab===t?"#a5b4fc":"#64748b" }}
                    onClick={() => setModalTab(t)}>
                    {t==="info"?"📋 Infos":t==="qualify"?"🧠 Qualification":t==="action"?"✅ Action":t==="quote"?"📄 Devis":"📜 Historique"}
                  </button>
                ))}
              </div>

              {/* Tab: Info */}
              {modalTab === "info" && (
                <div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
                    {[{l:"Téléphone",v:selected.phone},{l:"Email",v:selected.email},{l:"Site web",v:selected.website},{l:"Instagram",v:selected.instagram},{l:"Google Maps",v:selected.googleMapsUrl?"Voir ↗":""},{l:"Notes",v:selected.notes}]
                      .filter(f=>f.v).map(f => (
                      <div key={f.l} style={{ background:"rgba(99,102,241,.04)",borderRadius:8,padding:8 }}>
                        <div style={{ fontSize:9,color:"#475569" }}>{f.l}</div>
                        <div style={{ fontSize:12,color:"#d1d5db" }}>{f.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Pipeline change */}
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:10,color:"#64748b",marginBottom:4 }}>Déplacer dans le pipeline</div>
                    <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                      {PIPELINE.map(s => (
                        <button key={s.id} className="B" style={{ padding:"4px 10px",fontSize:10,
                          background:selected.stage===s.id?`${s.color}30`:"transparent",color:s.color,border:`1px solid ${s.color}30` }}
                          onClick={() => { moveStage(selected.id, s.id, `Passage à ${s.label}`); setSelected(prev => prev ? {...prev,stage:s.id} : null); }}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Assign */}
                  {isAdmin && (
                    <div>
                      <div style={{ fontSize:10,color:"#64748b",marginBottom:4 }}>Assigner à</div>
                      <select className="S" value={selected.assignedTo||""} onChange={e => {
                        assignProspect(selected.id, e.target.value);
                        const u = users.find(x => x.id === e.target.value);
                        setSelected(prev => prev ? {...prev, assignedTo:e.target.value, assignedName:u?.name||""} : null);
                      }}>
                        <option value="">Non assigné</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Qualification IA */}
              {modalTab === "qualify" && (
                <div>
                  <button className="B BP" disabled={loading==="qualify"} onClick={async () => {
                    setLoading("qualify");
                    const q = await ai(
                      `${AI_SYS}\n\nAnalyse ce prospect et qualifie-le en détail. Réponds UNIQUEMENT en JSON valide sans backticks:\n{"score":1-100,"priority":"hot|warm|cold","estimated_monthly_volume":"...","lifetime_value":"...","best_channel":"email|whatsapp|phone|instagram","approach_strategy":"...","recommended_products":[{"name":"...","reason":"..."}],"talking_points":["..."],"objection_risks":["..."],"competitor_risk":"low|medium|high","red_flags":["..."]}`,
                      `Qualifie en détail: ${selected.name} (${selected.type}) à ${selected.city}, ${selected.countryName}. Tel: ${selected.phone||"N/A"}. Site: ${selected.website||"N/A"}. ${selected.notes||""} ${selected.rating ? "Note Google: "+selected.rating+"/5" : ""} ${selected.reviewCount ? "("+selected.reviewCount+" avis)" : ""}`,
                      true
                    );
                    if (q) {
                      setProspects(prev => prev.map(p => p.id === selected.id ? { ...p, qualification: q, score: q.score } : p));
                      setSelected(prev => prev ? { ...prev, qualification: q, score: q.score } : null);
                      addActivity(selected.id, selected.name, "Qualification IA", `Score: ${q.score}/100 — ${q.priority}`);
                    }
                    setLoading("");
                  }} style={{ marginBottom:16 }}>
                    {loading==="qualify" ? <Dots/> : "🧠 Lancer la Qualification IA"}
                  </button>

                  {selected.qualification ? (
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                      <div style={{ background:"rgba(139,92,246,.06)",borderRadius:8,padding:10 }}>
                        <div style={{ fontSize:9,color:"#64748b" }}>Priorité</div>
                        <span className="T" style={{ 
                          background: selected.qualification.priority==="hot"?"rgba(239,68,68,.15)":selected.qualification.priority==="warm"?"rgba(245,158,11,.15)":"rgba(100,116,139,.15)",
                          color: selected.qualification.priority==="hot"?"#ef4444":selected.qualification.priority==="warm"?"#f59e0b":"#64748b",
                          fontSize:12,padding:"4px 12px" }}>
                          {selected.qualification.priority==="hot"?"🔥 HOT":selected.qualification.priority==="warm"?"🌤️ WARM":"❄️ COLD"}
                        </span>
                      </div>
                      <div style={{ background:"rgba(139,92,246,.06)",borderRadius:8,padding:10 }}>
                        <div style={{ fontSize:9,color:"#64748b" }}>Volume Mensuel Estimé</div>
                        <div style={{ fontSize:14,fontWeight:700,color:"#10b981" }}>{selected.qualification.estimated_monthly_volume}</div>
                      </div>
                      <div style={{ background:"rgba(139,92,246,.06)",borderRadius:8,padding:10 }}>
                        <div style={{ fontSize:9,color:"#64748b" }}>Meilleur Canal</div>
                        <div style={{ fontSize:13,color:"#e2e8f0" }}>📧 {selected.qualification.best_channel}</div>
                      </div>
                      <div style={{ background:"rgba(139,92,246,.06)",borderRadius:8,padding:10 }}>
                        <div style={{ fontSize:9,color:"#64748b" }}>Lifetime Value</div>
                        <div style={{ fontSize:14,fontWeight:700,color:"#06b6d4" }}>{selected.qualification.lifetime_value}</div>
                      </div>
                      <div style={{ gridColumn:"1/-1",background:"rgba(139,92,246,.06)",borderRadius:8,padding:10 }}>
                        <div style={{ fontSize:9,color:"#64748b",marginBottom:4 }}>Stratégie d'approche</div>
                        <div style={{ fontSize:12,color:"#d1d5db",lineHeight:1.5 }}>{selected.qualification.approach_strategy}</div>
                      </div>
                      {selected.qualification.recommended_products?.length > 0 && (
                        <div style={{ gridColumn:"1/-1",background:"rgba(16,185,129,.06)",borderRadius:8,padding:10,border:"1px solid rgba(16,185,129,.1)" }}>
                          <div style={{ fontSize:9,color:"#64748b",marginBottom:6 }}>Produits Recommandés</div>
                          {selected.qualification.recommended_products.map((p,i) => (
                            <div key={i} style={{ fontSize:12,color:"#94a3b8",marginBottom:4 }}>
                              • <b style={{ color:"#10b981" }}>{p.name}</b> — {p.reason}
                            </div>
                          ))}
                        </div>
                      )}
                      {selected.qualification.talking_points?.length > 0 && (
                        <div style={{ gridColumn:"1/-1",background:"rgba(99,102,241,.06)",borderRadius:8,padding:10,border:"1px solid rgba(99,102,241,.1)" }}>
                          <div style={{ fontSize:9,color:"#64748b",marginBottom:6 }}>Points d'Accroche</div>
                          {selected.qualification.talking_points.map((t,i) => (
                            <div key={i} style={{ fontSize:12,color:"#a5b4fc",marginBottom:3 }}>💡 {t}</div>
                          ))}
                        </div>
                      )}
                      {selected.qualification.objection_risks?.length > 0 && (
                        <div style={{ gridColumn:"1/-1",background:"rgba(245,158,11,.06)",borderRadius:8,padding:10 }}>
                          <div style={{ fontSize:9,color:"#64748b",marginBottom:6 }}>Risques d'Objection</div>
                          {selected.qualification.objection_risks.map((o,i) => (
                            <div key={i} style={{ fontSize:11,color:"#fbbf24",marginBottom:2 }}>⚠️ {o}</div>
                          ))}
                        </div>
                      )}
                      {selected.qualification.red_flags?.length > 0 && (
                        <div style={{ gridColumn:"1/-1",background:"rgba(239,68,68,.06)",borderRadius:8,padding:10 }}>
                          <div style={{ fontSize:9,color:"#64748b",marginBottom:6 }}>Red Flags</div>
                          {selected.qualification.red_flags.map((r,i) => (
                            <div key={i} style={{ fontSize:11,color:"#f87171",marginBottom:2 }}>🚩 {r}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color:"#475569",textAlign:"center",padding:30,fontSize:12 }}>
                      Cliquez sur "Lancer la Qualification IA" pour analyser ce prospect en détail.
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Action */}
              {modalTab === "action" && (
                <div>
                  <h4 style={{ fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:10 }}>✅ Valider un Contact / Action</h4>
                  <textarea className="I" rows={3} value={commentText} onChange={e => setCommentText(e.target.value)}
                    placeholder="Décrivez l'action (appel passé, email envoyé, RDV pris...)..." style={{ resize:"vertical",marginBottom:10 }}/>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                    {[
                      {label:"📞 Appel passé",stage:"contacted"},{label:"📧 Email envoyé",stage:"contacted"},
                      {label:"📅 RDV pris",stage:"meeting"},{label:"📄 Devis envoyé",stage:"quote_sent"},
                      {label:"🤝 En négociation",stage:"negotiation"},{label:"✅ Gagné !",stage:"won"},{label:"❌ Perdu",stage:"lost"},
                    ].map(a => (
                      <button key={a.label} className="B BG" style={{ fontSize:10 }} disabled={!commentText.trim()}
                        onClick={() => {
                          validateContact(selected, commentText || a.label);
                          moveStage(selected.id, a.stage, commentText || a.label);
                          setSelected(prev => prev ? {...prev,stage:a.stage} : null);
                        }}>{a.label}</button>
                    ))}
                  </div>
                  {/* AI message generator */}
                  <div style={{ marginTop:16,paddingTop:16,borderTop:"1px solid rgba(99,102,241,.08)" }}>
                    <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:8 }}>🤖 Générer un message IA</h4>
                    <div style={{ display:"flex",gap:6 }}>
                      {["Email intro","Relance","Proposition échantillon"].map(type => (
                        <button key={type} className="B BP" style={{ fontSize:10 }} disabled={!!loading}
                          onClick={async () => {
                            setLoading("ai");
                            const msg = await ai(AI_SYS, `Rédige un ${type.toLowerCase()} pour: ${selected.name} (${selected.type}) à ${selected.city}, ${selected.countryName}. ${selected.notes||""}`);
                            setAiOutput(msg);
                            setLoading("");
                          }}>{loading==="ai"?<Dots/>:type}</button>
                      ))}
                    </div>
                    {aiOutput && (
                      <div style={{ background:"rgba(16,185,129,.05)",borderRadius:10,padding:12,marginTop:10,border:"1px solid rgba(16,185,129,.12)" }}>
                        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                          <span style={{ fontSize:11,fontWeight:600,color:"#34d399" }}>Message Généré</span>
                          <button className="B BG" style={{ padding:"3px 8px",fontSize:9 }} onClick={() => navigator.clipboard.writeText(aiOutput)}>📋 Copier</button>
                        </div>
                        <pre style={{ fontSize:11,color:"#cbd5e1",whiteSpace:"pre-wrap",margin:0,fontFamily:"'Outfit'",lineHeight:1.5 }}>{aiOutput}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Quote */}
              {modalTab === "quote" && (
                <div>
                  <h4 style={{ fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:10 }}>📄 Créer un Devis</h4>
                  {quoteItems.map((item, idx) => (
                    <div key={idx} style={{ display:"flex",gap:8,alignItems:"center",marginBottom:8 }}>
                      <select className="S" style={{ flex:2 }} value={item.productId} onChange={e => {
                        const next = [...quoteItems]; next[idx].productId = e.target.value; setQuoteItems(next);
                      }}>
                        <option value="">Choisir un produit...</option>
                        {PRODUCTS.map(cat => (
                          <optgroup key={cat.cat} label={cat.cat}>
                            {cat.items.map(p => <option key={p.id} value={p.id}>{p.name} — {p.price}€/{p.unit}</option>)}
                          </optgroup>
                        ))}
                      </select>
                      <input type="number" className="I" style={{ flex:"0 0 70px" }} min={1} value={item.qty}
                        onChange={e => { const next = [...quoteItems]; next[idx].qty = parseInt(e.target.value)||1; setQuoteItems(next); }}/>
                      <span style={{ fontSize:12,fontWeight:600,color:"#10b981",fontFamily:"'JetBrains Mono'",minWidth:70,textAlign:"right" }}>
                        {((ALL_PRODUCTS.find(p=>p.id===item.productId)?.price||0)*item.qty).toLocaleString()}€
                      </span>
                      <button className="B BD" style={{ padding:"4px 8px",fontSize:10 }}
                        onClick={() => setQuoteItems(prev => prev.filter((_,i) => i !== idx))}>✕</button>
                    </div>
                  ))}
                  <button className="B BG" style={{ fontSize:10,marginBottom:12 }}
                    onClick={() => setQuoteItems(prev => [...prev, { productId:"", qty:1 }])}>+ Ajouter un produit</button>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:"1px solid rgba(99,102,241,.08)" }}>
                    <div style={{ fontSize:18,fontWeight:700,color:"#10b981",fontFamily:"'JetBrains Mono'" }}>
                      Total: {quoteItems.reduce((a,i) => a + (ALL_PRODUCTS.find(p=>p.id===i.productId)?.price||0)*i.qty, 0).toLocaleString()}€
                    </div>
                    <button className="B BS" onClick={() => createQuote(selected)}
                      disabled={quoteItems.filter(i=>i.productId).length===0}>📄 Valider le Devis</button>
                  </div>
                  {/* Existing quotes for this prospect */}
                  {quotes.filter(q => q.prospectId === selected.id).length > 0 && (
                    <div style={{ marginTop:12,paddingTop:12,borderTop:"1px solid rgba(99,102,241,.08)" }}>
                      <h4 style={{ fontSize:11,fontWeight:600,color:"#94a3b8",marginBottom:8 }}>Devis existants</h4>
                      {quotes.filter(q => q.prospectId === selected.id).map(q => (
                        <div key={q.id} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(99,102,241,.04)",fontSize:11 }}>
                          <span style={{ color:"#94a3b8" }}>#{q.id.slice(-6)} — {new Date(q.date).toLocaleDateString("fr-FR")} — {q.items.length} produit(s)</span>
                          <span style={{ fontWeight:700,color:"#10b981",fontFamily:"'JetBrains Mono'" }}>{q.total.toLocaleString()}€</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: History */}
              {modalTab === "history" && (
                <div>
                  <h4 style={{ fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:10 }}>📜 Historique Complet</h4>
                  {activities.filter(a => a.prospectId === selected.id).length === 0 && (selected.interactions||[]).length === 0 ? (
                    <div style={{ color:"#475569",textAlign:"center",padding:20,fontSize:12 }}>Aucune activité enregistrée</div>
                  ) : [...activities.filter(a => a.prospectId === selected.id), ...(selected.interactions||[]).map(i => ({
                    id: i.date, userName: i.by || "Système", type: i.type, comment: i.comment, date: i.date
                  }))].sort((a,b) => new Date(b.date) - new Date(a.date)).map((a,i) => (
                    <div key={i} style={{ display:"flex",gap:8,padding:"8px 0",borderBottom:"1px solid rgba(99,102,241,.04)" }}>
                      <span style={{ fontSize:9,color:"#475569",fontFamily:"'JetBrains Mono'",minWidth:90 }}>{new Date(a.date).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
                      <span className="T" style={{ background:"rgba(99,102,241,.1)",color:"#a5b4fc" }}>{a.userName}</span>
                      <span className="T" style={{ background:"rgba(245,158,11,.1)",color:"#fbbf24" }}>{a.type}</span>
                      {a.comment && <span style={{ fontSize:11,color:"#94a3b8" }}>{a.comment}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:14,paddingTop:12,borderTop:"1px solid rgba(99,102,241,.08)" }}>
                <button className="B BD" style={{ fontSize:10 }} onClick={() => {
                  setProspects(prev => prev.filter(p => p.id !== selected.id));
                  setSelected(null);
                }}>🗑️ Supprimer</button>
                <button className="B BG" onClick={() => setSelected(null)}>Fermer</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ADD PROSPECT MODAL ════════════════════════════════════════════ */}
        {showAddModal && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}
            onClick={() => setShowAddModal(false)}>
            <div style={{ background:"#0a0d16",border:"1px solid rgba(99,102,241,.15)",borderRadius:18,width:"90%",maxWidth:480,padding:24 }}
              onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:14 }}>➕ Ajouter un Prospect</h3>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:10,color:"#64748b" }}>Nom *</label>
                  <input className="I" value={newProspect.name} onChange={e => setNewProspect(p=>({...p,name:e.target.value}))} placeholder="Green CBD Shop"/>
                </div>
                <div><label style={{ fontSize:10,color:"#64748b" }}>Type</label>
                  <select className="S" style={{ width:"100%" }} value={newProspect.type} onChange={e => setNewProspect(p=>({...p,type:e.target.value}))}>
                    {PROSPECT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select></div>
                <div><label style={{ fontSize:10,color:"#64748b" }}>Pays</label>
                  <select className="S" style={{ width:"100%" }} value={newProspect.country} onChange={e => setNewProspect(p=>({...p,country:e.target.value}))}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                  </select></div>
                <div><label style={{ fontSize:10,color:"#64748b" }}>Ville</label><input className="I" value={newProspect.city} onChange={e => setNewProspect(p=>({...p,city:e.target.value}))}/></div>
                <div><label style={{ fontSize:10,color:"#64748b" }}>Téléphone</label><input className="I" value={newProspect.phone} onChange={e => setNewProspect(p=>({...p,phone:e.target.value}))}/></div>
                <div><label style={{ fontSize:10,color:"#64748b" }}>Email</label><input className="I" value={newProspect.email} onChange={e => setNewProspect(p=>({...p,email:e.target.value}))}/></div>
                <div><label style={{ fontSize:10,color:"#64748b" }}>Site web</label><input className="I" value={newProspect.website} onChange={e => setNewProspect(p=>({...p,website:e.target.value}))}/></div>
                <div style={{ gridColumn:"1/-1" }}><label style={{ fontSize:10,color:"#64748b" }}>Notes</label>
                  <input className="I" value={newProspect.notes} onChange={e => setNewProspect(p=>({...p,notes:e.target.value}))}/></div>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:14 }}>
                <label className="B BG" style={{ cursor:"pointer" }}>📂 Importer CSV/JSON<input type="file" accept=".csv,.json" onChange={e=>{importFile(e);setShowAddModal(false);}} style={{ display:"none" }}/></label>
                <div style={{ display:"flex",gap:8 }}>
                  <button className="B BG" onClick={() => setShowAddModal(false)}>Annuler</button>
                  <button className="B BP" onClick={addManualProspect} disabled={!newProspect.name.trim()}>➕ Ajouter</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
