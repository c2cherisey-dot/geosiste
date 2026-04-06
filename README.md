# 🌿 GEOSISTE v9 — Agent Commercial IA + CRM CBD Europe

> **L'Entrepôt du Chanvrier** • lentrepotduchanvrier.com
> 13 modules • Multi-utilisateur • Notifications Push

---

## 🚀 Nouvelles fonctions v9

| # | Fonction | Module |
|---|----------|--------|
| 1 | **Connexion multi-email** | Config → Comptes Email |
| 2 | **Choix compte Instagram** | Config → Comptes Instagram |
| 3 | **Newsletter IA** avec sélection produits | 📰 Newsletter |
| 4 | **Templates messages** (8 inclus, FR/EN/DE) | 📝 Templates |
| 5 | **Historique envois** par prospect | 📨 Envois |
| 6 | **Relances auto** avec rappels | 🔔 Relances |
| 7 | **Tableau CA** graphique SVG | 📊 CA |
| 8 | **Fiches produits** PDF/TXT | 🏷️ Produits |
| 9 | **Notes vocales** par prospect | 🤖 Agent → 🎙️ |
| 10 | **Tags personnalisés** + filtres | 📋 CRM |
| 11 | **Pappers avancé** (NAF, dept, CA, effectifs) | 🔍 Pappers |
| 12 | **Multi-utilisateur** login | ⚙️ Config |
| 13 | **Notifications push** | 🔔 Header |

---

## 📦 Déploiement

### 1. Supabase
1. Créer projet sur supabase.com
2. SQL Editor → coller `supabase-schema.sql` → Run
3. Copier URL + clé anon

### 2. Configurer
Ouvrir `src/App.js` lignes 12-13 → coller URL et clé Supabase

### 3. Vercel
```bash
cd geosiste-v9
npm install
vercel deploy
```

### 4. Variable d'environnement
Dashboard Vercel → Settings → Environment Variables :
- `ANTHROPIC_API_KEY` = `sk-ant-api03-xxxxx`

Redéployer : `vercel deploy --prod`

### 5. Connexion
Login par défaut : `admin@geosiste.com` / `geosiste2024`

---

## 💰 Coûts

| Service | Gratuit | Payant |
|---------|---------|--------|
| Supabase | 500 MB | 25$/mois (Pro) |
| Vercel | 100 GB | 20$/mois (Pro) |
| Claude API | — | ~0.003€/msg |
| Pappers | 100 req/mois | 39€/mois |

**Total démarrage : 0€** (hors API Claude)
