/**
 * Toast Notification System
 * Secure replacement for alert() dialogs
 */

import { DOM } from './dom-builder.js';

const Toast = {
    container: null,
    toasts: [],
    autoHideDelay: 3000,

    /**
     * Initialize toast container
     */
    init() {
        if (!this.container) {
            this.container = document.getElementById('toastContainer');
            if (!this.container) {
                // Create container if it doesn't exist
                this.container = DOM.createElement('div', {
                    id: 'toastContainer',
                    className: 'toast-container'
                });
                document.body.appendChild(this.container);
            }
        }
    },

    /**
     * Show a toast notification
     * @param {string} message - Message to display (will be sanitized)
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Auto-hide duration in ms (0 for no auto-hide)
     */
    show(message, type = 'info', duration = null) {
        this.init();

        const toast = DOM.createElement('div', {
            className: `toast ${type}`,
            text: message // Safe: textContent prevents XSS
        });

        // Add hide class for animation
        setTimeout(() => {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        }, duration || this.autoHideDelay);

        this.container.appendChild(toast);
        this.toasts.push(toast);

        return toast;
    },

    /**
     * Show success toast
     * @param {string} message - Success message
     */
    success(message) {
        return this.show(message, 'success');
    },

    /**
     * Show error toast
     * @param {string} message - Error message
     */
    error(message) {
        return this.show(message, 'error');
    },

    /**
     * Show warning toast
     * @param {string} message - Warning message
     */
    warning(message) {
        return this.show(message, 'warning');
    },

    /**
     * Show info toast
     * @param {string} message - Info message
     */
    info(message) {
        return this.show(message, 'info');
    },

    /**
     * Clear all toasts
     */
    clearAll() {
        if (this.container) {
            DOM.clear(this.container);
        }
        this.toasts = [];
    },

    /**
     * Remove specific toast
     * @param {HTMLElement} toast - Toast element to remove
     */
    remove(toast) {
        if (toast && toast.parentElement) {
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        }
    }
};

export default Toast;
