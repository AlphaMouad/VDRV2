"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Zap, Calendar, ArrowRight } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/types"
import { AnimatedValue } from "@/components/vdr/animated-value"

interface StickyActionFooterProps {
  irr: number
  moic: number
  lpProfit: number
  t: Dictionary
}

export function StickyActionFooter({ irr, moic, lpProfit, t }: StickyActionFooterProps) {
  const [locked, setLocked] = useState(false)

  // Fake "Soft-Circle" effect
  const handleLock = () => {
    setLocked(true)
    setTimeout(() => {
      alert("DocuSign NDA/LOI generated. Calendar invite sent for closing call.")
    }, 1500)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ delay: 1, type: "spring", stiffness: 100 }}
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[rgba(197,160,89,0.3)] bg-[rgba(10,10,10,0.95)] backdrop-blur-xl shadow-2xl"
      >
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between gap-4">

          <div className="flex flex-1 items-center gap-6 sm:gap-10 overflow-hidden">
            {/* Project Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3]">Proj. IRR</span>
                <span className="font-mono text-xl font-bold text-[#10B981]">
                  <AnimatedValue value={irr} format="percent" decimals={1} />%
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 border-l border-[rgba(255,255,255,0.1)] pl-4">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3]">MOIC</span>
                <span className="font-mono text-xl font-bold gold-text-gradient">
                  <AnimatedValue value={moic} format="multiplier" />x
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 border-l border-[rgba(255,255,255,0.1)] pl-4">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3]">Base Profit</span>
                <span className="font-mono text-xl font-bold text-[#ffffff]">
                  €<AnimatedValue value={lpProfit} format="currency" />
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleLock}
            disabled={locked}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300
              ${locked
                ? "bg-[#10B981] text-white cursor-default scale-95 opacity-80"
                : "bg-gradient-to-r from-[#C5A059] to-[#DFBD69] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(197,160,89,0.3)]"
              }
            `}
          >
            {locked ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Allocation Soft-Circled</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Lock Allocation (Soft-Circle)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
