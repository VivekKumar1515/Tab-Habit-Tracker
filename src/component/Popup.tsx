"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, BarChart2, Trash2, SettingsIcon } from "lucide-react"
import { IOSButton } from "./IOSButton"
import { DomainGroup } from "./DomainGroup"
import { groupBy } from "lodash"
import { Settings } from "./Settings"
import { CircularLoader } from "./CircularLoader"

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

export default function Popup() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [productivityScore, setProductivityScore] = useState(0)
  const [groupedTabs, setGroupedTabs] = useState<{ [key: string]: Tab[] }>({})
  const [showSettings, setShowSettings] = useState(false)
  const [hours, setHours] = useState<number>(0)
  const [minutes, setMinutes] = useState<number>(30)
  const [isLoadingTabs, setIsLoadingTabs] = useState(true)

  // Helper to load tabs in chunks
  const loadTabsFromStorage = async () => {
    return new Promise<Tab[]>((resolve, reject) => {
      chrome.storage.local.get(["totalTabChunks", "inactivityThreshold"], (data) => {
        if (chrome.runtime.lastError || !data.totalTabChunks) {
          reject(new Error("Error fetching tab chunks"))
          return
        }
        const totalChunks = data.totalTabChunks
        const inactivityThreshold = data.inactivityThreshold || { hours: 0, minutes: 30 }
        let loadedTabs: Tab[] = []

        const loadChunk = async (index: number) => {
          return new Promise<void>((resolveChunk) => {
            chrome.storage.local.get([`tabs_chunk_${index}`], (chunkData) => {
              if (chrome.runtime.lastError) {
                console.error(`Error fetching chunk ${index}:`, chrome.runtime.lastError)
              } else if (chunkData[`tabs_chunk_${index}`]) {
                loadedTabs = loadedTabs.concat(chunkData[`tabs_chunk_${index}`])
              }
              resolveChunk()
            })
          })
        }

        // Load all chunks
        const chunkPromises = []
        for (let i = 0; i < totalChunks; i++) {
          chunkPromises.push(loadChunk(i))
        }

        Promise.all(chunkPromises)
          .then(() => {
            const thresholdMs = (inactivityThreshold.hours * 60 + inactivityThreshold.minutes) * 60000
            const updatedTabs = loadedTabs.map((tab: Tab) => ({
              ...tab,
              isActive: Date.now() - tab.lastAccessed < thresholdMs,
            }))
            resolve(updatedTabs)
          })
          .catch(reject)
      })
    })
  }

  useEffect(() => {
    loadTabsFromStorage()
      .then((storedTabs) => {
        const updatedStoredTabs: Tab[] = storedTabs.map((tab: Tab) => ({
          ...tab,
          isActive: Date.now() - tab.lastAccessed < (hours * 60 + minutes) * 60000,
        }))

        chrome.tabs.query({ active: true }, (result) => {
          const activeTabs = new Set()
          result.forEach((tab) => activeTabs.add(tab.id))
          const updatedTabs: Tab[] = updatedStoredTabs.map((tab: Tab) =>
            activeTabs.has(tab.id) ? { ...tab, isActive: true } : tab,
          )
          setTabs(updatedTabs)
          setTimeout(() => {
            setIsLoadingTabs(false)

          }, 1500)
        })
      })
      .catch((error) => {
        console.error("Error loading tabs:", error)
        setIsLoadingTabs(false)
      })
  }, [minutes, hours]) // Added loadTabsFromStorage to dependencies

  useEffect(() => {
    chrome.storage.local.get("inactivityThreshold", (data) => {
      setHours(data.inactivityThreshold?.hours || 0)
      setMinutes(data.inactivityThreshold?.minutes || 30)
    })
  }, [])

  useEffect(() => {
    const activeTabs = tabs.filter((tab) => tab.isActive)
    const inactiveTabs = tabs.filter((tab) => !tab.isActive)
    setGroupedTabs(groupBy(inactiveTabs, (tab) => new URL(tab.url).hostname))
    setProductivityScore(calculateProductivityScore(activeTabs.length, inactiveTabs.length))
  }, [tabs])

  const removeTab = (id: number) => {
    chrome.tabs.remove(id)
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id))
  }

  const removeAllInactive = async () => {
    const updatedTabs: Tab[] = []
    let wait = true
    for (const tab of tabs) {
      if (!tab.isActive) {
        if (wait) {
          chrome.tabs.remove(tab.id)
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Waits before proceeding
          wait = false
        } else chrome.tabs.remove(tab.id)
      } else {
        updatedTabs.push(tab)
      }
    }

    setTabs(updatedTabs)
  }

  const inactiveTabs = tabs.filter((tab) => !tab.isActive)

  const toggleSettings = () => setShowSettings(!showSettings)

  const updateInactivityThreshold = (newHours: number, newMinutes: number) => {
    setHours(newHours)
    setMinutes(newMinutes)
    const inactivityThreshold = { hours: newHours, minutes: newMinutes }
    chrome.storage.local.set({ inactivityThreshold: inactivityThreshold })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-80 p-6 bg-black text-zinc-50 font-sans border border-zinc-800/50 shadow-2xl overflow-hidden"
    >
      <motion.div
        className="mb-8 text-center space-y-1 relative"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.2 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-zinc-100 to-zinc-400 text-transparent bg-clip-text">
          Tabify
        </h1>
        <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase">Smart Tab Management</p>
        <motion.button
          onClick={toggleSettings}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <SettingsIcon size={20} />
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {showSettings ? (
          <Settings
            key="settings"
            onBack={() => setShowSettings(false)}
            hours={hours}
            minutes={minutes}
            onUpdateThreshold={updateInactivityThreshold}
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-6">
              <h2 className="text-sm font-medium mb-3 text-zinc-400 uppercase tracking-wider">Inactive Tabs</h2>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {isLoadingTabs ? (
                  <div className="flex justify-center items-center h-40">
                    <CircularLoader size={20} color="#ffffff" />
                  </div>
                ) : (
                  <AnimatePresence>
                    {Object.entries(groupedTabs).map(([domain, domainTabs]) => (
                      <DomainGroup key={domain} domain={domain} tabs={domainTabs} onRemove={removeTab} />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            <motion.div
              className="bg-zinc-900 rounded-lg p-4 mb-6 border border-zinc-800/50 shadow-inner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center text-zinc-400">
                  <Clock size={16} className="mr-2" /> Active tabs
                </span>
                <span className="font-medium text-zinc-200">{tabs.filter((tab) => tab.isActive).length}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center text-zinc-400">
                  <Clock size={16} className="mr-2" /> Inactive tabs
                </span>
                <span className="font-medium text-zinc-200">{inactiveTabs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-zinc-400">
                  <BarChart2 size={16} className="mr-2" /> Productivity score
                </span>
                <span className="font-medium text-zinc-200">{productivityScore}%</span>
              </div>
            </motion.div>

            <motion.div
              className="flex justify-between mb-6 space-x-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              <IOSButton onClick={removeAllInactive} className="flex-1">
                <Trash2 size={14} className="inline mr-1" /> Remove All
              </IOSButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

