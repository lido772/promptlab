# PromptLab Worker - Guide de Déploiement Sécurisé

## 🔒 Améliorations de Sécurité Implémentées

### ✅ Correction des Vulnérabilités Critiques

1. **CORS Restreint**
   - ✅ Remplacement de `Access-Control-Allow-Origin: *` par une liste blanche d'origines autorisées
   - ✅ Support des wildcards pour sous-domaines (ex: `https://*.yourdomain.com`)
   - ✅ Validation de l'origine avant chaque requête

2. **Rate Limiting avec Cloudflare KV**
   - ✅ 60 requêtes par heure par adresse IP
   - ✅ Fenêtre glissante de 1 heure
   - ✅ Réponse HTTP 429 avec header `Retry-After` si limite dépassée

3. **Validation des Entrées**
   - ✅ Validation de la taille du prompt (min: 10, max: 10 000 caractères)
   - ✅ Vérification du type de données
   - ✅ Sanitization XSS basique (suppression des balises `<script>`)

4. **Messages d'Erreur Génériques**
   - ✅ Plus de fuite d'informations techniques
   - ✅ Messages d'erreur cohérents pour l'utilisateur

5. **Headers de Sécurité**
   - ✅ `X-Content-Type-Options: nosniff`
   - ✅ `X-Frame-Options: DENY`
   - ✅ `X-XSS-Protection: 1; mode=block`
   - ✅ `Referrer-Policy: strict-origin-when-cross-origin`
   - ✅ `Permissions-Policy: geolocation=(), microphone=(), camera=()`

6. **Gestion Robuste des Erreurs**
   - ✅ Gestion spécifique des erreurs 429 (rate limit) de l'API Gemini
   - ✅ Codes HTTP appropriés (400, 405, 429, 502, 503, 500)

---

## 📋 Instructions de Déploiement

### Prérequis

1. **Installer Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **S'authentifier auprès de Cloudflare**
   ```bash
   wrangler login
   ```

### Étape 1: Créer le Namespace KV pour Rate Limiting

```bash
# Créer le namespace de production
wrangler kv:namespace create "RATE_LIMIT_KV"

# Créer le namespace de preview/développement
wrangler kv:namespace create "RATE_LIMIT_KV" --preview
```

**Notez les IDs retournés** et mettez à jour `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "votre-id-production-ici"
preview_id = "votre-id-preview-ici"
```

### Étape 2: Configurer les Secrets

```bash
# Clé API Gemini
wrangler secret put GEMINI_API_KEY
# (Collez votre clé quand demandé)

# Origines autorisées (CORS)
wrangler secret put ALLOWED_ORIGINS
# Entrez: http://localhost:3000,https://votre-domaine.com,https://*.votre-domaine.com
```

**Format ALLOWED_ORIGINS:**
- Séparez les origines par des virgules
- Utilisez `*` pour wildcard de sous-domaine
- Exemple: `http://localhost:3000,https://promptlab.example.com,https://*.example.com`

### Étape 3: Mettre à jour wrangler.toml

Ouvrez `wrangler.toml` et configurez:

```toml
# Ajoutez votre account ID (optionnel si déjà authentifié)
account_id = "votre-account-id-cloudflare"

# Mettez à jour les KV namespace IDs
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Étape 4: Déployer

```bash
# Déployer en production
wrangler deploy

# Ou déployer en environnement de développement
wrangler deploy --env development
```

### Étape 5: Vérifier le Déploiement

```bash
# Tester le worker
curl -X POST https://votre-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test prompt"}'

# Vérifier les logs
wrangler tail
```

---

## 🧪 Tester la Sécurité

### Test CORS
```bash
# Test depuis origine non autorisée (doit échouer)
curl -X POST https://votre-worker.workers.dev \
  -H "Origin: https://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

### Test Rate Limiting
```bash
# Envoyer 61 requêtes (la 61ème doit renvoyer 429)
for i in {1..61}; do
  curl -X POST https://votre-worker.workers.dev \
    -H "Content-Type: application/json" \
    -d '{"prompt":"test"}'
  echo "Request $i"
done
```

### Test Validation
```bash
# Prompt trop court
curl -X POST https://votre-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt":"hi"}'  # Doit renvoyer 400

# Prompt trop long (>10000 caractères)
curl -X POST https://votre-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"prompt":"'$(python3 -c 'print("a"*10001')'"}'  # Doit renvoyer 400
```

---

## 🔄 Mise à Jour de l'Application Frontend

Dans votre `frontend/` ou `index.html`, configurez l'URL du worker:

```javascript
// Utilisez une variable d'environnement ou une configuration
const WORKER_URL = import.meta.env.WORKER_URL || "https://votre-worker.workers.dev";

const response = await fetch(WORKER_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: prompt })
});
```

---

## 📊 Monitoring et Logs

### Voir les logs en temps réel
```bash
wrangler tail
```

### Voir les métriques
```bash
wrangler analytics
```

### Vérifier l'utilisation KV
```bash
wrangler kv:key list --namespace-id=VOTRE_ID
```

---

## ⚠️ Notes de Sécurité Importantes

1. **Ne committez JAMAIS**:
   - `wrangler.toml` avec des vrais secrets
   - Les variables d'environnement avec des clés API
   - Utilisez toujours `wrangler secret put` pour les valeurs sensibles

2. **Rotation des Secrets**:
   - Changez régulièrement votre clé API Gemini
   - Utilisez des clés API avec des quotas limités si possible

3. **Surveillance**:
   - Surveillez l'utilisation de KV pour détecter les abus
   - Configurez des alertes Cloudflare pour les pics de trafic

4. **Production**:
   - Utilisez des domaines personnalisés
   - Activez Cloudflare Access pour une protection supplémentaire (optionnel)

---

## 🆘 Dépannage

### Erreur "KV namespace not found"
```bash
# Vérifiez que vous avez créé les namespaces
wrangler kv:namespace list

# Recréez les namespaces si nécessaire
wrangler kv:namespace create "RATE_LIMIT_KV"
```

### Erreur "Invalid secret"
```bash
# Vérifiez que les secrets sont définis
wrangler secret list

# Redéfinissez le secret manquant
wrangler secret put GEMINI_API_KEY
```

### CORS bloque les requêtes
```bash
# Vérifiez que votre origine est dans ALLOWED_ORIGINS
wrangler secret bulk get ALLOWED_ORIGINS
```

---

## 📚 Ressources Utiles

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [CORS Configuration Guide](https://developers.cloudflare.com/workers/examples/cors/)
