//it's for fb file
chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.clear()
});