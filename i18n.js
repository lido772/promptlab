/**
 * Internationalization (i18n) Configuration
 * Supports multiple languages for UI and heuristic patterns
 */

export const i18n = {
    en: {
        name: 'English',
        flag: '🇺🇸',
        ui: {
            title: 'Prompt Analyzer',
            subtitle: 'Optimize your AI prompts with instant heuristic scoring and <span class="text-blue-400 font-semibold">Local Browser AI</span>. Private, offline, and free.',
            yourPrompt: 'Your Prompt',
            placeholder: 'Example: Act as an expert marketing consultant. Create a 3-month strategy for a new SaaS...',
            analyzeBtn: 'Analyze Instantly',
            rewriteBtn: 'Rewrite with AI',
            localEngine: 'Local AI Engine',
            loadModel: 'Load Model',
            modelLoaded: '✅ Model Loaded',
            modelNotLoaded: 'No model loaded. Select a model and click Load Model.',
            downloadingModel: 'Downloading model',
            initializingModel: 'Initializing model',
            errorLoadingModel: 'Error loading model',
            errorGeneratingPrompt: 'Error generating prompt',
            ecoModeWarning: 'Low battery detected. Consider a smaller model or plug in for optimal performance.',
            prefetchingProModel: 'Silently preloading Pro model for offline access...',
            proModelPrefetched: 'Pro model ready for offline use!',
            prefetchingFailed: 'Pro model prefetching failed',
            qualityScore: 'Quality Score',
            metrics: {
                role: 'Role',
                format: 'Format',
                constraints: 'Constraints',
                context: 'Context'
            },
            issuesTitle: 'Suggested Improvements',
            optimizedVersion: 'Optimized Version',
            copyBtn: 'Copy',
            waitingModel: 'Load a model above to enable AI-powered rewriting.',
            perfectPrompt: '✨ Perfect prompt! No issues detected.',
            analyzing: '🧠 Analyzing and rewriting...',
            generateBtn: 'Generate Improved Prompt',
            generating: 'Generating...',
            deleteCacheBtn: 'Delete Current Model from Cache',
            confirmDeleteCache: (modelName) => `Are you sure you want to delete the cached model for ${modelName}? This cannot be undone.`,
            modelCacheDeleted: (modelName) => `🗑️ Cached model for ${modelName} deleted!`,
            errorDeletingCache: 'Error deleting cached model. Please try again.',
            deleteCurrentModelBtn: 'Delete Current Model from Cache',
            copiedToClipboard: 'Copied to clipboard!',
            noPromptToCopy: 'Nothing to copy yet.',
            rewriteFailed: 'Rewrite failed. Try refreshing.',
            retryBtn: 'Retry',
            fallbackMode: 'Fallback mode activated',
            cacheCleared: 'Cache cleared successfully!',
            footer: 'Built with <span class="text-blue-400">Transformers.js</span> • Offline First • Privacy Optimized'
        heuristics: {
            patterns: {
                role: ['you are', 'act as', 'as a', 'expert', 'specialist', 'persona', 'professional', 'consultant'],
                format: ['format', 'json', 'table', 'list', 'markdown', 'return', 'output as', 'bullet point', 'structured', 'csv', 'html', 'xml'],
                constraints: ['must', 'do not', 'only', 'avoid', 'limit', 'never', 'strictly', 'without', 'requirements', 'negative prompt'],
                context: ['context', 'background', 'given', 'scenario', 'situation', 'example', 'here is', 'audience', 'purpose'],
                specificity: ['specifically', 'exactly', 'detailed', 'precise', 'minute', 'particular', 'instance']
            },
            issues: {
                role: "Missing a clear role definition (e.g., 'You are an expert...')",
                format: "No specific output format requested (e.g., 'Return as a JSON')",
                constraints: "No constraints defined (e.g., 'Do not use technical jargon')",
                context: "Lack of background context for the AI",
                specificity: "Prompt seems vague; add more specific details, numbers, or data",
                short: "Prompt is too short to be clear",
                structure: "Improve structure using line breaks, bullet points, or headers"
            }
        }
    },
    fr: {
        name: 'Français',
        flag: '🇫🇷',
        ui: {
            title: 'Analyseur de Prompt',
            subtitle: 'Optimisez vos prompts IA avec un scoring heuristique instantané et une <span class="text-blue-400 font-semibold">IA locale</span>. Privé, hors-ligne et gratuit.',
            yourPrompt: 'Votre Prompt',
            placeholder: 'Exemple : Agissez en tant qu\'expert en marketing. Créez une stratégie de 3 mois pour un nouveau SaaS...',
            analyzeBtn: 'Analyser instantanément',
            rewriteBtn: 'Réécrire avec l\'IA',
            localEngine: 'Moteur d\'IA Local',
            loadModel: 'Charger le modèle',
            modelLoaded: '✅ Modèle chargé',
            modelNotLoaded: 'Aucun modèle chargé. Sélectionnez un modèle et cliquez sur Charger le modèle.',
            downloadingModel: 'Téléchargement du modèle',
            initializingModel: 'Initialisation du modèle',
            errorLoadingModel: 'Erreur de chargement du modèle',
            errorGeneratingPrompt: 'Erreur de génération du prompt',
            ecoModeWarning: 'Batterie faible détectée. Pensez à un modèle plus petit ou branchez votre appareil pour des performances optimales.',
            prefetchingProModel: 'Préchargement silencieux du modèle Pro pour un accès hors ligne...',
            proModelPrefetched: 'Modèle Pro prêt pour une utilisation hors ligne !',
            prefetchingFailed: 'Échec du préchargement du modèle Pro',
            qualityScore: 'Score de Qualité',
            metrics: {
                role: 'Rôle',
                format: 'Format',
                constraints: 'Contraintes',
                context: 'Contexte'
            },
            issuesTitle: 'Améliorations suggérées',
            optimizedVersion: 'Version optimisée',
            copyBtn: 'Copier',
            waitingModel: 'Chargez un modèle ci-dessus pour activer la réécriture par IA.',
            perfectPrompt: '✨ Prompt parfait ! Aucune erreur détectée.',
            analyzing: '🧠 Analyse et réécriture en cours...',
            generateBtn: 'Générer un prompt amélioré',
            generating: 'Génération...',
            deleteCacheBtn: 'Supprimer le modèle actuel du cache',
            confirmDeleteCache: (modelName) => `Êtes-vous sûr de vouloir supprimer le modèle en cache pour ${modelName} ? Cette action est irréversible.`,
            modelCacheDeleted: (modelName) => `🗑️ Modèle en cache pour ${modelName} supprimé !`,
            errorDeletingCache: 'Erreur lors de la suppression du modèle du cache. Veuillez réessayer.',
            deleteCurrentModelBtn: 'Supprimer le modèle actuel du cache',
            copiedToClipboard: 'Copié dans le presse-papiers !',
            noPromptToCopy: 'Rien à copier pour le moment.',
            rewriteFailed: 'La réécriture a échoué. Essayez de rafraîchir.',
            retryBtn: 'Retry',
            fallbackMode: 'Fallback mode activated',
            cacheCleared: 'Cache cleared successfully!',
            footer: 'Propulsé par <span class="text-blue-400">Transformers.js</span> • Hors-ligne • Privé'
        heuristics: {
            patterns: {
                role: ['tu es', 'vous êtes', 'agis en tant que', 'expert', 'spécialiste', 'persona', 'professionnel', 'consultant'],
                format: ['format', 'json', 'tableau', 'liste', 'markdown', 'retourne', 'sortie en', 'puce', 'structuré', 'csv', 'html', 'xml'],
                constraints: ['doit', 'ne pas', 'seulement', 'éviter', 'limite', 'jamais', 'strictement', 'sans', 'exigences', 'prompt négatif'],
                context: ['contexte', 'fond', 'donné', 'scénario', 'situation', 'exemple', 'voici', 'audience', 'objectif'],
                specificity: ['spécifiquement', 'exactement', 'détaillé', 'précis', 'minute', 'particulier', 'instance']
            },
            issues: {
                role: "Définition de rôle manquante (ex: 'Vous êtes un expert...')",
                format: "Aucun format de sortie spécifié (ex: 'Retourne en JSON')",
                constraints: "Aucune contrainte définie (ex: 'N'utilisez pas de jargon technique')",
                context: "Manque de contexte pour l'IA",
                specificity: "Le prompt semble vague ; ajoutez des détails, des chiffres ou des données",
                short: "Le prompt est trop court pour être clair",
                structure: "Améliorez la structure avec des sauts de ligne, des puces ou des en-têtes"
            }
        }
    },
    es: {
        name: 'Español',
        flag: '🇪🇸',
        ui: {
            title: 'Analizador de Prompts',
            subtitle: 'Optimiza tus prompts de IA con puntuación heurística instantánea e <span class="text-blue-400 font-semibold">IA local</span>. Privado, offline y gratuito.',
            yourPrompt: 'Tu Prompt',
            placeholder: 'Ejemplo: Actúa como un experto consultor de marketing. Crea una estrategia de 3 meses para un nuevo SaaS...',
            analyzeBtn: 'Analizar al instante',
            rewriteBtn: 'Reescribir con IA',
            localEngine: 'Motor de IA Local',
            loadModel: 'Cargar Modelo',
            modelLoaded: '✅ Modelo cargado',
            modelNotLoaded: 'No hay modelo cargado. Selecciona uno y haz clic en Cargar Modelo.',
            downloadingModel: 'Descargando modelo',
            initializingModel: 'Inicializando modelo',
            errorLoadingModel: 'Error al cargar el modelo',
            errorGeneratingPrompt: 'Error al generar el prompt',
            ecoModeWarning: 'Batería baja detectada. Considera un modelo más pequeño o conecta el cargador para un rendimiento óptimo.',
            prefetchingProModel: 'Precargando silenciosamente el modelo Pro para acceso sin conexión...',
            proModelPrefetched: '¡Modelo Pro listo para usar sin conexión!',
            prefetchingFailed: 'Fallo al precargar el modelo Pro',
            downloading: 'Herunterladen',
            qualityScore: 'Puntuación de Calidad',
            metrics: {
                role: 'Rol',
                format: 'Formato',
                constraints: 'Restricciones',
                context: 'Contexto'
            },
            issuesTitle: 'Mejoras sugeridas',
            optimizedVersion: 'Versión optimizada',
            copyBtn: 'Copiar',
            waitingModel: 'Carga un modelo arriba para activar la reescritura con IA.',
            perfectPrompt: '✨ ¡Prompt perfecto! No se detectaron problemas.',
            analyzing: '🧠 Analizando y reescribiendo...',
            generateBtn: 'Generar prompt mejorado',
            generating: 'Generando...',
            deleteCacheBtn: 'Eliminar modelo actual del caché',
            confirmDeleteCache: (modelName) => `¿Estás seguro de que quieres eliminar el modelo en caché para ${modelName}? Esta acción no se puede deshacer.`,
            modelCacheDeleted: (modelName) => `🗑️ ¡Modelo en caché para ${modelName} eliminado!`,
            errorDeletingCache: 'Error al eliminar el modelo del caché. Por favor, inténtalo de nuevo.',
            deleteCurrentModelBtn: 'Eliminar modelo actual del caché',
            copiedToClipboard: '¡Copiado al portapapeles!',
            noPromptToCopy: 'Nada para copiar todavía.',
            rewriteFailed: 'Error al reescribir. Intenta refrescar.',
            retryBtn: 'Retry',
            fallbackMode: 'Fallback mode activated',
            cacheCleared: 'Cache cleared successfully!',
            footer: 'Desarrollado con <span class="text-blue-400">Transformers.js</span> • Offline primero • Privacidad optimizada'
        heuristics: {
            patterns: {
                role: ['eres', 'actúa como', 'como un', 'experto', 'especialista', 'persona', 'profesional', 'consultor'],
                format: ['formato', 'json', 'tabla', 'lista', 'markdown', 'devuelve', 'salida como', 'viñeta', 'estructurado', 'csv', 'html', 'xml'],
                constraints: ['debe', 'no', 'solo', 'evitar', 'limite', 'nunca', 'estrictamente', 'sin', 'requisitos', 'prompt negativo'],
                context: ['contexto', 'antecedentes', 'dado', 'escenario', 'situación', 'ejemplo', 'aquí hay', 'audiencia', 'objetivo'],
                specificity: ['específicamente', 'exactamente', 'detallado', 'préciso', 'minuto', 'particular', 'instancia']
            },
            issues: {
                role: "Falta una definición clara del rol (ej: 'Eres un experto...')",
                format: "No se solicitó un formato de salida específico (ej: 'Devuelve como JSON')",
                constraints: "Aucune contrainte définie (ej: 'N'utilisez pas de jargon technique')",
                context: "Falta de contexto pour l'IA",
                specificity: "Le prompt semble vague ; ajoutez des détails, des chiffres ou des données",
                short: "Le prompt est trop court pour être clair",
                structure: "Mejora la estructura usando saltos de línea, viñetas o encabezados"
            }
        }
    },
    de: {
        name: 'Deutsch',
        flag: '🇩🇪',
        ui: {
            title: 'Prompt-Analysator',
            subtitle: 'Optimieren Sie Ihre KI-Prompts mit sofortiger heuristischer Bewertung und <span class="text-blue-400 font-semibold">Lokaler Browser-KI</span>. Privat, offline und kostenlos.',
            yourPrompt: 'Ihr Prompt',
            placeholder: 'Beispiel: Agieren Sie als erfahrener Marketingberater. Erstellen Sie eine 3-Monats-Strategie für ein neues SaaS...',
            analyzeBtn: 'Sofort analysieren',
            rewriteBtn: 'Mit KI umschreiben',
            localEngine: 'Lokale KI-Engine',
            loadModel: 'Modell laden',
            modelLoaded: '✅ Modell geladen',
            modelNotLoaded: 'Kein Modell geladen. Wählen Sie eines aus und klicken Sie auf Modell laden.',
            downloadingModel: 'Modell wird heruntergeladen',
            initializingModel: 'Modell wird initialisiert',
            errorLoadingModel: 'Fehler beim Laden des Modells',
            errorGeneratingPrompt: 'Fehler beim Generieren des Prompts',
            ecoModeWarning: 'Niedriger Akkustand erkannt. Erwägen Sie ein kleineres Modell oder schließen Sie das Gerät für optimale Leistung an.',
            prefetchingProModel: 'Pro-Modell wird im Hintergrund für Offline-Zugriff vorgeladen...',
            proModelPrefetched: 'Pro-Modell ist offline einsatzbereit!',
            prefetchingFailed: 'Fehler beim Vorladen des Pro-Modells',
            downloading: 'Herunterladen',
            qualityScore: 'Qualitätsbewertung',
            metrics: {
                role: 'Rolle',
                format: 'Format',
                constraints: 'Einschränkungen',
                context: 'Kontext'
            },
            issuesTitle: 'Empfohlene Verbesserungen',
            optimizedVersion: 'Optimierte Version',
            copyBtn: 'Kopieren',
            waitingModel: 'Laden Sie oben ein Modell, um die KI-gestützte Umschreibung zu aktivieren.',
            perfectPrompt: '✨ Perfekter Prompt! Keine Probleme erkannt.',
            analyzing: '🧠 Analysieren und umschreiben...',
            generateBtn: 'Verbesserten Prompt generieren',
            generating: 'Generieren...',
            deleteCacheBtn: 'Aktuelles Modell aus dem Cache löschen',
            confirmDeleteCache: (modelName) => `Sind Sie sicher, dass Sie das zwischengespeicherte Modell für ${modelName} löschen möchten? Dies kann nicht rückgängig gemacht werden.`,
            modelCacheDeleted: (modelName) => `🗑️ Zwischengespeichertes Modell für ${modelName} gelöscht!`,
            errorDeletingCache: 'Fehler beim Löschen des Modells aus dem Cache. Bitte versuchen Sie es erneut.',
            deleteCurrentModelBtn: 'Aktuelles Modell aus Cache löschen',
            copiedToClipboard: 'In die Zwischenablage kopiert!',
            noPromptToCopy: 'Noch nichts zum Kopieren.',
            rewriteFailed: 'Umschreiben fehlgeschlagen. Bitte aktualisieren.',
            retryBtn: 'Retry',
            fallbackMode: 'Fallback mode activated',
            cacheCleared: 'Cache cleared successfully!',
            footer: 'Erstellt mit <span class="text-blue-400">Transformers.js</span> • Zuerst Offline • Datenschutz optimiert'
        },
        heuristics: {
            patterns: {
                role: ['du bist', 'sie sind', 'agiere als', 'experte', 'spezialist', 'persona', 'profi', 'berater'],
                format: ['format', 'json', 'tabelle', 'liste', 'markdown', 'gib zurück', 'ausgabe als', 'aufzählungspunkt', 'strukturiert', 'csv', 'html', 'xml'],
                constraints: ['muss', 'nicht', 'nur', 'vermeiden', 'begrenzen', 'niemals', 'strikt', 'ohne', 'anforderungen', 'negativer prompt'],
                context: ['kontext', 'hintergrund', 'gegeben', 'szenario', 'situation', 'beispiel', 'hier ist', 'zielgruppe', 'zweck'],
                specificity: ['spezifisch', 'genau', 'detailliert', 'präzise', 'minuziös', 'besonders', 'instanz']
            },
            issues: {
                role: "Fehlende klare Rollendefinition (z. B. 'Du bist ein Experte...')",
                format: "Kein spezifisches Ausgabeformat angefordert (z. B. 'Als JSON zurückgeben')",
                constraints: "Keine Einschränkungen definiert (z. B. 'Verwenden Sie keinen Fachjargon')",
                context: "Mangel an Hintergrundkontext für die KI",
                specificity: "Prompt erscheint vage; fügen Sie spezifischere Details, Zahlen oder Daten hinzu",
                short: "Prompt ist zu kurz, um klar zu sein",
                structure: "Struktur durch Zeilenumbrüche, Aufzählungspunkte oder Überschriften verbessern"
            }
        }
    }
};
