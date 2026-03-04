/**
 * Prompt History Module
 * Fetches, renders, and manages user prompt history
 * Uses DOM builder pattern for XSS safety
 */

import { DOM } from './dom-builder.js';
import Auth from './auth.js';
import Toast from './toast.js';

const WORKER_URL = window.env?.WORKER_URL || "https://promptlab.lido772.workers.dev";

let historyEntries = [];
let isVisible = false;

/**
 * Fetch history from the worker API
 */
async function fetchHistory() {
    const token = await Auth.getIdToken();
    if (!token) return [];

    try {
        const resp = await fetch(`${WORKER_URL}/history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) {
            console.error('History fetch failed:', resp.status);
            return [];
        }

        const data = await resp.json();
        historyEntries = data.entries || [];
        return historyEntries;
    } catch (err) {
        console.error('History fetch error:', err);
        return [];
    }
}

/**
 * Render history entries into the #historyContent container
 */
function renderHistory() {
    const container = document.getElementById('historyContent');
    if (!container) return;

    DOM.clear(container);

    if (historyEntries.length === 0) {
        const emptyMsg = DOM.createElement('div', {
            className: 'history-empty',
            text: 'No history yet. Improve a prompt to see it here.'
        });
        container.appendChild(emptyMsg);
        return;
    }

    historyEntries.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const item = DOM.createElement('div', {
            className: 'history-item',
            children: [
                DOM.createElement('div', {
                    className: 'history-item-date',
                    text: dateStr
                }),
                DOM.createElement('div', {
                    className: 'history-item-label',
                    text: 'Original'
                }),
                DOM.createElement('div', {
                    className: 'history-item-original',
                    text: entry.originalPrompt || ''
                }),
                DOM.createElement('div', {
                    className: 'history-item-label',
                    text: 'Improved'
                }),
                DOM.createElement('div', {
                    className: 'history-item-improved',
                    text: entry.improvedPrompt || ''
                }),
                DOM.createElement('div', {
                    className: 'history-actions',
                    children: [
                        DOM.createElement('button', {
                            className: 'history-use-btn',
                            text: 'Use This',
                            dataset: { action: 'use-history', historyText: entry.improvedPrompt || '' }
                        }),
                        DOM.createElement('button', {
                            className: 'history-delete-btn',
                            text: 'Delete',
                            dataset: { action: 'delete-history', historyId: entry.id }
                        })
                    ]
                })
            ]
        });
        container.appendChild(item);
    });
}

/**
 * Delete a history entry by ID
 * @param {string} entryId
 */
async function deleteEntry(entryId) {
    const token = await Auth.getIdToken();
    if (!token) return;

    // Optimistic UI update
    historyEntries = historyEntries.filter(e => e.id !== entryId);
    renderHistory();

    try {
        const resp = await fetch(`${WORKER_URL}/history/${encodeURIComponent(entryId)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!resp.ok) {
            Toast.error('Failed to delete entry');
            // Re-fetch to restore correct state
            await fetchHistory();
            renderHistory();
        }
    } catch (err) {
        console.error('History delete error:', err);
        Toast.error('Failed to delete entry');
    }
}

/**
 * Copy improved prompt text to the prompt input textarea
 * @param {string} text
 */
function usePrompt(text) {
    const promptInput = document.getElementById('promptInput');
    if (promptInput && text) {
        promptInput.value = text;
        promptInput.focus();
        Toast.success('Prompt loaded from history');
    }
}

/**
 * Toggle history section visibility
 * @param {boolean} [show] - Force show/hide, or toggle
 */
function toggle(show) {
    const section = document.getElementById('historySection');
    if (!section) return;

    if (typeof show === 'boolean') {
        isVisible = show;
    } else {
        isVisible = !isVisible;
    }

    section.style.display = isVisible ? 'block' : 'none';

    // Update toggle button text
    const btn = section.querySelector('[data-action="toggle-history"]');
    if (btn) {
        btn.textContent = isVisible ? 'Hide History' : 'Show History';
    }

    // Fetch history when showing for the first time
    if (isVisible && historyEntries.length === 0) {
        const container = document.getElementById('historyContent');
        if (container) {
            DOM.clear(container);
            container.appendChild(DOM.createElement('div', {
                className: 'history-loading',
                text: 'Loading history...'
            }));
        }
        fetchHistory().then(() => renderHistory());
    }
}

const History = {
    fetchHistory,
    renderHistory,
    deleteEntry,
    usePrompt,
    toggle,
    /** Show history section and load data */
    async show() {
        toggle(true);
    },
    /** Hide history section */
    hide() {
        toggle(false);
    }
};

export default History;
