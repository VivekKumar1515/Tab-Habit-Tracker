import type React from "react"
import { motion } from "framer-motion"

interface IOSButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const IOSButton: React.FC<IOSButtonProps> = ({ onClick, children, className = "", disabled = false }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        py-2 px-4 rounded-lg text-sm font-medium 
        bg-zinc-900 text-zinc-200 transition-all duration-200 
        border border-zinc-800/50 shadow-sm
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800 hover:shadow-md hover:border-zinc-700/50"}
        ${className}
      `}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

