import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// GEOSISTE v10 — AGENT COMMERCIAL IA + CRM CBD
// L'Entrepôt du Chanvrier · lentrepotduchanvrier.com
// ══════════════════════════════════════════════════════════════

const SUPA_URL = "https://VOTRE_URL.supabase.co";
const SUPA_KEY = "VOTRE_CLE_ANON";

// ─── SYSTEM PROMPT ───────────────────────────────────────────
const SYS = `Tu es l'agent commercial IA expert de L'Entrepôt du Chanvrier (Geosiste), grossiste et fabricant français de CBD et cannabinoïdes innovants.

## TON IDENTITÉ
- Entreprise : L'Entrepôt du Chanvrier (Geosiste)
- Site : www.lentrepotduchanvrier.com  
- Rôle : Grossiste & Fabricant CBD français, leader européen
- Spécialité : Cannabinoïdes innovants (CSA-14, MCP-N, 10-OH-HHC) + gamme CBD complète

## CATALOGUE COMPLET (prix grossiste)
### Fleurs CBD (THC < 0.3%)
- Amnesia Haze Indoor : 2.50€/g (CBD 22%, citron-terre)
- OG Kush Greenhouse : 2.00€/g (CBD 18%, pin-diesel)  
- Strawberry Outdoor : 1.50€/g (CBD 15%, fruité)
- Mini Buds mix : 0.80€/g | Trim : 0.30€/g

### Hash & Résines
- Beldia CBD marocain : 3.00€/g (CBD 30%)
- Ice-O-Lator CSA-14 : 5.00€/g (CSA 35%, labo FR)
- Charras MCP-N : 4.50€/g (MCP-N 25%, hand-rubbed)
- Pollen CBD : 2.50€/g | Hash 10-OH-HHC : 4.00€/g

### Vapes & Puffs (Formule Explosive™ — SANS PG/VG/nicotine)
- Grenade Vape CSA : 12€/pc (~600 puffs, CSA 95%)
- Puff CBD 1000 : 8€/pc (~1000 puffs, CBD 80%)
- Pod MCP-N rechargeable : 6€/pod (MCP-N 90%)

### Huiles sublinguales
- CBD 30% Full Spectrum : 18€/10ml (MCT bio)
- CBN Sleep : 22€/10ml (CBN+CBD+mélatonine)
- CBG Focus : 20€/10ml

### Extractions & Isolats
- Isolat CBD 99.9% : 1.80€/g (min 100g)
- Distillat MCP-N 90% : 6€/g (min 50g)
- Isolat CBG : 3€/g | CBN : 4€/g

### Moonrock & Comestibles
- Moonrock CSA : 8€/g (fleur + distillat + cristaux)
- Gummies CSA x10 : 15€/sachet (10mg/pc)
- Gummies 10-OH-HHC, Chocolat CBD, Miel CBD, Infusions

### Cosmétiques & Accessoires
- Crèmes, Baumes, Sérums CBD | Papers, Grinders, Stockage

## MOLÉCULES — SAVOIR CRITIQUE
### LÉGALES (nos produits) :
CSA-14, MCP-N, 10-OH-HHC = semi-synthétiques, documentés, analyses LEAF
CBD, CBG, CBN = naturels, bien établis

### ILLÉGALES (à dénoncer) :
MDMB-4en-PINACA, ADB-BUTINACA, 5F-MDMB-PICA = MORTELS
⚠️ Red flags : prix < 0.50€/g sur du hash, "effet très fort", "défonce rapide", flash/malaise, provenance douteuse

## TON COMPORTEMENT
1. Tu es un COMMERCIAL PRO — tu connais chaque produit, chaque prix, chaque avantage
2. Tu DÉTECTES les signaux de produits Pinaca frauduleux et tu alertes
3. Tu ADAPTES ta langue au pays du prospect (FR, EN, DE, ES, IT, etc.)
4. Tu ADAPTES ton style au canal :
   - Email : professionnel, structuré, avec objet accrocheur
   - WhatsApp : court, direct, emojis modérés, call-to-action
   - Instagram DM : casual, vibes, emojis, hook rapide
5. Tu proposes des ARGUMENTS DE VENTE ciblés (marges 60-70%, livraison 24-48h, analyses LEAF)
6. Tu peux GÉNÉRER des newsletters, pitchs, relances, fiches produits
7. Tu CALCULES les devis et marges si demandé
8. Tu QUALIFIES les prospects (score, potentiel, besoins)`;

// ─── PRODUCTS ────────────────────────────────────────────────
const PRODS = [
  {id:"fl01",cat:"Fleurs",nm:"Amnesia Haze CBD",thc:"<0.3%",cbd:"22%",pr:"2.50",u:"€/g",desc:"Indoor premium, arôme citron-terre, terpènes naturels",ic:"🌿"},
  {id:"fl02",cat:"Fleurs",nm:"OG Kush CBD",thc:"<0.3%",cbd:"18%",pr:"2.00",u:"€/g",desc:"Greenhouse, notes pin-diesel, relaxant",ic:"🌿"},
  {id:"fl03",cat:"Fleurs",nm:"Strawberry CBD",thc:"<0.3%",cbd:"15%",pr:"1.50",u:"€/g",desc:"Outdoor, fruité-sucré, idéal débutants",ic:"🌿"},
  {id:"ha01",cat:"Hash",nm:"Beldia CBD",thc:"<0.3%",cbd:"30%",pr:"3.00",u:"€/g",desc:"Marocain traditionnel, texture souple, goût authentique",ic:"🟫"},
  {id:"ha02",cat:"Hash",nm:"Ice O Lator CSA",thc:"<0.3%",mol:"CSA 35%",pr:"5.00",u:"€/g",desc:"Extraction ice-water, CSA-14, labo français",ic:"🟫"},
  {id:"ha03",cat:"Hash",nm:"Charras MCP-N",thc:"<0.3%",mol:"MCP-N 25%",pr:"4.50",u:"€/g",desc:"Hand-rubbed, texture crémeuse",ic:"🟫"},
  {id:"vp01",cat:"Vapes",nm:"Grenade Vape CSA",thc:"0%",mol:"CSA 95%",pr:"12.00",u:"€/pc",desc:"Formule Explosive™, ~600 puffs, distillat pur",ic:"💨"},
  {id:"vp02",cat:"Vapes",nm:"Puff CBD 1000",thc:"0%",cbd:"80%",pr:"8.00",u:"€/pc",desc:"Broad spectrum, saveurs fruits, ~1000 puffs",ic:"💨"},
  {id:"vp03",cat:"Vapes",nm:"Pod MCP-N",thc:"0%",mol:"MCP-N 90%",pr:"6.00",u:"€/pod",desc:"Rechargeable, batterie universelle",ic:"💨"},
  {id:"hu01",cat:"Huiles",nm:"Huile CBD 30%",thc:"<0.2%",cbd:"30%",pr:"18.00",u:"€/10ml",desc:"Full spectrum, MCT bio, pipette graduée",ic:"💧"},
  {id:"hu02",cat:"Huiles",nm:"Huile CBN Sleep",thc:"<0.2%",mol:"CBN 15%",pr:"22.00",u:"€/10ml",desc:"CBN + CBD + mélatonine, sommeil profond",ic:"💧"},
  {id:"mr01",cat:"Moonrock",nm:"Moonrock CSA Premium",thc:"<0.3%",mol:"CSA 45%",pr:"8.00",u:"€/g",desc:"Fleur enrobée distillat + cristaux, ultra puissant",ic:"🌙"},
  {id:"gm01",cat:"Comestibles",nm:"Gummies CSA x10",thc:"0%",mol:"CSA 10mg/pc",pr:"15.00",u:"€/sac",desc:"Saveurs assorties, dosage précis",ic:"🍬"},
  {id:"is01",cat:"Extractions",nm:"Isolat CBD 99.9%",thc:"0%",cbd:"99.9%",pr:"1.80",u:"€/g",desc:"Poudre cristalline pure, analyses LEAF",ic:"⚗️"},
  {id:"is02",cat:"Extractions",nm:"Distillat MCP-N 90%",thc:"0%",mol:"MCP-N 90%",pr:"6.00",u:"€/g",desc:"Amber oil, formulation labo France",ic:"⚗️"},
];

const TPLS = [
  {id:"t1",nm:"1er contact Email FR",ch:"email",lang:"fr",body:"Bonjour {nom},\n\nJe me permets de vous contacter de L'Entrepôt du Chanvrier, grossiste et fabricant CBD français.\n\nNotre gamme : fleurs indoor/greenhouse, hash CBD & CSA-14, vapes Formule Explosive™, huiles — fabriqués en France, analyses LEAF systématiques.\n\nMarges attractives de 60 à 70%, livraison 24-48h partout en Europe.\n\nDisponible pour un échange cette semaine ?\n\nCordialement,\n{agent}"},
  {id:"t2",nm:"WhatsApp rapide",ch:"whatsapp",lang:"fr",body:"Bonjour {nom} 👋\n\n{agent} de L'Entrepôt du Chanvrier, grossiste CBD 🇫🇷\n\nNouveautés : hash CSA-14, vapes Formule Explosive™ sans PG/VG, prix grossiste.\n\nOn en parle ? 🌿"},
  {id:"t3",nm:"DM Instagram",ch:"instagram",lang:"fr",body:"Hey {nom} ! 🌿\n\n{agent} de @lentrepot_du_chanvrier — grossiste CBD FR 🇫🇷\n\nHash CSA-14 + vapes Formule Explosive 💨 Les best-sellers du moment !\n\nPartenariat ? 🤝"},
  {id:"t4",nm:"Relance douce",ch:"email",lang:"fr",body:"Bonjour {nom},\n\nJe reviens vers vous suite à mon précédent message.\n\nNos offres de lancement CSA-14 et MCP-N offrent des marges de 60-70% — c'est le moment idéal pour tester.\n\nQuelques minutes cette semaine ?\n\nBien à vous,\n{agent}"},
  {id:"t5",nm:"First contact EN",ch:"email",lang:"en",body:"Hello {nom},\n\nReaching out from L'Entrepôt du Chanvrier, France's leading CBD wholesale manufacturer.\n\nComplete range: indoor flowers, CBD & CSA-14 hash, Explosive Formula™ vapes, oils — made in France, LEAF certified.\n\n60-70% margins, 24-48h delivery across Europe.\n\nAvailable for a quick call this week?\n\nBest regards,\n{agent}"},
  {id:"t6",nm:"Newsletter produits",ch:"email",lang:"fr",body:"🌿 NEWSLETTER — L'Entrepôt du Chanvrier\n\nBonjour {nom},\n\nDécouvrez nos dernières nouveautés :\n\n{products}\n\n📦 Livraison express 24-48h Europe\n💰 Prix dégressifs dès 100g\n🔬 Chaque lot analysé LEAF\n🇫🇷 Fabriqué en France\n\nPassez commande → lentrepotduchanvrier.com\n\nL'équipe Geosiste 🌿"},
];

