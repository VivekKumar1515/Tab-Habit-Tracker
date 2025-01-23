"use client";

import React, { useState, useEffect, useCallback } from "react";
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

interface Tab {
  id: number;
  title: string;
  url: string;
  isActive: boolean;
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
        className="flex items-center py-2 px-3 rounded-lg bg-gray-800 mb-2"
      >
        <img
          src={tab.tabFavicon || "/placeholder.svg"}
          alt=""
          className="w-4 h-4 mr-3"
        />
        <span className="flex-1 truncate text-sm text-gray-300">
          {tab.title}
        </span>
        <span className="text-xs text-gray-500 mr-3">
          {formatLastAccessed(tab.lastAccessed)}
        </span>
        <motion.button
          onClick={() => onRemove(tab.id)}
          className="text-gray-500 hover:text-red-400 transition-colors duration-200"
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
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(30);

  useEffect(() => {
    // Simulating fetching data from the extension
    chrome.storage.sync.get("tabs", (data) => {
      const storedTabs = data.tabs || [];
      storedTabs.map((tab: Tab) => ({...tab, isActive: Date.now() - tab.lastAccessed > (hours*60 + minutes)*60000}))
      console.log(storedTabs);
      
      setTabs(storedTabs)
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get("inactivityThreshold", (data) => {
      setHours(data.inactivityThreshold.hours);
      setMinutes(data.inactivityThreshold.minutes);
    })
  }, [hours, minutes])

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
  }, []);

  const removeAllInactive = () => {
    tabs.forEach((tab) => {
      if(!tab.isActive) {
        chrome.tabs.remove(tab.id)
      }
    })
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.isActive));
  };

  const organizeTabs = () => {
    console.log("Organizing tabs...");
  };

  const submitInactivityThreshold = () => {
    console.log(`Inactivity threshold set to ${hours}h ${minutes}m`);
    const inactivityThreshold = {hours: hours, minutes: minutes};
    chrome.storage.sync.set({inactivityThreshold: inactivityThreshold})
  };

  const inactiveTabs = tabs.filter((tab) => !tab.isActive);

  return (
    <div className="w-80 p-6 bg-gray-900 text-gray-100 font-sans border-none">
      <h1 className="text-2xl font-bold mb-6 text-center">Tab Habit Tracker</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-300">
          Inactive Tabs
        </h2>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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
                className="flex flex-col items-center justify-center h-12 text-gray-500"
              >
                <AlertCircle size={24} className="mb-2" />
                <p className="text-sm">No inactive tabs</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center text-gray-300">
            <Clock size={16} className="mr-2" /> Active tabs
          </span>
          <span className="font-semibold text-gray-100">
            {tabs.filter((tab) => tab.isActive).length}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center text-gray-300">
            <Clock size={16} className="mr-2" /> Inactive tabs
          </span>
          <span className="font-semibold text-gray-100">
            {inactiveTabs.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-300">
            <BarChart2 size={16} className="mr-2" /> Productivity score
          </span>
          <span className="font-semibold text-gray-100">
            {productivityScore}%
          </span>
        </div>
      </div>

      <div className="flex justify-between mb-6 space-x-3">
        <motion.button
          onClick={removeAllInactive}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-red-500 text-white transition-colors duration-200"
          whileHover={{ backgroundColor: "#f56565" }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 size={14} className="inline mr-1" /> Remove All
        </motion.button>
        <motion.button
          onClick={organizeTabs}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-blue-500 text-white transition-colors duration-200"
          whileHover={{ backgroundColor: "#4299e1" }}
          whileTap={{ scale: 0.95 }}
        >
          <Layers size={14} className="inline mr-1" /> Organize
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-300">
          Inactivity Threshold
        </h2>
        <div className="flex justify-center items-center mb-3">
          <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number.parseInt(e.target.value) || 0)}
              className="w-12 p-2 text-center bg-transparent text-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="23"
            />
            <span className="text-gray-400 px-1">h</span>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number.parseInt(e.target.value) || 0)}
              className="w-12 p-2 text-center bg-transparent text-gray-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="59"
            />
            <span className="text-gray-400 px-1">m</span>
          </div>
        </div>
        <motion.button
          onClick={submitInactivityThreshold}
          className="w-full py-2 px-3 rounded-lg text-sm font-medium bg-green-500 text-white transition-colors duration-200"
          whileHover={{ backgroundColor: "#48bb78" }}
          whileTap={{ scale: 0.95 }}
        >
          <Send size={14} className="inline mr-1" /> Set Threshold
        </motion.button>
      </div>
    </div>
  );
}
