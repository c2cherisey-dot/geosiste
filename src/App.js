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

// ─── SUPABASE MINI CLIENT ───────────────────────────────────────────────────
const SUPA_URL = "https://doompuvsmjmfqnbwclwf.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvb21wdXZzbWptZnFuYndjbHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTA3MTUsImV4cCI6MjA5MDkyNjcxNX0.u4oSacxmDUKnYM5-IVIJrpIy-iQsQfpxADkBIPk9SLM";
const SUPA_HEADERS = { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", "Prefer": "return=minimal" };

const supa = {
  // Fetch all rows from a table
  async getAll(table) {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/${table}?select=*&order=created_at.desc&limit=10000`, { headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` } });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },
  // Upsert (insert or update) a single row
  async upsert(table, row) {
    try {
      await fetch(`${SUPA_URL}/rest/v1/${table}`, { method: "POST", headers: { ...SUPA_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(row) });
    } catch {}
  },
  // Upsert many rows (batch)
  async upsertMany(table, rows) {
    if (!rows?.length) return;
    // Batch in chunks of 100
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100);
      try {
        await fetch(`${SUPA_URL}/rest/v1/${table}`, { method: "POST", headers: { ...SUPA_HEADERS, "Prefer": "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(chunk) });
      } catch {}
    }
  },
  // Delete a row
  async del(table, id) {
    try {
      await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: SUPA_HEADERS });
    } catch {}
  },
  // Check connection
  async ping() {
    try {
      const r = await fetch(`${SUPA_URL}/rest/v1/crm_users?select=id&limit=1`, { headers: { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` } });
      return r.ok;
    } catch { return false; }
  },
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
    <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={col} fontSize={size>28?10:8} fontWeight={700} style={{ transform:"rotate(90deg)", transformOrigin:"center", fontFamily:"'Space Mono'" }}>{s}</text>
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
  const [filters, setFilters] = useState({ stage:"all", country:"all", assignee:"all", search:"", hasEmail:"all", hasWebsite:"all", hasPhone:"all", minScore:0, sortBy:"score", tag:"all" });
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
  const [adminTab, setAdminTab] = useState("team");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 100;
  const [supaOk, setSupaOk] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const saveTimer = useRef(null);

  // ─── INIT: Load from Supabase first, fallback to localStorage ─────────
  useEffect(() => {
    const u = LS.get("crm_user");
    if (u) setUser(u);
    
    // Load data — try Supabase first
    (async () => {
      const ok = await supa.ping();
      setSupaOk(ok);
      
      if (ok) {
        // Load from Supabase
        const [supaUsers, supaProspects, supaActivities, supaQuotes] = await Promise.all([
          supa.getAll("crm_users"), supa.getAll("crm_prospects"),
          supa.getAll("crm_activities"), supa.getAll("crm_quotes"),
        ]);
        if (supaUsers?.length > 0) setUsers(supaUsers);
        else setUsers(LS.get("crm_users") || [{ id:"admin1",name:"Carl",email:"admin@chanvrier.com",password:"admin",role:"admin",createdAt:new Date().toISOString() }]);
        
        if (supaProspects?.length > 0) {
          setProspects(supaProspects.map(r => r.data ? { ...r.data, _supaId: r.id } : r));
        } else {
          setProspects(LS.get("crm_prospects") || []);
        }
        if (supaActivities?.length > 0) setActivities(supaActivities.map(r => r.data || r));
        else setActivities(LS.get("crm_activities") || []);
        if (supaQuotes?.length > 0) setQuotes(supaQuotes.map(r => r.data || r));
        else setQuotes(LS.get("crm_quotes") || []);
      } else {
        // Fallback to localStorage
        setUsers(LS.get("crm_users") || [{ id:"admin1",name:"Carl",email:"admin@chanvrier.com",password:"admin",role:"admin",createdAt:new Date().toISOString() }]);
        setProspects(LS.get("crm_prospects") || []);
        setActivities(LS.get("crm_activities") || []);
        setQuotes(LS.get("crm_quotes") || []);
      }
    })();

    // Gmail
    const gt = localStorage.getItem('gmail_refresh_token');
    if (gt) { gmailAction('profile').then(p => { if (p.emailAddress) { setGmailOk(true); setGmailEmail(p.emailAddress); } }); }
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      gmailAction('exchange_token', { code }).then(d => {
        if (d.refreshToken) { localStorage.setItem('gmail_refresh_token', d.refreshToken); setGmailOk(true); window.history.replaceState({}, '', window.location.pathname); }
      });
    }
  }, []);

  // ─── SAVE: localStorage always + debounced Supabase sync ──────────────
  const syncToSupabase = useCallback(async (prosp, acts, qts) => {
    if (!supaOk) return;
    // Sync prospects
    if (prosp?.length > 0) {
      const rows = prosp.map(p => ({ id: p.id, data: p, created_at: p.addedAt || new Date().toISOString(), updated_at: p.lastUpdate || new Date().toISOString() }));
      await supa.upsertMany("crm_prospects", rows);
    }
    // Sync activities (last 200)
    if (acts?.length > 0) {
      const rows = acts.slice(0, 200).map(a => ({ id: a.id, data: a, created_at: a.date || new Date().toISOString() }));
      await supa.upsertMany("crm_activities", rows);
    }
    // Sync quotes
    if (qts?.length > 0) {
      const rows = qts.map(q => ({ id: q.id, data: q, created_at: q.date || new Date().toISOString() }));
      await supa.upsertMany("crm_quotes", rows);
    }
  }, [supaOk]);

  useEffect(() => {
    if (!user) return;
    LS.set("crm_prospects", prospects);
    // Debounced Supabase sync (5 seconds after last change)
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { syncToSupabase(prospects, activities, quotes); }, 5000);
  }, [prospects]);
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
    const h = ["Nom","Type","Ville","Pays","Score","Stade","Assigné","Téléphone","Email","Site","Instagram","Contact","Poste",
      "SIRET","Dirigeant","Effectif","CA","Code NAF","Activité","Trafic Organique","Mots-Clés","Autorité SEO","Trafic Payant",
      "Note Google","Nb Avis","Priorité IA","Volume Mensuel Estimé","Lifetime Value","Tags","Complétude","Date Ajout"];
    const rows = filtered.map(p => [p.name,p.type,p.city,p.countryName,p.score||"",PIPELINE.find(s=>s.id===p.stage)?.label,
      p.assignedName||"",p.phone||"",p.email||"",p.website||"",p.instagram||"",p.contactName||"",p.contactPosition||"",
      p.siret||"",p.dirigeant||"",p.effectif||"",p.chiffreAffaires||"",p.codeNAF||"",p.activite||"",
      p.organicTraffic||"",p.organicKeywords||"",p.authorityScore||"",p.paidTraffic||"",
      p.rating||"",p.reviewCount||"",p.qualification?.priority||"",p.qualification?.estimated_monthly_volume||"",
      p.qualification?.lifetime_value||"",(p.tags||[]).join(";"),getCompleteness(p),
      p.addedAt?new Date(p.addedAt).toLocaleDateString("fr-FR"):""]);
    const csv = [h,...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`prospects_enrichis_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── BACKUP / RESTORE ─────────────────────────────────────────────────────
  const backupAll = () => {
    const data = { prospects, activities, quotes, users, exportDate: new Date().toISOString(), version: "v12" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `geosiste_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.prospects) { setProspects(data.prospects); LS.set("crm_prospects", data.prospects); }
        if (data.activities) { setActivities(data.activities); LS.set("crm_activities", data.activities); }
        if (data.quotes) { setQuotes(data.quotes); LS.set("crm_quotes", data.quotes); }
        addActivity("system", "Système", "Restauration", `Backup restauré — ${data.prospects?.length || 0} prospects`);
      } catch {}
    };
    reader.readAsText(file); e.target.value = "";
  };

  // ─── MULTI-SELECT ACTIONS ─────────────────────────────────────────────────
  const toggleSelect = (id) => setSelectedIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const selectAllPage = () => setSelectedIds(new Set(filtered.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE).map(p => p.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const bulkAction = (action, value) => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    if (action === "delete") {
      setProspects(prev => prev.filter(p => !selectedIds.has(p.id)));
      addActivity("system", "Système", "Suppression masse", `${ids.length} prospects supprimés`);
    } else if (action === "assign") {
      const u = users.find(x => x.id === value);
      setProspects(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, assignedTo: value, assignedName: u?.name || "" } : p));
      addActivity("system", "Système", "Assignation masse", `${ids.length} prospects → ${u?.name}`);
    } else if (action === "tag") {
      setProspects(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, tags: [...new Set([...(p.tags||[]), value])] } : p));
    } else if (action === "stage") {
      setProspects(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, stage: value, lastUpdate: new Date().toISOString() } : p));
    }
    setSelectedIds(new Set());
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

  // ─── HELPER: add prospects with dedup ─────────────────────────────────────
  const addNewProspects = (results, countryCode, countryName, flag, source) => {
    const news = results.map(r => ({
      name: r.name || '', type: r.type || "CBD Shop", city: r.city || '', phone: r.phone || '', email: r.email || '',
      website: r.website || '', instagram: r.instagram || '', openingHours: r.openingHours || '',
      rating: r.rating || 0, reviewCount: r.reviewCount || 0, notes: r.notes || '',
      score: r.score || 40, source: source, placeId: r.placeId || '',
      id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
      stage: "new", country: countryCode, countryName, flag,
      addedAt: new Date().toISOString(), addedBy: user?.id, addedByName: user?.name,
      assignedTo: null, assignedName: "", interactions: [], lastUpdate: new Date().toISOString(),
    })).filter(r => r.name);
    setProspects(prev => {
      const ex = new Set(prev.map(p => p.name.toLowerCase().replace(/[^a-z0-9]/g,'')));
      return [...prev, ...news.filter(n => !ex.has(n.name.toLowerCase().replace(/[^a-z0-9]/g,'')))];
    });
    return news.length;
  };

  // ─── SEMRUSH COMPETITOR DISCOVERY ─────────────────────────────────────────
  const searchSemrushCompetitors = async (seedDomains, countryDb) => {
    const found = [];
    for (const domain of seedDomains.slice(0, 5)) {
      try {
        const r = await fetch('/api/semrush', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ domain, database: countryDb }) });
        if (r.ok) {
          const d = await r.json();
          if (d.competitors) {
            d.competitors.forEach(c => {
              if (c.domain && (c.domain.includes('cbd') || c.domain.includes('chanvre') || c.domain.includes('hemp') || c.domain.includes('cannabis'))) {
                found.push({ name: c.domain.replace(/\..*/,'').replace(/-/g,' '), website: `https://${c.domain}`,
                  organicTraffic: c.organicTraffic || 0, organicKeywords: c.organicKeywords || 0 });
              }
            });
          }
          // Also use top keywords to find more sites
          if (d.topKeywords) {
            d.topKeywords.forEach(kw => {
              if (kw.url && !found.find(f => f.website === kw.url)) {
                const dom = kw.url.replace(/https?:\/\//,'').split('/')[0];
                if (dom.includes('cbd') || dom.includes('chanvre') || dom.includes('hemp')) {
                  found.push({ name: dom.replace(/\..*/,'').replace(/-/g,' '), website: `https://${dom}` });
                }
              }
            });
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, 300));
    }
    // Dedupe
    const seen = new Set();
    return found.filter(f => { const k = f.website.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  };

  // ─── MEGA SCAN: ALL SOURCES + AUTO ENRICHMENT ─────────────────────────────
  const runMegaScan = async (targetCountries) => {
    agentRef.current.running = true; setAgentRunning(true); setAgentLog([]);
    const targets = targetCountries || COUNTRIES;
    const countryDbs = { FR:"fr",DE:"de",ES:"es",IT:"it",NL:"nl",BE:"be",CH:"ch",PT:"pt",AT:"at",CZ:"cz",PL:"pl",GB:"uk",DK:"dk",SE:"se",IE:"ie",GR:"gr" };
    let totalNew = 0;

    for (const country of targets) {
      if (!agentRef.current.running) break;

      // SOURCE 1: Google Places (by city)
      setAgentLog(prev => [{ id:Date.now(), msg:`📍 Google Places: ${country.flag} ${country.name}...` },...prev].slice(0,150));
      for (const city of country.cities.slice(0, 15)) { // Top 15 cities per country for speed
        if (!agentRef.current.running) break;
        const results = await searchPlaces(country.name, city);
        if (results.length > 0) {
          const added = addNewProspects(results, country.code, country.name, country.flag, 'google_places');
          if (added > 0) totalNew += added;
          setAgentLog(prev => [{ id:Date.now(), msg:`  ✅ Places: +${results.length} à ${city}` },...prev].slice(0,150));
        }
        await new Promise(r => setTimeout(r, 50));
      }

      // SOURCE 2: OpenStreetMap
      if (!agentRef.current.running) break;
      setAgentLog(prev => [{ id:Date.now(), msg:`🗺️ OpenStreetMap: ${country.flag} ${country.name}...` },...prev].slice(0,150));
      try {
        const r = await fetch('/api/overpass', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ country: country.code }) });
        if (r.ok) {
          const d = await r.json();
          if (d.results?.length > 0) {
            const added = addNewProspects(d.results, country.code, country.name, country.flag, 'openstreetmap');
            totalNew += added;
            setAgentLog(prev => [{ id:Date.now(), msg:`  ✅ OSM: +${d.results.length} (${added} nouveaux)` },...prev].slice(0,150));
          }
        }
      } catch {}
      await new Promise(r => setTimeout(r, 2000));

      // SOURCE 3: SEMrush Competitor Discovery (find CBD websites via SEO data)
      if (!agentRef.current.running) break;
      const db = countryDbs[country.code] || 'fr';
      const seedDomains = ['cbdshop.com', 'justbob.fr', 'cbdpaschere.com', 'naturalcbd.fr', 'sensiseeds.com'];
      setAgentLog(prev => [{ id:Date.now(), msg:`📊 SEMrush Discovery: ${country.flag} ${country.name}...` },...prev].slice(0,150));
      try {
        const semResults = await searchSemrushCompetitors(seedDomains, db);
        if (semResults.length > 0) {
          const mapped = semResults.map(r => ({ ...r, type: "E-shop CBD", score: 55 }));
          const added = addNewProspects(mapped, country.code, country.name, country.flag, 'semrush_discovery');
          totalNew += added;
          setAgentLog(prev => [{ id:Date.now(), msg:`  ✅ SEMrush: +${semResults.length} sites CBD trouvés` },...prev].slice(0,150));
        }
      } catch {}

      // SOURCE 4: Pappers (France only)
      if (country.code === "FR" && agentRef.current.running) {
        setAgentLog(prev => [{ id:Date.now(), msg:`🏢 Pappers: recherche entreprises CBD...` },...prev].slice(0,150));
        for (const q of ["CBD","chanvre","cannabidiol","cannabis light"]) {
          try {
            const r = await fetch('/api/pappers', { method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ query: q }) });
            if (r.ok) {
              const d = await r.json();
              if (d.results?.length > 0) {
                const mapped = d.results.map(r => ({ name: r.nom||'', city: r.ville||'', siret: r.siret||'',
                  dirigeant: r.dirigeant||'', codeNAF: r.codeNAF||'', activite: r.activite||'', score: 45 }));
                const added = addNewProspects(mapped, "FR", "France", "🇫🇷", 'pappers');
                totalNew += added;
                setAgentLog(prev => [{ id:Date.now(), msg:`  ✅ Pappers "${q}": +${d.results.length}` },...prev].slice(0,150));
              }
            }
          } catch {}
          await new Promise(r => setTimeout(r, 500));
        }
      }

      // SOURCE 5: Google Custom Search (if configured)
      if (!agentRef.current.running) break;
      setAgentLog(prev => [{ id:Date.now(), msg:`🔎 Google Search: ${country.flag} ${country.name}...` },...prev].slice(0,150));
      const searchQueries = [`CBD shop ${country.name}`, `boutique CBD ${country.name}`, `hemp store ${country.name}`];
      for (const sq of searchQueries) {
        try {
          const r = await fetch('/api/search', { method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ query: sq, country: country.code }) });
          if (r.ok) {
            const d = await r.json();
            if (d.results?.length > 0) {
              const mapped = d.results.map(r => ({ name: r.name, website: r.website, phone: r.phone, score: 35 }));
              const added = addNewProspects(mapped, country.code, country.name, country.flag, 'google_search');
              totalNew += added;
              setAgentLog(prev => [{ id:Date.now(), msg:`  ✅ Google: +${d.results.length} pour "${sq}"` },...prev].slice(0,150));
            }
          }
        } catch {}
        await new Promise(r => setTimeout(r, 200));
      }

      setAgentLog(prev => [{ id:Date.now(), msg:`📊 ${country.flag} ${country.name} terminé — Total base: ${prospects.length + totalNew}` },...prev].slice(0,150));
    }

    // AUTO-ENRICHMENT: SEMrush on new prospects with websites
    if (agentRef.current.running) {
      setAgentLog(prev => [{ id:Date.now(), msg:`\n📊 Auto-enrichissement SEMrush des nouveaux prospects...` },...prev].slice(0,150));
      setProspects(prev => {
        const toEnrich = prev.filter(p => !p.semrushData && p.website && p.source !== 'semrush_discovery').slice(0, 20);
        // We'll do this async separately to not block
        return prev;
      });
    }

    agentRef.current.running = false; setAgentRunning(false);
    setAgentLog(prev => [{ id:Date.now(), msg:`\n🏁 MEGA SCAN TERMINÉ ! +${totalNew} nouveaux prospects ajoutés` },...prev]);
  };

  // ─── FILTERED & STATS ─────────────────────────────────────────────────────
  const myProspects = useMemo(() => isAdmin ? prospects : prospects.filter(p => p.assignedTo === user?.id || !p.assignedTo), [prospects, user, isAdmin]);

  // Completeness score (0-100) based on filled fields
  const getCompleteness = (p) => {
    let score = 0, max = 0;
    const fields = [
      [p.name, 10], [p.city, 5], [p.phone, 15], [p.email, 20], [p.website, 10],
      [p.qualification, 15], [p.pappersData||p.siret, 10], [p.semrushData, 10], [p.instagram, 5],
    ];
    fields.forEach(([v, w]) => { max += w; if (v) score += w; });
    return Math.round((score / max) * 100);
  };

  // All unique tags across prospects
  const allTags = useMemo(() => {
    const tags = new Set();
    myProspects.forEach(p => (p.tags || []).forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [myProspects]);

  const filtered = useMemo(() => {
    let result = myProspects.filter(p => {
      if (filters.stage !== "all" && p.stage !== filters.stage) return false;
      if (filters.country !== "all" && p.country !== filters.country) return false;
      if (filters.assignee !== "all" && p.assignedTo !== filters.assignee) return false;
      if (filters.hasEmail === "yes" && !p.email) return false;
      if (filters.hasEmail === "no" && p.email) return false;
      if (filters.hasWebsite === "yes" && !p.website) return false;
      if (filters.hasWebsite === "no" && p.website) return false;
      if (filters.hasPhone === "yes" && !p.phone) return false;
      if (filters.hasPhone === "no" && p.phone) return false;
      if (filters.minScore > 0 && (p.score || 0) < filters.minScore) return false;
      if (filters.tag !== "all" && !(p.tags || []).includes(filters.tag)) return false;
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.city?.toLowerCase().includes(filters.search.toLowerCase()) && !p.email?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
    // Sort
    const sortFns = {
      score: (a,b) => (b.score||0) - (a.score||0),
      name: (a,b) => a.name.localeCompare(b.name),
      traffic: (a,b) => (b.organicTraffic||0) - (a.organicTraffic||0),
      rating: (a,b) => (b.rating||0) - (a.rating||0),
      completeness: (a,b) => getCompleteness(b) - getCompleteness(a),
      recent: (a,b) => new Date(b.addedAt||0) - new Date(a.addedAt||0),
    };
    if (sortFns[filters.sortBy]) result.sort(sortFns[filters.sortBy]);
    return result;
  }, [myProspects, filters]);

  // Top 50 best prospects to contact
  const top50 = useMemo(() => {
    return [...myProspects]
      .filter(p => p.stage !== "won" && p.stage !== "lost")
      .map(p => ({ ...p, totalScore: (p.score||0) + (p.organicTraffic ? Math.min(20, Math.log10(p.organicTraffic)*5) : 0) + (p.email ? 10 : 0) + (p.phone ? 5 : 0) + (p.qualification?.priority==="hot" ? 15 : p.qualification?.priority==="warm" ? 5 : 0) }))
      .sort((a,b) => b.totalScore - a.totalScore)
      .slice(0, 50);
  }, [myProspects]);

  const stats = useMemo(() => ({
    total: myProspects.length,
    byStage: PIPELINE.map(s => ({ ...s, count: myProspects.filter(p => p.stage === s.id).length })),
    byCountry: COUNTRIES.map(c => ({ ...c, count: myProspects.filter(p => p.country === c.code).length })).filter(c => c.count > 0).sort((a,b) => b.count - a.count),
    won: myProspects.filter(p => p.stage === "won").length,
    quotesTotal: quotes.reduce((a, q) => a + q.total, 0),
    todayActivities: activities.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length,
  }), [myProspects, quotes, activities]);

  // ─── ENRICHMENT: PAPPERS ──────────────────────────────────────────────────
  const enrichPappers = async (prospect) => {
    try {
      const r = await fetch('/api/pappers', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ query: prospect.name }) });
      if (!r.ok) return null;
      const d = await r.json();
      if (d.results?.length > 0) {
        const best = d.results[0];
        // Fetch full details
        const r2 = await fetch('/api/pappers', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ siren: best.siren }) });
        if (r2.ok) {
          const d2 = await r2.json();
          if (d2.company) return d2.company;
        }
        return best;
      }
    } catch {} return null;
  };

  // ─── ENRICHMENT: HUNTER EMAIL ─────────────────────────────────────────────
  const enrichEmail = async (prospect) => {
    if (!prospect.website) return null;
    try {
      const domain = prospect.website.replace(/https?:\/\//,'').replace(/\/.*/,'').replace(/^www\./,'');
      const r = await fetch('/api/hunter', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'domain_search', domain }) });
      if (!r.ok) return null;
      const d = await r.json();
      return d.emails?.length > 0 ? d : null;
    } catch {} return null;
  };

  // ─── ENRICHMENT: SEMRUSH ──────────────────────────────────────────────────
  const enrichSemrush = async (prospect) => {
    if (!prospect.website) return null;
    try {
      const domain = prospect.website.replace(/https?:\/\//,'').replace(/\/.*/,'').replace(/^www\./,'');
      const countryDb = { FR:"fr",DE:"de",ES:"es",IT:"it",NL:"nl",BE:"be",CH:"ch",PT:"pt",AT:"at",CZ:"cz",PL:"pl",GB:"uk",DK:"dk",SE:"se",IE:"ie",GR:"gr" };
      const db = countryDb[prospect.country] || "fr";
      const r = await fetch('/api/semrush', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ domain, database: db }) });
      if (!r.ok) return null;
      const d = await r.json();
      return d.hasData ? d : null;
    } catch {} return null;
  };

  // ─── BULK ENRICHMENT ──────────────────────────────────────────────────────
  const [enrichLog, setEnrichLog] = useState([]);
  const [enrichRunning, setEnrichRunning] = useState(false);

  const runEnrichment = async (type) => {
    setEnrichRunning(true); setEnrichLog([]);
    const targets = type === "noemail" ? myProspects.filter(p => !p.email && p.website) :
      type === "nocompany" ? myProspects.filter(p => !p.pappersData && !p.siret && p.country === "FR") :
      type === "semrush" ? myProspects.filter(p => !p.semrushData && p.website) :
      myProspects.filter(p => !p.qualification);
    let done = 0;
    for (const p of targets.slice(0, 30)) {
      done++;
      if (type === "noemail") {
        setEnrichLog(prev => [{ id:Date.now(), msg:`📧 ${done}/${Math.min(30,targets.length)} Email: ${p.name}` },...prev].slice(0,50));
        const emailData = await enrichEmail(p);
        if (emailData?.emails?.[0]) {
          const bestEmail = emailData.emails.sort((a,b) => b.confidence - a.confidence)[0];
          setProspects(prev => prev.map(x => x.id === p.id ? { ...x, email: bestEmail.email, emailConfidence: bestEmail.confidence,
            contactName: `${bestEmail.firstName} ${bestEmail.lastName}`.trim(), contactPosition: bestEmail.position || '' } : x));
          addActivity(p.id, p.name, "Email trouvé", `${bestEmail.email} (${bestEmail.confidence}%)`);
        }
      } else if (type === "nocompany") {
        setEnrichLog(prev => [{ id:Date.now(), msg:`🏢 ${done}/${Math.min(30,targets.length)} Pappers: ${p.name}` },...prev].slice(0,50));
        const company = await enrichPappers(p);
        if (company) {
          setProspects(prev => prev.map(x => x.id === p.id ? { ...x, pappersData: company,
            siret: company.siret||'', dirigeant: company.dirigeant||'', effectif: company.effectif||'',
            chiffreAffaires: company.chiffreAffaires||'', codeNAF: company.codeNAF||'', activite: company.activite||'' } : x));
          addActivity(p.id, p.name, "Enrichi Pappers", `SIRET: ${company.siret||'N/A'} — CA: ${company.chiffreAffaires||'N/A'}`);
        }
      } else if (type === "semrush") {
        setEnrichLog(prev => [{ id:Date.now(), msg:`📊 ${done}/${Math.min(30,targets.length)} SEMrush: ${p.name}` },...prev].slice(0,50));
        const sem = await enrichSemrush(p);
        if (sem) {
          const ov = sem.overview || {};
          const trafficBoost = Math.min(30, Math.round(Math.log10(Math.max(1, ov.organicTraffic)) * 8));
          setProspects(prev => prev.map(x => x.id === p.id ? { ...x, semrushData: sem,
            organicTraffic: ov.organicTraffic||0, organicKeywords: ov.organicKeywords||0,
            authorityScore: ov.authorityScore||0, paidTraffic: ov.paidTraffic||0, paidCost: ov.paidCost||0,
            topKeywords: sem.topKeywords||[], trafficTrend: sem.trafficHistory||[], semCompetitors: sem.competitors||[],
            score: Math.min(99, (x.id===p.id?(x.score||50):0) + trafficBoost) } : x));
          addActivity(p.id, p.name, "Enrichi SEMrush", `Trafic: ${ov.organicTraffic||0}/mois — Autorité: ${ov.authorityScore||0}`);
        }
      } else {
        setEnrichLog(prev => [{ id:Date.now(), msg:`🧠 ${done}/${Math.min(30,targets.length)} Qualification: ${p.name}` },...prev].slice(0,50));
        const q = await ai(`${AI_SYS}\n\nQualifie. JSON uniquement:\n{"score":1-100,"priority":"hot|warm|cold","estimated_monthly_volume":"...","lifetime_value":"...","best_channel":"email|phone","approach_strategy":"...","recommended_products":[{"name":"...","reason":"..."}],"talking_points":["..."]}`,
          `Qualifie: ${p.name} (${p.type}) ${p.city}, ${p.countryName}. ${p.notes||""} ${p.rating?"Note:"+p.rating:""} ${p.email?"Email:"+p.email:""} ${p.siret?"SIRET:"+p.siret:""} ${p.chiffreAffaires?"CA:"+p.chiffreAffaires:""} ${p.organicTraffic?"Trafic web:"+p.organicTraffic+"/mois":""} ${p.authorityScore?"Autorité SEO:"+p.authorityScore:""}`, true);
        if (q) {
          setProspects(prev => prev.map(x => x.id === p.id ? { ...x, qualification: q, score: q.score } : x));
          addActivity(p.id, p.name, "Qualification IA", `Score: ${q.score} — ${q.priority}`);
        }
      }
      await new Promise(r => setTimeout(r, 100));
    }
    setEnrichLog(prev => [{ id:Date.now(), msg:`🏁 Terminé ! ${done} prospects enrichis` },...prev]);
    setEnrichRunning(false);
  };

  // ─── DUPLICATE DETECTION ──────────────────────────────────────────────────
  const duplicates = useMemo(() => {
    const nameMap = {};
    prospects.forEach(p => {
      const key = p.name.toLowerCase().replace(/[^a-záàâäéèêëïîôùûüÿçœæ0-9]/g, '');
      if (!nameMap[key]) nameMap[key] = [];
      nameMap[key].push(p);
    });
    return Object.values(nameMap).filter(g => g.length > 1);
  }, [prospects]);

  const removeDuplicates = () => {
    const toRemove = new Set();
    duplicates.forEach(group => {
      // Keep the one with most data, remove others
      const sorted = group.sort((a,b) => {
        const scoreA = (a.email?1:0)+(a.phone?1:0)+(a.website?1:0)+(a.qualification?2:0)+(a.pappersData?2:0);
        const scoreB = (b.email?1:0)+(b.phone?1:0)+(b.website?1:0)+(b.qualification?2:0)+(b.pappersData?2:0);
        return scoreB - scoreA;
      });
      sorted.slice(1).forEach(p => toRemove.add(p.id));
    });
    setProspects(prev => prev.filter(p => !toRemove.has(p.id)));
    addActivity("system", "Système", "Nettoyage doublons", `${toRemove.size} doublons supprimés`);
  };

  // ─── ENHANCED ANALYTICS ───────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const total = myProspects.length;
    if (total === 0) return null;

    // Funnel conversion
    const funnel = PIPELINE.map(s => {
      const count = myProspects.filter(p => p.stage === s.id).length;
      return { ...s, count, pct: ((count/total)*100).toFixed(1) };
    });

    // By country with details
    const byCountry = COUNTRIES.map(c => {
      const cp = myProspects.filter(p => p.country === c.code);
      return { ...c, total: cp.length, qualified: cp.filter(p=>p.qualification).length,
        hot: cp.filter(p=>p.qualification?.priority==="hot").length,
        withEmail: cp.filter(p=>p.email).length,
        withPhone: cp.filter(p=>p.phone).length,
        won: cp.filter(p=>p.stage==="won").length };
    }).filter(c => c.total > 0).sort((a,b) => b.total - a.total);

    // Data quality
    const withEmail = myProspects.filter(p=>p.email).length;
    const withPhone = myProspects.filter(p=>p.phone).length;
    const withWebsite = myProspects.filter(p=>p.website).length;
    const withQualification = myProspects.filter(p=>p.qualification).length;
    const withPappers = myProspects.filter(p=>p.pappersData||p.siret).length;
    const hotLeads = myProspects.filter(p=>p.qualification?.priority==="hot").length;
    const warmLeads = myProspects.filter(p=>p.qualification?.priority==="warm").length;
    const avgScore = total > 0 ? Math.round(myProspects.reduce((a,p) => a + (p.score||0), 0) / total) : 0;

    // By type
    const byType = {};
    myProspects.forEach(p => { byType[p.type] = (byType[p.type]||0) + 1; });

    // Score distribution
    const scoreRanges = [
      { label:"0-20", min:0, max:20, color:"#ef4444" },
      { label:"21-40", min:21, max:40, color:"#f97316" },
      { label:"41-60", min:41, max:60, color:"#f59e0b" },
      { label:"61-80", min:61, max:80, color:"#10b981" },
      { label:"81-100", min:81, max:100, color:"#06b6d4" },
    ].map(r => ({ ...r, count: myProspects.filter(p => (p.score||0) >= r.min && (p.score||0) <= r.max).length }));

    return { funnel, byCountry, withEmail, withPhone, withWebsite, withQualification, withPappers,
      hotLeads, warmLeads, avgScore, byType, scoreRanges, total };
  }, [myProspects]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── AUTH SCREEN ──────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#05060b", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif",
      backgroundImage:"radial-gradient(ellipse at 50% 0%, rgba(99,102,241,.08) 0%, transparent 60%)" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <div style={{ background:"rgba(10,12,20,.85)", border:"1px solid rgba(255,255,255,.05)", borderRadius:24, padding:40, width:"90%", maxWidth:400,
        backdropFilter:"blur(24px)", boxShadow:"0 24px 64px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 14px",boxShadow:"0 8px 32px rgba(99,102,241,.3)" }}>⚡</div>
          <h1 style={{ fontSize:24,fontWeight:800,color:"#f8fafc",margin:0,letterSpacing:"-.02em" }}>Geosiste CRM</h1>
          <p style={{ fontSize:10,color:"rgba(139,92,246,.6)",margin:"6px 0 0",fontFamily:"'Space Mono'",letterSpacing:".14em",textTransform:"uppercase" }}>L'Entrepôt du Chanvrier</p>
        </div>
        <div style={{ display:"flex",gap:2,marginBottom:24,background:"rgba(255,255,255,.03)",padding:3,borderRadius:11,border:"1px solid rgba(255,255,255,.04)" }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); }}
              style={{ flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",transition:"all .2s",
                background:authMode===m?"rgba(99,102,241,.12)":"transparent",color:authMode===m?"#c4b5fd":"#64748b" }}>
              {m === "login" ? "Connexion" : "Créer un compte"}
            </button>
          ))}
        </div>
        {authMode === "register" && (
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:3 }}>Nom complet</label>
            <input style={{ width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.06)",background:"rgba(0,0,0,.4)",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border .2s" }}
              value={loginForm.name} onChange={e => setLoginForm(p=>({...p,name:e.target.value}))} placeholder="Jean Dupont"/>
          </div>
        )}
        <div style={{ marginBottom:12 }}>
          <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:4 }}>Email</label>
          <input style={{ width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.06)",background:"rgba(0,0,0,.4)",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border .2s" }}
            value={loginForm.email} onChange={e => setLoginForm(p=>({...p,email:e.target.value}))} placeholder="email@exemple.com"
            onKeyDown={e => e.key === "Enter" && (authMode === "login" ? doLogin() : doRegister())}/>
        </div>
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:10,color:"#64748b",display:"block",marginBottom:4 }}>Mot de passe</label>
          <input type="password" style={{ width:"100%",padding:"11px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,.06)",background:"rgba(0,0,0,.4)",color:"#e2e8f0",fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border .2s" }}
            value={loginForm.password} onChange={e => setLoginForm(p=>({...p,password:e.target.value}))} placeholder="••••••"
            onKeyDown={e => e.key === "Enter" && (authMode === "login" ? doLogin() : doRegister())}/>
        </div>
        {authError && <div style={{ fontSize:11,color:"#ef4444",marginBottom:14,textAlign:"center" }}>{authError}</div>}
        <button onClick={authMode === "login" ? doLogin : doRegister}
          style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"inherit",
            background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",boxShadow:"0 4px 20px rgba(99,102,241,.3)",transition:"all .2s" }}>
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
    <div style={{ minHeight:"100vh",background:"#05060b",color:"#c8cdd5",fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(99,102,241,.1)}50%{box-shadow:0 0 24px rgba(99,102,241,.2)}}
        .C{background:rgba(10,12,20,.75);border:1px solid rgba(255,255,255,.04);border-radius:16px;padding:22px;backdrop-filter:blur(20px) saturate(1.2);animation:fadeUp .4s cubic-bezier(.16,1,.3,1);box-shadow:0 4px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.03)}
        .B{padding:9px 18px;border-radius:10px;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;transition:all .2s cubic-bezier(.16,1,.3,1);display:inline-flex;align-items:center;gap:6px;letter-spacing:.01em}
        .B:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.3)}
        .B:active{transform:scale(.97) translateY(0)}
        .BP{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 2px 12px rgba(99,102,241,.25)}
        .BS{background:linear-gradient(135deg,#059669,#10b981);color:#fff;box-shadow:0 2px 12px rgba(16,185,129,.2)}
        .BD{background:linear-gradient(135deg,#dc2626,#ef4444);color:#fff}
        .BG{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:#94a3b8}
        .BG:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.1);color:#e2e8f0}
        .I{padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.4);color:#e2e8f0;font-size:12px;font-family:inherit;outline:none;width:100%;box-sizing:border-box;transition:border .2s}
        .I:focus{border-color:rgba(99,102,241,.4);box-shadow:0 0 0 3px rgba(99,102,241,.08)}
        .S{padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.4);color:#e2e8f0;font-size:12px;font-family:inherit;outline:none;transition:border .2s}
        .S:focus{border-color:rgba(99,102,241,.4)}
        .T{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.02em}
        *{scrollbar-width:thin;scrollbar-color:rgba(99,102,241,.15) transparent}
        ::selection{background:rgba(99,102,241,.3)}
        table tr:hover{background:rgba(99,102,241,.03) !important}
      `}</style>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <header style={{ background:"rgba(5,6,11,.85)",backdropFilter:"blur(32px) saturate(1.3)",borderBottom:"1px solid rgba(255,255,255,.04)",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ maxWidth:1500,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,padding:"0 20px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 2px 12px rgba(99,102,241,.3)" }}>⚡</div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:"#f8fafc",letterSpacing:"-.01em" }}>Geosiste CRM</div>
              <div style={{ fontSize:8,color:"rgba(139,92,246,.7)",fontFamily:"'Space Mono'",letterSpacing:".12em",textTransform:"uppercase" }}>L'Entrepôt du Chanvrier</div>
            </div>
          </div>

          <nav style={{ display:"flex",gap:1,background:"rgba(255,255,255,.03)",padding:3,borderRadius:11,border:"1px solid rgba(255,255,255,.04)" }}>
            {[
              { id:"dashboard",label:"Dashboard",icon:"📊" },
              { id:"prospects",label:"Prospects",icon:"👥" },
              { id:"pipeline",label:"Pipeline",icon:"📈" },
              { id:"scan",label:"Scanner",icon:"🔍" },
              { id:"enrich",label:"Enrichir",icon:"🔬" },
              { id:"analytics",label:"Analytics",icon:"📉" },
              { id:"top50",label:"Top 50",icon:"🏆" },
              { id:"quotes",label:"Devis",icon:"📄" },
              ...(isAdmin ? [{ id:"admin",label:"Admin",icon:"👑" }] : []),
            ].map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                style={{ padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:"inherit",
                  display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap",transition:"all .2s",
                  background:view===t.id?"rgba(99,102,241,.12)":"transparent",color:view===t.id?"#c4b5fd":"#64748b",
                  boxShadow:view===t.id?"inset 0 1px 0 rgba(255,255,255,.05)":"none" }}>
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {agentRunning && <span style={{ display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#10b981",fontFamily:"'Space Mono'" }}>
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
                  <div style={{ fontSize:24,fontWeight:800,color:k.color,fontFamily:"'Space Mono'" }}>{k.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:12,marginBottom:16 }}>
              <div className="C">
                <h3 style={{ fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:12 }}>Activité Récente</h3>
                {activities.slice(0,12).map(a => (
                  <div key={a.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:"1px solid rgba(99,102,241,.04)",fontSize:11 }}>
                    <span style={{ color:"#475569",fontFamily:"'Space Mono'",fontSize:9,minWidth:80 }}>{new Date(a.date).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
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
                <button className="B BG" onClick={backupAll} style={{ width:"100%",justifyContent:"center" }}>💾 Backup JSON</button>
                {/* Supabase Status */}
                <div style={{ background:supaOk?"rgba(16,185,129,.06)":"rgba(239,68,68,.06)", borderRadius:10, padding:10, border:`1px solid ${supaOk?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)"}` }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
                    <span style={{ width:8,height:8,borderRadius:"50%",background:supaOk?"#10b981":"#ef4444" }}/>
                    <span style={{ fontSize:11,fontWeight:600,color:supaOk?"#10b981":"#ef4444" }}>Supabase {supaOk?"Connecté":"Déconnecté"}</span>
                  </div>
                  {supaOk && !migrating && (
                    <button className="B BS" style={{ width:"100%",justifyContent:"center",fontSize:10,padding:"6px" }}
                      onClick={async () => {
                        setMigrating(true);
                        try {
                          // Sync users
                          for (const u of users) { await supa.upsert("crm_users", u); }
                          // Sync all prospects
                          const rows = prospects.map(p => ({ id: p.id, data: p, created_at: p.addedAt || new Date().toISOString(), updated_at: p.lastUpdate || new Date().toISOString() }));
                          await supa.upsertMany("crm_prospects", rows);
                          // Sync activities
                          const actRows = activities.slice(0,500).map(a => ({ id: a.id, data: a, created_at: a.date || new Date().toISOString() }));
                          await supa.upsertMany("crm_activities", actRows);
                          // Sync quotes
                          const qRows = quotes.map(q => ({ id: q.id, data: q, created_at: q.date || new Date().toISOString() }));
                          await supa.upsertMany("crm_quotes", qRows);
                          alert(`✅ Migration terminée !\n${prospects.length} prospects\n${activities.length} activités\n${quotes.length} devis`);
                        } catch (e) { alert("Erreur: " + e.message); }
                        setMigrating(false);
                      }}>
                      {migrating ? <Dots/> : `☁️ Migrer ${prospects.length} prospects vers Supabase`}
                    </button>
                  )}
                  {!supaOk && <div style={{ fontSize:9,color:"#64748b" }}>Les données sont sauvegardées en local uniquement</div>}
                </div>
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
                      <span style={{ fontSize:12,fontWeight:700,color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{c.count}</span>
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
            {/* Advanced Filters */}
            <div className="C" style={{ marginBottom:12 }}>
              <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:8 }}>
                <input className="I" style={{ maxWidth:160 }} placeholder="Rechercher nom, ville, email..." value={filters.search} onChange={e => setFilters(p=>({...p,search:e.target.value}))}/>
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
                <select className="S" value={filters.sortBy} onChange={e => setFilters(p=>({...p,sortBy:e.target.value}))}>
                  <option value="score">Tri: Score ↓</option>
                  <option value="traffic">Tri: Trafic ↓</option>
                  <option value="rating">Tri: Note Google ↓</option>
                  <option value="completeness">Tri: Complétude ↓</option>
                  <option value="recent">Tri: Plus récent</option>
                  <option value="name">Tri: A-Z</option>
                </select>
              </div>
              <div style={{ display:"flex",gap:6,alignItems:"center",flexWrap:"wrap" }}>
                <select className="S" value={filters.hasEmail} onChange={e => setFilters(p=>({...p,hasEmail:e.target.value}))}>
                  <option value="all">Email: tous</option><option value="yes">✅ Avec email</option><option value="no">❌ Sans email</option>
                </select>
                <select className="S" value={filters.hasPhone} onChange={e => setFilters(p=>({...p,hasPhone:e.target.value}))}>
                  <option value="all">Tél: tous</option><option value="yes">✅ Avec tél</option><option value="no">❌ Sans tél</option>
                </select>
                <select className="S" value={filters.hasWebsite} onChange={e => setFilters(p=>({...p,hasWebsite:e.target.value}))}>
                  <option value="all">Site: tous</option><option value="yes">✅ Avec site</option><option value="no">❌ Sans site</option>
                </select>
                <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                  <span style={{ fontSize:10,color:"#64748b" }}>Score min:</span>
                  <input type="range" min={0} max={90} step={10} value={filters.minScore} onChange={e => setFilters(p=>({...p,minScore:parseInt(e.target.value)}))} style={{ width:80 }}/>
                  <span style={{ fontSize:10,color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{filters.minScore}</span>
                </div>
                {allTags.length > 0 && <select className="S" value={filters.tag} onChange={e => setFilters(p=>({...p,tag:e.target.value}))}>
                  <option value="all">Tous tags</option>
                  {allTags.map(t => <option key={t} value={t}>🏷️ {t}</option>)}
                </select>}
                <span style={{ marginLeft:"auto",fontSize:11,color:"#64748b",fontFamily:"'Space Mono'" }}>{filtered.length} / {myProspects.length}</span>
                <button className="B BP" disabled={agentRunning} onClick={() => runEnrichment("qualify")} style={{ fontSize:9,padding:"5px 10px" }}>
                  {agentRunning ? <Dots/> : `🧠 Qualifier (${filtered.filter(p=>!p.qualification).length})`}
                </button>
                <button className="B BS" onClick={() => setShowAddModal(true)} style={{ fontSize:9,padding:"5px 10px" }}>➕</button>
                <button className="B BG" onClick={exportCSV} style={{ fontSize:9,padding:"5px 10px" }}>📥 CSV</button>
                <button className="B BG" onClick={backupAll} style={{ fontSize:9,padding:"5px 10px" }}>💾 Backup</button>
                <label className="B BG" style={{ fontSize:9,padding:"5px 10px",cursor:"pointer" }}>📂 Restaurer<input type="file" accept=".json" onChange={restoreBackup} style={{display:"none"}}/></label>
              </div>
            </div>

            {/* Multi-select action bar */}
            {selectedIds.size > 0 && (
              <div className="C" style={{ marginBottom:8,padding:10,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",border:"1px solid rgba(99,102,241,.2)" }}>
                <span style={{ fontSize:11,fontWeight:700,color:"#c4b5fd" }}>✓ {selectedIds.size} sélectionné(s)</span>
                <button className="B BG" style={{ fontSize:9,padding:"4px 8px" }} onClick={deselectAll}>Désélectionner</button>
                {isAdmin && <select className="S" style={{ fontSize:10,padding:"4px 8px" }} onChange={e => { if(e.target.value) bulkAction("assign",e.target.value); e.target.value=""; }}>
                  <option value="">Assigner à...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>}
                <select className="S" style={{ fontSize:10,padding:"4px 8px" }} onChange={e => { if(e.target.value) bulkAction("stage",e.target.value); e.target.value=""; }}>
                  <option value="">Pipeline →</option>
                  {PIPELINE.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                </select>
                <select className="S" style={{ fontSize:10,padding:"4px 8px" }} onChange={e => { if(e.target.value) bulkAction("tag",e.target.value); e.target.value=""; }}>
                  <option value="">Ajouter tag...</option>
                  {["Priorité Q2","VIP","À rappeler","Salon","Concurrent","Nouveau"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button className="B BD" style={{ fontSize:9,padding:"4px 8px",marginLeft:"auto" }} onClick={() => { if(window.confirm(`Supprimer ${selectedIds.size} prospects ?`)) bulkAction("delete"); }}>🗑️ Supprimer</button>
              </div>
            )}

            {/* Table */}
            <div className="C" style={{ padding:0,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:10 }}>
                <thead><tr style={{ background:"rgba(99,102,241,.05)" }}>
                  <th style={{ padding:"6px 4px",width:28 }}><input type="checkbox" onChange={e => e.target.checked ? selectAllPage() : deselectAll()} checked={selectedIds.size > 0 && filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).every(p=>selectedIds.has(p.id))}/></th>
                  {["","Nom","Type","Ville","Pays","Score","📊","📧","📞","Stade","Assigné","Complét.","Tags"].map(h => (
                    <th key={h} style={{ padding:"6px 4px",textAlign:"left",color:"#64748b",fontWeight:600,fontSize:9 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE).map(p => {
                    const compl = getCompleteness(p);
                    return (
                      <tr key={p.id} style={{ borderBottom:"1px solid rgba(255,255,255,.02)",cursor:"pointer",background:selectedIds.has(p.id)?"rgba(99,102,241,.06)":"transparent" }}>
                        <td style={{ padding:"4px" }} onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)}/></td>
                        <td style={{ padding:"4px",fontSize:13 }} onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); setCommentText(""); }}>{p.flag}</td>
                        <td style={{ padding:"4px",fontWeight:600,color:"#e2e8f0",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); setCommentText(""); }}>{p.name}</td>
                        <td style={{ padding:"4px" }}><span className="T" style={{ background:"rgba(99,102,241,.08)",color:"#a5b4fc",fontSize:8 }}>{p.type}</span></td>
                        <td style={{ padding:"4px",color:"#94a3b8",fontSize:9 }}>{p.city}</td>
                        <td style={{ padding:"4px",color:"#94a3b8",fontSize:9 }}>{p.countryName}</td>
                        <td style={{ padding:"4px" }}><ScoreRing score={p.score} size={24}/></td>
                        <td style={{ padding:"4px",color:"#06b6d4",fontSize:9,fontFamily:"'Space Mono'" }}>{p.organicTraffic ? p.organicTraffic.toLocaleString() : "—"}</td>
                        <td style={{ padding:"4px" }}>{p.email ? <span style={{color:"#10b981"}}>✓</span> : <span style={{color:"#475569"}}>—</span>}</td>
                        <td style={{ padding:"4px" }}>{p.phone ? <span style={{color:"#10b981"}}>✓</span> : <span style={{color:"#475569"}}>—</span>}</td>
                        <td style={{ padding:"4px" }}><span className="T" style={{ background:`${PIPELINE.find(s=>s.id===p.stage)?.color}15`,color:PIPELINE.find(s=>s.id===p.stage)?.color,fontSize:8 }}>{PIPELINE.find(s=>s.id===p.stage)?.icon}</span></td>
                        <td style={{ padding:"4px",color:"#94a3b8",fontSize:9 }}>{p.assignedName||"—"}</td>
                        <td style={{ padding:"4px" }}>
                          <div style={{ width:40,height:4,borderRadius:2,background:"rgba(255,255,255,.06)" }}>
                            <div style={{ height:"100%",borderRadius:2,background:compl>=80?"#10b981":compl>=50?"#f59e0b":"#ef4444",width:`${compl}%` }}/>
                          </div>
                        </td>
                        <td style={{ padding:"4px" }}>{(p.tags||[]).map(t => <span key={t} className="T" style={{ background:"rgba(139,92,246,.12)",color:"#c4b5fd",fontSize:7,marginRight:2 }}>{t}</span>)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:12 }}>
                <button className="B BG" style={{ fontSize:10,padding:"5px 12px" }} disabled={page===0}
                  onClick={() => setPage(p => Math.max(0, p-1))}>← Précédent</button>
                <span style={{ fontSize:11,color:"#64748b",fontFamily:"'Space Mono'" }}>
                  Page {page+1} / {Math.ceil(filtered.length/PAGE_SIZE)} — {filtered.length} résultats
                </span>
                <button className="B BG" style={{ fontSize:10,padding:"5px 12px" }} disabled={(page+1)*PAGE_SIZE >= filtered.length}
                  onClick={() => setPage(p => p+1)}>Suivant →</button>
              </div>
            )}
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
                    <span style={{ fontSize:10,fontWeight:700,color:stage.color,fontFamily:"'Space Mono'",background:`${stage.color}18`,padding:"1px 7px",borderRadius:8 }}>{sp.length}</span>
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

        {/* ═══ TOP 50 ═════════════════════════════════════════════════════════ */}
        {view === "top50" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div className="C" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:4 }}>🏆 Top 50 — Meilleurs Prospects à Contacter</h3>
              <p style={{ fontSize:10,color:"#64748b",margin:0 }}>Classement basé sur: Score IA + Trafic web + Email disponible + Téléphone + Priorité</p>
            </div>
            <div className="C" style={{ padding:0,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:10 }}>
                <thead><tr style={{ background:"rgba(245,158,11,.08)" }}>
                  {["#","","Nom","Ville","Pays","Score","Trafic","Note","📧","📞","Priorité","Raison"].map(h => (
                    <th key={h} style={{ padding:"6px 4px",textAlign:"left",color:"#fbbf24",fontWeight:700,fontSize:9 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {top50.map((p,i) => (
                    <tr key={p.id} style={{ borderBottom:"1px solid rgba(99,102,241,.04)",cursor:"pointer",background:i<3?"rgba(245,158,11,.03)":"transparent" }}
                      onClick={() => { setSelected(p); setAiOutput(""); setModalTab("info"); setCommentText(""); }}>
                      <td style={{ padding:"4px 6px",fontWeight:800,color:i<3?"#fbbf24":"#64748b",fontFamily:"'Space Mono'",fontSize:12 }}>{i+1}</td>
                      <td style={{ padding:"4px",fontSize:13 }}>{p.flag}</td>
                      <td style={{ padding:"4px",fontWeight:600,color:"#e2e8f0" }}>{p.name}</td>
                      <td style={{ padding:"4px",color:"#94a3b8",fontSize:9 }}>{p.city}</td>
                      <td style={{ padding:"4px",color:"#94a3b8",fontSize:9 }}>{p.countryName}</td>
                      <td style={{ padding:"4px" }}><ScoreRing score={p.score} size={24}/></td>
                      <td style={{ padding:"4px",color:"#06b6d4",fontSize:9,fontFamily:"'Space Mono'" }}>{p.organicTraffic ? p.organicTraffic.toLocaleString() : "—"}</td>
                      <td style={{ padding:"4px",color:"#f59e0b",fontSize:9 }}>{p.rating ? `⭐${p.rating}` : "—"}</td>
                      <td style={{ padding:"4px" }}>{p.email ? <span style={{color:"#10b981",fontSize:10}}>✓</span> : <span style={{color:"#475569"}}>✗</span>}</td>
                      <td style={{ padding:"4px" }}>{p.phone ? <span style={{color:"#10b981",fontSize:10}}>✓</span> : <span style={{color:"#475569"}}>✗</span>}</td>
                      <td style={{ padding:"4px" }}>{p.qualification?.priority && <span className="T" style={{
                        background:p.qualification.priority==="hot"?"rgba(239,68,68,.15)":"rgba(245,158,11,.15)",
                        color:p.qualification.priority==="hot"?"#ef4444":"#f59e0b",fontSize:8
                      }}>{p.qualification.priority==="hot"?"🔥":"🌤️"}</span>}</td>
                      <td style={{ padding:"4px",color:"#64748b",fontSize:8 }}>{p.qualification?.approach_strategy?.slice(0,40) || "Non qualifié"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ SCANNER ════════════════════════════════════════════════════════ */}
        {view === "scan" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div className="C" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:4 }}>🔍 Scanner Multi-Sources</h3>
              <p style={{ fontSize:10,color:"#64748b",marginBottom:12 }}>Google Places + OpenStreetMap + SEMrush + Pappers + Google Search — {prospects.length} prospects au total</p>

              {/* MEGA SCAN BUTTON */}
              <div style={{ display:"flex",gap:8,marginBottom:14 }}>
                {agentRunning ? (
                  <button className="B BD" onClick={() => { agentRef.current.running=false; setAgentRunning(false); }} style={{ padding:"12px 28px",fontSize:14 }}>⏹ STOP</button>
                ) : (
                  <button className="B" onClick={() => runMegaScan()}
                    style={{ padding:"12px 28px",fontSize:14,fontWeight:800,background:"linear-gradient(135deg,#f59e0b,#ef4444,#8b5cf6)",color:"#fff",letterSpacing:".02em" }}>
                    🚀 MEGA SCAN EUROPE — Toutes Sources
                  </button>
                )}
                {!agentRunning && <button className="B BS" onClick={() => {
                  const c = COUNTRIES.find(x => x.code === searchForm.country);
                  runMegaScan([c]);
                }} style={{ padding:"12px 20px" }}>🚀 Mega Scan {COUNTRIES.find(x=>x.code===searchForm.country)?.name}</button>}
              </div>

              {/* Quick search */}
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
                <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8" }}>Scan Europe — Google Places ({COUNTRIES.reduce((a,c)=>a+c.cities.length,0)} villes)</h4>
                {agentRunning ? <button className="B BD" onClick={() => { agentRef.current.running=false; setAgentRunning(false); }}>⏹ Stop</button>
                  : <button className="B BS" onClick={() => runScan()}>🌍 Google Places Europe</button>}
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                {COUNTRIES.map(c => (
                  <button key={c.code} className="B BG" style={{ padding:"4px 10px",fontSize:10 }} disabled={agentRunning}
                    onClick={() => runScan([c])}>{c.flag} {c.name} ({c.cities.length})</button>
                ))}
              </div>
            </div>

            {/* OpenStreetMap */}
            <div className="C" style={{ marginBottom:16,border:"1px solid rgba(16,185,129,.15)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <div>
                  <h4 style={{ fontSize:12,fontWeight:600,color:"#10b981" }}>🗺️ OpenStreetMap — CBD Shops Europe (gratuit, illimité)</h4>
                  <p style={{ fontSize:9,color:"#64748b",margin:0 }}>Base de données communautaire — trouve les shops non référencés sur Google</p>
                </div>
              </div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                <button className="B BS" disabled={agentRunning} onClick={async () => {
                  setAgentRunning(true); setAgentLog([]);
                  for (const c of COUNTRIES) {
                    if (!agentRef.current.running) break;
                    setAgentLog(prev => [{ id:Date.now(), msg:`🗺️ OpenStreetMap: ${c.flag} ${c.name}...` },...prev].slice(0,100));
                    try {
                      const r = await fetch('/api/overpass', { method:'POST', headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ country: c.code }) });
                      if (r.ok) {
                        const d = await r.json();
                        if (d.results?.length > 0) {
                          const news = d.results.map(r => ({
                            name: r.name, type: "CBD Shop", city: r.city || '', phone: r.phone || '', email: r.email || '',
                            website: r.website || '', instagram: r.instagram || '', openingHours: r.openingHours || '',
                            score: 40, notes: r.openingHours ? `Horaires: ${r.openingHours}` : '',
                            source: 'openstreetmap', id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
                            stage:"new", country:c.code, countryName:c.name, flag:c.flag,
                            addedAt:new Date().toISOString(), addedBy:user?.id, addedByName:user?.name,
                            assignedTo:null, assignedName:"", interactions:[], lastUpdate:new Date().toISOString(),
                          }));
                          setProspects(prev => {
                            const ex = new Set(prev.map(p => p.name.toLowerCase()));
                            return [...prev, ...news.filter(n => !ex.has(n.name.toLowerCase()))];
                          });
                          setAgentLog(prev => [{ id:Date.now()+1, msg:`✅ +${d.results.length} depuis OSM ${c.name}` },...prev].slice(0,100));
                        }
                      }
                    } catch {}
                    await new Promise(r => setTimeout(r, 2000)); // Rate limit respect
                  }
                  setAgentRunning(false);
                  setAgentLog(prev => [{ id:Date.now(), msg:"🏁 Scan OpenStreetMap terminé !" },...prev]);
                }}>🗺️ Scan OSM Europe</button>
                {COUNTRIES.map(c => (
                  <button key={c.code} className="B BG" style={{ padding:"3px 8px",fontSize:9 }} disabled={agentRunning}
                    onClick={async () => {
                      setAgentRunning(true);
                      setAgentLog(prev => [{ id:Date.now(), msg:`🗺️ OSM: ${c.flag} ${c.name}...` },...prev]);
                      try {
                        const r = await fetch('/api/overpass', { method:'POST', headers:{'Content-Type':'application/json'},
                          body: JSON.stringify({ country: c.code }) });
                        if (r.ok) {
                          const d = await r.json();
                          if (d.results?.length > 0) {
                            const news = d.results.map(r => ({
                              name: r.name, type: "CBD Shop", city: r.city || '', phone: r.phone || '', email: r.email || '',
                              website: r.website || '', instagram: r.instagram || '', score: 40, source: 'openstreetmap',
                              id: `p${Date.now()}${Math.random().toString(36).slice(2,6)}`,
                              stage:"new", country:c.code, countryName:c.name, flag:c.flag,
                              addedAt:new Date().toISOString(), addedBy:user?.id, addedByName:user?.name,
                              assignedTo:null, assignedName:"", interactions:[], lastUpdate:new Date().toISOString(),
                            }));
                            setProspects(prev => {
                              const ex = new Set(prev.map(p => p.name.toLowerCase()));
                              return [...prev, ...news.filter(n => !ex.has(n.name.toLowerCase()))];
                            });
                            setAgentLog(prev => [{ id:Date.now(), msg:`✅ +${d.results.length} OSM ${c.name}` },...prev].slice(0,100));
                          } else { setAgentLog(prev => [{ id:Date.now(), msg:`⚪ 0 résultats OSM ${c.name}` },...prev]); }
                        }
                      } catch {}
                      setAgentRunning(false);
                    }}>{c.flag}</button>
                ))}
              </div>
            </div>

            {/* Pappers NAF (France only) */}
            <div className="C" style={{ marginBottom:16,border:"1px solid rgba(139,92,246,.15)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                <div>
                  <h4 style={{ fontSize:12,fontWeight:600,color:"#8b5cf6" }}>🏢 Pappers — Registre entreprises (France)</h4>
                  <p style={{ fontSize:9,color:"#64748b",margin:0 }}>Recherche par activité CBD dans le registre français</p>
                </div>
                <button className="B BP" disabled={agentRunning} onClick={async () => {
                  setAgentRunning(true); setAgentLog([]);
                  const queries = ["CBD","chanvre","cannabidiol","hemp","cannabis light"];
                  for (const q of queries) {
                    setAgentLog(prev => [{ id:Date.now(), msg:`🏢 Pappers: recherche "${q}"...` },...prev]);
                    try {
                      const r = await fetch('/api/pappers', { method:'POST', headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ query: q }) });
                      if (r.ok) {
                        const d = await r.json();
                        if (d.results?.length > 0) {
                          addNewProspects(d.results.map(r => ({ name:r.nom||'', city:r.ville||'', siret:r.siret||'',
                            dirigeant:r.dirigeant||'', codeNAF:r.codeNAF||'', score:45 })), "FR","France","🇫🇷","pappers");
                          setAgentLog(prev => [{ id:Date.now(), msg:`✅ +${d.results.length} Pappers "${q}"` },...prev].slice(0,100));
                        }
                      }
                    } catch {}
                    await new Promise(r => setTimeout(r, 500));
                  }
                  setAgentRunning(false);
                  setAgentLog(prev => [{ id:Date.now(), msg:"🏁 Pappers terminé !" },...prev]);
                }}>🏢 Scanner Pappers</button>
              </div>
            </div>

            {/* SEMrush Discovery */}
            <div className="C" style={{ marginBottom:16,border:"1px solid rgba(6,182,212,.15)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                <div>
                  <h4 style={{ fontSize:12,fontWeight:600,color:"#06b6d4" }}>📊 SEMrush — Découverte de Concurrents CBD</h4>
                  <p style={{ fontSize:9,color:"#64748b",margin:0 }}>Trouve des sites CBD via l'analyse SEO concurrentielle</p>
                </div>
                <button className="B" disabled={agentRunning} onClick={async () => {
                  setAgentRunning(true); setAgentLog([]);
                  const countryDbs = { FR:"fr",DE:"de",ES:"es",IT:"it",NL:"nl",BE:"be",CH:"ch",PT:"pt",AT:"at",GB:"uk" };
                  const seeds = ["justbob.fr","naturalcbd.fr","cbdpaschere.com","lacbduthek.com","sensiseeds.com",
                    "nordicoil.fr","cibdol.fr","cbdshop.fr","greenowl.fr","famous-cbd.fr"];
                  setAgentLog(prev => [{ id:Date.now(), msg:`📊 Analyse de ${seeds.length} domaines CBD de référence...` },...prev]);
                  for (const [code, db] of Object.entries(countryDbs)) {
                    if (!agentRef.current.running) break;
                    const c = COUNTRIES.find(x => x.code === code);
                    setAgentLog(prev => [{ id:Date.now(), msg:`📊 SEMrush ${c?.flag} ${c?.name}: découverte concurrents...` },...prev].slice(0,100));
                    const results = await searchSemrushCompetitors(seeds, db);
                    if (results.length > 0) {
                      const mapped = results.map(r => ({ ...r, type:"E-shop CBD", score:55 }));
                      const added = addNewProspects(mapped, code, c?.name||'', c?.flag||'', 'semrush_discovery');
                      setAgentLog(prev => [{ id:Date.now(), msg:`✅ +${results.length} sites CBD (${added} nouveaux)` },...prev].slice(0,100));
                    }
                    await new Promise(r => setTimeout(r, 1000));
                  }
                  setAgentRunning(false);
                  setAgentLog(prev => [{ id:Date.now(), msg:"🏁 SEMrush Discovery terminé !" },...prev]);
                }} style={{ background:"linear-gradient(135deg,#06b6d4,#0891b2)",color:"#fff" }}>📊 Lancer Discovery</button>
              </div>
              <div style={{ fontSize:9,color:"#64748b",marginTop:4 }}>
                Domaines analysés: justbob.fr, naturalcbd.fr, cbdpaschere.com, sensiseeds.com, nordicoil.fr...
              </div>
            </div>

            {/* Auto-Enrich with SEMrush */}
            <div className="C" style={{ marginBottom:16,border:"1px solid rgba(245,158,11,.15)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <h4 style={{ fontSize:12,fontWeight:600,color:"#f59e0b" }}>⚡ Auto-Enrichir avec SEMrush</h4>
                  <p style={{ fontSize:9,color:"#64748b",margin:0 }}>Enrichit automatiquement les prospects avec site web (trafic, mots-clés, autorité)</p>
                </div>
                <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                  <span style={{ fontSize:11,color:"#f59e0b",fontFamily:"'Space Mono'" }}>{myProspects.filter(p=>!p.semrushData&&p.website).length} à enrichir</span>
                  <button className="B" disabled={enrichRunning} onClick={() => runEnrichment("semrush")}
                    style={{ background:"linear-gradient(135deg,#f59e0b,#f97316)",color:"#fff" }}>
                    {enrichRunning ? <Dots/> : "⚡ Enrichir SEMrush"}
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Log */}
            {agentLog.length > 0 && (
              <div className="C">
                <h4 style={{ fontSize:12,fontWeight:600,color:"#f1f5f9",marginBottom:8 }}>Terminal — {prospects.length} prospects au total</h4>
                <div style={{ maxHeight:250,overflowY:"auto",fontFamily:"'Space Mono'",fontSize:10,background:"rgba(0,0,0,.3)",borderRadius:8,padding:10 }}>
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
                <div style={{ fontSize:13,fontWeight:700,color:"#10b981",fontFamily:"'Space Mono'" }}>Total: {stats.quotesTotal.toLocaleString()}€</div>
              </div>
              {quotes.length === 0 ? (
                <div style={{ color:"#475569",textAlign:"center",padding:30,fontSize:12 }}>Aucun devis. Ouvrez un prospect → onglet Devis pour en créer un.</div>
              ) : quotes.sort((a,b) => new Date(b.date)-new Date(a.date)).map(q => (
                <div key={q.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(99,102,241,.04)" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:"#e2e8f0" }}>{q.prospectName}</div>
                    <div style={{ fontSize:10,color:"#64748b" }}>{q.items.length} produit(s) — par {q.userName} — {new Date(q.date).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <div style={{ fontSize:16,fontWeight:700,color:"#10b981",fontFamily:"'Space Mono'" }}>{q.total.toLocaleString()}€</div>
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
                        <div style={{ fontSize:18,fontWeight:700,color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{uProspects.length}</div>
                        <div style={{ fontSize:8,color:"#64748b" }}>Prospects</div>
                      </div>
                      <div style={{ textAlign:"center",padding:"0 12px" }}>
                        <div style={{ fontSize:18,fontWeight:700,color:"#10b981",fontFamily:"'Space Mono'" }}>{uWon}</div>
                        <div style={{ fontSize:8,color:"#64748b" }}>Gagnés</div>
                      </div>
                      <div style={{ textAlign:"center",padding:"0 12px" }}>
                        <div style={{ fontSize:18,fontWeight:700,color:"#06b6d4",fontFamily:"'Space Mono'" }}>{uActivities.length}</div>
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
                      <span style={{ color:"#475569",fontFamily:"'Space Mono'",fontSize:9,minWidth:100 }}>{new Date(a.date).toLocaleString("fr-FR")}</span>
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
                            <span style={{ color:s.color,fontWeight:700,fontFamily:"'Space Mono'" }}>{c}</span>
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

        {/* ═══ ENRICHIR ═══════════════════════════════════════════════════════ */}
        {view === "enrich" && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            {/* Data Quality Overview */}
            <div className="C" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:14 }}>🔬 Enrichissement & Qualité de la Base</h3>
              {analytics && (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))",gap:10,marginBottom:16 }}>
                  {[
                    { label:"Total",value:analytics.total,color:"#a5b4fc",pct:"100%" },
                    { label:"Avec Email",value:analytics.withEmail,color:"#10b981",pct:((analytics.withEmail/analytics.total)*100).toFixed(0)+"%" },
                    { label:"Avec Téléphone",value:analytics.withPhone,color:"#06b6d4",pct:((analytics.withPhone/analytics.total)*100).toFixed(0)+"%" },
                    { label:"Avec Site Web",value:analytics.withWebsite,color:"#8b5cf6",pct:((analytics.withWebsite/analytics.total)*100).toFixed(0)+"%" },
                    { label:"Qualifiés IA",value:analytics.withQualification,color:"#f59e0b",pct:((analytics.withQualification/analytics.total)*100).toFixed(0)+"%" },
                    { label:"Enrichis Pappers",value:analytics.withPappers,color:"#ec4899",pct:((analytics.withPappers/analytics.total)*100).toFixed(0)+"%" },
                    { label:"🔥 Hot Leads",value:analytics.hotLeads,color:"#ef4444",pct:((analytics.hotLeads/analytics.total)*100).toFixed(0)+"%" },
                    { label:"Doublons",value:duplicates.length,color:duplicates.length>0?"#ef4444":"#10b981",pct:duplicates.length+" groupes" },
                  ].map((k,i) => (
                    <div key={i} className="C" style={{ textAlign:"center",padding:12 }}>
                      <div style={{ fontSize:22,fontWeight:800,color:k.color,fontFamily:"'Space Mono'" }}>{k.value}</div>
                      <div style={{ fontSize:9,color:"#64748b",marginTop:2 }}>{k.label}</div>
                      <div style={{ fontSize:10,color:k.color,fontFamily:"'Space Mono'" }}>{k.pct}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enrichment Actions */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16 }}>
              <div className="C" style={{ textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:6 }}>📧</div>
                <h4 style={{ fontSize:13,fontWeight:700,color:"#10b981",marginBottom:4 }}>Trouver les Emails</h4>
                <p style={{ fontSize:10,color:"#64748b",marginBottom:10 }}>Hunter.io — Recherche emails</p>
                <div style={{ fontSize:20,fontWeight:700,color:"#f59e0b",fontFamily:"'Space Mono'",marginBottom:8 }}>{myProspects.filter(p=>!p.email&&p.website).length}</div>
                <div style={{ fontSize:9,color:"#64748b",marginBottom:10 }}>sans email</div>
                <button className="B BS" disabled={enrichRunning} onClick={() => runEnrichment("noemail")} style={{ width:"100%" }}>
                  {enrichRunning ? <Dots/> : "📧 Lancer"}
                </button>
              </div>
              <div className="C" style={{ textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:6 }}>🏢</div>
                <h4 style={{ fontSize:13,fontWeight:700,color:"#8b5cf6",marginBottom:4 }}>Données Entreprise</h4>
                <p style={{ fontSize:10,color:"#64748b",marginBottom:10 }}>Pappers — SIRET, CA, dirigeant</p>
                <div style={{ fontSize:20,fontWeight:700,color:"#f59e0b",fontFamily:"'Space Mono'",marginBottom:8 }}>{myProspects.filter(p=>!p.pappersData&&!p.siret&&p.country==="FR").length}</div>
                <div style={{ fontSize:9,color:"#64748b",marginBottom:10 }}>FR sans Pappers</div>
                <button className="B BP" disabled={enrichRunning} onClick={() => runEnrichment("nocompany")} style={{ width:"100%" }}>
                  {enrichRunning ? <Dots/> : "🏢 Lancer"}
                </button>
              </div>
              <div className="C" style={{ textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:6 }}>📊</div>
                <h4 style={{ fontSize:13,fontWeight:700,color:"#06b6d4",marginBottom:4 }}>SEMrush Analytics</h4>
                <p style={{ fontSize:10,color:"#64748b",marginBottom:10 }}>Trafic, mots-clés, autorité</p>
                <div style={{ fontSize:20,fontWeight:700,color:"#f59e0b",fontFamily:"'Space Mono'",marginBottom:8 }}>{myProspects.filter(p=>!p.semrushData&&p.website).length}</div>
                <div style={{ fontSize:9,color:"#64748b",marginBottom:10 }}>sans SEMrush</div>
                <button className="B" disabled={enrichRunning} onClick={() => runEnrichment("semrush")}
                  style={{ width:"100%",background:"linear-gradient(135deg,#06b6d4,#0891b2)",color:"#fff" }}>
                  {enrichRunning ? <Dots/> : "📊 Lancer"}
                </button>
              </div>
              <div className="C" style={{ textAlign:"center" }}>
                <div style={{ fontSize:28,marginBottom:6 }}>🧠</div>
                <h4 style={{ fontSize:13,fontWeight:700,color:"#f59e0b",marginBottom:4 }}>Qualification IA</h4>
                <p style={{ fontSize:10,color:"#64748b",marginBottom:10 }}>Score + priorité + stratégie</p>
                <div style={{ fontSize:20,fontWeight:700,color:"#f59e0b",fontFamily:"'Space Mono'",marginBottom:8 }}>{myProspects.filter(p=>!p.qualification).length}</div>
                <div style={{ fontSize:9,color:"#64748b",marginBottom:10 }}>non qualifiés</div>
                <button className="B" disabled={enrichRunning} onClick={() => runEnrichment("qualify")}
                  style={{ width:"100%",background:"linear-gradient(135deg,#f59e0b,#f97316)",color:"#fff" }}>
                  {enrichRunning ? <Dots/> : "🧠 Lancer"}
                </button>
              </div>
            </div>

            {/* Duplicates */}
            {duplicates.length > 0 && (
              <div className="C" style={{ marginBottom:16,border:"1px solid rgba(239,68,68,.2)" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <h4 style={{ fontSize:13,fontWeight:700,color:"#ef4444" }}>⚠️ {duplicates.length} groupes de doublons détectés</h4>
                  <button className="B BD" onClick={removeDuplicates}>🗑️ Supprimer les doublons ({duplicates.reduce((a,g)=>a+g.length-1,0)})</button>
                </div>
                {duplicates.slice(0,10).map((group,i) => (
                  <div key={i} style={{ padding:"6px 0",borderBottom:"1px solid rgba(99,102,241,.04)",fontSize:11 }}>
                    <span style={{ color:"#ef4444",fontWeight:600 }}>{group.length}x</span>
                    <span style={{ color:"#e2e8f0",marginLeft:8 }}>{group[0].name}</span>
                    <span style={{ color:"#64748b",marginLeft:8 }}>({group.map(p=>p.city).join(", ")})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Enrichment Log */}
            {enrichLog.length > 0 && (
              <div className="C">
                <h4 style={{ fontSize:12,fontWeight:600,color:"#f1f5f9",marginBottom:8 }}>Terminal Enrichissement</h4>
                <div style={{ maxHeight:200,overflowY:"auto",fontFamily:"'Space Mono'",fontSize:10,background:"rgba(0,0,0,.3)",borderRadius:8,padding:10 }}>
                  {enrichLog.map(l => <div key={l.id} style={{ padding:"2px 0",color:"#94a3b8" }}>{l.msg}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ ANALYTICS ══════════════════════════════════════════════════════ */}
        {view === "analytics" && analytics && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            {/* Score Distribution */}
            <div className="C" style={{ marginBottom:16 }}>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:14 }}>📉 Analytics de la Base</h3>
              <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:10 }}>Distribution des Scores</h4>
              <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:120,marginBottom:8 }}>
                {analytics.scoreRanges.map(r => {
                  const maxCount = Math.max(...analytics.scoreRanges.map(x=>x.count),1);
                  return (
                    <div key={r.label} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                      <span style={{ fontSize:10,fontWeight:700,color:r.color,fontFamily:"'Space Mono'" }}>{r.count}</span>
                      <div style={{ width:"100%",background:`${r.color}30`,borderRadius:4,height:`${Math.max(4,(r.count/maxCount)*100)}px`,transition:"height .5s" }}>
                        <div style={{ width:"100%",height:"100%",background:r.color,borderRadius:4,opacity:.8 }}/>
                      </div>
                      <span style={{ fontSize:8,color:"#64748b" }}>{r.label}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign:"center",fontSize:11,color:"#94a3b8" }}>Score moyen: <b style={{ color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{analytics.avgScore}/100</b></div>
            </div>

            {/* Funnel */}
            <div className="C" style={{ marginBottom:16 }}>
              <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:10 }}>Funnel de Conversion</h4>
              {analytics.funnel.map((s,i) => (
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                  <span style={{ minWidth:100,fontSize:11,color:s.color,fontWeight:600 }}>{s.icon} {s.label}</span>
                  <div style={{ flex:1,height:24,background:"rgba(255,255,255,.03)",borderRadius:6,overflow:"hidden" }}>
                    <div style={{ height:"100%",background:`${s.color}40`,borderRadius:6,width:`${Math.max(2,parseFloat(s.pct))}%`,transition:"width .5s",display:"flex",alignItems:"center",paddingLeft:8 }}>
                      <span style={{ fontSize:10,fontWeight:700,color:s.color,fontFamily:"'Space Mono'" }}>{s.count}</span>
                    </div>
                  </div>
                  <span style={{ fontSize:10,color:"#64748b",fontFamily:"'Space Mono'",minWidth:40,textAlign:"right" }}>{s.pct}%</span>
                </div>
              ))}
            </div>

            {/* By Country detailed */}
            <div className="C" style={{ marginBottom:16 }}>
              <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:10 }}>Détail par Pays</h4>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:10 }}>
                  <thead><tr style={{ background:"rgba(99,102,241,.05)" }}>
                    {["Pays","Total","Qualifiés","🔥 Hot","Email","Tél","Gagnés"].map(h => (
                      <th key={h} style={{ padding:"6px 8px",textAlign:"left",color:"#64748b",fontWeight:600 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {analytics.byCountry.map(c => (
                      <tr key={c.code} style={{ borderBottom:"1px solid rgba(99,102,241,.04)" }}>
                        <td style={{ padding:"6px 8px" }}>{c.flag} {c.name}</td>
                        <td style={{ padding:"6px 8px",fontWeight:700,color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{c.total}</td>
                        <td style={{ padding:"6px 8px",color:"#8b5cf6" }}>{c.qualified}</td>
                        <td style={{ padding:"6px 8px",color:"#ef4444" }}>{c.hot}</td>
                        <td style={{ padding:"6px 8px",color:"#10b981" }}>{c.withEmail}</td>
                        <td style={{ padding:"6px 8px",color:"#06b6d4" }}>{c.withPhone}</td>
                        <td style={{ padding:"6px 8px",color:"#10b981",fontWeight:700 }}>{c.won}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Type */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <div className="C">
                <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:10 }}>Par Type de Prospect</h4>
                {Object.entries(analytics.byType).sort((a,b)=>b[1]-a[1]).map(([type,count]) => (
                  <div key={type} style={{ display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(99,102,241,.04)" }}>
                    <span style={{ fontSize:11,color:"#94a3b8" }}>{type}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{count}</span>
                  </div>
                ))}
              </div>
              <div className="C">
                <h4 style={{ fontSize:12,fontWeight:600,color:"#94a3b8",marginBottom:10 }}>Qualité des Données</h4>
                {[
                  { label:"Avec email",value:analytics.withEmail,total:analytics.total,color:"#10b981" },
                  { label:"Avec téléphone",value:analytics.withPhone,total:analytics.total,color:"#06b6d4" },
                  { label:"Avec site web",value:analytics.withWebsite,total:analytics.total,color:"#8b5cf6" },
                  { label:"Qualifiés IA",value:analytics.withQualification,total:analytics.total,color:"#f59e0b" },
                  { label:"Données Pappers",value:analytics.withPappers,total:analytics.total,color:"#ec4899" },
                ].map(d => (
                  <div key={d.label} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2 }}>
                      <span style={{ color:"#94a3b8" }}>{d.label}</span>
                      <span style={{ color:d.color,fontFamily:"'Space Mono'" }}>{d.value}/{d.total} ({((d.value/d.total)*100).toFixed(0)}%)</span>
                    </div>
                    <div style={{ height:6,background:"rgba(255,255,255,.04)",borderRadius:3 }}>
                      <div style={{ height:"100%",borderRadius:3,background:d.color,width:`${(d.value/d.total)*100}%`,transition:"width .5s" }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ PROSPECT DETAIL MODAL ══════════════════════════════════════════ */}
        {selected && (
          <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}
            onClick={() => setSelected(null)}>
            <div style={{ background:"rgba(8,10,18,.95)",border:"1px solid rgba(255,255,255,.06)",borderRadius:22,width:"92%",maxWidth:750,maxHeight:"88vh",overflow:"auto",padding:28,
              boxShadow:"0 32px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04)" }}
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

              {/* Tab: Info — Inline Editable */}
              {modalTab === "info" && (
                <div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14 }}>
                    {[{k:"phone",l:"📞 Téléphone"},{k:"email",l:"📧 Email"},{k:"website",l:"🌐 Site web"},{k:"instagram",l:"📸 Instagram"},{k:"type",l:"🏪 Type",select:true},{k:"city",l:"📍 Ville"},{k:"notes",l:"📝 Notes",wide:true}]
                      .map(f => (
                      <div key={f.k} style={{ background:"rgba(255,255,255,.02)",borderRadius:10,padding:8,gridColumn:f.wide?"1/-1":"auto" }}>
                        <div style={{ fontSize:9,color:"#64748b",marginBottom:3 }}>{f.l}</div>
                        {f.select ? (
                          <select className="S" style={{ width:"100%",padding:"5px 8px",fontSize:11 }} value={selected[f.k]||""} onChange={e => {
                            const v = e.target.value;
                            setProspects(prev => prev.map(p => p.id===selected.id ? {...p,[f.k]:v,lastUpdate:new Date().toISOString()} : p));
                            setSelected(prev => prev ? {...prev,[f.k]:v} : null);
                          }}>
                            {PROSPECT_TYPES.map(t => <option key={t}>{t}</option>)}
                          </select>
                        ) : (
                          <input className="I" style={{ padding:"5px 8px",fontSize:11,background:"transparent",border:"1px solid rgba(255,255,255,.04)" }}
                            value={selected[f.k]||""} placeholder={`Ajouter ${f.l.slice(2).toLowerCase()}...`}
                            onChange={e => {
                              const v = e.target.value;
                              setSelected(prev => prev ? {...prev,[f.k]:v} : null);
                            }}
                            onBlur={e => {
                              const v = e.target.value;
                              setProspects(prev => prev.map(p => p.id===selected.id ? {...p,[f.k]:v,lastUpdate:new Date().toISOString()} : p));
                              if (v !== (prospects.find(p=>p.id===selected.id)?.[f.k]||"")) {
                                addActivity(selected.id, selected.name, "Modifié", `${f.l.slice(2)}: ${v}`);
                              }
                            }}/>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Read-only enriched data */}
                  {(selected.contactName || selected.emailConfidence) && (
                    <div style={{ display:"flex",gap:8,marginBottom:10,flexWrap:"wrap" }}>
                      {selected.contactName && <span className="T" style={{ background:"rgba(16,185,129,.1)",color:"#34d399" }}>👤 {selected.contactName}</span>}
                      {selected.contactPosition && <span className="T" style={{ background:"rgba(99,102,241,.1)",color:"#a5b4fc" }}>{selected.contactPosition}</span>}
                      {selected.emailConfidence && <span className="T" style={{ background:"rgba(245,158,11,.1)",color:"#fbbf24" }}>Email: {selected.emailConfidence}% confiance</span>}
                      {selected.source && <span className="T" style={{ background:"rgba(255,255,255,.04)",color:"#64748b" }}>Source: {selected.source}</span>}
                      <span className="T" style={{ background:"rgba(255,255,255,.04)",color:"#64748b" }}>Complétude: {getCompleteness(selected)}%</span>
                    </div>
                  )}
                  {/* Pappers / Company Data */}
                  {(selected.siret || selected.dirigeant || selected.chiffreAffaires) && (
                    <div style={{ background:"rgba(139,92,246,.06)",borderRadius:10,padding:12,marginBottom:14,border:"1px solid rgba(139,92,246,.1)" }}>
                      <div style={{ fontSize:10,fontWeight:700,color:"#8b5cf6",marginBottom:8 }}>🏢 Données Entreprise (Pappers)</div>
                      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11 }}>
                        {selected.siret && <div><span style={{color:"#64748b"}}>SIRET:</span> <span style={{color:"#e2e8f0",fontFamily:"'Space Mono'"}}>{selected.siret}</span></div>}
                        {selected.dirigeant && <div><span style={{color:"#64748b"}}>Dirigeant:</span> <span style={{color:"#e2e8f0"}}>{selected.dirigeant}</span></div>}
                        {selected.effectif && <div><span style={{color:"#64748b"}}>Effectif:</span> <span style={{color:"#e2e8f0"}}>{selected.effectif}</span></div>}
                        {selected.chiffreAffaires && <div><span style={{color:"#64748b"}}>CA:</span> <span style={{color:"#10b981",fontWeight:700}}>{selected.chiffreAffaires}</span></div>}
                        {selected.codeNAF && <div><span style={{color:"#64748b"}}>NAF:</span> <span style={{color:"#e2e8f0"}}>{selected.codeNAF}</span></div>}
                        {selected.activite && <div><span style={{color:"#64748b"}}>Activité:</span> <span style={{color:"#e2e8f0"}}>{selected.activite}</span></div>}
                      </div>
                    </div>
                  )}
                  {/* SEMrush Data */}
                  {selected.semrushData && (
                    <div style={{ background:"rgba(6,182,212,.06)",borderRadius:10,padding:12,marginBottom:14,border:"1px solid rgba(6,182,212,.1)" }}>
                      <div style={{ fontSize:10,fontWeight:700,color:"#06b6d4",marginBottom:8 }}>📊 SEMrush Analytics</div>
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,fontSize:11,marginBottom:10 }}>
                        <div style={{ textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:8 }}>
                          <div style={{ fontSize:18,fontWeight:700,color:"#10b981",fontFamily:"'Space Mono'" }}>{(selected.organicTraffic||0).toLocaleString()}</div>
                          <div style={{ fontSize:8,color:"#64748b" }}>Trafic/mois</div>
                        </div>
                        <div style={{ textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:8 }}>
                          <div style={{ fontSize:18,fontWeight:700,color:"#a5b4fc",fontFamily:"'Space Mono'" }}>{selected.organicKeywords||0}</div>
                          <div style={{ fontSize:8,color:"#64748b" }}>Mots-clés</div>
                        </div>
                        <div style={{ textAlign:"center",background:"rgba(0,0,0,.2)",borderRadius:8,padding:8 }}>
                          <div style={{ fontSize:18,fontWeight:700,color:"#f59e0b",fontFamily:"'Space Mono'" }}>{selected.authorityScore||0}</div>
                          <div style={{ fontSize:8,color:"#64748b" }}>Autorité</div>
                        </div>
                      </div>
                      {(selected.paidTraffic > 0 || selected.paidCost > 0) && (
                        <div style={{ fontSize:10,color:"#ec4899",marginBottom:6 }}>💰 Pub: {selected.paidTraffic||0} visites payantes — {selected.paidCost||0}€/mois estimé</div>
                      )}
                      {selected.topKeywords?.length > 0 && (
                        <div style={{ marginTop:6 }}>
                          <div style={{ fontSize:9,color:"#64748b",marginBottom:4 }}>Top Mots-Clés</div>
                          {selected.topKeywords.slice(0,5).map((kw,i) => (
                            <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0",borderBottom:"1px solid rgba(6,182,212,.06)" }}>
                              <span style={{ color:"#e2e8f0" }}>{kw.keyword}</span>
                              <span style={{ color:"#64748b" }}>pos.{kw.position} — vol.{kw.searchVolume}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
                    <div style={{ marginBottom:12 }}>
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
                  {/* Tags */}
                  <div>
                    <div style={{ fontSize:10,color:"#64748b",marginBottom:4 }}>🏷️ Tags</div>
                    <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:6 }}>
                      {(selected.tags||[]).map(t => (
                        <span key={t} className="T" style={{ background:"rgba(139,92,246,.15)",color:"#c4b5fd",cursor:"pointer" }}
                          onClick={() => {
                            const newTags = (selected.tags||[]).filter(x=>x!==t);
                            setProspects(prev => prev.map(p => p.id===selected.id ? {...p,tags:newTags} : p));
                            setSelected(prev => prev ? {...prev,tags:newTags} : null);
                          }}>
                          {t} ✕
                        </span>
                      ))}
                    </div>
                    <div style={{ display:"flex",gap:4 }}>
                      <input className="I" style={{ flex:1 }} placeholder="Ajouter un tag..." id="tag-input"
                        onKeyDown={e => {
                          if (e.key === "Enter" && e.target.value.trim()) {
                            const tag = e.target.value.trim();
                            const newTags = [...new Set([...(selected.tags||[]), tag])];
                            setProspects(prev => prev.map(p => p.id===selected.id ? {...p,tags:newTags} : p));
                            setSelected(prev => prev ? {...prev,tags:newTags} : null);
                            e.target.value = "";
                          }
                        }}/>
                      <div style={{ display:"flex",gap:2,flexWrap:"wrap" }}>
                        {["Priorité Q2","VIP","À rappeler","Salon","Concurrent","Nouveau"].map(qt => (
                          <button key={qt} className="B BG" style={{ padding:"3px 6px",fontSize:8 }}
                            onClick={() => {
                              const newTags = [...new Set([...(selected.tags||[]), qt])];
                              setProspects(prev => prev.map(p => p.id===selected.id ? {...p,tags:newTags} : p));
                              setSelected(prev => prev ? {...prev,tags:newTags} : null);
                            }}>{qt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
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
                        <pre style={{ fontSize:11,color:"#cbd5e1",whiteSpace:"pre-wrap",margin:0,fontFamily:"'DM Sans'",lineHeight:1.5 }}>{aiOutput}</pre>
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
                      <span style={{ fontSize:12,fontWeight:600,color:"#10b981",fontFamily:"'Space Mono'",minWidth:70,textAlign:"right" }}>
                        {((ALL_PRODUCTS.find(p=>p.id===item.productId)?.price||0)*item.qty).toLocaleString()}€
                      </span>
                      <button className="B BD" style={{ padding:"4px 8px",fontSize:10 }}
                        onClick={() => setQuoteItems(prev => prev.filter((_,i) => i !== idx))}>✕</button>
                    </div>
                  ))}
                  <button className="B BG" style={{ fontSize:10,marginBottom:12 }}
                    onClick={() => setQuoteItems(prev => [...prev, { productId:"", qty:1 }])}>+ Ajouter un produit</button>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:"1px solid rgba(99,102,241,.08)" }}>
                    <div style={{ fontSize:18,fontWeight:700,color:"#10b981",fontFamily:"'Space Mono'" }}>
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
                          <span style={{ fontWeight:700,color:"#10b981",fontFamily:"'Space Mono'" }}>{q.total.toLocaleString()}€</span>
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
                      <span style={{ fontSize:9,color:"#475569",fontFamily:"'Space Mono'",minWidth:90 }}>{new Date(a.date).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span>
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
            <div style={{ background:"rgba(8,10,18,.95)",border:"1px solid rgba(255,255,255,.06)",borderRadius:22,boxShadow:"0 32px 80px rgba(0,0,0,.6)",width:"90%",maxWidth:480,padding:24 }}
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
