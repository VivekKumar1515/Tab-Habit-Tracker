class Tab {
    constructor(id, title, url, tabFavicon, lastAccessed) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.tabFavicon = tabFavicon;
        this.lastAccessed = lastAccessed;
    }
}

chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed!");

    const storedTabs = [];
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            storedTabs.push(new Tab(tab.id, tab.title, tab.url, tab.favIconUrl, tab.lastAccessed));
        });

        chrome.storage.sync.set({ tabs: storedTabs });
        chrome.storage.sync.set({ inactivityThreshold: { hours: 0, minutes: 30 } });
    });
});


// Handle tab creation
chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.sync.get("tabs", (data) => {
        const storedTabs = data.tabs || [];
        const newTab = new Tab(tab.id, tab.title || "New Tab", tab.url || "", tab.favIconUrl || "", tab.lastAccessed);
        storedTabs.push(newTab);

        chrome.storage.sync.set({ tabs: storedTabs }, () => {
            console.log("Tab added:", newTab);
        });
    });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.status === "complete") {
        chrome.storage.sync.get("tabs", (data) => {
            const storedTabs = data.tabs || [];
            const updatedTabs = storedTabs.map((storedTab) => {
                if (storedTab.id === tabId) {
                    return new Tab(tab.id, tab.title || storedTab.title, tab.url || storedTab.url, tab.favIconUrl || storedTab.tabFavicon, tab.lastAccessed);
                }
                return storedTab;
            });

            chrome.storage.sync.set({ tabs: updatedTabs }, () => {
                console.log("Tabs updated:", updatedTabs);
            });
        });
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      chrome.storage.sync.get("tabs", (data) => {
        const storedTabs = data.tabs || [];
        const updatedTabs = storedTabs.map((storedTab) => {
          if (storedTab.id === tab.id) {
            return { ...storedTab, lastAccessed: tab.lastAccessed };
          }
          return storedTab;
        });
  
        console.log(updatedTabs, tab.title, "is currently active");
        chrome.storage.sync.set({ tabs: updatedTabs });
      });
    });
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

// Get inactivity threshold
function getInactivityThreshold() {
    return new Promise((resolve) => {
        chrome.storage.sync.get("inactivityThreshold", (data) => {
            const inactivityThreshold = data.inactivityThreshold || { hours: 0, minutes: 30 };
            const { minutes, hours } = inactivityThreshold;
            console.log("Minutes:", minutes, "Hours:", hours);
            resolve((minutes + hours * 60) * 60000); // Convert to milliseconds
        });
    });
}

// Setup interval
(async function setupInterval() {
    const intervalTime = await getInactivityThreshold();
    console.log("Interval time (ms):", intervalTime);

    setInterval(() => {
        console.log("Interval triggered!");
        // Add your periodic code here
    }, intervalTime);
})();
