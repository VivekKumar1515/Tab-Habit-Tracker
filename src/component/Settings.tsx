"use client"

import { useState, useEffect } from "react"
import { Send, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { NumberInput } from "./NumberInput"
import { IOSButton } from "./IOSButton"
import { CircularLoader } from "./CircularLoader"

interface SettingsProps {
  onBack: () => void
  hours: number
  minutes: number
  onUpdateThreshold: (hours: number, minutes: number) => void
}

export function Settings({ onBack, hours, minutes, onUpdateThreshold }: SettingsProps) {
  const [localHours, setLocalHours] = useState(hours)
  const [localMinutes, setLocalMinutes] = useState(minutes)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isThresholdZero = localHours === 0 && localMinutes === 0

  useEffect(() => {
    setLocalHours(hours)
    setLocalMinutes(minutes)
  }, [hours, minutes])

  const submitInactivityThreshold = () => {
    if (!isThresholdZero) {
      setIsSubmitting(true)
      setTimeout(() => {
        onUpdateThreshold(localHours, localMinutes)
        setIsSubmitting(false)
      }, 2000) // Simulating an API call
    }
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="space-y-4"
    >
      <button onClick={onBack} className="flex items-center text-zinc-400 hover:text-zinc-200 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Tabs
      </button>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50 shadow-inner"
      >
        <h2 className="text-sm font-medium mb-3 text-zinc-400 uppercase tracking-wider">Inactivity Threshold</h2>
        <div className="flex justify-center items-center mb-3 space-x-4">
          <NumberInput value={localHours} onChange={(value) => setLocalHours(value)} min={0} max={23} label="Hours" />
          <NumberInput
            value={localMinutes}
            onChange={(value) => setLocalMinutes(value)}
            min={0}
            max={59}
            label="Minutes"
          />
        </div>
        <div className="relative">
          <IOSButton onClick={submitInactivityThreshold} disabled={isThresholdZero || isSubmitting} className="w-full">
            {isSubmitting ? (
              <CircularLoader size={20}/>
            ) : (
              <>
                <Send size={14} className="inline mr-1" />
                Set Threshold
              </>
            )}
          </IOSButton>
        </div>
      </motion.div>
    </motion.div>
  )
}

