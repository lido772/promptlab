# Déploiement Cloudflare - Correction Erreurs

## 🔴 Erreurs Rencontrées

Le déploiement a échoué pour 2 raisons:

### Erreur 1: Worker Name Mismatch ✅ CORRIGÉ
```
Failed to match Worker name. Your config is "promptup-worker", 
but CI expected "promptlab"
```

**Solution appliquée:** Changé dans `worker/wrangler.toml`:
- `name = "promptup-worker"` → `name = "promptlab"`

### Erreur 2: KV Namespace Invalid ⚠️ À CORRIGER
```
KV namespace 'your-kv-namespace-id-here' is not valid. [code: 10042]
```

**Raison:** Les IDs placeholder doivent être remplacées par les vraies IDs Cloudflare

---

## 🚀 Solution Rapide - Exécuter le Script

### Pour Windows (PowerShell)

```powershell
# 1. Naviguer au répertoire worker
cd worker

# 2. Exécuter le script de setup (si PowerShell est en mode non-restrictif)
.\setup.ps1

# OU autoriser le script et l'exécuter
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\setup.ps1

# Le script va:
# ✅ Vérifier l'auth Cloudflare
# ✅ Créer les KV namespaces
# ✅ Mettre à jour wrangler.toml
# ✅ Configurer GEMINI_API_KEY
# ✅ Déployer le worker
```

### Pour macOS/Linux

```bash
# 1. Naviguer au répertoire worker
cd worker

# 2. Donner les permissions et exécuter
chmod +x setup.sh
./setup.sh

# Le script va faire la même chose que le PowerShell
```

---

## 🔧 Méthode Manuelle (si script échoue)

Si le script ne fonctionne pas, voici les commandes à exécuter manuellement:

### Étape 1: Créer les KV Namespaces

```bash
# Être dans le répertoire worker
cd worker

# Créer namespace production
wrangler kv:namespace create "RATE_LIMIT_KV"

# ✅ COPIER L'ID affiché
# Output: ... id = "abc123def456" ...
```

```bash
# Créer namespace preview
wrangler kv:namespace create "RATE_LIMIT_KV" --preview

# ✅ COPIER L'ID affiché
# Output: ... preview_id = "xyz789abc123" ...
```

### Étape 2: Mettre à jour `wrangler.toml`

Ouvrir `worker/wrangler.toml` et remplacer:

**AVANT:**
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id-here"
preview_id = "your-preview-kv-namespace-id-here"
```

**APRÈS:**
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "abc123def456"              # ID de l'étape 1
preview_id = "xyz789abc123"      # ID de l'étape 2
```

### Étape 3: Configurer Secrets

```bash
# Définir la clé API Gemini
wrangler secret put GEMINI_API_KEY
# Puis copier-coller la clé depuis: https://aistudio.google.com/app/apikey

# Vérifier que tout est configuré
wrangler secret list
```

### Étape 4: Redéployer

```bash
# Redéployer le worker
wrangler deploy

# ✅ Output attendu:
# ⛅️ wrangler 4.70.0
# Total Upload: 11.56 KiB / gzip: 2.99 KiB
# Your Worker has access to the following bindings:
# Binding                           Resource
# env.RATE_LIMIT_KV (abc123def456)  KV Namespace
# ✨ Published your Worker!
# ✨ Deployed to: https://promptlab.YOUR_SUBDOMAIN.workers.dev
```

---

## ✅ Après le Déploiement Réussi

Une fois que `wrangler deploy` show **✨ Deployed successfully**:

### 1. Copier l'URL du Worker

L'output montrera: `https://promptlab.xyz123.workers.dev`

### 2. Mettre à jour `index.html`

```javascript
// Ligne ~739 dans index.html
const CONFIG = {
  // AVANT:
  WORKER_URL: window.env?.WORKER_URL || "https://broad-snow-9b87.lido772.workers.dev"
  
  // APRÈS (remplacer par votre worker URL):
  WORKER_URL: window.env?.WORKER_URL || "https://promptlab.xyz123.workers.dev"
};
```

### 3. Tester avant de déployer le frontend

```bash
# Tester l'API directement
curl -X POST https://promptlab.xyz123.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a book title about AI"}'

# ✅ Should return improved prompt
```

### 4. Déployer le Frontend

```bash
# Si utilisant GitHub Pages
git add .
git commit -m "Update worker URL for production"
git push origin main

# Puis dans repo settings:
# Settings > Pages > Custom domain: promptup.cloud
```

---

## 📋 Checklist Finale

- [ ] `worker/wrangler.toml` a les bonnes IDs KV
- [ ] `wrangler secret list` montre GEMINI_API_KEY
- [ ] `wrangler deploy` réussit (✨ Deployed)
- [ ] `index.html` a la bonne WORKER_URL
- [ ] Test API retourne résultat
- [ ] Frontend déployé sur GitHub Pages
- [ ] Site accessible sur https://promptup.cloud
- [ ] Optimisations gratuites fonctionnent
- [ ] Flow récompensé fonctionne end-to-end

---

## 🆘 En Cas d'Erreur

### KV namespace still invalid
```
Solution:
1. Vérifier la copie exacte de l'ID (pas d'espaces)
2. wrangler kv:namespace list (voir les IDs existants)
3. Utiliser l'ID exact du output
```

### API error: 10042
```
C'est le code d'erreur pour KV namespace ID invalide
1. Vérifier l'ID n'a pas d'espaces ou caractères invalides
2. Créer un nouveau namespace
```

### secret put échoue
```
Solution:
1. Vérifier authentification: wrangler whoami
2. Re-login si nécessaire: wrangler login
```

---

## 📞 Pour Plus d'Aide

| Question | Fichier |
|----------|---------|
| Comment déployer? | [worker/DEPLOYMENT_CHECKLIST.md](worker/DEPLOYMENT_CHECKLIST.md) |
| Erreur technique? | [DEPLOYMENT_FIX.md](DEPLOYMENT_FIX.md) |
| Comment ça fonctionne? | [worker/WORKER_GUIDE.md](worker/WORKER_GUIDE.md) |
| Modèle économique? | [API_MONETIZATION.md](API_MONETIZATION.md) |

---

## ⏱️ Temps Estimé

- **Script automatisé:** 2-3 minutes
- **Manuel:** 5-10 minutes
- **Test end-to-end:** 2-3 minutes

**Total:** 10-15 minutes pour un déploiement complet

---

**Status:** 🔧 Prêt à déployer  
**Action:** Exécuter `.\setup.ps1` dans `worker/` (Windows)  
**Ou:** Exécuter les commandes manuelles ci-dessus  

Bonne chance! 🚀
