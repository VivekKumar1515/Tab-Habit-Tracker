import { Send, ArrowLeft } from "lucide-react"
import { NumberInput } from "./NumberInput"
import { IOSButton } from "./IOSButton"

interface SettingsProps {
  onBack: () => void
  hours: number
  minutes: number
  onUpdateThreshold: (hours: number, minutes: number) => void
}

export function Settings({ onBack, hours, minutes, onUpdateThreshold }: SettingsProps) {
  const submitInactivityThreshold = () => {
    onUpdateThreshold(hours, minutes)
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center text-zinc-400 hover:text-zinc-200 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to Tabs
      </button>
      <div className="bg-zinc-900/70 backdrop-blur-sm rounded-lg p-4 border border-zinc-800/50 shadow-inner">
        <h2 className="text-sm font-medium mb-3 text-zinc-400 uppercase tracking-wider">Inactivity Threshold</h2>
        <div className="flex justify-center items-center mb-3 space-x-4">
          <NumberInput
            value={hours}
            onChange={(value) => onUpdateThreshold(value, minutes)}
            min={0}
            max={23}
            label="Hours"
          />
          <NumberInput
            value={minutes}
            onChange={(value) => onUpdateThreshold(hours, value)}
            min={1}
            max={59}
            label="Minutes"
          />
        </div>
        <IOSButton onClick={submitInactivityThreshold} className="w-full">
          <Send size={14} className="inline mr-1" /> Set Threshold
        </IOSButton>
      </div>
    </div>
  )
}

