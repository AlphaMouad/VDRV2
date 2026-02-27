"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle2, Zap } from "lucide-react"
import { navItemsDef, type ViewId } from "./sidebar-nav"
import type { VDRAccount } from "@/lib/accounts"
import type { Dictionary } from "@/lib/i18n/types"

interface StickyActionFooterProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  account: VDRAccount
  t: Dictionary
}

export function StickyActionFooter({ activeView, onNavigate, account, t }: StickyActionFooterProps) {
  const [tickerIndex, setTickerIndex] = useState(0)

  // ONLY render for UHNWI accounts
  if (account.avatarType !== "UHNWI") return null

  // Soft Circle Ticker Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % t.footer.softCircleTicker.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [t.footer.softCircleTicker.length])

  // Determine "Next" destination
  const currentIndex = navItemsDef.findIndex((item) => item.id === activeView)
  const nextItem = navItemsDef[currentIndex + 1]
  const isLast = currentIndex === navItemsDef.length - 1

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:ml-64 border-t border-[rgba(197,160,89,0.2)] bg-[#050505]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050505]/60">
      {/* Golden progress line at the very top */}
      <div className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent w-full opacity-60 shadow-[0_0_10px_#C5A059]" />

      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 sm:px-6 sm:py-4 gap-3 sm:gap-4 max-w-7xl mx-auto w-full">

        {/* LEFT: Soft Circle Ticker (FOMO) */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[9px] font-bold tracking-wider text-[#10B981] uppercase">Live</span>
          </div>

          <div className="h-5 overflow-hidden relative w-full sm:w-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 flex items-center"
              >
                <p className="text-[10px] sm:text-xs text-[#d4d4d4] font-mono truncate">
                  {t.footer.softCircleTicker[tickerIndex]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Primary Action Button */}
        <button
          onClick={() => {
            if (nextItem) onNavigate(nextItem.id)
            // If it's the last item, we might trigger a final modal or just do nothing for now
          }}
          className="group relative flex items-center gap-3 px-6 py-2.5 bg-[#C5A059] hover:bg-[#d4b97b] text-[#000000] font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] w-full sm:w-auto justify-center"
        >
          <span className="text-xs uppercase tracking-widest">
            {isLast ? t.footer.finalize : t.footer.next}
          </span>
          {isLast ? (
            <CheckCircle2 className="w-4 h-4 text-[#000000]" />
          ) : (
            <ArrowRight className="w-4 h-4 text-[#000000] group-hover:translate-x-1 transition-transform" />
          )}

          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute top-0 bottom-0 left-[-100%] w-1/2 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent skew-x-[-20deg] animate-[shimmer_3s_infinite]" />
          </div>
        </button>

      </div>
    </div>
  )
}