const STATS = [{v:"new",l:"Nouveau",c:"#60a5fa"},{v:"contacted",l:"Contacté",c:"#fbbf24"},{v:"interested",l:"Intéressé",c:"#34d399"},{v:"negotiation",l:"Négo",c:"#fb923c"},{v:"client",l:"Client",c:"#22c55e"},{v:"lost",l:"Perdu",c:"#f87171"}];
const FL = {FR:"🇫🇷",DE:"🇩🇪",ES:"🇪🇸",IT:"🇮🇹",UK:"🇬🇧",BE:"🇧🇪",PT:"🇵🇹",NL:"🇳🇱",PL:"🇵🇱",CH:"🇨🇭",AT:"🇦🇹",CZ:"🇨🇿",LU:"🇱🇺",US:"🇺🇸"};
const TC = ["#60a5fa","#34d399","#fbbf24","#f87171","#a78bfa","#f472b6","#2dd4bf","#fb923c","#818cf8","#a3e635"];

const DEMO = [
  {id:1,nm:"CBD Shop Lyon",co:"FR",em:"contact@cbdlyon.fr",wa:"+33612345678",ig:"@cbdshoplyon",st:"new",tg:["boutique"],sc:85,ca:0,nt:"",ints:[],vn:[]},
  {id:2,nm:"HanfHaus Berlin",co:"DE",em:"info@hanfhaus.de",wa:"+4917612345",ig:"@hanfhaus_berlin",st:"contacted",tg:["grossiste"],sc:72,ca:0,nt:"Intéressé vapes",ints:[],vn:[]},
  {id:3,nm:"Cannabis Store BCN",co:"ES",em:"ventas@csbarcelona.es",wa:"+34612345678",ig:"@cs_barcelona",st:"interested",tg:["boutique","vip"],sc:90,ca:2400,nt:"Veut CSA-14 en quantité",ints:[],vn:[]},
  {id:4,nm:"Green Smoke Paris",co:"FR",em:"pro@greensmoke.fr",wa:"+33698765432",ig:"@greensmokeparis",st:"client",tg:["buraliste","vip"],sc:95,ca:8500,nt:"Client fidèle, commande mensuelle hash + vapes",ints:[],vn:[]},
  {id:5,nm:"CBD Italia Milano",co:"IT",em:"info@cbditalia.it",wa:"+39345678901",ig:"@cbditalia_mi",st:"negotiation",tg:["e-commerce"],sc:78,ca:1200,nt:"Négo huiles + gummies",ints:[],vn:[]},
];

