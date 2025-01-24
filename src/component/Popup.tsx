"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  BarChart2,
  Layers,
  Trash2,
  Send,
  AlertCircle,
} from "lucide-react";
import { NumberInput } from "./NumberInput";
import { IOSButton } from "./IOSButton";

interface Tab {
  id: number;
  title: string;
  url: string;
  isActive: boolean;
  tabFavicon: string;
  lastAccessed: number;
}

interface OriginalTab {
  id: number;
  title: string;
  url: string;
  tabFavicon: string;
  lastAccessed: number;
}

const calculateProductivityScore = (
  activeCount: number,
  inactiveCount: number
) => {
  const totalTabs = activeCount + inactiveCount;
  if (totalTabs === 0) return 100;
  const activeTabWeight = 1;
  const inactiveTabPenalty = 0.5;
  const maxScore = totalTabs * activeTabWeight;
  const actualScore =
    activeCount * activeTabWeight - inactiveCount * inactiveTabPenalty;
  const score = (actualScore / maxScore) * 100;
  return Math.round(Math.max(0, Math.min(100, score)));
};

const TabItem = React.memo(
  ({ tab, onRemove }: { tab: Tab; onRemove: (id: number) => void }) => {
    const formatLastAccessed = (timestamp: number) => {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return `${minutes}m ago`;
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center py-2 px-3 rounded-lg bg-zinc-900/50 backdrop-blur-sm mb-2 border border-zinc-800"
      >
        <img
          src={tab.tabFavicon || "/placeholder.svg"}
          alt=""
          className="w-4 h-4 mr-3"
        />
        <span className="flex-1 truncate text-sm text-zinc-200">
          {tab.title}
        </span>
        <span className="text-xs text-zinc-400 mr-3">
          {formatLastAccessed(tab.lastAccessed)}
        </span>
        <motion.button
          onClick={() => onRemove(tab.id)}
          className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={16} />
        </motion.button>
      </motion.div>
    );
  }
);

export default function Popup() {
  const [originalTabs, setOriginalTabs] = useState<OriginalTab[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(30);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    chrome.storage.sync.get("tabs", (data) => {
      const storedTabs = data.tabs || [];
      setOriginalTabs(storedTabs);
      let updatedStoredTabs: Tab[] = storedTabs.map((tab: Tab) => ({
        ...tab,
        isActive:
          Date.now() - tab.lastAccessed < (hours * 60 + minutes) * 60000,
      }));

      chrome.tabs.query({active: true}, (result) => {
        const activeTab = result[0];
        updatedStoredTabs = updatedStoredTabs.filter((updatedTab) => updatedTab.id !== activeTab.id)
      })
      setTabs(updatedStoredTabs);
    });
  }, );

  useEffect(() => {
    chrome.storage.sync.get("inactivityThreshold", (data) => {
      setHours(data.inactivityThreshold?.hours || 0);
      setMinutes(data.inactivityThreshold?.minutes || 30);
    });
  }, []);

  useEffect(() => {
    const activeTabs = tabs.filter((tab) => tab.isActive);
    const inactiveTabs = tabs.filter((tab) => !tab.isActive);
    setProductivityScore(
      calculateProductivityScore(activeTabs.length, inactiveTabs.length)
    );
  }, [tabs]);

  const removeTab = useCallback((id: number) => {
    chrome.tabs.remove(id);
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
    setOriginalTabs((prevOriginalTabs) =>
      prevOriginalTabs.filter((ogTab) => ogTab.id !== id)
    );

    chrome.storage.sync.set({ tabs: originalTabs });
  }, []);

  const removeAllInactive = () => {
    const updatedTabs: Tab[] = [];

    tabs.forEach((tab) => {
      if (!tab.isActive) {
        chrome.tabs.remove(tab.id);
      } else {
        updatedTabs.push(tab);
      }
    });

    setTabs(updatedTabs);

    setOriginalTabs((prevOriginalTabs) => prevOriginalTabs.filter((ogTab) => (Date.now() - ogTab.lastAccessed) < (minutes + hours * 60) * 60000));

    chrome.storage.sync.set({tabs: originalTabs});
  };

  const organizeTabs = () => {
    console.log("Organizing tabs...");
  };

  const submitInactivityThreshold = () => {
    const inactivityThreshold = { hours, minutes };
    chrome.storage.sync.set({ inactivityThreshold });
  };

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  const inactiveTabs = tabs.filter((tab) => !tab.isActive);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-80 p-6 bg-black/95 backdrop-blur-xl text-zinc-50 font-sans border border-zinc-800/50 shadow-2xl"
    >
      <div className="mb-8 text-center space-y-1">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-zinc-100 to-zinc-400 text-transparent bg-clip-text">
          Tabify
        </h1>
        <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase">
          Smart Tab Management
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-zinc-400 uppercase tracking-wider">
          Inactive Tabs
        </h2>
        <div
          className={`space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar ${
            isScrolling ? "scrolling" : ""
          }`}
          onScroll={handleScroll}
        >
          <AnimatePresence>
            {inactiveTabs.length > 0 ? (
              inactiveTabs.map((tab) => (
                <TabItem key={tab.id} tab={tab} onRemove={removeTab} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-12 text-zinc-500"
              >
                <AlertCircle size={24} className="mb-2" />
                <p className="text-sm">No inactive tabs</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-4 mb-6 border border-zinc-800/50 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center text-zinc-400">
            <Clock size={16} className="mr-2" /> Active tabs
          </span>
          <span className="font-medium text-zinc-200">
            {tabs.filter((tab) => tab.isActive).length}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center text-zinc-400">
            <Clock size={16} className="mr-2" /> Inactive tabs
          </span>
          <span className="font-medium text-zinc-200">
            {inactiveTabs.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-zinc-400">
            <BarChart2 size={16} className="mr-2" /> Productivity score
          </span>
          <span className="font-medium text-zinc-200">
            {productivityScore}%
          </span>
        </div>
      </div>

      <div className="flex justify-between mb-6 space-x-3">
        <IOSButton onClick={removeAllInactive} className="flex-1">
          <Trash2 size={14} className="inline mr-1" /> Remove All
        </IOSButton>
        <IOSButton onClick={organizeTabs} className="flex-1">
          <Layers size={14} className="inline mr-1" /> Organize
        </IOSButton>
      </div>

      <div className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50 shadow-inner">
        <h2 className="text-sm font-medium mb-3 text-zinc-400 uppercase tracking-wider">
          Inactivity Threshold
        </h2>
        <div className="flex justify-center items-center mb-3 space-x-4">
          <NumberInput
            value={hours}
            onChange={setHours}
            min={0}
            max={23}
            label="Hours"
          />
          <NumberInput
            value={minutes}
            onChange={setMinutes}
            min={0}
            max={59}
            label="Minutes"
          />
        </div>
        <IOSButton onClick={submitInactivityThreshold} className="w-full">
          <Send size={14} className="inline mr-1" /> Set Threshold
        </IOSButton>
      </div>
    </motion.div>
  );
}
