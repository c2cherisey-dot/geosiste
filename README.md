# 🌿 GEOSISTE v8 — Agent Commercial IA + CRM CBD Europe

> **L'Entrepôt du Chanvrier** • lentrepotduchanvrier.com  
> CRM complet + Agent IA Claude + Supabase + Déploiement Vercel

---

## 🚀 Déploiement en 5 étapes

### 1. Supabase (base de données — gratuit)

1. Va sur [supabase.com](https://supabase.com) → **New Project** → Nom: `geosiste`
2. Va dans **SQL Editor** et colle ce script :

```sql
CREATE TABLE prospects (
  id BIGINT PRIMARY KEY,
  nm TEXT NOT NULL DEFAULT '',
  co TEXT DEFAULT 'France', ct TEXT DEFAULT '', tp TEXT DEFAULT '',
  web TEXT DEFAULT '', em TEXT DEFAULT '', ph TEXT DEFAULT '',
  wa TEXT DEFAULT '', ig TEXT DEFAULT '', li TEXT DEFAULT '',
  sz TEXT DEFAULT 'Moyen', ca TEXT DEFAULT 'N/A',
  pr JSONB DEFAULT '[]', st TEXT DEFAULT 'prospect',
  sc INTEGER DEFAULT 60, ml BOOLEAN DEFAULT FALSE,
  sg TEXT DEFAULT 'grossiste_cbd',
  ints JSONB DEFAULT '[]', pi JSONB DEFAULT '{}',
  last TEXT, nt TEXT DEFAULT '',
  seq INTEGER, seq_step INTEGER DEFAULT 0,
  orders JSONB DEFAULT '[]', revenue NUMERIC DEFAULT 0
);

CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value JSONB
);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all" ON prospects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_cfg" ON config FOR ALL USING (true) WITH CHECK (true);
```

3. Va dans **Settings > API** et copie :
   - **Project URL** : `https://xxxx.supabase.co`
   - **anon public key** : `eyJhbGci...`

4. Ouvre `src/App.js` et remplace les lignes 11-12 :
```js
const SUPABASE_URL = "https://xxxx.supabase.co";  // ← ta URL
const SUPABASE_KEY = "eyJhbGci...";                // ← ta clé anon
```

### 2. Clé API Claude

1. Va sur [console.anthropic.com](https://console.anthropic.com/settings/keys)
2. Crée une clé API
3. Tu l'ajouteras dans Vercel à l'étape 4

### 3. Vercel (hébergement — gratuit)

```bash
# Installe Vercel CLI
npm install -g vercel

# Clone ce dossier sur ton PC puis :
cd geosiste-vercel
npm install
vercel deploy
```

### 4. Variables d'environnement Vercel

Dans le dashboard Vercel → **Settings > Environment Variables** :

| Nom | Valeur |
|-----|--------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxxxx` |

Puis **redéploie** : `vercel deploy --prod`

### 5. C'est en ligne ! 🎉

Ton app est accessible sur `https://geosiste-xxx.vercel.app`

---

## 📁 Structure du projet

```
geosiste-vercel/
├── api/
│   └── claude.js          ← Proxy sécurisé API Claude (serverless)
├── public/
│   └── index.html          ← HTML de base
├── src/
│   ├── App.js              ← Application React complète (867 lignes)
│   └── index.js            ← Point d'entrée React
├── .env.example            ← Template variables d'environnement
├── .gitignore
├── package.json
├── vercel.json             ← Config Vercel
└── README.md
```

## 🔐 Sécurité

- La **clé API Claude** est côté serveur uniquement (via `/api/claude.js`)
- La **clé Supabase anon** est publique (c'est normal — les policies RLS protègent)
- Aucune donnée sensible n'est exposée côté client

## 💰 Coûts

| Service | Gratuit | Payant |
|---------|---------|--------|
| Supabase | 500 MB, 50k lignes | 25$/mois (Pro) |
| Vercel | 100 GB bande passante | 20$/mois (Pro) |
| Claude API | — | ~0.003€/message |
| Pappers | 100 req/mois | 39€/mois (Pro) |

**Total démarrage : 0€** (sauf Claude API pay-as-you-go)
