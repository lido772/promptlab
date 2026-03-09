/**
 * Model Cache Service
 * Handles clearing and managing cached models in Cache API and IndexedDB
 */

import { MODEL_VERSION, CACHE_KEYS, CACHE_PATTERNS } from '../constants/models.js';

export class ModelCacheService {
    constructor() {
        this.version = MODEL_VERSION;
    }

    /**
     * Clear all model-related caches
     */
    async clearAllModels() {
        const report = {
            cachesDeleted: [],
            dbsDeleted: [],
            localStorageKeysCleared: [],
            totalSizeClearedMB: 0,
            success: true,
            errors: []
        };

        try {
            // 1. Clear Cache API
            const cacheReport = await this.clearCacheAPI();
            report.cachesDeleted = cacheReport.deleted;
            report.totalSizeClearedMB += cacheReport.sizeClearedMB;
            if (cacheReport.errors.length > 0) {
                report.errors.push(...cacheReport.errors);
            }
        } catch (error) {
            report.errors.push(`Cache API error: ${error.message}`);
            report.success = false;
        }

        try {
            // 2. Clear IndexedDB
            const dbReport = await this.clearIndexedDB();
            report.dbsDeleted = dbReport.deleted;
            report.totalSizeClearedMB += dbReport.sizeClearedMB;
            if (dbReport.errors.length > 0) {
                report.errors.push(...dbReport.errors);
            }
        } catch (error) {
            report.errors.push(`IndexedDB error: ${error.message}`);
            report.success = false;
        }

        try {
            // 3. Clear localStorage
            const storageReport = this.clearLocalStorage();
            report.localStorageKeysCleared = storageReport.cleared;
        } catch (error) {
            report.errors.push(`localStorage error: ${error.message}`);
            report.success = false;
        }

        console.log('[ModelCache] Clear report:', report);
        return report;
    }

    /**
     * Clear Cache API entries related to models
     */
    async clearCacheAPI() {
        const result = {
            deleted: [],
            sizeClearedMB: 0,
            errors: []
        };

        try {
            const cacheNames = await caches.keys();
            
            for (const cacheName of cacheNames) {
                const shouldDelete = CACHE_PATTERNS.huggingface.some(pattern => 
                    cacheName.toLowerCase().includes(pattern.toLowerCase())
                ) || CACHE_PATTERNS.xenova.some(pattern => 
                    cacheName.toLowerCase().includes(pattern.toLowerCase())
                ) || CACHE_PATTERNS.cache.some(pattern => 
                    cacheName.toLowerCase().includes(pattern.toLowerCase())
                );

                if (shouldDelete) {
                    try {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        
                        // Estimate size
                        let sizeEstimate = 0;
                        for (const request of keys) {
                            const response = await cache.match(request);
                            if (response) {
                                const blob = await response.clone().blob();
                                sizeEstimate += blob.size;
                            }
                        }

                        await caches.delete(cacheName);
                        result.deleted.push(cacheName);
                        result.sizeClearedMB += sizeEstimate / (1024 * 1024);
                        
                        console.log(`[ModelCache] Deleted cache: ${cacheName}`);
                    } catch (error) {
                        result.errors.push(`Failed to delete cache ${cacheName}: ${error.message}`);
                    }
                }
            }
        } catch (error) {
            result.errors.push(`Failed to list caches: ${error.message}`);
        }

        return result;
    }

    /**
     * Clear IndexedDB databases related to models
     */
    async clearIndexedDB() {
        const result = {
            deleted: [],
            sizeClearedMB: 0,
            errors: []
        };

        const dbNames = [
            'transformers-cache',
            'hf-cache',
            'model-cache',
            'huggingface-cache',
            'xenova-cache'
        ];

        for (const dbName of dbNames) {
            try {
                await new Promise((resolve, reject) => {
                    const request = indexedDB.deleteDatabase(dbName);
                    
                    request.onsuccess = () => {
                        result.deleted.push(dbName);
                        console.log(`[ModelCache] Deleted IndexedDB: ${dbName}`);
                        resolve(true);
                    };
                    
                    request.onerror = (event) => {
                        result.errors.push(`Failed to delete ${dbName}: ${event.target.error}`);
                        resolve(false);
                    };
                    
                    request.onblocked = () => {
                        console.warn(`[ModelCache] Delete blocked for ${dbName}`);
                        resolve(false);
                    };
                });
            } catch (error) {
                result.errors.push(`Exception deleting ${dbName}: ${error.message}`);
            }
        }

        return result;
    }

    /**
     * Clear localStorage keys related to models
     */
    clearLocalStorage() {
        const result = { cleared: [] };
        const keysToClear = Object.values(CACHE_KEYS);

        for (const key of keysToClear) {
            if (localStorage.getItem(key) !== null) {
                localStorage.removeItem(key);
                result.cleared.push(key);
                console.log(`[ModelCache] Cleared localStorage key: ${key}`);
            }
        }

        return result;
    }

    /**
     * Check if cached model version is outdated
     */
    isCacheOutdated() {
        const cachedVersion = localStorage.getItem(CACHE_KEYS.MODEL_VERSION);
        return !cachedVersion || cachedVersion !== this.version;
    }

    /**
     * Update the cached model version
     */
    updateCachedVersion() {
        localStorage.setItem(CACHE_KEYS.MODEL_VERSION, this.version);
        localStorage.setItem(CACHE_KEYS.LAST_MODEL_LOAD, new Date().toISOString());
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        let totalSize = 0;
        let cacheCount = 0;
        let entryCount = 0;

        try {
            const cacheNames = await caches.keys();
            cacheCount = cacheNames.length;

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                entryCount += keys.length;

                for (const request of keys) {
                    const response = await cache.match(request);
                    if (response) {
                        const blob = await response.clone().blob();
                        totalSize += blob.size;
                    }
                }
            }
        } catch (error) {
            console.error('[ModelCache] Error getting cache stats:', error);
        }

        return {
            totalSizeMB: totalSize / (1024 * 1024),
            cacheCount,
            entryCount
        };
    }

    /**
     * Check if model is cached
     */
    async isModelCached(modelId) {
        try {
            const cacheNames = await caches.keys();
            
            for (const cacheName of cacheNames) {
                if (cacheName.includes(modelId.split('/')[1]?.toLowerCase() || modelId.toLowerCase())) {
                    return true;
                }
                
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                
                for (const request of keys) {
                    if (request.url.toLowerCase().includes(modelId.toLowerCase())) {
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('[ModelCache] Error checking if model is cached:', error);
        }
        
        return false;
    }
}

export const modelCacheService = new ModelCacheService();
