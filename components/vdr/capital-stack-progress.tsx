"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users2, Lock, Activity } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/types"

interface CapitalStackProgressProps {
  t: Dictionary
  userTicket?: number
}

export function CapitalStackProgress({ t, userTicket = 0 }: CapitalStackProgressProps) {
  // Config: Total raise €10.5M
  const totalRaise = 10500000

  // "Live Pulse" Logic:
  // 1. Base soft-circle starts at 82% (€8.61M)
  // 2. Ticks up slowly to simulate live global order book activity
  // 3. Persists in localStorage so it doesn't reset on refresh (persistence = realism)
  const baseStart = 8610000
  const [softCircled, setSoftCircled] = useState(baseStart)

  useEffect(() => {
    // Load persisted state or init
    const saved = localStorage.getItem("vdr_soft_circle")
    if (saved) {
      setSoftCircled(Math.max(baseStart, parseInt(saved, 10)))
    }

    // Simulate random "ticks" of €50k - €150k every 30-90s
    const interval = setInterval(() => {
      setSoftCircled(prev => {
        // Cap "natural" market interest at 96% to leave room for the user
        if (prev >= totalRaise * 0.96) return prev

        const bump = Math.floor(Math.random() * 25000) + 25000 // +€25k-50k
        const next = Math.min(prev + bump, totalRaise * 0.96)
        localStorage.setItem("vdr_soft_circle", next.toString())
        return next
      })
    }, 45000) // Slow, realistic heartbeat

    return () => clearInterval(interval)
  }, [totalRaise])

  const currentTotal = softCircled + userTicket
  const progressBase = Math.min(100, (softCircled / totalRaise) * 100)
  const progressUser = Math.min(100, (currentTotal / totalRaise) * 100)
  const remaining = Math.max(0, totalRaise - currentTotal)
  const isFull = currentTotal >= totalRaise

  return (
    <div className="w-full bg-[#0a0a0a] border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-[#a3a3a3] font-mono mb-1.5">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </div>
            <span>
              {t.common.softCircled}: €{(softCircled / 1000000).toFixed(2)}M
              {userTicket > 0 && <span className="text-[#C5A059] ml-1"> + You</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{t.common.allocationRemaining}:</span>
            <span className={remaining === 0 ? "text-[#EF4444]" : "text-[#C5A059]"}>
              €{(remaining / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>

        <div className="relative h-1.5 w-full bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          {/* Base Market Interest (Grey/Green) */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressBase}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-[#10B981] opacity-60"
          />

          {/* User's Ticket Stacked (Gold) */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressUser}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full ${isFull ? "bg-[#EF4444]" : "bg-gradient-to-r from-[#10B981] to-[#C5A059]"}`}
            style={{
              clipPath: `inset(0 0 0 ${progressBase}%)` // Only show the delta
            }}
          />
        </div>

        {isFull && (
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="absolute top-full left-0 w-full bg-[#EF4444] text-white text-center py-1 text-[10px] uppercase tracking-widest font-bold"
           >
             <Lock className="w-3 h-3 inline mr-2" />
             {t.common.dealClosed}
           </motion.div>
        )}
      </div>
    </div>
  )
}
