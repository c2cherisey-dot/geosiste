import { useState, useRef, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════════
// GEOSISTE v8 — PRODUCTION READY + SUPABASE
// L'Entrepôt du Chanvrier • Geosiste • lentrepotduchanvrier.com
// ══════════════════════════════════════════════════════════════════════

// ── SUPABASE CONFIG ─────────────────────────────────────────────────
// 🔧 REMPLACE CES 2 VALEURS par celles de ton projet Supabase :
const SUPABASE_URL = "https://doompuvsmjmfqnbwclwf.supabase.co";
const SUPABASE_KEY = "sb_publishable_Uvb_TCy3yXv8BaHCitZNjA_k3A4KXDs";

// Mini client Supabase (pas besoin d'installer @supabase/supabase-js)
const supa = {
  headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
  async load(table) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=id.asc`, { headers: this.headers });
      if (!r.ok) return null;
      return await r.json();
    } catch { return null; }
  },
  async upsert(table, rows) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST", headers: { ...this.headers, "Prefer": "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(Array.isArray(rows) ? rows : [rows])
      });
    } catch (e) { console.error("Supabase upsert:", e); }
  },
  async del(table, id) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "DELETE", headers: this.headers });
    } catch (e) { console.error("Supabase delete:", e); }
  },
  async saveConfig(key, value) {
    await this.upsert("config", { key, value: JSON.stringify(value) });
  },
  async loadConfig(key) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/config?key=eq.${key}&select=value`, { headers: this.headers });
      if (!r.ok) return null;
      const d = await r.json();
      return d[0] ? JSON.parse(d[0].value) : null;
    } catch { return null; }
  }
};
const SUPA_READY = !SUPABASE_URL.includes("XXXXXXX");

// ── CATALOGUE ────────────────────────────────────────────────────────
const CAT=[
  {r:"H001",n:"3X Filtré Hash",c:"Hash",m:"CBG",d:"40% CBG+9% CBD",p:.95,v:["CBD","MCP-N"]},
  {r:"H002",n:"Beldia Hash CSA",c:"Hash",m:"CSA",d:"10% CSA",p:1.25,v:["CSA"]},
  {r:"H003",n:"Black Panther",c:"Hash",m:"CBN",d:"35% CBD+20% CBN",p:.95,v:["CBD+CBN"]},
  {r:"H004",n:"Bubble Hash 10-OH",c:"Hash",m:"10-OH",d:"15% 10-OH-HHC+10% CBN",p:2,v:["10-OH"]},
  {r:"H005",n:"Charas CBD",c:"Hash",m:"CBD",d:"30% CBD",p:.55,v:["CBD"]},
  {r:"H006",n:"Double Zero",c:"Hash",m:"CBD",d:"50% CBD",p:.85,v:["CBD"]},
  {r:"H007",n:"Drive 0%THC",c:"Hash",m:"CBD",d:"65% CBD, 0% THC",p:.85,v:["0%THC"]},
  {r:"H008",n:"Dry Ice",c:"Hash",m:"CBD",d:"42% CBD",p:.85,v:["CBD"]},
  {r:"H009",n:"Ice O Lator CSA",c:"Hash",m:"CSA",d:"20% CSA Premium",p:2,v:["CSA"]},
  {r:"H010",n:"Ketama Gold",c:"Hash",m:"CBD",d:"40% CBD",p:.55,v:["CBD"]},
  {r:"H011",n:"La Mousse CSA",c:"Hash",m:"CSA",d:"10% CSA",p:1.5,v:["CSA"]},
  {r:"H012",n:"Nepal MCP-N",c:"Hash",m:"MCP-N",d:"MCP-N relaxation",p:1.5,v:["MCP-N"]},
  {r:"H013",n:"Pollen CBD",c:"Hash",m:"CBD",d:"CBD classique",p:.55,v:["CBD"]},
  {r:"F001",n:"Amnésia Haze",c:"Fleurs",m:"Multi",d:"Hydro",p:1.6,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F002",n:"Blueberry",c:"Fleurs",m:"Multi",d:"Hydro",p:1.6,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F003",n:"Gorilla Glue",c:"Fleurs",m:"Multi",d:"Hydro",p:1.6,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F004",n:"Green Gelato",c:"Fleurs",m:"Multi",d:"Indoor",p:.85,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F005",n:"Lemon Diesel",c:"Fleurs",m:"Multi",d:"Indoor",p:.85,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F006",n:"OG Kush",c:"Fleurs",m:"Multi",d:"Hydro",p:1.6,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F007",n:"Papaya",c:"Fleurs",m:"Multi",d:"Indoor",p:.85,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F008",n:"Plutonium OG",c:"Fleurs",m:"Multi",d:"Hydro",p:1.6,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F009",n:"Purple Haze",c:"Fleurs",m:"Multi",d:"Indoor",p:1.4,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F010",n:"Strawberry",c:"Fleurs",m:"Multi",d:"Greenhouse",p:.6,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F011",n:"Tropical Kush",c:"Fleurs",m:"Multi",d:"Indoor",p:.85,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"F012",n:"White Widow",c:"Fleurs",m:"Multi",d:"Hydro",p:1.7,v:["CBD","MCP-N","10-OH","CSA"]},
  {r:"T001",n:"Mini Buds",c:"Trim",m:"CBD",d:"Petites fleurs",p:.4,v:["CBD"]},
  {r:"T002",n:"Trim",c:"Trim",m:"CBD",d:"Pour transformation",p:.1,v:["CBD"]},
  {r:"V001",n:"Grenade Vape 10-OH",c:"Vape",m:"10-OH",d:"80% 10-OH Puff 0.5ml",p:3.9,v:["Atomic Kush","Atomic Lemon","Atomic Mango"]},
  {r:"V002",n:"Skull Vape CSA",c:"Vape",m:"CSA",d:"CSA Pod 1ml",p:4.5,v:["Demon Candy","Demon Kush","Demon Menthol"]},
  {r:"V003",n:"Pods 1ml",c:"Vape",m:"Multi",d:"3 options rechargeables",p:3,v:["CBD","MCP-N","10-OH"]},
  {r:"V004",n:"Batterie Pods",c:"Vape",m:"—",d:"USB-C rechargeable",p:4,v:[]},
  {r:"M001",n:"Moonrock CBD",c:"Moonrock",m:"CBD",d:"Fleur+distillat+pollen",p:2.5,v:["CBD","MCP-N"]},
  {r:"M002",n:"Icerock",c:"Moonrock",m:"CBD",d:"Wax+cristaux",p:3.5,v:["CBD","10-OH"]},
  {r:"M003",n:"Moonrock CSA",c:"Moonrock",m:"CSA",d:"CSA enrichi",p:5,v:["CSA"]},
  {r:"O001",n:"Huile Velaria™ CBD",c:"Huiles",m:"CBD",d:"Full Spectrum",p:3,v:["5%","10%","15%","20%","30%","40%"]},
  {r:"O002",n:"Huile Velaria™ CBG",c:"Huiles",m:"CBG",d:"CBG",p:5,v:["10%","20%"]},
  {r:"O003",n:"Huile Velaria™ CBN",c:"Huiles",m:"CBN",d:"Sommeil",p:5,v:["10%","20%"]},
  {r:"E001",n:"Crude CBD",c:"Extraction",m:"CBD",d:"52% Full Spectrum",p:.45,v:[]},
  {r:"E002",n:"Distillat CBD 85%",c:"Extraction",m:"CBD",d:"Full Spectrum",p:660,v:[]},
  {r:"E003",n:"Distillat CBG 85%",c:"Extraction",m:"CBG",d:"Full Spectrum",p:1.1,v:[]},
  {r:"E004",n:"Distillat CBN 60%",c:"Extraction",m:"CBN",d:"Full Spectrum",p:1.2,v:[]},
  {r:"E005",n:"Distillat CBC 85%",c:"Extraction",m:"CBC",d:"Full Spectrum",p:3.5,v:[]},
  {r:"E006",n:"Distillat MCP-N",c:"Extraction",m:"MCP-N",d:"Exclusif",p:1500,v:[]},
  {r:"E007",n:"Distillat 10-OH 97%",c:"Extraction",m:"10-OH",d:"97% pureté",p:6.7,v:[]},
  {r:"E008",n:"Distillat CSA",c:"Extraction",m:"CSA",d:"Exclusif",p:7.5,v:[]},
  {r:"E009",n:"Isolat CBD 99.9%",c:"Extraction",m:"CBD",d:"Poudre >99.9%",p:.35,v:[]},
  {r:"E010",n:"Isolat CBG 99.4%",c:"Extraction",m:"CBG",d:">99.4%",p:.96,v:[]},
  {r:"E011",n:"Isolat CBN 99%+",c:"Extraction",m:"CBN",d:">99%",p:1.55,v:[]},
  {r:"P001",n:"Pre Roll Jok'Air™ CBD",c:"Pre Rolls",m:"CBD",d:"Sans tabac",p:1.5,v:["CBD","MCP-N"]},
  {r:"P002",n:"Pre Roll Jok'Air™ MCP-N",c:"Pre Rolls",m:"MCP-N",d:"MCP-N",p:2.5,v:["MCP-N"]},
];

// ── SÉQUENCES DE RELANCE ─────────────────────────────────────────────
const SEQUENCES=[
  {id:1,name:"Standard",steps:[
    {day:0,type:"intro",label:"Premier contact"},
    {day:3,type:"followup1",label:"Relance 1 — catalogue"},
    {day:7,type:"followup2",label:"Relance 2 — offre -10%"},
    {day:14,type:"special",label:"Offre spéciale volume"},
    {day:30,type:"last",label:"Dernière chance"},
  ]},
  {id:2,name:"Molécules",steps:[
    {day:0,type:"intro_mol",label:"Pitch CSA/MCP-N"},
    {day:2,type:"sample",label:"Proposition échantillon"},
    {day:5,type:"followup_mol",label:"Relance + prix volume"},
    {day:10,type:"exclusive",label:"Offre exclu molécules"},
    {day:21,type:"last",label:"Dernière relance"},
  ]},
  {id:3,name:"Agressive",steps:[
    {day:0,type:"intro",label:"Contact direct"},
    {day:1,type:"followup1",label:"Relance rapide"},
    {day:3,type:"followup2",label:"Offre flash 48h"},
    {day:7,type:"special",label:"Remise exceptionnelle"},
  ]},
];

// ── LANGUES PAR PAYS ─────────────────────────────────────────────────
const LANG_MAP={"France":"fr","Belgique":"fr","Luxembourg":"fr","Suisse":"fr","Allemagne":"de","Autriche":"de","Pays-Bas":"nl","Espagne":"es","Italie":"it","Portugal":"pt","Pologne":"pl","Royaume-Uni":"en","Irlande":"en","Slovénie":"en","Lituanie":"en","Danemark":"en","Suède":"en","Finlande":"en","Grèce":"en","Rép. Tchèque":"en","Croatie":"en","Bulgarie":"en","Hongrie":"en","Roumanie":"en"};
const LANG_NAMES={fr:"Français",en:"English",de:"Deutsch",es:"Español",it:"Italiano",pt:"Português",nl:"Nederlands",pl:"Polski"};

