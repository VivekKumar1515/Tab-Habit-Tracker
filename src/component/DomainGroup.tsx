import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, X } from "lucide-react"

interface Tab {
  id: number
  title: string
  url: string
  isActive: boolean
  tabFavicon: string
  lastAccessed: number
}

interface DomainGroupProps {
  domain: string
  tabs: Tab[]
  onRemove: (id: number) => void
}

export const DomainGroup: React.FC<DomainGroupProps> = ({ domain, tabs, onRemove }) => {
  const [isExpanded, setIsExpanded] = React.useState(true)

  const formatLastAccessed = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-sm font-medium mb-2 text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
      >
        <span>
          {domain} ({tabs.length})
        </span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2 overflow-hidden"
          >
            {tabs.map((tab) => (
              <motion.div
                key={tab.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center py-2 px-3 rounded-lg bg-zinc-900/50 backdrop-blur-sm border border-zinc-800"
              >
                <img src={tab.tabFavicon || "/placeholder.svg"} alt="" className="w-4 h-4 mr-3" />
                <span className="flex-1 truncate text-sm text-zinc-200">{tab.title}</span>
                <span className="text-xs text-zinc-400 mr-3">{formatLastAccessed(tab.lastAccessed)}</span>
                <motion.button
                  onClick={() => onRemove(tab.id)}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

