"use client"

import  { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, BarChart2, Layers, Trash2, Send, AlertCircle } from "lucide-react"

interface Tab {
  id: number
  title: string
  url: string
  isActive: boolean
  tabFavicon: string
  lastAccessed: number
}

const calculateProductivityScore = (activeCount: number, inactiveCount: number) => {
  const totalTabs = activeCount + inactiveCount
  if (totalTabs === 0) return 100
  const activeTabWeight = 1
  const inactiveTabPenalty = 0.5
  const maxScore = totalTabs * activeTabWeight
  const actualScore = activeCount * activeTabWeight - inactiveCount * inactiveTabPenalty
  const score = (actualScore / maxScore) * 100
  return Math.round(Math.max(0, Math.min(100, score)))
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
}

export default function Popup() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [productivityScore, setProductivityScore] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)

  useEffect(() => {
    // Simulating fetching data from the extension
    setTabs([
      {
        id: 1,
        title: "Active Tab",
        url: "https://example1.com",
        isActive: true,
        tabFavicon: "https://example1.com/favicon.ico",
        lastAccessed: Date.now(),
      },
      {
        id: 2,
        title: "Inactive Tab 1",
        url: "https://example2.com",
        isActive: false,
        tabFavicon: "https://example2.com/favicon.ico",
        lastAccessed: Date.now() - 3600000,
      },
      {
        id: 3,
        title: "Inactive Tab 2",
        url: "https://example3.com",
        isActive: false,
        tabFavicon: "https://example3.com/favicon.ico",
        lastAccessed: Date.now() - 7200000,
      },
    ])
  }, [])

  useEffect(() => {
    const activeTabs = tabs.filter((tab) => tab.isActive)
    const inactiveTabs = tabs.filter((tab) => !tab.isActive)
    setProductivityScore(calculateProductivityScore(activeTabs.length, inactiveTabs.length))
  }, [tabs])

  const removeTab = (id: number) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id))
  }

  const removeAllInactive = () => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.isActive))
  }

  const organizeTabs = () => {
    console.log("Organizing tabs...")
  }

  const submitInactivityThreshold = () => {
    console.log(`Inactivity threshold set to ${hours}h ${minutes}m`)
    // Here you would typically send this data to the background script
  }

  const formatLastAccessed = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  const inactiveTabs = tabs.filter((tab) => !tab.isActive)

  return (
    <div className="w-80 p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        Tab Habit Tracker
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-4 mb-4 border border-gray-700 max-h-60 overflow-y-auto"
      >
        <AnimatePresence>
          {inactiveTabs.length > 0 ? (
            inactiveTabs.map((tab) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center flex-1 mr-2 overflow-hidden">
                  <img src={tab.tabFavicon || "/placeholder.svg"} alt="" className="w-4 h-4 mr-2" />
                  <span className="truncate">{tab.title}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">{formatLastAccessed(tab.lastAccessed)}</span>
                  <motion.button
                    onClick={() => removeTab(tab.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-20 text-gray-400"
            >
              <AlertCircle size={24} className="mb-2" />
              <p className="text-sm">No inactive tabs</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-4 mb-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center">
            <Clock size={18} className="mr-2" /> Active tabs
          </span>
          <span className="font-semibold">{tabs.filter((tab) => tab.isActive).length}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center">
            <Clock size={18} className="mr-2" /> Inactive tabs
          </span>
          <span className="font-semibold">{inactiveTabs.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <BarChart2 size={18} className="mr-2" /> Productivity score
          </span>
          <span className="font-semibold">{productivityScore}%</span>
        </div>
      </div>

      <div className="flex justify-between mb-4 space-x-2">
        <motion.button
          onClick={removeAllInactive}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Trash2 size={16} className="inline mr-1" /> Remove All
        </motion.button>
        <motion.button
          onClick={organizeTabs}
          className="flex-1 py-2 px-3 rounded-md text-sm font-medium bg-gradient-to-r from-teal-400 to-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Layers size={16} className="inline mr-1" /> Organize
        </motion.button>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
          Inactivity Threshold
        </h2>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number.parseInt(e.target.value))}
              className="w-12 p-1 border border-gray-600 rounded mr-1 text-center bg-gray-700 text-gray-100"
              min="0"
              max="23"
            />
            <span className="mr-2">h</span>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Number.parseInt(e.target.value))}
              className="w-12 p-1 border border-gray-600 rounded mr-1 text-center bg-gray-700 text-gray-100"
              min="0"
              max="59"
            />
            <span>m</span>
          </div>
          <span className="text-sm text-gray-400">
            {hours}h {minutes}m
          </span>
        </div>
        <motion.button
          onClick={submitInactivityThreshold}
          className="w-full py-2 px-3 rounded-md text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          <Send size={16} className="inline mr-1" /> Set Threshold
        </motion.button>
      </div>
    </div>
  )
}

