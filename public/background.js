class Tab {
    constructor(id, title, url, tabFavicon, lastAccessed) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.tabFavicon = tabFavicon;
        this.lastAccessed = lastAccessed;
    }

    // Update tab fields
    update(updatedFields) {
        Object.assign(this, updatedFields);
    }
}

let cachedTabs = [];
let inactivityThreshold = { hours: 0, minutes: 30 };

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed!");

    // Initialize tabs on install
    chrome.tabs.query({}, (tabs) => {
        cachedTabs = tabs.map(tab => new Tab(tab.id, tab.title, tab.url, tab.favIconUrl, tab.lastAccessed));
        saveTabsToStorage();
        setInactivityThreshold();
    });
});

// Fetch and cache inactivity threshold
function setInactivityThreshold() {
    chrome.storage.sync.get("inactivityThreshold", (data) => {
        inactivityThreshold = data.inactivityThreshold || { hours: 0, minutes: 30 };
    });
}

// Save tabs to storage
function saveTabsToStorage() {
    chrome.storage.sync.set({ tabs: cachedTabs }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error saving tabs:", chrome.runtime.lastError);
        } else {
            console.log("Tabs saved successfully");
        }
    });
}

// Handle tab creation
chrome.tabs.onCreated.addListener((tab) => {
    cachedTabs.push(new Tab(tab.id, tab.title || "New Tab", tab.url || "", tab.favIconUrl || "", tab.lastAccessed));
    saveTabsToStorage();
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.status === "complete") {
        const updatedTab = cachedTabs.find(t => t.id === tabId);
        if (updatedTab) {
            updatedTab.update({
                title: tab.title || updatedTab.title,
                url: tab.url || updatedTab.url,
                tabFavicon: tab.favIconUrl || updatedTab.tabFavicon,
                lastAccessed: tab.lastAccessed
            });
            saveTabsToStorage();
        }
    }
});

// Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        const updatedTab = cachedTabs.find(t => t.id === tab.id);
        if (updatedTab) {
            updatedTab.update({ lastAccessed: tab.lastAccessed });
            saveTabsToStorage();
        }
    });
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
    cachedTabs = cachedTabs.filter(t => t.id !== tabId);
    saveTabsToStorage();
});

// Get inactivity threshold in milliseconds
function getInactivityThreshold() {
    return new Promise((resolve) => {
        resolve((inactivityThreshold.minutes + inactivityThreshold.hours * 60) * 60000);
    });
}

// Setup periodic inactivity check
(async function setupInterval() {
    const intervalTime = await getInactivityThreshold();
    setInterval(() => {
        // Add your periodic code here, like checking for inactive tabs
        console.log("Checking inactivity...");
    }, intervalTime);
})();