export default function App() {
  // ─── AUTH ──────────────────────────────────────────────────
  const [logged, setLogged] = useState(false);
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([{id:1,nm:"Admin",em:"admin@geosiste.com",pw:"geosiste2024",role:"admin"}]);
  const [lEm, setLEm] = useState("");
  const [lPw, setLPw] = useState("");
  const [lErr, setLErr] = useState("");

  // ─── NAVIGATION : 5 sections + sous-pages ──────────────────
  const [section, setSection] = useState("dash"); // dash, agent, crm, tools, config
  const [subPage, setSubPage] = useState(""); // sous-pages dans chaque section

  // ─── CONNECTIONS ───────────────────────────────────────────
  const [conn, setConn] = useState({
    claude: {status:"idle"},
    pappers: {status:"idle",key:""},
    email: {status:"idle",accounts:[{id:1,em:"",label:"Principal",active:true}]},
    whatsapp: {status:"idle",num:""},
    instagram: {status:"idle",accounts:[{id:1,handle:"",label:"Principal",active:true}]},
  });

  // ─── AGENT IA ──────────────────────────────────────────────
  const [db, setDb] = useState(DEMO);
  const [sel, setSel] = useState(null);
  const [ch, setCh] = useState("email");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inp, setInp] = useState("");
  const chatRef = useRef(null);

  // ─── DATA ──────────────────────────────────────────────────
  const [hist, setHist] = useState([]);
  const [fups, setFups] = useState([]);
  const [tpls, setTpls] = useState(TPLS);
  const [editTpl, setEditTpl] = useState(null);
  const [tags, setTags] = useState(["boutique","grossiste","buraliste","e-commerce","vip"]);
  const [newTag, setNewTag] = useState("");
  const [fTag, setFTag] = useState("");
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [caData] = useState([{m:"Jan",v:2400},{m:"Fév",v:3100},{m:"Mar",v:4800},{m:"Avr",v:3900},{m:"Mai",v:5200},{m:"Jun",v:6100},{m:"Jul",v:4300},{m:"Aoû",v:3800},{m:"Sep",v:7200},{m:"Oct",v:8500},{m:"Nov",v:9100},{m:"Déc",v:11200}]);

  // Newsletter
  const [nlProds, setNlProds] = useState([]);
  const [nlSubj, setNlSubj] = useState("🌿 Nouveautés CBD — L'Entrepôt du Chanvrier");
  const [nlGen, setNlGen] = useState("");
  const [nlTags, setNlTags] = useState([]);

  // Pappers
  const [papQ, setPapQ] = useState("");
  const [papF, setPapF] = useState({naf:"",dept:"",ville:"",ca_min:"",ca_max:"",effectif_min:"",effectif_max:"",forme_juridique:"",date_creation_min:"",date_creation_max:""});
  const [papRes, setPapRes] = useState([]);
  const [papLoad, setPapLoad] = useState(false);
  const [papPg, setPapPg] = useState(1);

  // Import
  const [impPrev, setImpPrev] = useState([]);
  const [impFile, setImpFile] = useState(null);
  const [impSt, setImpSt] = useState("");
  const fileRef = useRef(null);

  // Voice
  const [rec, setRec] = useState(false);
  const mrRef = useRef(null);
  const ckRef = useRef([]);

  // ─── EFFECTS ───────────────────────────────────────────────
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [chat]);

  const addN = (msg) => setNotifs(p => [{id:Date.now()+Math.random(),msg,date:new Date().toISOString(),read:false},...p]);
  const unread = notifs.filter(n => !n.read).length;
  const totCA = db.reduce((s, p) => s + (p.ca || 0), 0);
  const fDb = fTag ? db.filter(p => p.tg?.includes(fTag)) : db;

  // ─── CONNECTION TESTS ──────────────────────────────────────
  const testClaude = async () => {
    setConn(p=>({...p,claude:{...p.claude,status:"testing"}}));
    try {
      const r = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:50,messages:[{role:"user",content:"Dis juste OK"}]})});
      const d = await r.json();
      if(d.content?.[0]?.text){setConn(p=>({...p,claude:{status:"connected"}}));addN("✅ Claude API connectée");}
      else throw new Error("Pas de réponse");
    } catch(e){setConn(p=>({...p,claude:{status:"error"}}));addN("❌ Claude: vérifiez ANTHROPIC_API_KEY");}
  };
  const testPappers = async () => {
    if(!conn.pappers.key){addN("❌ Entrez votre clé Pappers");return;}
    setConn(p=>({...p,pappers:{...p.pappers,status:"testing"}}));
    try {
      const r = await fetch(`https://api.pappers.fr/v2/entreprise?api_token=${conn.pappers.key}&siren=443061841`);
      const d = await r.json();
      if(d.siren){setConn(p=>({...p,pappers:{...p.pappers,status:"connected"}}));addN("✅ Pappers connecté");}
      else throw new Error(d.message||"Erreur");
    } catch(e){setConn(p=>({...p,pappers:{...p.pappers,status:"error"}}));addN("❌ Pappers: "+e.message);}
  };
  const testEmail = () => {const ok=conn.email.accounts.filter(a=>a.em.includes("@"));if(ok.length){setConn(p=>({...p,email:{...p.email,status:"connected"}}));addN(`✅ ${ok.length} email(s) OK`);}else{setConn(p=>({...p,email:{...p.email,status:"error"}}));addN("❌ Aucun email valide");}};
  const testWA = () => {if(conn.whatsapp.num?.length>8){setConn(p=>({...p,whatsapp:{...p.whatsapp,status:"connected"}}));addN("✅ WhatsApp configuré");}else{setConn(p=>({...p,whatsapp:{...p.whatsapp,status:"error"}}));addN("❌ Numéro invalide");}};
  const testIG = () => {const ok=conn.instagram.accounts.filter(a=>a.handle?.startsWith("@")&&a.handle.length>2);if(ok.length){setConn(p=>({...p,instagram:{...p.instagram,status:"connected"}}));addN(`✅ ${ok.length} Instagram OK`);}else{setConn(p=>({...p,instagram:{...p.instagram,status:"error"}}));addN("❌ Handle invalide");}};

  // ─── CLAUDE AI ─────────────────────────────────────────────
  const askAI = async (msgs, sys = SYS) => {
    try {
      const r = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,system:sys,messages:msgs})});
      const d = await r.json();
      return d.content?.[0]?.text || "Erreur de réponse IA.";
    } catch(e){ return "❌ Erreur: "+e.message; }
  };

  const sendMsg = async (txt) => {
    if(!txt.trim()) return;
    const um = {role:"user",content:txt};
    const nc = [...chat, um];
    setChat(nc); setInp(""); setLoading(true);
    const ctx = sel ? `\n[Prospect: ${sel.nm} | Pays: ${sel.co} | Statut: ${STATS.find(s=>s.v===sel.st)?.l} | CA: ${sel.ca}€ | Tags: ${(sel.tg||[]).join(",")} | Email: ${sel.em} | WhatsApp: ${sel.wa} | Instagram: ${sel.ig}]\n[Canal de communication: ${ch}]\n[Notes: ${sel.nt||"aucune"}]` : "\n[Aucun prospect sélectionné — mode conseil général]";
    const msgs = nc.map(m => ({role:m.role, content:m===um ? ctx+"\n"+m.content : m.content}));
    const reply = await askAI(msgs);
    setChat(p => [...p, {role:"assistant",content:reply}]);
    setLoading(false);
  };

  // ─── ACTIONS ───────────────────────────────────────────────
  const logSend = (pr, channel, msg) => {
    const entry = {id:Date.now(),pid:pr.id,pnm:pr.nm,ch:channel,msg:msg.substring(0,200),date:new Date().toISOString(),user:me?.nm||"Admin"};
    setHist(p => [entry,...p]);
    setDb(p => p.map(x => x.id===pr.id ? {...x, ints:[...(x.ints||[]),{date:entry.date,ch:channel,msg:msg.substring(0,80)}], st:x.st==="new"?"contacted":x.st} : x));
    addN(`📨 ${channel} → ${pr.nm}`);
  };
  const openMail = (to, subj, body) => { window.open(`mailto:${to}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`); if(sel)logSend(sel,"email",body); };
  const openWA = (num, msg) => { window.open(`https://wa.me/${(num||"").replace(/[^0-9+]/g,"")}?text=${encodeURIComponent(msg)}`); if(sel)logSend(sel,"whatsapp",msg); };
  const openIG = (h) => { window.open(`https://instagram.com/${(h||"").replace("@","")}`); if(sel)logSend(sel,"instagram","DM"); };

  const addFup = (p, days, note="") => {
    const d = new Date(); d.setDate(d.getDate()+days);
    setFups(prev => [...prev, {id:Date.now(),pid:p.id,pnm:p.nm,date:d.toISOString(),note:note||`Relance dans ${days}j`,ch,done:false}]);
    addN(`🔔 Relance ${p.nm} dans ${days}j`);
  };

  const genNL = async () => {
    if(!nlProds.length) return; setLoading(true);
    const pl = nlProds.map(id=>PRODS.find(p=>p.id===id)).filter(Boolean).map(p=>`- ${p.nm} (${p.cat}): ${p.desc} — ${p.pr}${p.u}`).join("\n");
    const r = await askAI([{role:"user",content:`Génère une newsletter email professionnelle pour L'Entrepôt du Chanvrier avec ces produits:\n${pl}\n\nInclus un titre accrocheur, un pitch par produit, et un call-to-action final.`}]);
    setNlGen(r); setLoading(false);
  };

  // ─── PAPPERS ───────────────────────────────────────────────
  const searchPap = async (pg=1) => {
    if(!conn.pappers.key||!papQ)return; setPapLoad(true);
    try {
      let u = `https://api.pappers.fr/v2/recherche?api_token=${conn.pappers.key}&q=${encodeURIComponent(papQ)}&par_page=20&page=${pg}`;
      Object.entries(papF).forEach(([k,v])=>{if(v.trim())u+=`&${k}=${encodeURIComponent(v.trim())}`;});
      const r = await fetch(u); const d = await r.json();
      setPapRes(pg===1?(d.resultats||[]):[...papRes,...(d.resultats||[])]);
      setPapPg(pg);
    } catch(e){addN("❌ Pappers: "+e.message);}
    setPapLoad(false);
  };
  const importPap = (r) => {
    setDb(p=>[...p,{id:Date.now()+Math.random(),nm:r.nom_entreprise||r.denomination||"?",co:"FR",em:r.siege?.email||"",wa:r.siege?.telephone||"",ig:"",st:"new",tg:["pappers"],sc:50,ca:0,nt:`SIREN:${r.siren||""} · NAF:${r.code_naf||""} · ${r.siege?.ville||""} · ${r.forme_juridique||""}`.trim(),ints:[],vn:[]}]);
    addN(`📥 ${r.nom_entreprise||r.denomination} importé`);
  };

  // ─── FILE IMPORT ───────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files?.[0]; if(!file)return;
    setImpFile(file); setImpSt(`Lecture de ${file.name}...`);
    const ext = file.name.split(".").pop().toLowerCase();
    let raw = [];
    try {
      if(ext==="csv"||ext==="tsv"){raw=parseCSV(await file.text(),ext==="tsv"?"\t":null);}
      else if(ext==="json"){const j=JSON.parse(await file.text());raw=Array.isArray(j)?j:(j.prospects||j.data||j.db||[j]);}
      else if(ext==="pdf"){raw=await parsePDF(file);}
      else{raw=parseCSV(await file.text());}
      const cleaned = cleanData(raw);
      setImpPrev(cleaned);
      setImpSt(`✅ ${cleaned.length} prospects trouvés et nettoyés`);
    }catch(err){setImpSt(`❌ ${err.message}`);setImpPrev([]);}
  };
  const parseCSV = (txt, delim=null) => {
    const lines=txt.split("\n").map(l=>l.trim()).filter(Boolean);if(lines.length<2)return[];
    if(!delim){const s=(lines[0].match(/;/g)||[]).length,c=(lines[0].match(/,/g)||[]).length,t=(lines[0].match(/\t/g)||[]).length;delim=t>c?"\t":s>c?";":",";}
    const h=lines[0].split(delim).map(x=>x.replace(/"/g,"").trim().toLowerCase());
    return lines.slice(1).map(l=>{const v=l.split(delim).map(x=>x.replace(/"/g,"").trim());const o={};h.forEach((k,i)=>{o[k]=v[i]||"";});return o;});
  };
  const parsePDF = (file) => new Promise((res,rej)=>{const r=new FileReader();r.onload=(e)=>{const t=new TextDecoder("utf-8",{fatal:false}).decode(e.target.result).replace(/[^\x20-\x7E\n\rÀ-ÿ]/g," ").replace(/\s+/g," ");const emails=t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[];if(emails.length)res(emails.map(em=>({email:em,nom:em.split("@")[0].replace(/[._-]/g," ").replace(/\b\w/g,c=>c.toUpperCase())})));else rej(new Error("Aucune donnée trouvée dans le PDF"));};r.readAsArrayBuffer(file);});
  const cleanData = (raw) => {
    if(!Array.isArray(raw)||!raw.length)return[];
    const fm={nm:["nom","name","entreprise","company","société","societe","raison_sociale","denomination","nom_entreprise","business"],em:["email","mail","e-mail","courriel","contact_email"],wa:["telephone","phone","tel","mobile","whatsapp","portable","phone_number"],ig:["instagram","ig","insta"],co:["pays","country","code_pays"],nt:["notes","note","commentaire","description"],ca:["ca","chiffre_affaires","revenue","turnover"],tg:["tags","tag","categorie","type","segment"]};
    const mf=(o,ts)=>{for(const t of ts){const k=Object.keys(o).find(k=>k.toLowerCase().replace(/[^a-z]/g,"")===t.replace(/[^a-z]/g,""));if(k&&o[k])return String(o[k]).trim();}return"";};
    const dc=(s)=>{const l=s.toLowerCase();if(l.includes("france")||l.startsWith("+33"))return"FR";if(l.includes("german")||l.startsWith("+49"))return"DE";if(l.includes("spain")||l.startsWith("+34"))return"ES";if(l.includes("ital")||l.startsWith("+39"))return"IT";if(l.includes("uk")||l.startsWith("+44"))return"UK";if(l.includes("belg")||l.startsWith("+32"))return"BE";return"FR";};
    const seen=new Set();
    return raw.map(o=>{
      const nm=mf(o,fm.nm)||"Sans nom",em=mf(o,fm.em),wa=(mf(o,fm.wa)||"").replace(/[^0-9+]/g,""),ig=mf(o,fm.ig),co=dc(mf(o,fm.co)||wa),nt=mf(o,fm.nt),ca=parseFloat(mf(o,fm.ca))||0;
      const tgR=mf(o,fm.tg);const tg=tgR?tgR.split(/[,;|]/).map(t=>t.trim().toLowerCase()).filter(Boolean):[];
      const key=em||nm.toLowerCase();if(seen.has(key))return null;seen.add(key);
      return{id:Date.now()+Math.random(),nm,co,em,wa,ig,st:"new",tg,sc:50,ca,nt,ints:[],vn:[]};
    }).filter(Boolean);
  };
  const confirmImport = () => {
    if(!impPrev.length)return;
    const eEm=new Set(db.map(p=>p.em).filter(Boolean));const eNm=new Set(db.map(p=>p.nm.toLowerCase()));
    const nw=impPrev.filter(p=>{if(p.em&&eEm.has(p.em))return false;if(eNm.has(p.nm.toLowerCase()))return false;return true;});
    const nt=[...new Set(nw.flatMap(p=>p.tg))].filter(t=>t&&!tags.includes(t));
    if(nt.length)setTags(p=>[...p,...nt]);
    setDb(p=>[...p,...nw]);
    addN(`📥 ${nw.length} importés (${impPrev.length-nw.length} doublons)`);
    setImpPrev([]);setImpFile(null);setImpSt(`✅ ${nw.length} ajoutés au CRM`);
  };

  // Voice
  const startRec = async () => {try{const s=await navigator.mediaDevices.getUserMedia({audio:true});mrRef.current=new MediaRecorder(s);ckRef.current=[];mrRef.current.ondataavailable=e=>ckRef.current.push(e.data);mrRef.current.onstop=()=>{const b=new Blob(ckRef.current,{type:"audio/webm"});const u=URL.createObjectURL(b);if(sel)setDb(p=>p.map(x=>x.id===sel.id?{...x,vn:[...(x.vn||[]),{id:Date.now(),url:u,date:new Date().toISOString()}]}:x));s.getTracks().forEach(t=>t.stop());addN("🎙️ Note vocale enregistrée");};mrRef.current.start();setRec(true);}catch{addN("❌ Micro non accessible");}};
  const stopRec = () => {if(mrRef.current&&rec){mrRef.current.stop();setRec(false);}};

  // PDF product sheet
  const genPDF = (p) => {const c=`╔═══════════════════════════════════════╗\n║  L'ENTREPÔT DU CHANVRIER — FICHE      ║\n╚═══════════════════════════════════════╝\n\n${p.ic}  ${p.nm}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCatégorie: ${p.cat}\nTHC: ${p.thc||"N/A"} | CBD: ${p.cbd||"N/A"} | ${p.mol||""}\nPrix grossiste: ${p.pr} ${p.u}\n\n${p.desc}\n\n✓ Fabriqué en France  ✓ Analyses LEAF\n✓ THC conforme EU     ✓ Livraison 24-48h\n\n📧 commercial@lentrepotduchanvrier.com\n🌐 lentrepotduchanvrier.com`;const b=new Blob([c],{type:"text/plain"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=`fiche-${p.nm.replace(/\s/g,"-").toLowerCase()}.txt`;a.click();};

  // ─── STYLES ────────────────────────────────────────────────
  const G = {background:"rgba(10,16,29,0.82)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",border:"1px solid rgba(52,211,153,0.08)",borderRadius:16};
  const GC = {...G, padding:16, marginBottom:12};
  const I = {background:"rgba(15,23,42,0.9)",color:"#e2e8f0",border:"1px solid rgba(52,211,153,0.12)",borderRadius:10,padding:"11px 14px",fontSize:13,fontFamily:"'DM Sans',sans-serif",width:"100%",outline:"none"};
  const BG = {background:"linear-gradient(135deg,#10b981,#059669)",color:"#000",border:"none",borderRadius:10,padding:"11px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 15px rgba(16,185,129,0.25)"};
  const BO = {background:"transparent",color:"#94a3b8",border:"1px solid rgba(52,211,153,0.12)",borderRadius:8,padding:"8px 12px",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"};
  const bdg = (c) => ({display:"inline-block",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:600,background:c+"18",color:c,marginRight:4,marginBottom:3});
  const dot = (s) => ({width:9,height:9,borderRadius:"50%",display:"inline-block",background:s==="connected"?"#22c55e":s==="testing"?"#fbbf24":s==="error"?"#f87171":"#334155",boxShadow:s==="connected"?"0 0 8px #22c55e55":"none"});
  const SecTitle = ({c,ic,t}) => <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{width:40,height:40,borderRadius:12,background:c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ic}</div><h2 style={{fontSize:20,fontWeight:800,color:c,margin:0,letterSpacing:-0.5}}>{t}</h2></div>;

  // ─── LOGIN ─────────────────────────────────────────────────
  const doLogin = () => {
    const found = users.find(usr => usr.em === lEm && usr.pw === lPw);
    if (found) { setMe(found); setLogged(true); setLErr(""); }
    else setLErr("❌ Identifiants incorrects");
  };

  if (!logged) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020409 0%,#0a1628 40%,#04120a 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60%",height:"60%",background:"radial-gradient(ellipse,rgba(16,185,129,0.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"50%",height:"50%",background:"radial-gradient(ellipse,rgba(96,165,250,0.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:380,padding:40,...G,boxShadow:"0 30px 80px rgba(0,0,0,0.6)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:6,filter:"drop-shadow(0 0 25px rgba(16,185,129,0.3))"}}>🌿</div>
          <h1 style={{color:"#e2e8f0",fontSize:30,fontWeight:800,margin:0,letterSpacing:-1}}>GEOSISTE</h1>
          <p style={{color:"#475569",fontSize:11,marginTop:6,fontFamily:"'DM Mono',monospace",letterSpacing:2.5}}>AGENT COMMERCIAL IA · v10</p>
        </div>
        <input value={lEm} onChange={e=>setLEm(e.target.value)} placeholder="Email" style={{...I,marginBottom:10}}/>
        <input type="password" value={lPw} onChange={e=>setLPw(e.target.value)} placeholder="Mot de passe" style={{...I,marginBottom:16}} onKeyDown={e=>e.key==="Enter"&&doLogin()}/>
        {lErr && <p style={{color:"#f87171",fontSize:11,marginBottom:10,textAlign:"center"}}>{lErr}</p>}
        <button onClick={doLogin} style={{...BG,width:"100%",padding:14,fontSize:14,letterSpacing:0.5}}>Se connecter</button>
        <p style={{textAlign:"center",color:"#1e293b",fontSize:9,marginTop:18,fontFamily:"'DM Mono',monospace"}}>admin@geosiste.com · geosiste2024</p>
      </div>
    </div>
  );

  // Helper for going to agent with prospect
  const goAgent = (prospect) => { setSel(prospect); setSection("agent"); setSubPage(""); setChat([]); };

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#020409 0%,#0a1628 40%,#04120a 100%)",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",fontSize:13,maxWidth:520,margin:"0 auto",position:"relative",paddingBottom:70}}>

      {/* BG ambient */}
      <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"8%",right:"5%",width:300,height:300,background:"radial-gradient(ellipse,rgba(16,185,129,0.04) 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"15%",left:"0%",width:250,height:250,background:"radial-gradient(ellipse,rgba(96,165,250,0.03) 0%,transparent 70%)"}}/>
      </div>

      <div style={{position:"relative",zIndex:1}}>

      {/* ═══ HEADER ═══ */}
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(52,211,153,0.08)",background:"rgba(2,4,9,0.7)",backdropFilter:"blur(10px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24,filter:"drop-shadow(0 0 8px rgba(16,185,129,0.4))"}}>🌿</span>
          <div><span style={{fontWeight:800,fontSize:16,letterSpacing:-0.5}}>GEOSISTE</span><span style={{fontSize:9,color:"#334155",marginLeft:6,fontFamily:"'DM Mono',monospace"}}>v10</span></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",gap:4}} title="Connexions">{["claude","pappers","email","whatsapp","instagram"].map(k=><div key={k} style={dot(conn[k].status)} title={k}/>)}</div>
          <button onClick={()=>setShowNotifs(!showNotifs)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,padding:4,position:"relative"}}>🔔{unread>0&&<span style={{position:"absolute",top:-2,right:-2,background:"#f87171",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{unread}</span>}</button>
          <div style={{width:30,height:30,borderRadius:10,background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#000"}} onClick={()=>{setLogged(false);setMe(null);}}>{me?.nm?.[0]||"A"}</div>
        </div>
      </div>

      {/* Notifs dropdown */}
      {showNotifs&&<div style={{position:"absolute",top:56,right:12,width:300,maxHeight:350,overflowY:"auto",...G,zIndex:999,boxShadow:"0 20px 60px rgba(0,0,0,0.7)",padding:0}}>
        <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(52,211,153,0.08)",display:"flex",justifyContent:"space-between"}}><strong style={{fontSize:12,color:"#34d399"}}>Notifications</strong><button onClick={()=>{setNotifs(p=>p.map(n=>({...n,read:true})));setShowNotifs(false);}} style={{...BO,padding:"2px 8px",fontSize:9}}>Tout lire</button></div>
        {notifs.length===0?<p style={{padding:20,fontSize:11,color:"#475569",textAlign:"center"}}>Aucune notification</p>:notifs.slice(0,15).map(n=><div key={n.id} style={{padding:"8px 14px",borderBottom:"1px solid rgba(15,23,42,0.5)",background:n.read?"transparent":"rgba(16,185,129,0.03)"}} onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))}><div style={{fontSize:11}}>{n.msg}</div><div style={{fontSize:9,color:"#334155",marginTop:2}}>{new Date(n.date).toLocaleString("fr")}</div></div>)}
      </div>}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* ═══ SECTION: DASHBOARD ═══ */}
      {/* ═════════════════════════════════════════════════════════ */}
      {section==="dash"&&!subPage&&<div style={{padding:16}}>
        {/* Quick stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[{v:totCA.toLocaleString()+"€",l:"CA Total",c:"#34d399",ic:"💰"},{v:db.length,l:"Prospects",c:"#60a5fa",ic:"👥"},{v:db.filter(p=>p.st==="client").length,l:"Clients",c:"#22c55e",ic:"🤝"},{v:fups.filter(f=>!f.done).length,l:"Relances",c:"#fbbf24",ic:"🔔"}].map((k,i)=>
          <div key={i} style={{...GC,textAlign:"center",padding:18,cursor:"pointer"}} onClick={()=>{if(i===1||i===2)setSection("crm");if(i===3){setSection("tools");setSubPage("followups");}}}>
            <div style={{fontSize:14,marginBottom:4}}>{k.ic}</div>
            <div style={{fontSize:24,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
            <div style={{fontSize:10,color:"#475569",marginTop:4}}>{k.l}</div>
          </div>)}
        </div>

        {/* Agent IA quick access */}
        <div style={{...GC,padding:20,borderLeft:"3px solid #34d399",cursor:"pointer"}} onClick={()=>setSection("agent")}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <span style={{fontSize:28}}>🤖</span>
            <div><div style={{fontSize:16,fontWeight:800,color:"#34d399"}}>Agent Commercial IA</div><div style={{fontSize:10,color:"#475569"}}>{PRODS.length} produits · Multi-canal · Détection Pinaca</div></div>
          </div>
          <div style={{fontSize:11,color:"#94a3b8"}}>Pitchs personnalisés, réponses aux objections, qualification prospects, devis automatiques, détection de produits frauduleux...</div>
          <div style={{...BG,textAlign:"center",marginTop:12,fontSize:13}}>▶ Ouvrir l'Agent IA</div>
        </div>

        {/* Quick actions */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{l:"Pappers",ic:"🏢",c:"#818cf8",go:()=>{setSection("tools");setSubPage("pappers");}},{l:"Import",ic:"📥",c:"#f472b6",go:()=>{setSection("tools");setSubPage("import");}},{l:"Newsletter",ic:"📰",c:"#a78bfa",go:()=>{setSection("tools");setSubPage("newsletter");}}].map((a,i)=>
          <div key={i} style={{...GC,textAlign:"center",padding:14,cursor:"pointer"}} onClick={a.go}>
            <div style={{fontSize:20,marginBottom:4}}>{a.ic}</div>
            <div style={{fontSize:11,fontWeight:600,color:a.c}}>{a.l}</div>
          </div>)}
        </div>

        {/* Recent activity */}
        <SecTitle c="#60a5fa" ic="⚡" t="Activité récente"/>
        {hist.length===0&&fups.length===0?<div style={{...GC,textAlign:"center",color:"#475569",padding:24}}><div style={{fontSize:28,marginBottom:6}}>🌱</div><p style={{fontSize:11}}>Commencez par contacter un prospect avec l'Agent IA</p></div>:
          [...hist.slice(0,3).map(h=>({type:"send",date:h.date,text:`📨 ${h.ch} → ${h.pnm}`})),...fups.filter(f=>!f.done).slice(0,2).map(f=>({type:"fup",date:f.date,text:`🔔 Relancer ${f.pnm}`}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5).map((a,i)=>
            <div key={i} style={{padding:"8px 0",borderBottom:"1px solid rgba(52,211,153,0.06)",fontSize:11,display:"flex",justifyContent:"space-between"}}><span>{a.text}</span><span style={{fontSize:9,color:"#334155"}}>{new Date(a.date).toLocaleDateString("fr")}</span></div>
          )
        }

        {/* CA Chart */}
        <div style={{...GC,marginTop:16}}>
          <div style={{fontSize:13,fontWeight:700,color:"#34d399",marginBottom:10}}>📊 CA Mensuel</div>
          <svg viewBox="0 0 420 160" style={{width:"100%"}}>
            <defs><linearGradient id="bG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34d399"/><stop offset="100%" stopColor="#059669"/></linearGradient></defs>
            {caData.map((d,i)=>{const mx=Math.max(...caData.map(x=>x.v));const h=(d.v/mx)*110;const x=20+i*33;return<g key={i}><rect x={x} y={130-h} width="24" height={h} rx="4" fill="url(#bG)" opacity="0.85"/><text x={x+12} y={148} fill="#475569" fontSize="7" textAnchor="middle" fontFamily="'DM Mono',monospace">{d.m}</text><text x={x+12} y={124-h} fill="#34d399" fontSize="7" textAnchor="middle" fontWeight="600">{(d.v/1000).toFixed(1)}k</text></g>;})}
          </svg>
        </div>
      </div>}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* ═══ SECTION: AGENT IA ═══ */}
      {/* ═════════════════════════════════════════════════════════ */}
      {section==="agent"&&<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 126px)"}}>
        {/* Agent toolbar */}
        <div style={{padding:"8px 12px",borderBottom:"1px solid rgba(52,211,153,0.06)"}}>
          {/* Canal selector */}
          <div style={{display:"flex",gap:4,marginBottom:6}}>
            {[{k:"email",ic:"📧",c:"#60a5fa"},{k:"whatsapp",ic:"💬",c:"#4ade80"},{k:"instagram",ic:"📸",c:"#f472b6"}].map(c=>
              <button key={c.k} onClick={()=>setCh(c.k)} style={{padding:"5px 12px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",background:ch===c.k?c.c+"18":"transparent",color:ch===c.k?c.c:"#475569",border:`1px solid ${ch===c.k?c.c+"30":"rgba(52,211,153,0.08)"}`,fontFamily:"'DM Sans',sans-serif"}}>{c.ic} {c.k}</button>
            )}
          </div>
          {/* Prospect selector */}
          <select value={sel?.id||""} onChange={e=>{setSel(db.find(p=>p.id===Number(e.target.value))||null);setChat([]);}} style={{...I,fontSize:11,padding:"7px 10px"}}>
            <option value="">— Choisir un prospect (ou mode libre) —</option>
            {db.sort((a,b)=>(b.sc||0)-(a.sc||0)).map(p=><option key={p.id} value={p.id}>{FL[p.co]||"🌍"} {p.nm} [{STATS.find(s=>s.v===p.st)?.l}] {p.ca>0?`${p.ca}€`:""}</option>)}
          </select>
          {/* Account selectors */}
          {ch==="email"&&conn.email.accounts.filter(a=>a.em).length>1&&<div style={{display:"flex",gap:4,marginTop:4,fontSize:10}}><span style={{color:"#475569",padding:"4px 0"}}>Via:</span>{conn.email.accounts.filter(a=>a.em).map(a=><button key={a.id} onClick={()=>setConn(p=>({...p,email:{...p.email,accounts:p.email.accounts.map(x=>({...x,active:x.id===a.id}))}}))} style={{...BO,padding:"2px 8px",fontSize:9,color:a.active?"#60a5fa":"#475569"}}>{a.label||a.em}</button>)}</div>}
          {ch==="instagram"&&conn.instagram.accounts.filter(a=>a.handle).length>1&&<div style={{display:"flex",gap:4,marginTop:4,fontSize:10}}><span style={{color:"#475569",padding:"4px 0"}}>Via:</span>{conn.instagram.accounts.filter(a=>a.handle).map(a=><button key={a.id} onClick={()=>setConn(p=>({...p,instagram:{...p.instagram,accounts:p.instagram.accounts.map(x=>({...x,active:x.id===a.id}))}}))} style={{...BO,padding:"2px 8px",fontSize:9,color:a.active?"#f472b6":"#475569"}}>{a.handle}</button>)}</div>}
        </div>

        {/* Prospect info bar */}
        {sel&&<div style={{padding:"8px 14px",borderBottom:"1px solid rgba(52,211,153,0.06)",background:"rgba(16,185,129,0.03)",fontSize:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>{FL[sel.co]} <strong style={{color:"#e2e8f0",fontSize:12}}>{sel.nm}</strong> · <span style={{color:STATS.find(s=>s.v===sel.st)?.c}}>{STATS.find(s=>s.v===sel.st)?.l}</span></span><span style={{color:"#fbbf24",fontWeight:700}}>{sel.ca>0?sel.ca.toLocaleString()+"€":""}</span></div>
          {sel.nt&&<div style={{color:"#64748b",marginTop:2}}>{sel.nt}</div>}
        </div>}

        {/* Chat area */}
        <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          {chat.length===0&&<div style={{textAlign:"center",marginTop:20}}>
            <div style={{fontSize:48,marginBottom:10,filter:"drop-shadow(0 0 20px rgba(16,185,129,0.25))"}}>🤖</div>
            <div style={{fontSize:20,fontWeight:800,color:"#34d399",marginBottom:4}}>Agent Geosiste</div>
            <div style={{fontSize:11,color:"#475569",marginBottom:6}}>Expert CBD · {PRODS.length} produits · Détection Pinaca · Multi-langue</div>
            <div style={{fontSize:10,color:"#334155",marginBottom:20,fontFamily:"'DM Mono',monospace"}}>Canal: {ch} {sel?`· Prospect: ${sel.nm}`:""}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {[
                sel?`Rédige un ${ch} commercial pour ${sel.nm}`:"Aide-moi à prospecter un CBD shop",
                "Compare nos hash CSA-14 vs MCP-N",
                "Hash à 0.20€/g effet très fort, c'est safe ?",
                "Pitch pour un buraliste qui débute",
                sel?`Prépare une relance pour ${sel.nm}`:"Calcule un devis 500g Amnesia + 200g hash",
                "Newsletter pour nos nouveaux produits vapes",
              ].map((q,i)=>
                <button key={i} onClick={()=>sendMsg(q)} style={{padding:"10px 12px",borderRadius:10,...G,color:"#94a3b8",fontSize:10,cursor:"pointer",textAlign:"left",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</button>
              )}
            </div>
          </div>}

          {chat.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
            <div style={{maxWidth:"88%",padding:"12px 16px",borderRadius:16,background:m.role==="user"?"linear-gradient(135deg,#10b981,#059669)":"rgba(10,16,29,0.9)",color:m.role==="user"?"#000":"#e2e8f0",border:m.role==="user"?"none":"1px solid rgba(52,211,153,0.1)",fontSize:12,lineHeight:1.65,whiteSpace:"pre-wrap",boxShadow:m.role==="user"?"0 4px 15px rgba(16,185,129,0.2)":"0 2px 10px rgba(0,0,0,0.3)"}}>
              {m.content}
              {m.role==="assistant"&&sel&&<div style={{display:"flex",gap:4,marginTop:10,paddingTop:8,borderTop:"1px solid rgba(52,211,153,0.1)"}}>
                {ch==="email"&&sel.em&&<button onClick={()=>openMail(sel.em,"Partenariat CBD — L'Entrepôt du Chanvrier",m.content)} style={{...BO,fontSize:9,padding:"4px 8px"}}>📧 Envoyer</button>}
                {ch==="whatsapp"&&sel.wa&&<button onClick={()=>openWA(sel.wa,m.content)} style={{...BO,fontSize:9,padding:"4px 8px"}}>💬 WhatsApp</button>}
                {ch==="instagram"&&sel.ig&&<button onClick={()=>openIG(sel.ig)} style={{...BO,fontSize:9,padding:"4px 8px"}}>📸 DM</button>}
                <button onClick={()=>navigator.clipboard.writeText(m.content)} style={{...BO,fontSize:9,padding:"4px 8px"}}>📋</button>
              </div>}
            </div>
          </div>)}
          {loading&&<div style={{textAlign:"center",padding:16}}><span style={{color:"#34d399",fontSize:12,animation:"pulse 1.5s infinite",display:"inline-block"}}>🤖 L'agent réfléchit...</span></div>}
        </div>

        {/* Action bar */}
        {sel&&<div style={{padding:"6px 12px",borderTop:"1px solid rgba(52,211,153,0.06)",display:"flex",gap:4,flexWrap:"wrap"}}>
          <button onClick={()=>addFup(sel,3)} style={{...BO,fontSize:9,padding:"4px 8px"}}>🔔 3j</button>
          <button onClick={()=>addFup(sel,7)} style={{...BO,fontSize:9,padding:"4px 8px"}}>🔔 7j</button>
          <button onClick={()=>addFup(sel,14)} style={{...BO,fontSize:9,padding:"4px 8px"}}>🔔 14j</button>
          {rec?<button onClick={stopRec} style={{...BO,fontSize:9,padding:"4px 8px",color:"#f87171",background:"rgba(248,113,113,0.1)"}}>⏹ Stop</button>:<button onClick={startRec} style={{...BO,fontSize:9,padding:"4px 8px"}}>🎙️ Note</button>}
          <button onClick={()=>sendMsg(`Génère un pitch ${ch} complet pour ${sel.nm}`)} style={{...BO,fontSize:9,padding:"4px 8px",color:"#34d399"}}>⚡ Auto-pitch</button>
        </div>}

        {/* Input */}
        <div style={{padding:"10px 12px",borderTop:"1px solid rgba(52,211,153,0.08)",display:"flex",gap:8}}>
          <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(inp)} placeholder="Demandez à l'agent IA..." style={{...I,flex:1}}/>
          <button onClick={()=>sendMsg(inp)} disabled={loading} style={{...BG,padding:"10px 22px",fontSize:14}}>▶</button>
        </div>
      </div>}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* ═══ SECTION: CRM ═══ */}
      {/* ═════════════════════════════════════════════════════════ */}
      {section==="crm"&&!subPage&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <SecTitle c="#34d399" ic="📋" t="CRM Prospects"/>
        {/* Pipeline summary */}
        <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto"}}>{STATS.map(s=>{const c=db.filter(p=>p.st===s.v).length;return<button key={s.v} onClick={()=>setFTag(fTag===s.v?"":s.v)} style={{...BO,fontSize:9,whiteSpace:"nowrap",background:fTag===s.v?s.c+"18":"transparent",color:fTag===s.v?s.c:"#475569",borderColor:fTag===s.v?s.c+"30":"rgba(52,211,153,0.08)"}}>{s.l} ({c})</button>;})}<button onClick={()=>setFTag("")} style={{...BO,fontSize:9,color:!fTag?"#34d399":"#475569"}}>Tous</button></div>
        {/* Tags filter */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>{tags.map(t=>{const c=db.filter(p=>p.tg?.includes(t)).length;return c>0?<button key={t} onClick={()=>setFTag(fTag===t?"":t)} style={{...BO,fontSize:9,background:fTag===t?TC[tags.indexOf(t)%TC.length]+"18":"transparent",color:fTag===t?TC[tags.indexOf(t)%TC.length]:"#475569"}}>#{t} ({c})</button>:null;})}</div>
        {/* Add tag */}
        <div style={{display:"flex",gap:4,marginBottom:14}}><input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="Nouveau tag..." style={{...I,flex:1,fontSize:11,padding:"6px 10px"}}/><button onClick={()=>{if(newTag.trim()&&!tags.includes(newTag.trim().toLowerCase())){setTags(p=>[...p,newTag.trim().toLowerCase()]);setNewTag("");}}} style={{...BO,fontSize:10}}>+ Tag</button></div>

        {/* Prospect list */}
        {(fTag?db.filter(p=>p.st===fTag||p.tg?.includes(fTag)):db).sort((a,b)=>(b.sc||0)-(a.sc||0)).map(p=>
          <div key={p.id} style={{...GC,cursor:"pointer"}} onClick={()=>goAgent(p)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{FL[p.co]||"🌍"} {p.nm}</div>
                <div style={{fontSize:10,color:"#475569",marginTop:3}}>{p.em||"—"} {p.wa?`· ${p.wa}`:""}</div>
                <div style={{marginTop:5}}>{p.tg?.map(t=><span key={t} style={bdg(TC[tags.indexOf(t)%TC.length]||"#475569")}>#{t}</span>)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:800,color:"#34d399",lineHeight:1}}>{p.sc}</div>
                <div style={{fontSize:9,color:STATS.find(s=>s.v===p.st)?.c,marginTop:2}}>{STATS.find(s=>s.v===p.st)?.l}</div>
                {p.ca>0&&<div style={{fontSize:12,color:"#fbbf24",fontWeight:700,marginTop:2}}>{p.ca.toLocaleString()}€</div>}
              </div>
            </div>
            {p.nt&&<div style={{fontSize:10,color:"#64748b",marginTop:6,borderTop:"1px solid rgba(52,211,153,0.06)",paddingTop:6}}>{p.nt}</div>}
            <div style={{display:"flex",gap:4,marginTop:8}} onClick={e=>e.stopPropagation()}>
              <select value={p.st} onChange={e=>setDb(prev=>prev.map(x=>x.id===p.id?{...x,st:e.target.value}:x))} style={{...I,width:"auto",fontSize:9,padding:"3px 6px"}}>{STATS.map(s=><option key={s.v} value={s.v}>{s.l}</option>)}</select>
              <button onClick={()=>goAgent(p)} style={{...BO,fontSize:9,color:"#34d399"}}>🤖 Agent</button>
              <button onClick={()=>{if(window.confirm(`Supprimer ${p.nm} ?`))setDb(prev=>prev.filter(x=>x.id!==p.id));}} style={{...BO,fontSize:9,color:"#f87171"}}>✕</button>
            </div>
            {p.vn?.length>0&&<div style={{marginTop:6,borderTop:"1px solid rgba(52,211,153,0.06)",paddingTop:4}}><span style={{fontSize:9,color:"#475569"}}>🎙️ {p.vn.length} note(s)</span>{p.vn.map(v=><audio key={v.id} controls src={v.url} style={{display:"block",width:"100%",height:28,marginTop:3}}/>)}</div>}
          </div>
        )}
        <button onClick={()=>{const n=prompt("Nom du prospect ?");if(n)setDb(p=>[...p,{id:Date.now(),nm:n,co:"FR",em:"",wa:"",ig:"",st:"new",tg:[],sc:50,ca:0,nt:"",ints:[],vn:[]}]);}} style={{...BG,width:"100%",marginTop:8}}>+ Ajouter prospect</button>
      </div>}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* ═══ SECTION: TOOLS (sous-pages) ═══ */}
      {/* ═════════════════════════════════════════════════════════ */}
      {section==="tools"&&!subPage&&<div style={{padding:14}}>
        <SecTitle c="#a78bfa" ic="🧰" t="Outils"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {k:"history",ic:"📨",l:"Historique envois",c:"#60a5fa",n:hist.length},
            {k:"followups",ic:"🔔",l:"Relances",c:"#fbbf24",n:fups.filter(f=>!f.done).length},
            {k:"newsletter",ic:"📰",l:"Newsletter IA",c:"#a78bfa",n:null},
            {k:"templates",ic:"📝",l:"Templates",c:"#2dd4bf",n:tpls.length},
            {k:"products",ic:"🏷️",l:"Catalogue",c:"#fb923c",n:PRODS.length},
            {k:"pappers",ic:"🏢",l:"Pappers",c:"#818cf8",n:null},
            {k:"import",ic:"📥",l:"Import fichiers",c:"#f472b6",n:null},
            {k:"connect",ic:"🔌",l:"Connexions",c:"#60a5fa",n:null},
          ].map(t=>
            <div key={t.k} style={{...GC,textAlign:"center",padding:20,cursor:"pointer"}} onClick={()=>setSubPage(t.k)}>
              <div style={{fontSize:24,marginBottom:6}}>{t.ic}</div>
              <div style={{fontSize:12,fontWeight:700,color:t.c}}>{t.l}</div>
              {t.n!==null&&<div style={{fontSize:10,color:"#475569",marginTop:2}}>{t.n}</div>}
            </div>
          )}
        </div>
      </div>}

      {/* ─── TOOLS: Historique ─── */}
      {section==="tools"&&subPage==="history"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#60a5fa" ic="📨" t="Historique Envois"/>
        {hist.length===0?<div style={{...GC,textAlign:"center",padding:30,color:"#475569"}}><div style={{fontSize:32,marginBottom:6}}>📨</div><p>Aucun envoi pour le moment</p></div>:hist.map(h=><div key={h.id} style={GC}><div style={{display:"flex",justifyContent:"space-between"}}><div><strong>{h.pnm}</strong> <span style={bdg(h.ch==="email"?"#60a5fa":h.ch==="whatsapp"?"#4ade80":"#f472b6")}>{h.ch}</span></div><span style={{fontSize:9,color:"#475569"}}>{new Date(h.date).toLocaleString("fr")}</span></div><div style={{fontSize:10,color:"#94a3b8",marginTop:6,padding:"6px 8px",background:"rgba(15,23,42,0.6)",borderRadius:6}}>{h.msg}...</div></div>)}
      </div>}

      {/* ─── TOOLS: Relances ─── */}
      {section==="tools"&&subPage==="followups"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#fbbf24" ic="🔔" t="Relances & Rappels"/>
        <div style={{...GC,borderLeft:"3px solid #fbbf24"}}><div style={{fontSize:11,fontWeight:600,color:"#fbbf24",marginBottom:8}}>Programmer une relance</div><select id="fu-sel" style={{...I,marginBottom:6,fontSize:11}}><option value="">Choisir prospect...</option>{db.map(p=><option key={p.id} value={p.id}>{FL[p.co]} {p.nm}</option>)}</select><div style={{display:"flex",gap:4}}>{[1,3,7,14,30].map(d=><button key={d} onClick={()=>{const pr=db.find(p=>p.id===Number(document.getElementById("fu-sel")?.value));if(pr)addFup(pr,d);}} style={{...BO,flex:1,fontSize:10}}>{d}j</button>)}</div></div>
        {fups.sort((a,b)=>new Date(a.date)-new Date(b.date)).map(f=>{const past=new Date(f.date)<new Date();return<div key={f.id} style={{...GC,borderLeft:`3px solid ${f.done?"#22c55e":past?"#f87171":"#fbbf24"}`,opacity:f.done?0.5:1}}><div style={{display:"flex",justifyContent:"space-between"}}><div><strong>{f.pnm}</strong>{past&&!f.done&&<span style={bdg("#f87171")}>EN RETARD</span>}{f.done&&<span style={bdg("#22c55e")}>FAIT</span>}</div><span style={{fontSize:10,color:"#475569"}}>{new Date(f.date).toLocaleDateString("fr")}</span></div><div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>{f.note}</div><div style={{display:"flex",gap:4,marginTop:6}}>{!f.done&&<><button onClick={()=>goAgent(db.find(p=>p.id===f.pid))} style={{...BO,fontSize:9}}>🤖 Agent</button><button onClick={()=>setFups(p=>p.map(x=>x.id===f.id?{...x,done:true}:x))} style={{...BO,fontSize:9,color:"#22c55e"}}>✓ Fait</button></>}<button onClick={()=>setFups(p=>p.filter(x=>x.id!==f.id))} style={{...BO,fontSize:9,color:"#f87171"}}>✕</button></div></div>;})}
      </div>}

      {/* ─── TOOLS: Newsletter ─── */}
      {section==="tools"&&subPage==="newsletter"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#a78bfa" ic="📰" t="Newsletter IA"/>
        <div style={GC}><div style={{fontSize:12,fontWeight:600,color:"#a78bfa",marginBottom:8}}>1. Produits à mettre en avant</div><div style={{maxHeight:180,overflowY:"auto"}}>{PRODS.map(p=><label key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",cursor:"pointer",fontSize:11}}><input type="checkbox" checked={nlProds.includes(p.id)} onChange={()=>setNlProds(prev=>prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev,p.id])} style={{accentColor:"#a78bfa"}}/>{p.ic} {p.nm} <span style={{color:"#475569"}}>{p.pr}{p.u}</span></label>)}</div></div>
        <div style={GC}><div style={{fontSize:12,fontWeight:600,color:"#a78bfa",marginBottom:8}}>2. Cibler par tags</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{tags.map(t=><button key={t} onClick={()=>setNlTags(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t])} style={{...BO,fontSize:9,background:nlTags.includes(t)?"rgba(167,139,250,0.1)":"transparent",color:nlTags.includes(t)?"#a78bfa":"#475569"}}>#{t}</button>)}</div></div>
        <div style={GC}><div style={{fontSize:12,fontWeight:600,color:"#a78bfa",marginBottom:6}}>3. Sujet</div><input value={nlSubj} onChange={e=>setNlSubj(e.target.value)} style={I}/></div>
        <button onClick={genNL} disabled={loading||!nlProds.length} style={{...BG,width:"100%",background:"linear-gradient(135deg,#8b5cf6,#6d28d9)",marginBottom:12}}>{loading?"🤖 Génération...":"🤖 Générer newsletter ("+nlProds.length+" produits)"}</button>
        {nlGen&&<div style={{...GC,borderLeft:"3px solid #a78bfa"}}><pre style={{fontSize:11,color:"#e2e8f0",whiteSpace:"pre-wrap",lineHeight:1.6}}>{nlGen}</pre><div style={{display:"flex",gap:4,marginTop:8}}><button onClick={()=>navigator.clipboard.writeText(nlGen)} style={BO}>📋 Copier</button><button onClick={()=>{const t=nlTags.length>0?db.filter(p=>nlTags.some(tg=>p.tg?.includes(tg))&&p.em):db.filter(p=>p.em);t.forEach(p=>logSend(p,"email","Newsletter: "+nlSubj));addN(`📰 Newsletter → ${t.length} prospects`);}} style={{...BG,fontSize:10,background:"linear-gradient(135deg,#8b5cf6,#6d28d9)"}}>📨 Envoyer ({(nlTags.length>0?db.filter(p=>nlTags.some(tg=>p.tg?.includes(tg))&&p.em):db.filter(p=>p.em)).length})</button></div></div>}
      </div>}

      {/* ─── TOOLS: Templates ─── */}
      {section==="tools"&&subPage==="templates"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#2dd4bf" ic="📝" t="Templates Messages"/>
        <p style={{fontSize:10,color:"#475569",marginBottom:12}}>Variables : {"{nom}"} {"{agent}"} {"{products}"}</p>
        {tpls.map(t=><div key={t.id} style={GC}><div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}><strong style={{fontSize:12}}>{t.nm}</strong><span style={bdg(t.ch==="email"?"#60a5fa":t.ch==="whatsapp"?"#4ade80":"#f472b6")}>{t.ch}</span><span style={bdg("#818cf8")}>{t.lang}</span></div>{editTpl===t.id?<div style={{marginTop:8}}><textarea value={t.body} onChange={e=>setTpls(p=>p.map(x=>x.id===t.id?{...x,body:e.target.value}:x))} style={{...I,height:160,resize:"vertical"}}/><button onClick={()=>setEditTpl(null)} style={{...BG,marginTop:6,fontSize:10}}>✓ Sauver</button></div>:<><pre style={{fontSize:10,color:"#94a3b8",marginTop:8,whiteSpace:"pre-wrap",maxHeight:80,overflow:"hidden",lineHeight:1.5}}>{t.body}</pre><div style={{display:"flex",gap:4,marginTop:8}}><button onClick={()=>setEditTpl(t.id)} style={BO}>✏️</button><button onClick={()=>navigator.clipboard.writeText(t.body.replace("{nom}",sel?.nm||"[nom]").replace("{agent}",me?.nm||"Agent"))} style={BO}>📋</button><button onClick={()=>{if(sel){const m=t.body.replace("{nom}",sel.nm).replace("{agent}",me?.nm||"Agent");if(t.ch==="email"&&sel.em)openMail(sel.em,"CBD — Geosiste",m);else if(t.ch==="whatsapp")openWA(sel.wa,m);else openIG(sel.ig);}}} style={{...BO,color:"#34d399"}}>📨{sel?` → ${sel.nm}`:""}</button></div></>}</div>)}
        <button onClick={()=>{const n=prompt("Nom du template ?");if(n)setTpls(p=>[...p,{id:"c"+Date.now(),nm:n,ch:"email",lang:"fr",body:"Bonjour {nom},\n\n\n\nCordialement,\n{agent}"}]);}} style={{...BG,width:"100%",marginTop:8,background:"linear-gradient(135deg,#2dd4bf,#14b8a6)"}}>+ Nouveau template</button>
      </div>}

      {/* ─── TOOLS: Produits ─── */}
      {section==="tools"&&subPage==="products"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#fb923c" ic="🏷️" t="Catalogue Produits"/>
        {[...new Set(PRODS.map(p=>p.cat))].map(cat=><div key={cat} style={{marginBottom:16}}><h3 style={{fontSize:14,fontWeight:700,color:"#fb923c",marginBottom:8}}>{cat}</h3>{PRODS.filter(p=>p.cat===cat).map(p=><div key={p.id} style={GC}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>{p.ic}</span><span style={{fontWeight:700,fontSize:13}}>{p.nm}</span></div><span style={{fontWeight:800,color:"#34d399",fontSize:14}}>{p.pr}{p.u}</span></div><div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>{p.desc}</div><div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap"}}>{p.cbd&&<span style={bdg("#34d399")}>CBD {p.cbd}</span>}{p.thc&&<span style={bdg("#475569")}>THC {p.thc}</span>}{p.mol&&<span style={bdg("#fbbf24")}>{p.mol}</span>}</div><div style={{display:"flex",gap:4,marginTop:8}}><button onClick={()=>genPDF(p)} style={BO}>📄 Fiche</button><button onClick={()=>navigator.clipboard.writeText(`${p.nm} — ${p.desc} — ${p.pr}${p.u}`)} style={BO}>📋</button><button onClick={()=>{setSection("agent");sendMsg(`Fais un pitch commercial détaillé pour notre produit ${p.nm} (${p.cat}) à ${p.pr}${p.u}`);}} style={{...BO,color:"#34d399"}}>🤖 Pitch IA</button></div></div>)}</div>)}
      </div>}

      {/* ─── TOOLS: Pappers ─── */}
      {section==="tools"&&subPage==="pappers"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#818cf8" ic="🏢" t="Pappers — Recherche Libre"/>
        <div style={GC}>
          <input value={papQ} onChange={e=>setPapQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchPap()} placeholder="Tapez librement : nom, activité, ville, SIREN, mot-clé..." style={{...I,marginBottom:10,fontSize:14}}/>
          <details style={{marginBottom:10}}><summary style={{cursor:"pointer",fontSize:11,color:"#818cf8",fontWeight:600}}>＋ Filtres optionnels (tous libres)</summary><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>{[{k:"naf",p:"Code NAF"},{k:"dept",p:"Département"},{k:"ville",p:"Ville"},{k:"forme_juridique",p:"Forme juridique"},{k:"ca_min",p:"CA min (€)"},{k:"ca_max",p:"CA max (€)"},{k:"effectif_min",p:"Effectif min"},{k:"effectif_max",p:"Effectif max"},{k:"date_creation_min",p:"Créée après"},{k:"date_creation_max",p:"Créée avant"}].map(f=><input key={f.k} value={papF[f.k]} onChange={e=>setPapF(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={{...I,fontSize:10,padding:"7px 10px"}}/>)}</div></details>
          <button onClick={()=>searchPap(1)} disabled={papLoad||!conn.pappers.key} style={{...BG,width:"100%",background:"linear-gradient(135deg,#818cf8,#6366f1)"}}>{papLoad?"🔍 Recherche...":"🔍 Rechercher"}</button>
          {!conn.pappers.key&&<p style={{fontSize:10,color:"#f87171",marginTop:6,textAlign:"center"}}>⚠️ Configurez votre clé dans Outils → Connexions</p>}
        </div>
        {papRes.map((r,i)=><div key={i} style={GC}><div style={{fontWeight:700,fontSize:13}}>🏢 {r.nom_entreprise||r.denomination}</div><div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>SIREN: {r.siren||"—"} · NAF: {r.code_naf||"—"} {r.libelle_code_naf?`(${r.libelle_code_naf})`:""}</div><div style={{fontSize:10,color:"#475569",marginTop:2}}>📍 {r.siege?.adresse||"—"}, {r.siege?.code_postal||""} {r.siege?.ville||""}</div>{r.siege?.telephone&&<div style={{fontSize:10,color:"#60a5fa"}}>📞 {r.siege.telephone}</div>}{r.siege?.email&&<div style={{fontSize:10,color:"#60a5fa"}}>📧 {r.siege.email}</div>}{r.chiffre_affaires&&<div style={{fontSize:10,color:"#fbbf24"}}>💰 {Number(r.chiffre_affaires).toLocaleString()}€</div>}{r.effectifs&&<div style={{fontSize:10,color:"#475569"}}>👥 {r.effectifs}</div>}{r.dirigeants?.[0]&&<div style={{fontSize:10,color:"#94a3b8"}}>👤 {r.dirigeants[0].prenom} {r.dirigeants[0].nom} — {r.dirigeants[0].qualite}</div>}<button onClick={()=>importPap(r)} style={{...BG,marginTop:8,fontSize:10,width:"100%"}}>📥 Importer dans le CRM</button></div>)}
        {papRes.length>0&&papRes.length%20===0&&<button onClick={()=>searchPap(papPg+1)} style={{...BO,width:"100%",marginTop:6}}>Charger plus...</button>}
      </div>}

      {/* ─── TOOLS: Import ─── */}
      {section==="tools"&&subPage==="import"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#f472b6" ic="📥" t="Import Fichiers"/>
        <div style={{...GC,textAlign:"center",padding:28,borderStyle:"dashed",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}><input ref={fileRef} type="file" accept=".csv,.tsv,.json,.xlsx,.xls,.pdf,.txt" onChange={handleFile} style={{display:"none"}}/><div style={{fontSize:40,marginBottom:8}}>📂</div><div style={{fontSize:14,fontWeight:700,color:"#f472b6",marginBottom:4}}>Cliquez pour choisir un fichier</div><div style={{fontSize:11,color:"#475569"}}>CSV · XLS · XLSX · JSON · PDF · TXT</div>{impFile&&<div style={{fontSize:11,color:"#34d399",marginTop:10}}>📎 {impFile.name}</div>}</div>
        {impSt&&<div style={{...GC,fontSize:11,color:impSt.startsWith("❌")?"#f87171":"#34d399"}}>{impSt}</div>}
        {impPrev.length>0&&<><div style={GC}><div style={{fontSize:12,fontWeight:600,color:"#f472b6",marginBottom:8}}>Aperçu — {impPrev.length} prospects</div><div style={{maxHeight:280,overflowY:"auto"}}>{impPrev.slice(0,20).map((p,i)=><div key={i} style={{padding:"6px 0",borderBottom:"1px solid rgba(52,211,153,0.06)",fontSize:10}}><div style={{fontWeight:600}}>{FL[p.co]||"🌍"} {p.nm}</div><div style={{color:"#475569"}}>{p.em||"—"} · {p.wa||"—"}</div></div>)}{impPrev.length>20&&<div style={{fontSize:10,color:"#475569",padding:6}}>+{impPrev.length-20} de plus</div>}</div></div><div style={{display:"flex",gap:6}}><button onClick={()=>{setImpPrev([]);setImpFile(null);setImpSt("");}} style={{...BO,flex:1}}>Annuler</button><button onClick={confirmImport} style={{...BG,flex:2,background:"linear-gradient(135deg,#f472b6,#ec4899)"}}>✅ Importer {impPrev.length} prospects</button></div></>}
        <div style={{...GC,marginTop:14}}><div style={{fontSize:11,fontWeight:600,color:"#f472b6",marginBottom:6}}>ℹ️ Nettoyage automatique</div><div style={{fontSize:10,color:"#94a3b8",lineHeight:1.7}}>Détection auto des colonnes (nom, email, téléphone, pays...) · Suppression des doublons · Normalisation téléphones (+33) · Détection pays par indicatif · Extraction des tags</div></div>
      </div>}

      {/* ─── TOOLS: Connexions ─── */}
      {section==="tools"&&subPage==="connect"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <button onClick={()=>setSubPage("")} style={{...BO,marginBottom:12,fontSize:10}}>← Outils</button>
        <SecTitle c="#60a5fa" ic="🔌" t="Connexions"/>

        <div style={GC}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>🤖</span><strong style={{fontSize:14}}>Claude API</strong></div><div style={{display:"flex",alignItems:"center",gap:6}}><div style={dot(conn.claude.status)}/><span style={{fontSize:10}}>{conn.claude.status==="connected"?"OK":conn.claude.status==="error"?"Erreur":"—"}</span></div></div><p style={{fontSize:10,color:"#475569",marginBottom:8}}>Clé dans Vercel → Settings → <code style={{color:"#60a5fa"}}>ANTHROPIC_API_KEY</code></p><button onClick={testClaude} disabled={conn.claude.status==="testing"} style={{...BG,width:"100%"}}>🧪 Tester</button></div>

        <div style={GC}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>🏢</span><strong style={{fontSize:14}}>Pappers</strong></div><div style={dot(conn.pappers.status)}/></div><input value={conn.pappers.key} onChange={e=>setConn(p=>({...p,pappers:{...p.pappers,key:e.target.value}}))} placeholder="Clé API Pappers" type="password" style={{...I,marginBottom:8}}/><button onClick={testPappers} style={{...BG,width:"100%",background:"linear-gradient(135deg,#818cf8,#6366f1)"}}>🧪 Tester</button></div>

        <div style={GC}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>📧</span><strong style={{fontSize:14}}>Email</strong></div><div style={dot(conn.email.status)}/></div>{conn.email.accounts.map((a,i)=><div key={a.id} style={{display:"flex",gap:4,marginBottom:6}}><input value={a.em} onChange={e=>setConn(p=>({...p,email:{...p.email,accounts:p.email.accounts.map(x=>x.id===a.id?{...x,em:e.target.value}:x)}}))} placeholder="email@..." style={{...I,flex:1,fontSize:11}}/><input value={a.label} onChange={e=>setConn(p=>({...p,email:{...p.email,accounts:p.email.accounts.map(x=>x.id===a.id?{...x,label:e.target.value}:x)}}))} placeholder="Label" style={{...I,width:70,fontSize:11}}/><button onClick={()=>setConn(p=>({...p,email:{...p.email,accounts:p.email.accounts.map(x=>({...x,active:x.id===a.id}))}}))} style={{...BO,fontSize:9,color:a.active?"#22c55e":"#475569"}}>{a.active?"✓":"○"}</button>{i>0&&<button onClick={()=>setConn(p=>({...p,email:{...p.email,accounts:p.email.accounts.filter(x=>x.id!==a.id)}}))} style={{...BO,fontSize:9,color:"#f87171"}}>✕</button>}</div>)}<div style={{display:"flex",gap:4}}><button onClick={()=>setConn(p=>({...p,email:{...p.email,accounts:[...p.email.accounts,{id:Date.now(),em:"",label:"",active:false}]}}))} style={{...BO,flex:1,fontSize:10}}>+ Compte</button><button onClick={testEmail} style={{...BG,flex:1,fontSize:10}}>🧪 Tester</button></div></div>

        <div style={GC}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>💬</span><strong style={{fontSize:14}}>WhatsApp</strong></div><div style={dot(conn.whatsapp.status)}/></div><input value={conn.whatsapp.num} onChange={e=>setConn(p=>({...p,whatsapp:{...p.whatsapp,num:e.target.value}}))} placeholder="+33 6 XX XX XX XX" style={{...I,marginBottom:8}}/><button onClick={testWA} style={{...BG,width:"100%",background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>🧪 Tester</button></div>

        <div style={GC}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22}}>📸</span><strong style={{fontSize:14}}>Instagram</strong></div><div style={dot(conn.instagram.status)}/></div>{conn.instagram.accounts.map((a,i)=><div key={a.id} style={{display:"flex",gap:4,marginBottom:6}}><input value={a.handle} onChange={e=>setConn(p=>({...p,instagram:{...p.instagram,accounts:p.instagram.accounts.map(x=>x.id===a.id?{...x,handle:e.target.value}:x)}}))} placeholder="@handle" style={{...I,flex:1,fontSize:11}}/><input value={a.label} onChange={e=>setConn(p=>({...p,instagram:{...p.instagram,accounts:p.instagram.accounts.map(x=>x.id===a.id?{...x,label:e.target.value}:x)}}))} placeholder="Label" style={{...I,width:70,fontSize:11}}/><button onClick={()=>setConn(p=>({...p,instagram:{...p.instagram,accounts:p.instagram.accounts.map(x=>({...x,active:x.id===a.id}))}}))} style={{...BO,fontSize:9,color:a.active?"#22c55e":"#475569"}}>{a.active?"✓":"○"}</button>{i>0&&<button onClick={()=>setConn(p=>({...p,instagram:{...p.instagram,accounts:p.instagram.accounts.filter(x=>x.id!==a.id)}}))} style={{...BO,fontSize:9,color:"#f87171"}}>✕</button>}</div>)}<div style={{display:"flex",gap:4}}><button onClick={()=>setConn(p=>({...p,instagram:{...p.instagram,accounts:[...p.instagram.accounts,{id:Date.now(),handle:"",label:"",active:false}]}}))} style={{...BO,flex:1,fontSize:10}}>+ Compte</button><button onClick={testIG} style={{...BG,flex:1,fontSize:10,background:"linear-gradient(135deg,#f472b6,#ec4899)"}}>🧪 Tester</button></div></div>

        <div style={GC}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:22}}>🔔</span><strong style={{fontSize:14}}>Push</strong></div><button onClick={()=>{"Notification"in window&&Notification.requestPermission().then(p=>{if(p==="granted")addN("✅ Push activées");});}} style={{...BG,width:"100%",background:"linear-gradient(135deg,#fbbf24,#f59e0b)",color:"#000"}}>{"Notification"in window&&Notification.permission==="granted"?"✅ Activées":"Activer les notifications"}</button></div>
      </div>}

      {/* ═════════════════════════════════════════════════════════ */}
      {/* ═══ SECTION: CONFIG ═══ */}
      {/* ═════════════════════════════════════════════════════════ */}
      {section==="config"&&<div style={{padding:14,height:"calc(100vh - 126px)",overflowY:"auto"}}>
        <SecTitle c="#94a3b8" ic="⚙️" t="Configuration"/>
        <div style={GC}><div style={{fontSize:13,fontWeight:700,color:"#34d399",marginBottom:10}}>👥 Utilisateurs ({users.length})</div>{users.map(u=><div key={u.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(52,211,153,0.06)",fontSize:11}}><span>{u.nm} — {u.em} <span style={bdg(u.role==="admin"?"#f87171":"#60a5fa")}>{u.role}</span></span>{u.id!==1&&<button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{...BO,fontSize:9,color:"#f87171"}}>✕</button>}</div>)}<button onClick={()=>{const n=prompt("Nom ?"),e=prompt("Email ?"),p=prompt("Mot de passe ?");if(n&&e&&p)setUsers(prev=>[...prev,{id:Date.now(),nm:n,em:e,pw:p,role:"user"}]);}} style={{...BO,marginTop:8,width:"100%"}}>+ Utilisateur</button></div>
        <div style={GC}><div style={{fontSize:13,fontWeight:700,color:"#94a3b8",marginBottom:10}}>📤 Export / Backup</div><div style={{display:"flex",gap:6}}><button onClick={()=>{const c="Nom;Pays;Email;Tel;Instagram;Statut;Score;CA;Tags;Notes\n"+db.map(p=>`"${p.nm}";"${p.co}";"${p.em}";"${p.wa}";"${p.ig}";"${p.st}";${p.sc};${p.ca};"${(p.tg||[]).join(",")}";"${p.nt}"`).join("\n");const b=new Blob([c],{type:"text/csv"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="geosiste-export.csv";a.click();}} style={{...BO,flex:1}}>📥 Export CSV</button><button onClick={()=>{const d=JSON.stringify({db,hist,fups,tpls},null,2);const b=new Blob([d],{type:"application/json"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="geosiste-backup.json";a.click();}} style={{...BO,flex:1}}>💾 Backup JSON</button></div></div>
        <div style={{textAlign:"center",marginTop:24,color:"#1e293b",fontSize:9,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>GEOSISTE v10 · L'Entrepôt du Chanvrier<br/>Agent Commercial IA · CRM CBD Europe</div>
      </div>}

      {/* ═══ BOTTOM NAV ═══ */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,display:"flex",justifyContent:"space-around",padding:"8px 0 12px",background:"rgba(2,4,9,0.92)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(52,211,153,0.08)",zIndex:100}}>
        {[
          {k:"dash",ic:"📊",l:"Accueil"},
          {k:"agent",ic:"🤖",l:"Agent IA"},
          {k:"crm",ic:"📋",l:"CRM"},
          {k:"tools",ic:"🧰",l:"Outils"},
          {k:"config",ic:"⚙️",l:"Config"},
        ].map(t=>
          <button key={t.k} onClick={()=>{setSection(t.k);setSubPage("");}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"4px 8px",color:section===t.k?"#34d399":"#475569",fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{fontSize:20,filter:section===t.k?"drop-shadow(0 0 6px rgba(52,211,153,0.4))":"none"}}>{t.ic}</span>
            <span style={{fontSize:9,fontWeight:section===t.k?700:400}}>{t.l}</span>
          </button>
        )}
      </div>

      </div>{/* zIndex wrapper */}
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{margin:0;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:rgba(52,211,153,0.15);border-radius:3px;}select:focus,input:focus,textarea:focus{outline:none;border-color:rgba(52,211,153,0.3)!important;box-shadow:0 0 0 3px rgba(52,211,153,0.06)!important;}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}button{transition:all 0.12s;}button:hover{filter:brightness(1.1);}button:active{transform:scale(0.97);}details>summary{list-style:none;}details>summary::-webkit-details-marker{display:none;}input::placeholder,textarea::placeholder{color:#334155;}`}</style>
    </div>
  );
}
