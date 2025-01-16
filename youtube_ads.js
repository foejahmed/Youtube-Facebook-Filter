//  YouTube Ad Handler
(function() {
    'use strict';
    
    const _SELECTORS = [    
        '.ytp-ad-player-overlay-layout .ytp-ad-clickable .ytp-ad-button-icon',
        '.ytp-ad-overlay-close-container .ytp-ad-overlay-close-button',
        '.ytp-skip-ad-button',  
        '.yt-about-this-ad-renderer',
    ];

    var overlayOpened = false;
    var maxTries = 2;
    var debug = false;

    // Wait for jQuery to be available
    function waitForJQuery(callback) {
        if (typeof jQuery !== 'undefined') {
            callback();
        } else {
            setTimeout(function() {
                waitForJQuery(callback);
            }, 50);
        }
    }

    function pageReloaded() {
        if (debug) console.log("new page loaded", maxTries);
        maxTries = 2;
    }

    var maxTriesReseted = false;
    function resetMaxTries() {
        if (!maxTriesReseted) {
            maxTriesReseted = true;
            setTimeout(function() { 
                maxTries = 2;
                maxTriesReseted = false;
            }, 40000);
        }
    }

    function safeClick(element) {
        try {
            if (element && element.length) {
                element.click();
                return true;
            }
        } catch (e) {
            if (debug) console.log("Click failed:", e);
        }
        return false;
    }

    function poll() {   
        const POLL_INTERVAL = 1000; 
        const waitBeforeClick = 450;

        try {
            // Handle skip ad button
            const skipButton = document.querySelector(_SELECTORS[2]);
            if (skipButton && skipButton.offsetParent !== null) {
                safeClick(skipButton);
                return;
            }

            // Handle overlay close button
            const overlayClose = document.querySelector(_SELECTORS[1]);
            if (overlayClose && overlayClose.offsetParent !== null) {
                safeClick(overlayClose);
                return;
            }

            // Handle ad options
            const adButton = document.querySelector(_SELECTORS[0]);
            if (adButton && adButton.offsetParent !== null && maxTries > 0) {
                if (!overlayOpened) {
                    if (debug) console.log("open overlay");
                    safeClick(adButton);

                    setTimeout(function() {
                        const popupContainer = document.querySelector(_SELECTORS[3]);
                        
                        if (popupContainer && popupContainer.offsetParent !== null && !overlayOpened) {
                            overlayOpened = true;
                            maxTries--;
                            resetMaxTries();

                            setTimeout(function() {
                                const blockButton = popupContainer.querySelector("button:has(img[src*='slash_circle_left_24px.svg'])");
                                if (blockButton) {
                                    safeClick(blockButton);

                                    setTimeout(function() {
                                        const confirmButton = popupContainer.querySelector("div[role='button']");
                                        if (confirmButton) {
                                            safeClick(confirmButton);

                                            setTimeout(function() {
                                                const closeButton = popupContainer.querySelector("button");
                                                if (closeButton) {
                                                    safeClick(closeButton);
                                                    
                                                    // Fallback close
                                                    if (popupContainer.offsetParent !== null) {
                                                        document.body.click();
                                                    }
                                                }
                                                overlayOpened = false;
                                            }, waitBeforeClick);
                                        }
                                    }, waitBeforeClick);
                                }
                            }, waitBeforeClick);
                        }
                    }, waitBeforeClick);
                }
            }
        } catch (e) {
            if (debug) console.log("Error in poll:", e);
        }

        setTimeout(poll, POLL_INTERVAL);
    }

    // Start observing page changes
    function initializeObserver() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length && mutation.type === 'childList') {
                    pageReloaded();
                }
            });
        });

        function checkPageReloaded() {
            const targetNode = document.querySelector(".ytd-video-primary-info-renderer");
            
            if (!targetNode) {
                setTimeout(checkPageReloaded, 500);
                return;
            }

            observer.observe(targetNode, {
                childList: true,
                subtree: true
            });
        }

        checkPageReloaded();
    }

    // Initialize everything when DOM is ready
    function initialize() {
        waitForJQuery(function() {
            poll();
            initializeObserver();
        });
    }

    // Ensure the script runs after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();