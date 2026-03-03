# ⚠️ Deployment Error Fix - March 3, 2026

## Erreurs Rencontrées

### 1. ❌ Worker Name Mismatch
```
Failed to match Worker name. Your config file is using "promptup-worker", 
but CI expected "promptlab"
```

✅ **CORRIGÉ**: Changé `name = "promptup-worker"` → `name = "promptlab"` dans wrangler.toml

### 2. ❌ Invalid KV Namespace
```
KV namespace 'your-kv-namespace-id-here' is not valid. [code: 10042]
```

⚠️ **À CORRIGER**: Remplacer les IDs placeholder par les vraies IDs Cloudflare

---

## 🔧 Comment Corriger le KV Namespace

### Étape 1: Créer les KV Namespaces localement

```bash
# Aller dans le répertoire worker
cd worker/

# Créer le namespace production
wrangler kv:namespace create "RATE_LIMIT_KV"

# Output example:
# ✓ Created namespace with ID: d4f1a2b3c4d5e6f7
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "RATE_LIMIT_KV", id = "d4f1a2b3c4d5e6f7" }
```

**⚠️ COPIER L'ID EXACTEMENT**

### Étape 2: Créer le namespace preview (opérationnel)

```bash
# Créer le namespace preview
wrangler kv:namespace create "RATE_LIMIT_KV" --preview

# Output example:
# ✓ Created namespace with ID: xyz789abc123
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "RATE_LIMIT_KV", id = "xyz789abc123", preview_id = "xyz789abc123" }
```

**⚠️ COPIER L'ID EXACTEMENT**

### Étape 3: Mettre à jour wrangler.toml

Remplacer la section KV namespaces:

```toml
# AVANT (❌ MAUVAIS):
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-kv-namespace-id-here"
preview_id = "your-preview-kv-namespace-id-here"

# APRÈS (✅ BON):
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "d4f1a2b3c4d5e6f7"           # Production ID from step 1
preview_id = "xyz789abc123"       # Preview ID from step 2
```

---

## 🔐 Étape 4: Configurer les Secrets

Avant de redéployer, s'assurer que les 2 secrets obligatoires sont définis:

```bash
# 1. Définir Gemini API Key
wrangler secret put GEMINI_API_KEY
# Puis copier-coller la clé depuis: https://aistudio.google.com/app/apikey

# 2. Vérifier que les secrets sont définis
wrangler secret list

# Output:
# - GEMINI_API_KEY (set)
# - ALLOWED_ORIGINS (optionnel)
```

---

## 🚀 Étape 5: Redéployer

Une fois les IDs KV mises à jour:

```bash
# Être dans le répertoire worker
cd worker/

# Redéployer
wrangler deploy

# Output attendu:
# ⛅️ wrangler 4.70.0
# Total Upload: 11.56 KiB / gzip: 2.99 KiB
# Your Worker has access to the following bindings:
# Binding                           Resource
# env.RATE_LIMIT_KV (d4f1a2b3c...)  KV Namespace
# ✓ Deployed to: https://promptlab.YOUR_SUBDOMAIN.workers.dev
```

---

## 📋 Checklist Complète

```bash
# 1. Vérifier wrangler.toml
cat wrangler.toml
# ✅ name = "promptlab"
# ✅ KV namespace IDs sont réels (pas de "your-...")

# 2. Vérifier les secrets
wrangler secret list
# ✅ GEMINI_API_KEY exists

# 3. Vérifier la connexion Cloudflare
wrangler whoami
# ✅ Shows your account

# 4. Redéployer
wrangler deploy
# ✅ No errors, deployment successful
```

---

## 📍 Localiser wrangler.toml

Chemin complet du fichier à corriger:
```
c:\Users\wbenmiled\Downloads\promptlab-main\promptlab\worker\wrangler.toml
```

**Section à modifier (environ ligne 15-19):**
```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR-PRODUCTION-ID"    # ← Remplacer ici
preview_id = "YOUR-PREVIEW-ID"  # ← Et ici
```

---

## ✅ Commandes Rapides

Si vous avez perdu les IDs:

```bash
# Lister tous les namespaces
wrangler kv:namespace list

# Output example:
# ID                    Preview ID            Binding
# d4f1a2b3c4d5e6f7     xyz789abc123         RATE_LIMIT_KV

# Copier l'ID d5 (pas preview) dans wrangler.toml
```

---

## 🎯 Résumé des Actions

| Action | Status | Command |
|--------|--------|---------|
| Créer KV namespace prod | Requiert | `wrangler kv:namespace create "RATE_LIMIT_KV"` |
| Créer KV namespace preview | Requiert | `wrangler kv:namespace create "RATE_LIMIT_KV" --preview` |
| Mettre à jour wrangler.toml | Requiert | Copier les 2 IDs dans fichier |
| Configurer GEMINI_API_KEY | Optionnel si déjà fait | `wrangler secret put GEMINI_API_KEY` |
| Redéployer | Requiert | `wrangler deploy` |

---

## 📞 En Cas de Problème

### "Failed to create KV namespace"
```
Solution: Vous êtes peut-être pas authentifié
$ wrangler login
```

### "KV namespace already exists"
```
Solution: Le namespace existe déjà, récupérer son ID:
$ wrangler kv:namespace list
```

### "Invalid API token"
```
Solution: Vous êtes pas authentifié avec le bon compte
$ wrangler logout
$ wrangler login
```

---

## 📝 Notes Important

1. **Ne pas** créer les namespaces dans Cloudflare UI - utiliser `wrangler`
2. **Les 2 IDs sont différents** - production vs preview
3. **Pas d'espace** après les égals dans wrangler.toml
4. **Vérifier 2x** avant de coller les IDs (très facile de se tromper)

---

**Status:** 🔧 En cours de correction  
**Prochaine étape:** Exécuter les commandes ci-dessus  
**Deadline:** Immédiat  

Questions? Consultez [worker/DEPLOYMENT_CHECKLIST.md](../worker/DEPLOYMENT_CHECKLIST.md)