// ── SEGMENTATION INTELLIGENTE ────────────────────────────────────────
const SEGMENTS={
  buraliste:{label:"Buraliste",products:["V001","V002","V003","V004","P001","P002"],pitch:"Vapes Formule Explosive™ et Pre Rolls Jok'Air™ — packaging prêt-à-vendre, forte rotation"},
  grossiste_mol:{label:"Grossiste Molécules",products:["E006","E007","E008","H002","H004","H009","H011","F001"],pitch:"CSA-14, MCP-N, 10-OH-HHC — distillats et hash enrichis, exclusifs"},
  grossiste_cbd:{label:"Grossiste CBD classique",products:["H005","H006","H010","H013","F010","F004","E009","O001"],pitch:"Gamme CBD complète à prix imbattable — fleurs, hash, isolats, huiles Velaria™"},
  ecommerce:{label:"E-commerce",products:["O001","O002","O003","V001","V002"],pitch:"Marque blanche + Formule Explosive™ — packaging premium, prêt pour la vente en ligne"},
  franchise:{label:"Franchise / Chaîne",products:["V001","V002","P001","O001","H005","F004"],pitch:"Gamme complète clé en main — packaging, volumes, prix dégressifs, livraison 24h"},
  premium:{label:"Shop Premium",products:["F001","F006","F012","H009","M003","E008"],pitch:"Hydroponie premium, CSA exclusif, Moonrock — pour une clientèle exigeante"},
};

// ── SYSTEM PROMPT ────────────────────────────────────────────────────
const SYS=`Tu es l'agent commercial IA de L'Entrepôt du Chanvrier (Geosiste), grossiste/fabricant CBD français.
Site: lentrepotduchanvrier.com | Marques: Formule Explosive™, Jok'Air™, Velaria™
Livraison 24h Chronopost FR | 48h EU | Colis 100% assurés | -10%: #LANCEMENT

CATALOGUE (50 produits):
${CAT.map(p=>`${p.r} ${p.n} [${p.c}] ${p.m}: ${p.d} — ${p.p}€`).join("\n")}

MOLÉCULES LÉGALES: CBD, CBG, CBN, CBC, MCP-N, 10-OH-HHC, CSA-14, Muscimol
INTERDITES: HHC, H4CBD, THCP, THCA, HHCP, HHCPO, THCPO, THCJD
PINACA: prix<0.30€/g, effets hallucinations, pas COA, "PTC/Spice/K2" → ALERTER

LANGUE: Adapte automatiquement — FR pour France/BE/LU/CH, DE pour Allemagne/Autriche, ES pour Espagne, IT pour Italie, PT pour Portugal, NL pour Pays-Bas, EN pour le reste.

SEGMENTATION: Buraliste→Vapes+PreRolls | Grossiste Mol→CSA/MCP-N/10-OH | Grossiste CBD→Hash+Fleurs+Isolats | E-com→White Label | Franchise→Gamme complète | Premium→Hydro+CSA

À la FIN, ajoute: [DATA_START]{"intent":"discover|interested|ready_to_order|objection|pinaca_alert|question","products":["refs"],"hot":false,"notes":"10 mots max","segment":"buraliste|grossiste_mol|grossiste_cbd|ecommerce|franchise|premium|unknown"}[DATA_END]`;

// ── CONSTANTES ────────────────────────────────────────────────────────
const FL={"France":"🇫🇷","Allemagne":"🇩🇪","Suisse":"🇨🇭","Pays-Bas":"🇳🇱","Slovénie":"🇸🇮","Royaume-Uni":"🇬🇧","Pologne":"🇵🇱","Espagne":"🇪🇸","Italie":"🇮🇹","Belgique":"🇧🇪","Luxembourg":"🇱🇺","Lituanie":"🇱🇹","Autriche":"🇦🇹","Portugal":"🇵🇹","Danemark":"🇩🇰","Rép. Tchèque":"🇨🇿","Croatie":"🇭🇷"};
const STS=[{v:"prospect",l:"Prospect",c:"#64748b",i:"⚪"},{v:"contacted",l:"Contacté",c:"#F59E0B",i:"📨"},{v:"interested",l:"Intéressé",c:"#8B5CF6",i:"💜"},{v:"hot",l:"Chaud",c:"#EF4444",i:"🔥"},{v:"ready",l:"Prêt",c:"#10B981",i:"💰"},{v:"client",l:"Client",c:"#06B6D4",i:"✅"},{v:"lost",l:"Perdu",c:"#374151",i:"❌"}];
const SIZES=["Très Grand","Grand","Moyen-Grand","Moyen","Petit"];
const CA_R=["50M€+","10-20M€","5-10M€","3-5M€","2-5M€","1-3M€","500k-2M€","<500k€","N/A"];

// ── MAP COORDINATES ──────────────────────────────────────────────────
const GEO={"France":[46.6,2.3],"Allemagne":[51.2,10.4],"Suisse":[46.8,8.2],"Pays-Bas":[52.1,5.3],"Belgique":[50.5,4.5],"Luxembourg":[49.6,6.1],"Espagne":[40.4,-3.7],"Italie":[41.9,12.5],"Portugal":[39.4,-8.2],"Royaume-Uni":[55.4,-3.4],"Pologne":[51.9,19.1],"Autriche":[47.5,14.6],"Slovénie":[46.2,14.8],"Lituanie":[55.2,23.9],"Danemark":[56.3,9.5],"Rép. Tchèque":[49.8,15.5],"Croatie":[45.1,15.2]};

const INIT=[
  {id:1,nm:"Le Petit Botaniste",co:"France",ct:"National",tp:"Grossiste Molécules",web:"lepetitbotaniste.com",em:"contact@lepetitbotaniste.com",ph:"",wa:"",ig:"lepetitbotaniste_cbd",li:"",sz:"Grand",ca:"3-5M€",pr:["CSA-14","CBDX"],st:"prospect",sc:97,ml:true,sg:"grossiste_mol",ints:[],pi:{},last:null,nt:"Réf. molécules puissantes FR/BE",seq:null,seqStep:0,orders:[],revenue:0},
  {id:2,nm:"CBDB2B",co:"France",ct:"National",tp:"Grossiste B2B",web:"cbdb2b.com",em:"contact@cbdb2b.com",ph:"",wa:"",ig:"",li:"",sz:"Grand",ca:"2-5M€",pr:["CBDX","NL1","THX+"],st:"prospect",sc:96,ml:true,sg:"grossiste_mol",ints:[],pi:{},last:null,nt:"CBDX/CSA-14/THX+/NL1 COA complet",seq:null,seqStep:0,orders:[],revenue:0},
  {id:3,nm:"Origine CBD",co:"France",ct:"National",tp:"Grossiste",web:"originecbd.fr",em:"contact@originecbd.fr",ph:"",wa:"",ig:"originecbd",li:"",sz:"Grand",ca:"2-5M€",pr:["CSA-14","Vapes CSA"],st:"prospect",sc:93,ml:true,sg:"grossiste_mol",ints:[],pi:{},last:null,nt:"CSA 90% vapes",seq:null,seqStep:0,orders:[],revenue:0},
  {id:4,nm:"Cibdol",co:"Suisse",ct:"Bâle",tp:"Fabricant",web:"cibdol.com",em:"info@cibdol.com",ph:"",wa:"",ig:"cibdol",li:"cibdol",sz:"Très Grand",ca:"10-20M€",pr:["Huiles"],st:"prospect",sc:93,ml:false,sg:"ecommerce",ints:[],pi:{},last:null,nt:"13k+ Trustpilot",seq:null,seqStep:0,orders:[],revenue:0},
  {id:5,nm:"420 Green Road",co:"France",ct:"Paris",tp:"Grossiste",web:"420greenroad.com",em:"contact@420greenroad.com",ph:"",wa:"",ig:"420greenroad",li:"",sz:"Grand",ca:"2-5M€",pr:["Fleurs","CSA"],st:"prospect",sc:92,ml:true,sg:"grossiste_mol",ints:[],pi:{},last:null,nt:"Partenaire existant CSA",seq:null,seqStep:0,orders:[],revenue:0},
  {id:6,nm:"Deli Hemp Pro",co:"France",ct:"National",tp:"Grossiste",web:"delihemp-pro.fr",em:"contact@delihemp-pro.fr",ph:"",wa:"",ig:"delihemp",li:"",sz:"Très Grand",ca:"5-10M€",pr:["2000+ réf"],st:"prospect",sc:90,ml:false,sg:"grossiste_cbd",ints:[],pi:{},last:null,nt:"2000+ réf",seq:null,seqStep:0,orders:[],revenue:0},
  {id:7,nm:"CBD'eau",co:"France",ct:"National",tp:"Franchise",web:"cbdeau.fr",em:"contact@cbdeau.fr",ph:"",wa:"",ig:"cbdeau_officiel",li:"",sz:"Très Grand",ca:"10-20M€",pr:["150+ boutiques"],st:"prospect",sc:90,ml:false,sg:"franchise",ints:[],pi:{},last:null,nt:"150+ boutiques FR",seq:null,seqStep:0,orders:[],revenue:0},
  {id:8,nm:"Nordic Oil",co:"Allemagne",ct:"Munich",tp:"Fabricant",web:"nordicoil.de",em:"info@nordicoil.de",ph:"",wa:"",ig:"nordicoil_de",li:"nordicoil",sz:"Très Grand",ca:"10-20M€",pr:["Huiles"],st:"prospect",sc:90,ml:false,sg:"ecommerce",ints:[],pi:{},last:null,nt:"Leader wellness CBD DE",seq:null,seqStep:0,orders:[],revenue:0},
  {id:9,nm:"Endoca",co:"Pays-Bas",ct:"Amsterdam",tp:"Fabricant",web:"endoca.com",em:"info@endoca.com",ph:"",wa:"",ig:"endoca",li:"endoca",sz:"Très Grand",ca:"10-20M€",pr:["Huiles"],st:"prospect",sc:89,ml:false,sg:"ecommerce",ints:[],pi:{},last:null,nt:"CO₂ supercritique bio",seq:null,seqStep:0,orders:[],revenue:0},
  {id:10,nm:"Cannactiva",co:"Espagne",ct:"Barcelone",tp:"Producteur",web:"cannactiva.com",em:"info@cannactiva.com",ph:"",wa:"",ig:"cannactiva_cbd",li:"cannactiva",sz:"Grand",ca:"3-5M€",pr:["Fleurs"],st:"prospect",sc:85,ml:false,sg:"grossiste_cbd",ints:[],pi:{},last:null,nt:"Distrib pharmacies/tabacs ES",seq:null,seqStep:0,orders:[],revenue:0},
  {id:11,nm:"Essentia Pura",co:"Slovénie",ct:"Ljubljana",tp:"White Label",web:"essentiapura.com",em:"info@essentiapura.com",ph:"",wa:"",ig:"essentiapura",li:"essentia-pura",sz:"Grand",ca:"3-5M€",pr:["White Label"],st:"prospect",sc:94,ml:false,sg:"ecommerce",ints:[],pi:{},last:null,nt:"GMP leader marque blanche EU",seq:null,seqStep:0,orders:[],revenue:0},
  {id:12,nm:"Reakiro",co:"Lituanie",ct:"Vilnius",tp:"Fabricant",web:"cbdreakiro.com",em:"info@cbdreakiro.com",ph:"",wa:"",ig:"reakiro",li:"reakiro",sz:"Grand",ca:"3-5M€",pr:["Huiles"],st:"prospect",sc:90,ml:false,sg:"grossiste_cbd",ints:[],pi:{},last:null,nt:"Seed-to-sale EIHA -60%",seq:null,seqStep:0,orders:[],revenue:0},
  {id:13,nm:"CBD 111",co:"Belgique",ct:"National",tp:"Grossiste Mol.",web:"cbd-111.com",em:"info@cbd-111.com",ph:"0499185830",wa:"32499185830",ig:"cbd111_be",li:"",sz:"Moyen-Grand",ca:"1-3M€",pr:["CSA-14","H4CBD"],st:"prospect",sc:89,ml:true,sg:"grossiste_mol",ints:[],pi:{},last:null,nt:"Grossiste BE/FR/LU molécules",seq:null,seqStep:0,orders:[],revenue:0},
  {id:14,nm:"Candropharm",co:"Pays-Bas",ct:"National",tp:"Private Label",web:"candropharm.com",em:"info@candropharm.com",ph:"",wa:"",ig:"candropharm",li:"candropharm",sz:"Grand",ca:"3-5M€",pr:["Private Label"],st:"prospect",sc:88,ml:false,sg:"ecommerce",ints:[],pi:{},last:null,nt:"900+ clients B2B sans MOQ",seq:null,seqStep:0,orders:[],revenue:0},
  {id:15,nm:"Hempati",co:"Italie",ct:"National",tp:"Producteur",web:"hempati.com",em:"info@hempati.com",ph:"",wa:"",ig:"hempati_cbd",li:"hempati",sz:"Grand",ca:"2-5M€",pr:["Fleurs IT"],st:"prospect",sc:84,ml:false,sg:"grossiste_cbd",ints:[],pi:{},last:null,nt:"Chanvre bio IT export EU",seq:null,seqStep:0,orders:[],revenue:0},
];

