class Tab {
    constructor(id, title, url, isActive, tabFavicon, lastAccessed) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.isActive = isActive;
        this.tabFavicon = tabFavicon;
        this.lastAccessed = lastAccessed;
    }
}

// Handle tab creation
chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.sync.get("tabs", (data) => {
        const storedTabs = data.tabs || [];
        const newTab = new Tab(tab.id, tab.title || "New Tab", tab.url || "", true, tab.favIconUrl || "", tab.lastAccessed);
        storedTabs.push(newTab);

        chrome.storage.sync.set({ tabs: storedTabs }, () => {
            console.log("Tab added:", newTab);
        });
    });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(tab.status === "complete") {
        chrome.storage.sync.get("tabs", (data) => {
            const storedTabs = data.tabs || [];
    
            const updatedTabs = storedTabs.map((storedTab) => {
                if (storedTab.id === tabId) {
                    return new Tab(tab.id, tab.title || storedTab.title, tab.url || storedTab.url, true, tab.favIconUrl || storedTab.tabFavicon, tab.lastAccessed);
                }
                return storedTab;
            });
    
            chrome.storage.sync.set({ tabs: updatedTabs }, () => {
                console.log("Tabs updated:", updatedTabs);
            });
        });
    }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.sync.get("tabs", (data) => {
        const storedTabs = data.tabs || [];
        const remainingTabs = storedTabs.filter((storedTab) => storedTab.id !== tabId);

        chrome.storage.sync.set({ tabs: remainingTabs }, () => {
            console.log("Tab removed. Remaining tabs:", remainingTabs);
        });
    });
});
