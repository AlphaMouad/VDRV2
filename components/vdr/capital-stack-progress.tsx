"use client"

import { motion } from "framer-motion"
import { Users2, Lock } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/types"

interface CapitalStackProgressProps {
  t: Dictionary
}

export function CapitalStackProgress({ t }: CapitalStackProgressProps) {
  // Mock values for "Manufactured Scarcity"
  const totalRaise = 10500000 // €10.5M
  const softCircled = 8900000 // €8.9M
  const progress = (softCircled / totalRaise) * 100

  return (
    <div className="w-full bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-[#a3a3a3] font-mono mb-1.5">
          <div className="flex items-center gap-2">
            <Users2 className="w-3 h-3 text-[#10B981]" />
            <span>{t.common?.softCircled || "Soft-Circled"}: €{(softCircled / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{t.common?.allocationRemaining || "Allocation Remaining"}:</span>
            <span className="text-[#C5A059]">€{((totalRaise - softCircled) / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        <div className="relative h-1.5 w-full bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#10B981] to-[#C5A059]"
          />
        </div>

        {progress >= 100 && (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute top-full left-0 w-full bg-[#EF4444] text-white text-center py-1 text-[10px] uppercase tracking-widest font-bold"
           >
             <Lock className="w-3 h-3 inline mr-2" />
             {t.common?.dealClosed || "Allocation Maximum Reached. Deal Closed to New LPs."}
           </motion.div>
        )}
      </div>
    </div>
  )
}
