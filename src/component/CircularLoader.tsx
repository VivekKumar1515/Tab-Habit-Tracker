import type React from "react"
import { motion } from "framer-motion"

interface CircularLoaderProps {
  size?: number
  color?: string
}

export const CircularLoader: React.FC<CircularLoaderProps> = ({
  size = 24,
  color = "#ffffff", 
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      className="mx-auto"
      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </motion.svg>
  )
}

