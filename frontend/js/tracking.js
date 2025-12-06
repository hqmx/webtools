
/**
 * HQMX Unified Tracking Script
 * Collects usage metrics and sends them to the central monitoring API.
 */
(function () {
    'use strict';

    // Prevent duplicate initialization
    if (window.trackUsage) return;

    const API_ENDPOINT = '/api/track';
    const SESSION_ID = Math.random().toString(36).substring(2, 15);

    /**
     * Tracks a user action or event.
     * @param {string} eventName - Name of the event (e.g., 'convert_success', 'calculate_error')
     * @param {boolean} success - Whether the action was successful
     * @param {object} metadata - Additional data (duration, error message, format, etc.)
     */
    window.trackUsage = function (eventName, success, metadata = {}) {
        const payload = {
            event: eventName,
            success: success,
            timestamp: new Date().toISOString(),
            session_id: SESSION_ID,
            url: window.location.href,
            referrer: document.referrer,
            metadata: metadata
        };

        // Console log for debugging (can be removed in prod or controlled via flag)
        // console.log('[Tracking]', payload);

        // Send to API (fire and forget)
        // Use navigator.sendBeacon if available for reliability during page unload
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(API_ENDPOINT, blob);
        } else {
            // Fallback to fetch
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(err => console.error('[Tracking] Failed to send metric:', err));
        }
    };

    // Auto-track page view
    window.addEventListener('DOMContentLoaded', () => {
        window.trackUsage('page_view', true, {
            title: document.title,
            screen_width: window.screen.width,
            screen_height: window.screen.height
        });
    });

    console.log('[HQMX] Tracking initialized');
})();