// ══════════════════════════════════════════════════════════════════════
export default function App(){
  const[db,setDb]=useState(INIT);
  const[vw,setVw]=useState("dash");
  const[chat,setChat]=useState([]);
  const[inp,setInp]=useState("");
  const[ld,setLd]=useState(false);
  const[sel,setSel]=useState(null);
  const[ch,setCh]=useState("email");
  const[alerts,setAlerts]=useState([]);
  const[showA,setShowA]=useState(false);
  const[srch,setSrch]=useState("");
  const[fM,setFM]=useState(false);
  const[fS,setFS]=useState("all");
  const[fC,setFC]=useState("all");
  // Auto agent
  const[autoOn,setAutoOn]=useState(false);
  const[autoLog,setAL]=useState([]);
  const[autoSt,setAS]=useState({sent:0,hot:0,ready:0,err:0});
  const[autoSpd,setASpd]=useState(5);
  const[autoCh,setACh]=useState("email");
  const[autoTgt,setATgt]=useState("all");
  const autoRef=useRef(false);
  // Config
  const[waNum,setWaNum]=useState("");
  const[pKey,setPK]=useState("");
  const[pRes,setPR]=useState("");
  // Add form
  const[showAdd,setShowAdd]=useState(false);
  const[af,setAf]=useState({nm:"",co:"France",ct:"",tp:"",web:"",em:"",ph:"",wa:"",ig:"",li:"",pr:"",sz:"Moyen",ca:"N/A",nt:""});
  // Edit + CSV
  const[editId,setEditId]=useState(null);
  const[csvText,setCsvText]=useState("");
  // Orders
  const[showOrder,setShowOrder]=useState(null);
  const[orderForm,setOF]=useState({products:"",amount:"",date:""});
  // Supabase
  const[supaOk,setSupaOk]=useState(false);
  const[supaMsg,setSupaMsg]=useState("");
  const[dbLoaded,setDbLoaded]=useState(false);
  const saveTimer=useRef(null);

  // ── SUPABASE: LOAD ON MOUNT ──────────────────────────────────────
  useEffect(()=>{
    if(!SUPA_READY){setSupaMsg("⚠️ Supabase non configuré — mode local");setDbLoaded(true);return;}
    (async()=>{
      setSupaMsg("⏳ Connexion Supabase...");
      const data=await supa.load("prospects");
      if(data&&data.length>0){
        // Map Supabase rows to app format
        const mapped=data.map(r=>({
          id:r.id,nm:r.nm||"",co:r.co||"France",ct:r.ct||"",tp:r.tp||"",web:r.web||"",em:r.em||"",
          ph:r.ph||"",wa:r.wa||"",ig:r.ig||"",li:r.li||"",sz:r.sz||"Moyen",ca:r.ca||"N/A",
          pr:typeof r.pr==="string"?JSON.parse(r.pr||"[]"):r.pr||[],
          st:r.st||"prospect",sc:r.sc||60,ml:!!r.ml,sg:r.sg||"grossiste_cbd",
          ints:typeof r.ints==="string"?JSON.parse(r.ints||"[]"):r.ints||[],
          pi:typeof r.pi==="string"?JSON.parse(r.pi||"{}"):r.pi||{},
          last:r.last||null,nt:r.nt||"",seq:r.seq||null,seqStep:r.seq_step||0,
          orders:typeof r.orders==="string"?JSON.parse(r.orders||"[]"):r.orders||[],
          revenue:r.revenue||0
        }));
        setDb(mapped);
        setSupaMsg(`✅ ${mapped.length} prospects chargés`);
        setSupaOk(true);
      } else if(data&&data.length===0) {
        // First time — push INIT data to Supabase
        setSupaMsg("📤 Premier lancement — envoi données initiales...");
        await saveAllToSupa(INIT);
        setSupaMsg(`✅ ${INIT.length} prospects initialisés`);
        setSupaOk(true);
      } else {
        setSupaMsg("❌ Erreur connexion — mode local");
      }
      // Load config
      const cfg=await supa.loadConfig("settings");
      if(cfg){if(cfg.waNum)setWaNum(cfg.waNum);if(cfg.pKey)setPK(cfg.pKey);}
      // Load alerts
      const savedAlerts=await supa.loadConfig("alerts");
      if(savedAlerts)setAlerts(savedAlerts);
      setDbLoaded(true);
    })();
  },[]);

  // ── SUPABASE: AUTO-SAVE ON DB CHANGE ─────────────────────────────
  const saveAllToSupa=async(data)=>{
    if(!SUPA_READY)return;
    const rows=data.map(p=>({
      id:p.id,nm:p.nm,co:p.co,ct:p.ct,tp:p.tp,web:p.web,em:p.em,ph:p.ph,wa:p.wa,ig:p.ig,li:p.li,
      sz:p.sz,ca:p.ca,pr:JSON.stringify(p.pr),st:p.st,sc:p.sc,ml:p.ml,sg:p.sg,
      ints:JSON.stringify(p.ints),pi:JSON.stringify(p.pi),last:p.last,nt:p.nt,
      seq:p.seq,seq_step:p.seqStep,orders:JSON.stringify(p.orders),revenue:p.revenue
    }));
    await supa.upsert("prospects",rows);
  };

  useEffect(()=>{
    if(!SUPA_READY||!dbLoaded)return;
    // Debounce: save 2s after last change
    if(saveTimer.current)clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{saveAllToSupa(db);},2000);
    return()=>{if(saveTimer.current)clearTimeout(saveTimer.current);};
  },[db,dbLoaded]);

  // Save config when waNum or pKey change
  useEffect(()=>{
    if(!SUPA_READY||!dbLoaded)return;
    supa.saveConfig("settings",{waNum,pKey});
  },[waNum,pKey,dbLoaded]);

  // Save alerts
  useEffect(()=>{
    if(!SUPA_READY||!dbLoaded||alerts.length===0)return;
    supa.saveConfig("alerts",alerts.slice(0,50));
  },[alerts,dbLoaded]);
  
  const chatEnd=useRef(null);
  const scroll=()=>setTimeout(()=>chatEnd.current?.scrollIntoView({behavior:"smooth"}),80);
  const parseD=t=>{const m=t.match(/\[DATA_START\]([\s\S]*?)\[DATA_END\]/);if(!m)return null;try{return JSON.parse(m[1]);}catch{return null;}};
  const cleanR=t=>t.replace(/\[DATA_START\][\s\S]*?\[DATA_END\]/g,"").trim();
  const now=()=>new Date().toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  const COUNTRIES=[...new Set(db.map(p=>p.co))].sort();

  // ── DYNAMIC SCORING ─────────────────────────────────────────────
  const calcScore=(p)=>{
    let s=p.sc;
    if(p.ints.length>0)s+=Math.min(p.ints.length*2,10);
    if(p.ints.some(i=>i.intent==="interested"))s+=5;
    if(p.ints.some(i=>i.intent==="ready_to_order"))s+=15;
    if(p.revenue>0)s+=10;
    const daysSince=p.last?Math.floor((Date.now()-new Date(p.last?.split(",").reverse().join("-")+"T00:00"))/86400000):999;
    if(daysSince>30&&p.st!=="client")s-=5;
    if(daysSince>60&&p.st!=="client")s-=10;
    return Math.max(0,Math.min(100,s));
  };

  // ── UPDATE FROM AI ──────────────────────────────────────────────
  const updateP=(id,data)=>{
    if(!data)return;const t=now();
    setDb(prev=>prev.map(p=>{
      if(p.id!==id)return p;
      const ni=[...p.ints,{t,intent:data.intent,prods:data.products||[],notes:data.notes,ch,seg:data.segment}];
      const np={...p.pi};(data.products||[]).forEach(r=>{const prod=CAT.find(c=>c.r===r);np[prod?.n||r]=(np[prod?.n||r]||0)+1;});
      let ns=p.st;
      if(data.intent==="ready_to_order")ns="ready";
      else if(data.hot)ns="hot";
      else if(data.intent==="interested")ns="interested";
      else if(p.st==="prospect")ns="contacted";
      const sg=data.segment&&data.segment!=="unknown"?data.segment:p.sg;
      return{...p,ints:ni,pi:np,st:ns,last:t,sg};
    }));
    if(data.intent==="ready_to_order"||data.hot||data.intent==="pinaca_alert"){
      const pr=db.find(p=>p.id===id);
      const msg=data.intent==="ready_to_order"?`💰 ${pr?.nm} PRÊT À COMMANDER !`:data.intent==="pinaca_alert"?`⚠️ PINACA — ${pr?.nm}`:`🔥 ${pr?.nm} très intéressé`;
      setAlerts(prev=>[{id:Date.now(),t:new Date().toLocaleTimeString(),msg,type:data.intent,pid:id,read:false},...prev]);
      setShowA(true);setTimeout(()=>setShowA(false),5000);
      if(waNum)window.open(`https://wa.me/${waNum.replace(/[^0-9]/g,"")}?text=${encodeURIComponent("🚨 GEOSISTE\n"+msg)}`,"_blank");
    }
  };

  // ── SEND CHAT ───────────────────────────────────────────────────
  const send=async(msg)=>{
    if(!msg.trim()||ld)return;
    const lang=sel?LANG_MAP[sel.co]||"en":"fr";
    const seg=sel?SEGMENTS[sel.sg]||{}:{};
    const ctx=sel?`\n[PROSPECT: ${sel.nm} (${sel.co}/${sel.ct}) | ${sel.web} | Mol:${sel.ml?"OUI":"NON"} | Segment:${sel.sg} | Produits recommandés: ${seg.products?.join(",")||"tous"} | Pitch: ${seg.pitch||""} | Langue: ${LANG_NAMES[lang]||lang} | ${sel.ints.length} interactions | Revenue: ${sel.revenue}€]\n[CANAL: ${ch}]`:"";
    const nc=[...chat,{role:"user",content:msg}];
    setChat(nc);setInp("");setLd(true);scroll();
    try{
      const msgs=nc.map(m=>({role:m.role,content:m.content}));
      msgs[msgs.length-1]={role:"user",content:msgs[msgs.length-1].content+ctx};
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYS,messages:msgs})});
      if(!res.ok)throw new Error(`API ${res.status}`);
      const d=await res.json();
      const raw=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("\n")||"";
      if(!raw)throw new Error("Réponse vide");
      setChat(prev=>[...prev,{role:"assistant",content:cleanR(raw)}]);
      if(sel)updateP(sel.id,parseD(raw));
    }catch(e){setChat(prev=>[...prev,{role:"assistant",content:`❌ ${e.message}\n\n💡 L'agent nécessite l'API Claude.`}]);}
    setLd(false);scroll();
  };

  // ── AUTO AGENT WITH SEQUENCES ───────────────────────────────────
  const startAuto=async()=>{
    autoRef.current=true;setAutoOn(true);
    const targets=db.filter(p=>{if(p.st==="client"||p.st==="lost")return false;if(autoTgt==="mol")return p.ml;if(autoTgt==="hi")return calcScore(p)>=85;return true;}).sort((a,b)=>calcScore(b)-calcScore(a));
    setAL(prev=>[`🚀 ${targets.length} prospects via ${autoCh}`,...prev]);
    for(const prospect of targets){
      if(!autoRef.current)break;
      const lang=LANG_MAP[prospect.co]||"en";
      const seg=SEGMENTS[prospect.sg]||SEGMENTS.grossiste_cbd;
      const seqId=prospect.ml?2:1;
      const seq=SEQUENCES.find(s=>s.id===seqId);
      const step=seq.steps[Math.min(prospect.seqStep,seq.steps.length-1)];
      try{
        const prompt=`Tu démarches ${prospect.nm} (${prospect.co}). Type: ${prospect.tp}. Segment: ${prospect.sg}. Produits: ${prospect.pr.join(",")}. Site: ${prospect.web}. ${prospect.ml?"Molécules alternatives — pitch CSA/MCP-N/10-OH.":"CBD classique."}
Langue: ${LANG_NAMES[lang]}. Canal: ${autoCh}. Étape séquence: ${step.label} (J+${step.day}).
Produits recommandés pour ce segment: ${seg.products?.map(r=>CAT.find(c=>c.r===r)?.n).filter(Boolean).join(", ")}
Pitch segment: ${seg.pitch}
${autoCh==="whatsapp"?"Max 300 car, emojis.":autoCh==="instagram"?"Max 200 car, accrocheur.":"Email pro avec objet."}
${step.type.includes("followup")?"C'est une RELANCE — fais référence au message précédent.":""}
${step.type==="special"?"Propose une OFFRE SPÉCIALE: -10% sur première commande ou échantillon gratuit.":""}
${step.type==="last"?"DERNIÈRE RELANCE — crée l'urgence, offre limitée dans le temps.":""}`;
        const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:SYS,messages:[{role:"user",content:prompt}]})});
        if(!res.ok)throw new Error(`${res.status}`);
        const d=await res.json();
        const raw=d.content?.filter(c=>c.type==="text").map(c=>c.text).join("\n")||"";
        const data=parseD(raw);const msg=cleanR(raw);
        setDb(prev=>prev.map(p=>p.id!==prospect.id?p:{...p,st:p.st==="prospect"?"contacted":p.st,last:now(),seqStep:Math.min(p.seqStep+1,(seq?.steps.length||5)-1),seq:seqId,ints:[...p.ints,{t:now(),intent:data?.intent||"outbound",prods:data?.products||[],notes:`[${step.label}] ${data?.notes||msg.substring(0,40)}`,ch:autoCh,autoMsg:msg,seg:data?.segment}]}));
        setAS(prev=>({...prev,sent:prev.sent+1,...(data?.hot?{hot:prev.hot+1}:{}),...(data?.intent==="ready_to_order"?{ready:prev.ready+1}:{})}));
        setAL(prev=>[`✅ ${prospect.nm} — ${step.label}`,...prev]);
        if(data?.hot||data?.intent==="ready_to_order"){
          setAlerts(prev=>[{id:Date.now(),t:new Date().toLocaleTimeString(),msg:`🤖 ${data?.intent==="ready_to_order"?"💰":"🔥"} ${prospect.nm}`,type:data.intent,pid:prospect.id,read:false},...prev]);
        }
      }catch(e){setAS(prev=>({...prev,err:prev.err+1}));setAL(prev=>[`❌ ${prospect.nm}: ${e.message}`,...prev]);}
      await new Promise(r=>setTimeout(r,autoSpd*1000));
    }
    autoRef.current=false;setAutoOn(false);setAL(prev=>["🏁 Terminé",...prev]);
  };

  // ── ADD ORDER ───────────────────────────────────────────────────
  const addOrder=(id)=>{
    const amt=parseFloat(orderForm.amount)||0;if(!amt)return;
    setDb(prev=>prev.map(p=>p.id!==id?p:{...p,st:"client",orders:[...p.orders,{date:orderForm.date||now(),products:orderForm.products,amount:amt}],revenue:p.revenue+amt}));
    setOF({products:"",amount:"",date:""});setShowOrder(null);
  };

  // ── COMPUTED ────────────────────────────────────────────────────
  const allPI=db.flatMap(p=>Object.entries(p.pi)).reduce((a,[k,v])=>{a[k]=(a[k]||0)+v;return a;},{});
  const topP=Object.entries(allPI).sort((a,b)=>b[1]-a[1]);
  const totI=db.reduce((a,p)=>a+p.ints.length,0);
  const totR=db.reduce((a,p)=>a+p.revenue,0);
  const filtered=db.filter(p=>{if(srch&&!p.nm.toLowerCase().includes(srch.toLowerCase()))return false;if(fM&&!p.ml)return false;if(fS!=="all"&&p.st!==fS)return false;if(fC!=="all"&&p.co!==fC)return false;return true;}).sort((a,b)=>calcScore(b)-calcScore(a));
  const unread=alerts.filter(a=>!a.read).length;
  const convRate=db.filter(p=>p.st!=="prospect").length?Math.round(db.filter(p=>["client","ready"].includes(p.st)).length/db.filter(p=>p.st!=="prospect").length*100):0;
  // Conversion by country
  const convByCountry=COUNTRIES.map(c=>{const all=db.filter(p=>p.co===c);const conv=all.filter(p=>["client","ready","hot"].includes(p.st));return{co:c,total:all.length,conv:conv.length,rate:all.length?Math.round(conv.length/all.length*100):0};}).sort((a,b)=>b.rate-a.rate);
  // Conversion by channel
  const convByCh=["email","whatsapp","instagram"].map(c=>{const msgs=db.flatMap(p=>p.ints.filter(i=>i.ch===c));return{ch:c,total:msgs.length,hot:msgs.filter(i=>["interested","ready_to_order"].includes(i.intent)).length};});
  // Follow-ups due
  const followUpsDue=db.filter(p=>{
    if(!p.seq||p.st==="client"||p.st==="lost")return false;
    const seq=SEQUENCES.find(s=>s.id===p.seq);if(!seq)return false;
    const nextStep=seq.steps[p.seqStep];if(!nextStep)return false;
    if(!p.last)return true;
    const lastDate=new Date();// simplified — would parse p.last in production
    return true;// show all pending
  });

  const fs={padding:"6px 7px",borderRadius:6,background:"#080d17",border:"1px solid #1a2332",color:"#94a3b8",fontSize:10,fontFamily:"'Outfit',sans-serif"};
  const openE=(to,s,b)=>window.open(`mailto:${to}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`);
  const openW=(ph,t)=>window.open(`https://wa.me/${ph.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(t)}`);
  const openI=h=>window.open(`https://instagram.com/${h.replace("@","")}`);
  const openL=u=>window.open(u.startsWith("http")?u:`https://linkedin.com/company/${u}`);
  const delP=id=>{if(confirm("Supprimer ?")){setDb(prev=>prev.filter(p=>p.id!==id));if(SUPA_READY)supa.del("prospects",id);}if(sel?.id===id)setSel(null);};
  const editField=(id,k,v)=>setDb(prev=>prev.map(p=>p.id===id?{...p,[k]:v}:p));
  const importCSV=()=>{
    if(!csvText.trim())return;
    const mx=Math.max(...db.map(p=>p.id),0);
    const mK=["CSA","CBDX","NL1","THX","HHC","10-OH","MCPN"];
    const lines=csvText.split("\n").filter(l=>l.trim());
    const newP=lines.map((l,i)=>{const p=l.split(";").map(s=>s.trim());const pArr=(p[5]||"CBD").split(",").map(s=>s.trim());const ml=pArr.some(x=>mK.some(m=>x.toUpperCase().includes(m)));
    return{id:mx+i+1,nm:p[0]||"Import",co:p[1]||"France",ct:p[2]||"",tp:"Import CSV",web:p[3]||"",em:p[4]||"",ph:"",wa:"",ig:"",li:"",sz:"Moyen",ca:"N/A",pr:pArr,st:"prospect",sc:ml?72:55,ml,sg:ml?"grossiste_mol":"grossiste_cbd",ints:[],pi:{},last:null,nt:p[6]||"",seq:null,seqStep:0,orders:[],revenue:0};});
    setDb(prev=>[...prev,...newP]);setCsvText("");
  };
  const addP=()=>{
    if(!af.nm.trim())return;
    const mx=Math.max(...db.map(p=>p.id),0);
    const mK=["CSA","CBDX","NL1","THX","HHC","10-OH","MCPN"];
    const pArr=(af.pr||"CBD").split(",").map(s=>s.trim());
    const ml=pArr.some(p=>mK.some(m=>p.toUpperCase().includes(m)));
    setDb(prev=>[...prev,{id:mx+1,nm:af.nm,co:af.co||"France",ct:af.ct,tp:af.tp,web:af.web,em:af.em,ph:af.ph,wa:af.wa,ig:af.ig,li:af.li,sz:af.sz,ca:af.ca,pr:pArr,st:"prospect",sc:ml?75:60,ml,sg:ml?"grossiste_mol":"grossiste_cbd",ints:[],pi:{},last:null,nt:af.nt,seq:null,seqStep:0,orders:[],revenue:0}]);
    setAf({nm:"",co:"France",ct:"",tp:"",web:"",em:"",ph:"",wa:"",ig:"",li:"",pr:"",sz:"Moyen",ca:"N/A",nt:""});setShowAdd(false);
  };
  // Pappers
  const searchP=async(q)=>{
    if(!pKey){setPR("❌ Clé requise");return;}setPR("⏳...");
    try{const r=await fetch(`https://api.pappers.fr/v2/recherche?api_token=${pKey}&q=${encodeURIComponent(q)}&par_page=100&statut_rcs=A`);const d=await r.json();
    if(d.resultats?.length){const mx=Math.max(...db.map(p=>p.id),0);const n=d.resultats.filter(r=>r.nom_entreprise&&!db.some(p=>p.nm.toLowerCase()===r.nom_entreprise.toLowerCase())).map((r,i)=>({id:mx+i+1,nm:r.nom_entreprise,co:"France",ct:r.siege?.ville||"",tp:r.libelle_code_naf||"Pappers",web:"",em:"",ph:"",wa:"",ig:"",li:"",sz:"Moyen",ca:"N/A",pr:["CBD"],st:"prospect",sc:55,ml:false,sg:"grossiste_cbd",ints:[],pi:{},last:null,nt:`SIREN:${r.siren||""}`,seq:null,seqStep:0,orders:[],revenue:0}));
    setDb(prev=>[...prev,...n]);setPR(`✅ +${n.length}/${d.total}`);}else setPR("0 résultat");}catch(e){setPR("❌ "+e.message);}};

  return(
    <div style={{minHeight:"100vh",background:"#050810",fontFamily:"'Outfit',sans-serif",color:"#e2e8f0"}}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet"/>

      {/* ALERT */}
      {showA&&alerts[0]&&<div style={{position:"fixed",top:6,left:6,right:6,zIndex:999,background:alerts[0].type==="pinaca_alert"?"#450a0a":"#052e16",border:"1px solid "+(alerts[0].type==="pinaca_alert"?"#dc2626":"#16a34a"),borderRadius:10,padding:"10px 12px",boxShadow:"0 8px 30px rgba(0,0,0,.6)"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{alerts[0].msg}</div>
        <div style={{display:"flex",gap:4,marginTop:6}}>
          <button onClick={()=>{setSel(db.find(x=>x.id===alerts[0].pid)||null);setVw("agent");setShowA(false);setAlerts(p=>p.map((a,i)=>i===0?{...a,read:true}:a));}} style={{flex:1,padding:5,borderRadius:5,background:"#fff",color:"#000",border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}>🖐️ Prendre la main</button>
          <button onClick={()=>{setShowA(false);setAlerts(p=>p.map((a,i)=>i===0?{...a,read:true}:a));}} style={{padding:"5px 10px",borderRadius:5,background:"transparent",color:"#fff",border:"1px solid #fff3",fontSize:10,cursor:"pointer"}}>OK</button>
        </div>
      </div>}

      {/* HEADER */}
      <div style={{background:"#0a1020",borderBottom:"1px solid #1a2332",padding:"8px 10px 5px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:22,height:22,borderRadius:5,background:"linear-gradient(135deg,#10B981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff"}}>G</div>
            <span style={{fontSize:12,fontWeight:900,color:"#10B981"}}>GEOSISTE</span>
            <span style={{fontSize:7,color:"#475569"}}>{db.length}p | {totR>0?`${totR.toLocaleString()}€`:""}</span>
          </div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <div title={supaMsg} style={{width:5,height:5,borderRadius:"50%",background:supaOk?"#10B981":SUPA_READY?"#F59E0B":"#64748b",boxShadow:supaOk?"0 0 4px #10B981":"none"}}/>
            {(ld||autoOn)&&<div style={{width:5,height:5,borderRadius:"50%",background:autoOn?"#F59E0B":"#10B981",boxShadow:`0 0 6px ${autoOn?"#F59E0B":"#10B981"}`,animation:"pulse 1s infinite"}}/>}
            <button onClick={()=>setVw("alerts")} style={{position:"relative",background:"none",border:"none",cursor:"pointer",fontSize:14,padding:2}}>🔔{unread>0&&<span style={{position:"absolute",top:-3,right:-4,width:12,height:12,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:7,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}</button>
          </div>
        </div>
        <div style={{display:"flex",gap:1,overflowX:"auto"}}>
          {[{k:"dash",l:"📊 Dashboard"},{k:"auto",l:"🚀 Auto"},{k:"agent",l:"🤖 Chat"},{k:"crm",l:"📋 CRM"},{k:"map",l:"🗺️"},{k:"prods",l:"🛒"},{k:"connect",l:"🔗"}].map(v=>(
            <button key={v.k} onClick={()=>setVw(v.k)} style={{flex:1,padding:"4px 1px",borderRadius:5,fontSize:8,fontWeight:vw===v.k?700:400,cursor:"pointer",background:vw===v.k?"#10B981":"transparent",color:vw===v.k?"#000":"#475569",border:vw===v.k?"none":"1px solid #1a2332",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap"}}>{v.l}</button>
          ))}
        </div>
      </div>

      {/* ═══ DASHBOARD ═══ */}
      {vw==="dash"&&<div style={{padding:"8px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        {/* KPIs */}
        <div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>
          {[{l:"Prospects",v:db.length,c:"#64748b"},{l:"Contactés",v:db.filter(p=>p.st!=="prospect").length,c:"#F59E0B"},{l:"🔥 Chauds",v:db.filter(p=>["hot","ready"].includes(p.st)).length,c:"#EF4444"},{l:"Clients",v:db.filter(p=>p.st==="client").length,c:"#06B6D4"},{l:"Revenue",v:totR>0?`${(totR/1000).toFixed(1)}k€`:"0€",c:"#10B981"},{l:"Conv.",v:convRate+"%",c:"#8B5CF6"}].map((k,i)=>(
            <div key={i} style={{flex:1,minWidth:48,background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:"5px 4px",textAlign:"center"}}>
              <div style={{fontSize:6,color:"#475569",textTransform:"uppercase"}}>{k.l}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:13,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
        {/* Pipeline */}
        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:4}}>Pipeline</div>
        <div style={{display:"flex",gap:1,marginBottom:8}}>
          {STS.map(s=>{const n=db.filter(p=>p.st===s.v).length;return <div key={s.v} style={{flex:1,background:s.c+"10",borderRadius:4,padding:"3px 1px",textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:s.c}}>{n}</div><div style={{fontSize:6,color:s.c}}>{s.i}</div></div>;})}
        </div>
        {/* Conv by country */}
        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginBottom:4}}>Conversion par pays</div>
        {convByCountry.slice(0,6).map(c=><div key={c.co} style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
          <span style={{fontSize:10}}>{FL[c.co]||"🌍"}</span>
          <span style={{fontSize:9,width:55,color:"#94a3b8"}}>{c.co}</span>
          <div style={{flex:1,height:10,background:"#0a1020",borderRadius:4,overflow:"hidden"}}><div style={{width:`${c.rate}%`,height:"100%",borderRadius:4,background:c.rate>50?"#10B981":c.rate>20?"#F59E0B":"#64748b"}}/></div>
          <span style={{fontFamily:"'JetBrains Mono'",fontSize:8,color:"#475569",width:28,textAlign:"right"}}>{c.rate}%</span>
          <span style={{fontSize:7,color:"#334155"}}>{c.conv}/{c.total}</span>
        </div>)}
        {/* Conv by channel */}
        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginTop:8,marginBottom:4}}>Par canal</div>
        <div style={{display:"flex",gap:3}}>
          {convByCh.map(c=><div key={c.ch} style={{flex:1,background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:"6px 4px",textAlign:"center"}}>
            <div style={{fontSize:14}}>{c.ch==="email"?"📧":c.ch==="whatsapp"?"💬":"📸"}</div>
            <div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:"#e2e8f0"}}>{c.total}</div>
            <div style={{fontSize:7,color:"#475569"}}>{c.hot} intéressés</div>
          </div>)}
        </div>
        {/* Top products */}
        <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",marginTop:8,marginBottom:4}}>⭐ Produits demandés</div>
        {topP.length===0?<div style={{fontSize:9,color:"#334155"}}>Lancez l'agent pour voir les stats</div>:
        topP.slice(0,6).map(([p,c],i)=><div key={p} style={{display:"flex",alignItems:"center",gap:3,marginBottom:2}}>
          <span style={{fontSize:8,color:i<3?"#10B981":"#475569",width:10}}>{i+1}</span>
          <span style={{fontSize:9,color:"#e2e8f0",flex:1}}>{p}</span>
          <div style={{width:50,height:6,background:"#0a1020",borderRadius:3}}><div style={{width:`${(c/topP[0][1])*100}%`,height:"100%",borderRadius:3,background:i<3?"#10B981":"#1e293b"}}/></div>
          <span style={{fontFamily:"'JetBrains Mono'",fontSize:7,color:"#475569"}}>{c}</span>
        </div>)}
        {/* Follow-ups */}
        <div style={{fontSize:10,fontWeight:700,color:"#F59E0B",marginTop:8,marginBottom:4}}>📅 Relances en attente ({followUpsDue.length})</div>
        {followUpsDue.slice(0,5).map(p=>{const seq=SEQUENCES.find(s=>s.id===p.seq);const step=seq?.steps[p.seqStep];return <div key={p.id} onClick={()=>{setSel(p);setVw("agent");}} style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:"4px 8px",marginBottom:2,cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontSize:9}}>{FL[p.co]}{p.nm}</span>
          <span style={{fontSize:8,color:"#F59E0B"}}>{step?.label} (J+{step?.day})</span>
        </div>;})}
      </div>}

      {/* ═══ AUTO ═══ */}
      {vw==="auto"&&<div style={{padding:"8px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        <div style={{background:autoOn?"#0f172a":"#080d17",borderRadius:8,border:autoOn?"1px solid #F59E0B44":"1px solid #1a2332",padding:10,marginBottom:6}}>
          <div style={{fontSize:12,fontWeight:800,color:autoOn?"#F59E0B":"#e2e8f0",marginBottom:6}}>🚀 Agent Autonome + Séquences</div>
          {!autoOn&&<>
            <div style={{display:"flex",gap:2,marginBottom:4}}>{["email","whatsapp","instagram"].map(c=><button key={c} onClick={()=>setACh(c)} style={{flex:1,padding:5,borderRadius:5,fontSize:9,fontWeight:600,cursor:"pointer",background:autoCh===c?(c==="email"?"#2563EB":c==="whatsapp"?"#16a34a":"#db2777"):"#080d17",color:autoCh===c?"#fff":"#475569",border:autoCh===c?"none":"1px solid #1a2332"}}>{c==="email"?"📧":c==="whatsapp"?"💬":"📸"}</button>)}</div>
            <div style={{display:"flex",gap:2,marginBottom:4}}>{[{v:"all",l:`🎯 Tous (${db.filter(p=>!["client","lost"].includes(p.st)).length})`},{v:"mol",l:`🧪 Mol. (${db.filter(p=>p.ml&&p.st!=="client").length})`},{v:"hi",l:`⚡ 85+ (${db.filter(p=>calcScore(p)>=85&&p.st!=="client").length})`}].map(f=><button key={f.v} onClick={()=>setATgt(f.v)} style={{flex:1,padding:4,borderRadius:5,fontSize:8,fontWeight:600,cursor:"pointer",background:autoTgt===f.v?"#10B98122":"#080d17",color:autoTgt===f.v?"#10B981":"#475569",border:"1px solid #1a2332"}}>{f.l}</button>)}</div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:6}}><span style={{fontSize:8,color:"#64748b"}}>⏱️</span><input type="range" min={2} max={30} value={autoSpd} onChange={e=>setASpd(+e.target.value)} style={{flex:1,accentColor:"#10B981"}}/><span style={{fontFamily:"'JetBrains Mono'",fontSize:9,color:"#10B981"}}>{autoSpd}s</span></div>
            <div style={{fontSize:8,color:"#475569",marginBottom:6}}>Séquence auto: {db.some(p=>p.ml)?"Molécules (5 étapes)":"Standard (5 étapes)"} — relances J+0, J+3, J+7, J+14, J+30</div>
          </>}
          <button onClick={autoOn?()=>{autoRef.current=false;setAutoOn(false);}:startAuto} style={{width:"100%",padding:10,borderRadius:8,fontSize:13,fontWeight:900,cursor:"pointer",background:autoOn?"#EF4444":"linear-gradient(135deg,#F59E0B,#D97706)",color:autoOn?"#fff":"#000",border:"none"}}>{autoOn?"⏹️ ARRÊTER":"🚀 LANCER"}</button>
        </div>
        <div style={{display:"flex",gap:2,marginBottom:6}}>{[{l:"Envoyés",v:autoSt.sent,c:"#3B82F6"},{l:"🔥",v:autoSt.hot,c:"#EF4444"},{l:"💰",v:autoSt.ready,c:"#10B981"},{l:"❌",v:autoSt.err,c:"#64748b"}].map((s,i)=><div key={i} style={{flex:1,background:"#080d17",borderRadius:5,border:"1px solid #1a2332",padding:"3px",textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono'",fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontSize:6,color:"#475569"}}>{s.l}</div></div>)}</div>
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:6,maxHeight:250,overflowY:"auto"}}>{autoLog.slice(0,30).map((l,i)=><div key={i} style={{fontSize:8,color:l.startsWith("✅")?"#10B981":l.startsWith("❌")?"#EF4444":"#94a3b8",padding:"2px 0",borderBottom:"1px solid #0d1520"}}>{l}</div>)}</div>
      </div>}

      {/* ═══ AGENT CHAT ═══ */}
      {vw==="agent"&&<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 72px)"}}>
        <div style={{padding:"4px 10px",display:"flex",gap:2,borderBottom:"1px solid #1a2332",alignItems:"center"}}>
          {["email","whatsapp","instagram"].map(c=><button key={c} onClick={()=>setCh(c)} style={{padding:"3px 6px",borderRadius:4,fontSize:8,fontWeight:600,cursor:"pointer",background:ch===c?(c==="email"?"#2563EB":c==="whatsapp"?"#16a34a":"#db2777"):"transparent",color:ch===c?"#fff":"#475569",border:ch===c?"none":"1px solid #1a2332"}}>{c==="email"?"📧":c==="whatsapp"?"💬":"📸"}</button>)}
          <select value={sel?.id||""} onChange={e=>{setSel(db.find(p=>p.id===+e.target.value)||null);setChat([]);}} style={{...fs,flex:1,fontSize:8}}><option value="">Prospect...</option>{db.sort((a,b)=>calcScore(b)-calcScore(a)).map(p=><option key={p.id} value={p.id}>{FL[p.co]||"🌍"}{p.nm}[{calcScore(p)}]</option>)}</select>
        </div>
        {sel&&<div style={{padding:"2px 10px",background:"#0f172a",borderBottom:"1px solid #1a2332",fontSize:7,color:"#475569",display:"flex",justifyContent:"space-between"}}>
          <span><strong style={{color:"#e2e8f0"}}>{sel.nm}</strong> • {LANG_NAMES[LANG_MAP[sel.co]||"en"]} • {SEGMENTS[sel.sg]?.label||sel.sg} • {sel.ints.length}💬</span>
          <div style={{display:"flex",gap:2}}>
            {sel.em&&ch==="email"&&<button onClick={()=>openE(sel.em,"Partenariat CBD — Geosiste",chat.filter(m=>m.role==="assistant").pop()?.content||"")} style={{background:"#2563EB33",color:"#60a5fa",border:"none",borderRadius:3,padding:"0px 4px",fontSize:6,cursor:"pointer"}}>📧Envoyer</button>}
            {ch==="whatsapp"&&<button onClick={()=>openW(sel.wa||waNum||"",chat.filter(m=>m.role==="assistant").pop()?.content||"")} style={{background:"#16a34a33",color:"#4ade80",border:"none",borderRadius:3,padding:"0px 4px",fontSize:6,cursor:"pointer"}}>💬Envoyer</button>}
          </div>
        </div>}
        <div style={{flex:1,overflowY:"auto",padding:"6px 10px"}}>
          {chat.length===0&&<div style={{textAlign:"center",marginTop:20}}>
            <div style={{fontSize:28,marginBottom:4}}>🤖</div>
            <div style={{fontSize:11,fontWeight:700,color:"#10B981",marginBottom:6}}>Agent Geosiste</div>
            <div style={{fontSize:8,color:"#475569",marginBottom:8}}>50 produits • Multi-langue auto • Détection Pinaca • Segmentation</div>
            {["Rédige un pitch "+(ch)+" pour "+(sel?.nm||"un prospect"),"Compare Beldia CSA et Ice O Lator CSA","Prix de nos Grenade Vape 10-OH ?","Ce hash à 0.20€/g ultra puissant, safe ?","Quels produits pour un buraliste ?"].map((q,i)=><button key={i} onClick={()=>send(q)} style={{display:"block",width:"100%",padding:"6px 8px",marginBottom:2,borderRadius:6,background:"#080d17",border:"1px solid #1a2332",color:"#94a3b8",fontSize:9,cursor:"pointer",textAlign:"left"}}>{q}</button>)}
          </div>}
          {chat.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:4}}>
            <div style={{maxWidth:"85%",padding:"7px 10px",borderRadius:10,background:m.role==="user"?"#10B981":"#080d17",color:m.role==="user"?"#000":"#e2e8f0",border:m.role==="user"?"none":"1px solid #1a2332",fontSize:11,lineHeight:1.5,whiteSpace:"pre-wrap",borderBottomRightRadius:m.role==="user"?2:10,borderBottomLeftRadius:m.role==="user"?10:2}}>{m.content}</div>
          </div>)}
          {ld&&<div style={{display:"flex",gap:3,padding:6}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#10B981",animation:`pulse 1s ${i*.2}s infinite`}}/>)}</div>}
          <div ref={chatEnd}/>
        </div>
        <div style={{padding:"5px 10px 8px",borderTop:"1px solid #1a2332",display:"flex",gap:3}}>
          <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(inp)} placeholder="Message..." style={{flex:1,padding:"8px 10px",borderRadius:8,background:"#080d17",border:"1px solid #1a2332",color:"#e2e8f0",fontSize:11,outline:"none"}}/>
          <button onClick={()=>send(inp)} disabled={ld} style={{padding:"8px 12px",borderRadius:8,background:ld?"#1a2332":"#10B981",color:ld?"#475569":"#000",border:"none",fontWeight:800,cursor:ld?"wait":"pointer",fontSize:13}}>→</button>
        </div>
      </div>}

      {/* ═══ CRM ═══ */}
      {vw==="crm"&&<div style={{padding:"6px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        <div style={{display:"flex",gap:2,marginBottom:3}}>
          <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="🔍" style={{...fs,flex:1}}/>
          <button onClick={()=>setFM(!fM)} style={{...fs,background:fM?"#eab30822":"#080d17",color:fM?"#eab308":"#475569",cursor:"pointer"}}>🧪</button>
          <select value={fS} onChange={e=>setFS(e.target.value)} style={{...fs,width:55}}><option value="all">Statut</option>{STS.map(s=><option key={s.v} value={s.v}>{s.i}</option>)}</select>
          <select value={fC} onChange={e=>setFC(e.target.value)} style={{...fs,width:55}}><option value="all">🌍</option>{COUNTRIES.map(c=><option key={c} value={c}>{FL[c]||""}</option>)}</select>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
          <span style={{fontSize:8,color:"#475569"}}>{filtered.length}/{db.length}</span>
          <button onClick={()=>setShowAdd(!showAdd)} style={{padding:"2px 6px",borderRadius:4,background:showAdd?"#EF444422":"#10B98122",color:showAdd?"#EF4444":"#10B981",border:"none",fontSize:8,fontWeight:700,cursor:"pointer"}}>{showAdd?"✕":"+ Ajouter"}</button>
        </div>
        {showAdd&&<div style={{background:"#0f172a",borderRadius:6,border:"1px solid #10B98133",padding:8,marginBottom:4}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
            <input value={af.nm} onChange={e=>setAf(p=>({...p,nm:e.target.value}))} placeholder="Nom *" style={{...fs,fontSize:8,gridColumn:"1/3"}}/>
            <input value={af.co} onChange={e=>setAf(p=>({...p,co:e.target.value}))} placeholder="Pays" style={{...fs,fontSize:8}}/>
            <input value={af.ct} onChange={e=>setAf(p=>({...p,ct:e.target.value}))} placeholder="Ville" style={{...fs,fontSize:8}}/>
            <input value={af.em} onChange={e=>setAf(p=>({...p,em:e.target.value}))} placeholder="Email" style={{...fs,fontSize:8}}/>
            <input value={af.ph} onChange={e=>setAf(p=>({...p,ph:e.target.value}))} placeholder="Téléphone" style={{...fs,fontSize:8}}/>
            <input value={af.web} onChange={e=>setAf(p=>({...p,web:e.target.value}))} placeholder="Site" style={{...fs,fontSize:8}}/>
            <input value={af.wa} onChange={e=>setAf(p=>({...p,wa:e.target.value}))} placeholder="WhatsApp" style={{...fs,fontSize:8}}/>
            <input value={af.ig} onChange={e=>setAf(p=>({...p,ig:e.target.value}))} placeholder="Instagram" style={{...fs,fontSize:8}}/>
            <input value={af.li} onChange={e=>setAf(p=>({...p,li:e.target.value}))} placeholder="LinkedIn" style={{...fs,fontSize:8}}/>
            <input value={af.tp} onChange={e=>setAf(p=>({...p,tp:e.target.value}))} placeholder="Type" style={{...fs,fontSize:8}}/>
            <input value={af.pr} onChange={e=>setAf(p=>({...p,pr:e.target.value}))} placeholder="Produits (CBD,CSA...)" style={{...fs,fontSize:8,gridColumn:"1/3"}}/>
          </div>
          <button onClick={addP} style={{width:"100%",marginTop:4,padding:5,borderRadius:5,background:af.nm?"#10B981":"#1a2332",color:af.nm?"#000":"#475569",border:"none",fontSize:9,fontWeight:700,cursor:af.nm?"pointer":"not-allowed"}}>✅ Ajouter</button>
        </div>}
        {filtered.map(p=>{const s=STS.find(x=>x.v===p.st)||STS[0];const isO=sel?.id===p.id;const dsc=calcScore(p);
        return <div key={p.id} onClick={()=>setSel(isO?null:p)} style={{background:"#080d17",borderRadius:6,border:isO?"1px solid #10B981":"1px solid #1a2332",padding:"6px 8px",marginBottom:3,cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              <span style={{fontSize:10}}>{FL[p.co]||"🌍"}</span>
              <div><div style={{fontWeight:700,fontSize:10}}>{p.nm}{p.ml&&<span style={{fontSize:6,color:"#eab308",marginLeft:2}}>🧪</span>}</div>
              <div style={{fontSize:7,color:"#475569"}}>{p.tp}{p.ct?` • ${p.ct}`:""} • {LANG_NAMES[LANG_MAP[p.co]||"en"]}</div></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1}}>
              <div style={{display:"flex",gap:2,alignItems:"center"}}>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:8,fontWeight:700,color:dsc>=85?"#10B981":dsc>=70?"#F59E0B":"#64748b"}}>{dsc}</span>
                <span style={{fontSize:7,color:s.c,background:s.c+"15",padding:"0px 3px",borderRadius:4}}>{s.i}</span>
              </div>
              {p.revenue>0&&<span style={{fontSize:7,color:"#10B981",fontWeight:600}}>{p.revenue.toLocaleString()}€</span>}
            </div>
          </div>
          {isO&&<div style={{marginTop:4,paddingTop:4,borderTop:"1px solid #1a2332"}}>
            {/* CONTACT CARD */}
            {editId!==p.id?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 6px",fontSize:8,color:"#64748b",marginBottom:3}}>
              <div>🌐 <span style={{color:"#60a5fa"}}>{p.web||"—"}</span></div><div>📧 {p.em||"—"}</div>
              <div>📞 {p.ph||"—"}</div><div>💬 {p.wa||"—"}</div>
              <div>📸 {p.ig?`@${p.ig}`:"—"}</div><div>🔗 {p.li||"—"}</div>
              <div>📏 {p.sz} | 💰 {p.ca}</div><div>🎯 {SEGMENTS[p.sg]?.label||"—"}</div>
              <div style={{gridColumn:"1/3"}}>📅 Dernier contact: <strong style={{color:p.last?"#e2e8f0":"#EF4444"}}>{p.last||"Jamais"}</strong></div>
            </div>:
            /* EDIT MODE */
            <div style={{background:"#0f172a",borderRadius:4,padding:6,marginBottom:3,border:"1px solid #10B98133"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
                {[{k:"em",ph:"Email"},{k:"ph",ph:"Téléphone"},{k:"wa",ph:"WhatsApp"},{k:"ig",ph:"Instagram"},{k:"li",ph:"LinkedIn"},{k:"web",ph:"Site web"}].map(f=>
                  <input key={f.k} defaultValue={p[f.k]||""} placeholder={f.ph} onBlur={e=>editField(p.id,f.k,e.target.value)} style={{...fs,fontSize:7,padding:"3px 5px"}}/>
                )}
                <select defaultValue={p.sz} onChange={e=>editField(p.id,"sz",e.target.value)} style={{...fs,fontSize:7,padding:"3px"}}>{SIZES.map(s=><option key={s}>{s}</option>)}</select>
                <select defaultValue={p.ca} onChange={e=>editField(p.id,"ca",e.target.value)} style={{...fs,fontSize:7,padding:"3px"}}>{CA_R.map(c=><option key={c}>{c}</option>)}</select>
                <textarea defaultValue={p.nt||""} placeholder="Notes..." onBlur={e=>editField(p.id,"nt",e.target.value)} style={{...fs,gridColumn:"1/3",height:30,resize:"vertical",fontSize:7,boxSizing:"border-box"}}/>
              </div>
              <button onClick={e=>{e.stopPropagation();setEditId(null);}} style={{width:"100%",marginTop:3,padding:3,borderRadius:3,background:"#10B981",color:"#000",border:"none",fontSize:7,fontWeight:700,cursor:"pointer"}}>✅ OK</button>
            </div>}
            <div style={{display:"flex",gap:2,marginBottom:3}}>
              {editId!==p.id&&<button onClick={e=>{e.stopPropagation();setEditId(p.id);}} style={{padding:"2px 5px",borderRadius:3,background:"#1a233288",color:"#94a3b8",border:"1px solid #1a2332",fontSize:6,cursor:"pointer"}}>✏️ Modifier</button>}
            </div>
            {p.seq&&<div style={{fontSize:7,color:"#F59E0B",marginBottom:2}}>📋 Séquence: {SEQUENCES.find(s=>s.id===p.seq)?.name} — Étape {p.seqStep+1}/{SEQUENCES.find(s=>s.id===p.seq)?.steps.length}</div>}
            {Object.keys(p.pi).length>0&&<div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:2}}>{Object.entries(p.pi).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([k,v])=><span key={k} style={{background:"#10B98115",color:"#10B981",padding:"0px 4px",borderRadius:4,fontSize:7}}>⭐{k}×{v}</span>)}</div>}
            {/* INTERACTIONS */}
            {p.ints.length>0&&<div style={{marginBottom:2}}>
              <div style={{fontSize:7,color:"#475569",marginBottom:1}}>📜 {p.ints.length} interactions</div>
              <div style={{maxHeight:60,overflowY:"auto"}}>{p.ints.slice().reverse().slice(0,5).map((int,i)=><div key={i} style={{fontSize:7,color:"#64748b",display:"flex",gap:2,alignItems:"center",borderBottom:"1px solid #0d1520",padding:"1px 0"}}>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:6,color:"#334155"}}>{int.t}</span>
                <span>{int.ch==="email"?"📧":int.ch==="whatsapp"?"💬":"📸"}</span>
                {int.intent==="outbound"&&<span style={{fontSize:6,color:"#F59E0B"}}>🤖</span>}
                <span style={{flex:1,color:int.intent==="ready_to_order"?"#10B981":"#94a3b8"}}>{int.notes}</span>
                {int.autoMsg&&<button onClick={e=>{e.stopPropagation();navigator.clipboard?.writeText(int.autoMsg);}} style={{background:"#1a2332",color:"#94a3b8",border:"none",borderRadius:2,padding:"0px 3px",fontSize:5,cursor:"pointer"}}>📋</button>}
              </div>)}</div>
            </div>}
            {p.orders.length>0&&<div style={{marginBottom:2}}><div style={{fontSize:7,color:"#06B6D4",fontWeight:600}}>💶 {p.orders.length} commandes — {p.revenue.toLocaleString()}€</div></div>}
            {p.nt&&editId!==p.id&&<div style={{fontSize:7,color:"#94a3b8",marginBottom:2,borderLeft:"2px solid #10B981",paddingLeft:4}}>💡 {p.nt}</div>}
            {/* ACTIONS */}
            <div style={{display:"flex",gap:2,marginTop:2}}>
              <button title="Ouvrir le chat IA" onClick={e=>{e.stopPropagation();setSel(p);setChat([]);setVw("agent");}} style={{flex:1,padding:4,borderRadius:4,background:"#10B98118",color:"#10B981",border:"1px solid #10B98122",fontSize:7,fontWeight:700,cursor:"pointer"}}>🤖 Chat</button>
              <button title="Enregistrer une commande" onClick={e=>{e.stopPropagation();setShowOrder(p.id);}} style={{padding:"4px 5px",borderRadius:4,background:"#06B6D418",color:"#06B6D4",border:"1px solid #06B6D422",fontSize:7,fontWeight:700,cursor:"pointer"}}>💶</button>
              {p.em&&<button title="Envoyer un email" onClick={e=>{e.stopPropagation();openE(p.em,"Partenariat CBD — Geosiste","");}} style={{padding:"4px 5px",borderRadius:4,background:"#2563EB18",color:"#60a5fa",border:"none",fontSize:7,cursor:"pointer"}}>📧</button>}
              {p.wa&&<button title="Ouvrir WhatsApp" onClick={e=>{e.stopPropagation();openW(p.wa,"");}} style={{padding:"4px 5px",borderRadius:4,background:"#16a34a18",color:"#4ade80",border:"none",fontSize:7,cursor:"pointer"}}>💬</button>}
              {p.ig&&<button title="Ouvrir Instagram" onClick={e=>{e.stopPropagation();openI(p.ig);}} style={{padding:"4px 5px",borderRadius:4,background:"#db277718",color:"#f472b6",border:"none",fontSize:7,cursor:"pointer"}}>📸</button>}
              {p.li&&<button title="Ouvrir LinkedIn" onClick={e=>{e.stopPropagation();openL(p.li);}} style={{padding:"4px 5px",borderRadius:4,background:"#0A66C218",color:"#0A66C2",border:"none",fontSize:7,cursor:"pointer"}}>🔗</button>}
              <button title="Supprimer ce prospect" onClick={e=>{e.stopPropagation();delP(p.id);}} style={{padding:"4px 5px",borderRadius:4,background:"#EF444418",color:"#EF4444",border:"none",fontSize:7,cursor:"pointer"}}>🗑️</button>
            </div>
            {showOrder===p.id&&<div style={{marginTop:4,background:"#0f172a",borderRadius:4,padding:6,border:"1px solid #06B6D433"}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:8,color:"#06B6D4",fontWeight:700,marginBottom:3}}>💶 Nouvelle commande</div>
              <input value={orderForm.products} onChange={e=>setOF(q=>({...q,products:e.target.value}))} placeholder="Produits commandés" style={{...fs,width:"100%",fontSize:8,marginBottom:2,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:2}}>
                <input value={orderForm.amount} onChange={e=>setOF(q=>({...q,amount:e.target.value}))} placeholder="Montant €" type="number" style={{...fs,flex:1,fontSize:8}}/>
                <input value={orderForm.date} onChange={e=>setOF(q=>({...q,date:e.target.value}))} placeholder="Date" type="date" style={{...fs,flex:1,fontSize:8}}/>
              </div>
              <button onClick={()=>addOrder(p.id)} style={{width:"100%",marginTop:3,padding:4,borderRadius:4,background:"#06B6D4",color:"#000",border:"none",fontSize:8,fontWeight:700,cursor:"pointer"}}>✅ Enregistrer</button>
            </div>}
          </div>}
        </div>;})}
      </div>}

      {/* ═══ MAP ═══ */}
      {vw==="map"&&<div style={{padding:"8px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#e2e8f0",marginBottom:6}}>🗺️ Carte Europe — {db.length} prospects</div>
        <div style={{position:"relative",width:"100%",aspectRatio:"4/3",background:"#080d17",borderRadius:8,border:"1px solid #1a2332",overflow:"hidden"}}>
          {/* Simple SVG Europe map */}
          <svg viewBox="0 0 400 320" style={{width:"100%",height:"100%"}}>
            <rect width="400" height="320" fill="#080d17"/>
            {/* Simplified Europe coastline */}
            <path d="M120,40 L180,30 L220,50 L260,35 L300,45 L320,60 L310,90 L330,100 L340,130 L320,160 L330,180 L310,200 L280,210 L260,240 L240,260 L220,250 L200,270 L180,260 L160,280 L140,260 L120,240 L100,220 L90,200 L100,180 L80,160 L90,130 L80,110 L100,80 L110,60Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1"/>
            {/* Country dots */}
            {Object.entries(GEO).map(([country,[lat,lng]])=>{
              const x=200+(lng*6);const y=280-(lat-35)*6;
              const prospects=db.filter(p=>p.co===country);
              const hasHot=prospects.some(p=>["hot","ready"].includes(p.st));
              const hasClient=prospects.some(p=>p.st==="client");
              const color=hasClient?"#06B6D4":hasHot?"#EF4444":prospects.length>0?"#10B981":"#334155";
              const size=Math.max(4,Math.min(12,prospects.length*2));
              return prospects.length>0?<g key={country}>
                <circle cx={x} cy={y} r={size} fill={color} opacity={0.3}/>
                <circle cx={x} cy={y} r={size/2} fill={color}/>
                <text x={x} y={y-size-2} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="Outfit">{FL[country]} {prospects.length}</text>
              </g>:null;
            })}
          </svg>
        </div>
        <div style={{marginTop:6,display:"flex",gap:6,justifyContent:"center",fontSize:8,color:"#475569"}}>
          <span><span style={{color:"#10B981"}}>●</span> Prospect</span>
          <span><span style={{color:"#EF4444"}}>●</span> Chaud</span>
          <span><span style={{color:"#06B6D4"}}>●</span> Client</span>
        </div>
        {/* Country list */}
        <div style={{marginTop:8}}>
          {Object.entries(GEO).filter(([c])=>db.some(p=>p.co===c)).sort((a,b)=>db.filter(p=>p.co===b[0]).length-db.filter(p=>p.co===a[0]).length).map(([country])=>{
            const ps=db.filter(p=>p.co===country);const rev=ps.reduce((a,p)=>a+p.revenue,0);
            return <div key={country} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:"1px solid #0d1520"}}>
              <span style={{fontSize:10}}>{FL[country]} {country} <span style={{color:"#475569",fontSize:8}}>({ps.length})</span></span>
              <div style={{display:"flex",gap:4,fontSize:8}}>
                {ps.some(p=>p.st==="client")&&<span style={{color:"#06B6D4"}}>{ps.filter(p=>p.st==="client").length}✅</span>}
                {ps.some(p=>["hot","ready"].includes(p.st))&&<span style={{color:"#EF4444"}}>{ps.filter(p=>["hot","ready"].includes(p.st)).length}🔥</span>}
                {rev>0&&<span style={{color:"#10B981",fontWeight:600}}>{rev.toLocaleString()}€</span>}
              </div>
            </div>;
          })}
        </div>
      </div>}

      {/* ═══ PRODUCTS ═══ */}
      {vw==="prods"&&<div style={{padding:"8px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#e2e8f0",marginBottom:6}}>🛒 Catalogue ({CAT.length})</div>
        {topP.length>0&&<div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:6,marginBottom:6}}>
          <div style={{fontSize:9,fontWeight:700,color:"#F59E0B",marginBottom:3}}>⭐ Plus demandés</div>
          {topP.slice(0,4).map(([p,c],i)=><div key={p} style={{fontSize:8,color:"#94a3b8"}}>{i+1}. {p} <span style={{color:"#10B981"}}>×{c}</span></div>)}
        </div>}
        {[...new Set(CAT.map(p=>p.c))].map(cat=><div key={cat}>
          <div style={{fontSize:10,fontWeight:700,color:"#10B981",marginTop:6,marginBottom:3}}>{cat}</div>
          {CAT.filter(p=>p.c===cat).map(p=><div key={p.r} style={{background:"#080d17",borderRadius:5,border:"1px solid #1a2332",padding:"4px 6px",marginBottom:2}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div><span style={{fontWeight:600,fontSize:9,color:"#e2e8f0"}}>{p.n}</span> <span style={{fontSize:7,color:["CSA","MCP-N","10-OH"].includes(p.m)?"#F59E0B":"#475569"}}>{p.m}</span></div>
              <span style={{fontFamily:"'JetBrains Mono'",fontSize:9,fontWeight:700,color:"#10B981"}}>{p.p}€</span>
            </div>
            {p.v.length>0&&<div style={{display:"flex",gap:1,marginTop:2,flexWrap:"wrap"}}>{p.v.map(v=><span key={v} style={{background:"#1a2332",color:"#94a3b8",padding:"0px 4px",borderRadius:3,fontSize:6}}>{v}</span>)}</div>}
          </div>)}
        </div>)}
      </div>}

      {/* ═══ CONNECT ═══ */}
      {vw==="connect"&&<div style={{padding:"8px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#e2e8f0",marginBottom:6}}>🔗 Connexions & API</div>
        {/* SUPABASE */}
        <div style={{background:"#080d17",borderRadius:6,border:`1px solid ${supaOk?"#10B98133":"#EF444433"}`,padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3B82F6",marginBottom:3}}>🗄️ Supabase — Base de données</div>
          <div style={{fontSize:8,padding:"4px 8px",borderRadius:4,background:supaOk?"#052e16":"#450a0a",color:supaOk?"#4ade80":"#fca5a5",marginBottom:4}}>
            {supaMsg}
          </div>
          <div style={{fontSize:7,color:"#475569",lineHeight:1.5}}>
            {SUPA_READY?<>
              <strong style={{color:"#60a5fa"}}>URL:</strong> {SUPABASE_URL.substring(0,40)}...<br/>
              <strong>Sauvegarde auto</strong> toutes les 2 secondes — prospects, interactions, alertes, config WhatsApp/Pappers.<br/>
              Les données sont <strong>persistantes</strong> — même si tu fermes le navigateur, tout est sauvegardé.
            </>:<>
              <strong style={{color:"#EF4444"}}>Non configuré</strong> — Les données se perdent à la fermeture.<br/>
              Pour activer : ouvre le fichier <code style={{background:"#1a2332",padding:"0 3px",borderRadius:2}}>App.jsx</code> et remplace <code style={{background:"#1a2332",padding:"0 3px",borderRadius:2}}>SUPABASE_URL</code> et <code style={{background:"#1a2332",padding:"0 3px",borderRadius:2}}>SUPABASE_KEY</code> par tes vraies valeurs (voir guide ci-dessous).
            </>}
          </div>
        </div>
        {/* EMAIL */}
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#2563EB",marginBottom:3}}>📧 Email / Gmail</div>
          <div style={{fontSize:7,color:"#475569",lineHeight:1.5}}>
            <strong style={{color:"#60a5fa"}}>✅ Connecté automatiquement</strong> — Quand vous cliquez 📧 sur une fiche CRM ou dans le chat, votre client mail s'ouvre (Gmail, Outlook, Apple Mail) avec le destinataire, l'objet et le message pré-rempli par l'agent IA.<br/>
            L'email part depuis <strong>votre adresse</strong>. Rien à configurer.
          </div>
        </div>
        {/* WHATSAPP */}
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#16a34a",marginBottom:3}}>💬 WhatsApp Business + Alertes</div>
          <input value={waNum} onChange={e=>setWaNum(e.target.value)} placeholder="Votre numéro WhatsApp (ex: 33664989889)" style={{width:"100%",...fs,marginBottom:3,boxSizing:"border-box"}}/>
          <div style={{fontSize:7,color:"#475569",lineHeight:1.5}}>
            {waNum?<strong style={{color:"#4ade80"}}>✅ Connecté — Alertes WhatsApp activées</strong>:<strong style={{color:"#EF4444"}}>❌ Non connecté — Entrez votre numéro</strong>}<br/>
            <strong>Alertes auto</strong> : Quand un prospect est 💰 prêt, 🔥 chaud, ou ⚠️ Pinaca → notification WhatsApp instantanée sur votre téléphone.<br/>
            <strong>Envoi</strong> : Cliquez 💬 sur une fiche CRM → WhatsApp s'ouvre avec le message pré-rempli pour le prospect.<br/>
            Format: code pays + numéro sans espaces (ex: 33664989889)
          </div>
        </div>
        {/* INSTAGRAM */}
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#db2777",marginBottom:3}}>📸 Instagram</div>
          <div style={{fontSize:7,color:"#475569",lineHeight:1.5}}>
            <strong style={{color:"#f472b6"}}>✅ Connecté automatiquement</strong> — Renseignez le @ Instagram de chaque prospect dans sa fiche CRM (✏️ Modifier).<br/>
            Cliquez 📸 sur la fiche → ouvre le profil Instagram du prospect pour envoyer un DM.<br/>
            L'agent IA génère des messages courts adaptés au format Instagram (200 car. max, emojis, accrocheur).<br/>
            <strong>Votre compte</strong> : @lentrepot_du_chanvrier
          </div>
        </div>
        {/* LINKEDIN */}
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#0A66C2",marginBottom:3}}>🔗 LinkedIn</div>
          <div style={{fontSize:7,color:"#475569",lineHeight:1.5}}>
            <strong style={{color:"#3B82F6"}}>✅ Connecté automatiquement</strong> — Ajoutez l'URL ou le nom LinkedIn de chaque prospect dans sa fiche CRM (✏️ Modifier).<br/>
            Formats: <code style={{background:"#1a2332",padding:"0 3px",borderRadius:2}}>linkedin.com/company/nom</code> ou simplement <code style={{background:"#1a2332",padding:"0 3px",borderRadius:2}}>nom-entreprise</code><br/>
            Cliquez 🔗 sur la fiche → ouvre la page LinkedIn pour envoyer un InMail ou une demande de connexion.
          </div>
        </div>
        {/* PAPPERS */}
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#F59E0B",marginBottom:3}}>🏛️ Pappers API — Registre entreprises FR</div>
          <input value={pKey} onChange={e=>setPK(e.target.value)} placeholder="Clé API Pappers (gratuite sur pappers.fr/api)" style={{width:"100%",...fs,marginBottom:3,boxSizing:"border-box"}}/>
          <div style={{fontSize:7,color:"#475569",lineHeight:1.5,marginBottom:3}}>
            {pKey?<strong style={{color:"#4ade80"}}>✅ Clé API renseignée</strong>:<strong style={{color:"#EF4444"}}>❌ Non connecté — Créez un compte gratuit sur pappers.fr/api</strong>}<br/>
            Recherche automatique d'entreprises CBD en France par mot-clé. ~17 000 entreprises code NAF 4776Z. 100 requêtes/mois gratuit.
          </div>
          {pKey&&<div style={{display:"flex",gap:2,marginBottom:3,flexWrap:"wrap"}}>{["CBD","chanvre","cannabidiol","hemp","chanvrier"].map(q=><button key={q} onClick={()=>searchP(q)} style={{...fs,cursor:"pointer",background:"#F59E0B12",color:"#F59E0B",border:"1px solid #F59E0B22",fontWeight:600,fontSize:8}}>🔍 {q}</button>)}</div>}
          {pRes&&<div style={{fontSize:8,color:pRes.startsWith("✅")?"#10B981":"#EF4444",marginBottom:3}}>{pRes}</div>}
        </div>
        {/* CSV IMPORT */}
        <div style={{background:"#080d17",borderRadius:6,border:"1px solid #1a2332",padding:8,marginBottom:4}}>
          <div style={{fontSize:10,fontWeight:700,color:"#3B82F6",marginBottom:3}}>📄 Import CSV</div>
          <div style={{fontSize:7,color:"#475569",marginBottom:3}}>Format: <code style={{background:"#1a2332",padding:"0 3px",borderRadius:2}}>nom;pays;ville;site;email;produits;notes</code></div>
          <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} placeholder={"Green CBD;France;Paris;greencbd.fr;contact@greencbd.fr;Fleurs,CSA;Boutique\nHemp Store;Allemagne;Berlin;hempstore.de;info@hempstore.de;Huiles;Grossiste"} style={{width:"100%",height:50,...fs,resize:"vertical",fontFamily:"'JetBrains Mono'",fontSize:7,boxSizing:"border-box"}}/>
          <button onClick={importCSV} style={{width:"100%",marginTop:3,padding:5,borderRadius:5,background:csvText.trim()?"#3B82F6":"#1a2332",color:csvText.trim()?"#fff":"#475569",border:"none",fontSize:8,fontWeight:700,cursor:csvText.trim()?"pointer":"not-allowed"}}>📥 Importer CSV</button>
        </div>
        {/* EXPORT */}
        <button onClick={()=>{const h="Nom;Pays;Ville;Site;Email;Tél;WhatsApp;Instagram;LinkedIn;Produits;Score;Statut;Segment;Interactions;Revenue;Séquence\n";const csv=db.map(p=>[p.nm,p.co,p.ct,p.web,p.em,p.ph||"",p.wa,p.ig,p.li,p.pr.join(","),calcScore(p),p.st,p.sg,p.ints.length,p.revenue,p.seq?`Seq${p.seq} step${p.seqStep}`:"—"].join(";")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+h+csv],{type:"text/csv"}));a.download="geosiste_crm.csv";a.click();}} style={{width:"100%",padding:8,borderRadius:6,background:"#10B981",color:"#000",border:"none",fontWeight:700,fontSize:10,cursor:"pointer"}}>💾 Exporter CRM complet ({db.length} prospects)</button>
      </div>}

      {/* ═══ ALERTS ═══ */}
      {vw==="alerts"&&<div style={{padding:"8px 10px",height:"calc(100vh - 72px)",overflowY:"auto"}}>
        <div style={{fontSize:12,fontWeight:800,color:"#e2e8f0",marginBottom:4}}>🔔 Alertes ({alerts.length})</div>
        {alerts.length===0&&<div style={{textAlign:"center",marginTop:20,color:"#475569",fontSize:9}}>💰 Prêt à commander | 🔥 Très intéressé | ⚠️ Pinaca</div>}
        {alerts.map(a=><div key={a.id} style={{background:a.read?"#080d17":"#0f172a",borderRadius:6,border:`1px solid ${a.type==="pinaca_alert"?"#dc262622":"#10B98122"}`,padding:6,marginBottom:2}}>
          <div style={{fontSize:9,fontWeight:700,color:a.type==="pinaca_alert"?"#ef4444":a.type==="ready_to_order"?"#10B981":"#F59E0B"}}>{a.msg}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
            <span style={{fontSize:7,color:"#475569"}}>{a.t}</span>
            <button onClick={()=>{setSel(db.find(x=>x.id===a.pid)||null);setChat([]);setVw("agent");setAlerts(p=>p.map(x=>x.id===a.id?{...x,read:true}:x));}} style={{padding:"2px 6px",borderRadius:3,background:"#10B98122",color:"#10B981",border:"none",fontSize:7,fontWeight:700,cursor:"pointer"}}>🖐️</button>
          </div>
        </div>)}
      </div>}

      <style>{`*{box-sizing:border-box}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#1a2332;border-radius:2px}input:focus,textarea:focus,select:focus{outline:none;border-color:#10B981!important}`}</style>
    </div>
  );
}
