//  YouTube Ad Handler
// ==UserScript==
// @name         YouTube Ad Handler Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Handle YouTube ads with enhanced video ad detection
// @match        *://*.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    const _SELECTORS = {
        // Video ad selectors
        videoAd: '.video-ads.ytp-ad-module',
        videoAdOverlay: '.ytp-ad-player-overlay',
        skipButton: '.ytp-ad-skip-button-slot, .ytp-ad-skip-button, .ytp-ad-skip-button-modern',
        previewText: '.ytp-ad-preview-text',
        adText: '.ytp-ad-text',
        // Other ad selectors
        adOverlayButton: '.ytp-ad-player-overlay-layout .ytp-ad-clickable .ytp-ad-button-icon',
        overlayCloseButton: '.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button',
        aboutAdRenderer: '.yt-about-this-ad-renderer',
        // Additional video player selectors
        video: 'video.html5-main-video',
        adContainer: '.video-ads',
        progressBar: '.ytp-play-progress'
    };

    const CONFIG = {
        POLL_INTERVAL: 500,  // Reduced interval for faster response
        WAIT_BEFORE_CLICK: 450,
        MAX_TRIES: 3,  // Increased max tries
        RESET_TIMEOUT: 40000,
        DEBUG: false,
        SKIP_WAIT_TIME: 1000
    };

    let overlayOpened = false;
    let maxTries = CONFIG.MAX_TRIES;
    let lastAdCheck = 0;
    let adObserver = null;

    function log(...args) {
        if (CONFIG.DEBUG) console.log('[YT Ad Handler]', ...args);
    }

    function isElementVisible(element) {
        return element && 
               element.offsetParent !== null && 
               window.getComputedStyle(element).display !== 'none' &&
               window.getComputedStyle(element).visibility !== 'hidden';
    }

    function skipAd() {
        const skipButtons = document.querySelectorAll(_SELECTORS.skipButton);
        skipButtons.forEach(button => {
            if (isElementVisible(button)) {
                button.click();
                log('Skip button clicked');
            }
        });
    }

    function handleVideoAd() {
        const video = document.querySelector(_SELECTORS.video);
        const adContainer = document.querySelector(_SELECTORS.adContainer);
        
        if (video && adContainer && isElementVisible(adContainer)) {
            // Try to skip immediately if possible
            skipAd();
            
            // Speed up video ad if can't skip
            if (video.playbackRate) {
                video.playbackRate = 16;
                video.volume = 0;
                log('Video ad speed increased');
            }

            // Click through the ad preview if present
            const previewText = document.querySelector(_SELECTORS.previewText);
            if (previewText && isElementVisible(previewText)) {
                previewText.click();
                log('Ad preview clicked');
            }

            return true;
        }
        return false;
    }

    function removeAdOverlay() {
        const overlay = document.querySelector(_SELECTORS.overlayCloseButton);
        if (overlay && isElementVisible(overlay)) {
            overlay.click();
            log('Ad overlay removed');
            return true;
        }
        return false;
    }

    function handleAdOptions() {
        if (overlayOpened || maxTries <= 0) return false;

        const adButton = document.querySelector(_SELECTORS.adOverlayButton);
        if (!adButton || !isElementVisible(adButton)) return false;

        log('Opening ad options');
        adButton.click();
        overlayOpened = true;

        setTimeout(() => {
            const aboutAd = document.querySelector(_SELECTORS.aboutAdRenderer);
            if (aboutAd && isElementVisible(aboutAd)) {
                // Find and click "Stop seeing this ad" button
                const buttons = aboutAd.querySelectorAll('button');
                let stopButton = Array.from(buttons).find(button => 
                    button.textContent.toLowerCase().includes('stop') || 
                    button.querySelector('img[src*="slash_circle"]')
                );

                if (stopButton) {
                    stopButton.click();
                    log('Stop seeing ad clicked');

                    // Handle confirmation
                    setTimeout(() => {
                        const confirmButton = aboutAd.querySelector('div[role="button"]');
                        if (confirmButton) {
                            confirmButton.click();
                            log('Confirmation clicked');

                            // Close the overlay
                            setTimeout(() => {
                                const closeButton = aboutAd.querySelector('button');
                                if (closeButton) closeButton.click();
                                
                                if (aboutAd.offsetParent !== null) {
                                    document.body.click();
                                }
                                
                                overlayOpened = false;
                                maxTries--;
                                log('Overlay closed');
                            }, CONFIG.WAIT_BEFORE_CLICK);
                        }
                    }, CONFIG.WAIT_BEFORE_CLICK);
                }
            }
        }, CONFIG.WAIT_BEFORE_CLICK);

        return true;
    }

    function pollForAds() {
        const now = Date.now();
        if (now - lastAdCheck < CONFIG.POLL_INTERVAL) return;
        lastAdCheck = now;

        try {
            // Priority order: video ads, skip buttons, overlays, ad options
            if (handleVideoAd() || 
                removeAdOverlay() || 
                handleAdOptions()) {
                log('Ad handling action taken');
            }
        } catch (e) {
            log('Error in pollForAds:', e);
        }

        setTimeout(pollForAds, CONFIG.POLL_INTERVAL);
    }

    function setupAdObserver() {
        if (adObserver) adObserver.disconnect();

        const observerCallback = (mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    pollForAds();
                }
            }
        };

        adObserver = new MutationObserver(observerCallback);
        
        // Observe video player container
        const playerContainer = document.querySelector('#movie_player');
        if (playerContainer) {
            adObserver.observe(playerContainer, {
                childList: true,
                subtree: true
            });
            log('Ad observer set up');
        }
    }

    function initialize() {
        // Reset max tries periodically
        setInterval(() => {
            maxTries = CONFIG.MAX_TRIES;
        }, CONFIG.RESET_TIMEOUT);

        // Start polling and observing
        pollForAds();
        setupAdObserver();

        // Watch for page navigation
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector('#movie_player')) {
                setupAdObserver();
                maxTries = CONFIG.MAX_TRIES;
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log('Initialization complete');
    }

    // Start when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
