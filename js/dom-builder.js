/**
 * DOM Builder - Safe DOM Manipulation Utilities
 * Provides secure alternatives to innerHTML for XSS prevention
 */

export const DOM = {
    /**
     * Safely create an element with properties
     * @param {string} tag - HTML tag name
     * @param {Object} options - Element configuration
     * @returns {HTMLElement}
     */
    createElement(tag, options = {}) {
        const el = document.createElement(tag);

        // Set class
        if (options.className) {
            el.className = options.className;
        }

        // Set ID
        if (options.id) {
            el.id = options.id;
        }

        // Set text content (safe from XSS)
        if (options.text !== undefined) {
            el.textContent = options.text;
        }

        // Set HTML (ONLY for trusted static content)
        if (options.html) {
            el.innerHTML = options.html;
        }

        // Set styles
        if (options.style) {
            Object.assign(el.style, options.style);
        }

        // Set attributes
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    el.setAttribute(key, value);
                }
            });
        }

        // Set dataset
        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                el.dataset[key] = value;
            });
        }

        // Add event listeners
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                el.addEventListener(event, handler);
            });
        }

        // Append children
        if (options.children && options.children.length > 0) {
            options.children.forEach(child => {
                if (child instanceof HTMLElement) {
                    el.appendChild(child);
                }
            });
        }

        return el;
    },

    /**
     * Sanitize text to prevent XSS when used in HTML context
     * @param {string} text - Text to sanitize
     * @returns {string} Escaped HTML
     */
    sanitize(text) {
        if (text === null || text === undefined) return '';
        if (typeof text !== 'string') return String(text);

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize attribute value
     * @param {string} text - Text to sanitize
     * @returns {string} Escaped attribute value
     */
    sanitizeAttr(text) {
        if (text === null || text === undefined) return '';
        if (typeof text !== 'string') return String(text);

        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    /**
     * Safely set HTML content with sanitization
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content (will be sanitized)
     * @param {boolean} allowTags - If false, escape all HTML tags
     */
    setHTML(element, html, allowTags = false) {
        if (allowTags) {
            // Only use with trusted static content
            element.innerHTML = html;
        } else {
            // Sanitize all HTML
            element.textContent = html;
        }
    },

    /**
     * Safely update element text
     * @param {HTMLElement} element - Target element
     * @param {string} text - Text content
     */
    setText(element, text) {
        element.textContent = text;
    },

    /**
     * Create a document fragment for batch DOM operations
     * @param {Array<HTMLElement>} children - Child elements
     * @returns {DocumentFragment}
     */
    createFragment(children = []) {
        const fragment = document.createDocumentFragment();
        children.forEach(child => {
            if (child instanceof HTMLElement) {
                fragment.appendChild(child);
            }
        });
        return fragment;
    },

    /**
     * Remove all children from an element
     * @param {HTMLElement} element - Target element
     */
    clear(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    /**
     * Replace element's content with new content
     * @param {HTMLElement} element - Target element
     * @param {HTMLElement|Array<HTMLElement>|DocumentFragment} newContent - New content
     */
    replaceContent(element, newContent) {
        this.clear(element);
        if (Array.isArray(newContent)) {
            newContent.forEach(child => {
                if (child instanceof HTMLElement) {
                    element.appendChild(child);
                }
            });
        } else if (newContent instanceof DocumentFragment) {
            element.appendChild(newContent);
        } else if (newContent instanceof HTMLElement) {
            element.appendChild(newContent);
        }
    }
};

export default DOM;
