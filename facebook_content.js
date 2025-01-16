// /////unwanted_post_filter     best
// Initialize state
let unwantedPostFilterEnabled = true;

// Load filter settings
chrome.storage.local.get(['unwanted_post_filter'], ({ unwanted_post_filter = true }) => {
    unwantedPostFilterEnabled = unwanted_post_filter;
});

// Process posts
const hideFollowButtons = () => {
    if (!unwantedPostFilterEnabled) return;

    const h3 = [...document.querySelectorAll('h3')]
        .find(h => h.textContent.toLowerCase().includes('news feed posts'));
    if (!h3?.nextElementSibling?.nextElementSibling) return;

    const posts = h3.nextElementSibling.nextElementSibling.children;
    [...posts].forEach(post => {
        if (post.classList.contains("SUGGESTED_POST_FUCKED")) return;

        const hasFollowButton = [...post.querySelectorAll('[role="button"] *')]
            .some(el => /Follow|Join/.test(el.textContent));

        if (hasFollowButton) {
            post.classList.add("SUGGESTED_POST_FUCKED");
            post.style.display = 'none';
            
            chrome.storage.local.get("sb", ({ sb = 0 }) => {
                chrome.storage.local.set({ "sb": parseInt(sb, 10) + 1 });
            });
        }
    });
};

// Set up mutation observer
new MutationObserver(mutations => {
    if (mutations.some(m => m.addedNodes.length)) hideFollowButtons();
}).observe(document, {
    childList: true,
    subtree: true,
    characterData: false
});
































//// Setting unwanted post filter enabled by default in content.js
// var unwantedPostFilterEnabled = true;

// const hideFollowButtons = () => {
//     // Fetching the unwanted_post_filter only (advertisement_filter removed)
//     chrome.storage.local.get(['unwanted_post_filter'], function(data) {
//         unwantedPostFilterEnabled = data.unwanted_post_filter ?? true; // default to true
//     });

//     if (!unwantedPostFilterEnabled) return;

//     const h3Element = Array.from(document.querySelectorAll('h3'))
//         .find(h3 => h3.textContent.toLowerCase().includes('news feed posts'));

//     if (h3Element) {
//         let secondSibling = h3Element.nextElementSibling?.nextElementSibling;

//         if (secondSibling) {
//             Array.from(secondSibling.children).forEach(child => {
//                 const buttonElements = child.querySelectorAll('[role="button"]');
//                 Array.from(buttonElements).forEach(buttonElement => {
//                     const containsFollow = Array.from(buttonElement.querySelectorAll('*'))
//                         .some(tag => tag.textContent.includes('Follow') || tag.textContent.includes('Join'));
//                     if (containsFollow) {
//                         if (!child.classList.contains("SUGGESTED_POST_FUCKED")) {
//                             child.classList.add("SUGGESTED_POST_FUCKED");
//                             child.style.display = 'none';
//                             chrome.storage.local.get("sb", function(data) {
//                                 const existingVal = parseInt(data.sb, 10);
//                                 const newVal = isNaN(existingVal) ? 0 : existingVal + 1;
//                                 chrome.storage.local.set({"sb": newVal});
//                             });
//                         }
//                     }
//                 });
//             });
//         }
//     }
// };

// var observers = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

// var observer = new observers((mutations) => {
//     var newNodeFound = false;
//     for (var i = 0; i < mutations.length; i++){
//         if (mutations[i].addedNodes.length) {
//             newNodeFound = true;
//            break;
//         }
//     }
//     if (newNodeFound) {hideFollowButtons();}
// });

// observer.observe(document, { childList: true, subtree: true, characterData: false });
