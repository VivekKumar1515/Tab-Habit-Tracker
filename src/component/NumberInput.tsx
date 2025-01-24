import type React from "react"
import { motion } from "framer-motion"
import { ChevronUp, ChevronDown } from "lucide-react"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label: string
}

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, min, max, label }) => {
  const increment = () => {
    onChange(Math.min(value + 1, max))
  }

  const decrement = () => {
    onChange(Math.max(value - 1, min))
  }

  return (
    <div className="flex flex-col items-center">
      <motion.button
        onClick={increment}
        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all duration-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800/50 shadow-sm hover:shadow-md hover:border-zinc-700/50"
        whileTap={{ scale: 0.95 }}
      >
        <ChevronUp size={20} />
      </motion.button>
      <div className="flex items-center justify-center bg-zinc-900 rounded-lg w-16 h-12 my-2 border border-zinc-800/50 shadow-inner">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-medium text-zinc-200"
        >
          {value.toString().padStart(2, "0")}
        </motion.span>
      </div>
      <motion.button
        onClick={decrement}
        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-all duration-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800/50 shadow-sm hover:shadow-md hover:border-zinc-700/50"
        whileTap={{ scale: 0.95 }}
      >
        <ChevronDown size={20} />
      </motion.button>
      <span className="text-xs text-zinc-500 mt-1 font-medium tracking-wide">{label}</span>
    </div>
  )
}

