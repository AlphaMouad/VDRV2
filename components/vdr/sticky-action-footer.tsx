"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/types"
import type { ViewId } from "./sidebar-nav"

interface StickyActionFooterProps {
  t: Dictionary
  locale: string
  onNavigate: (view: ViewId) => void
  activeView: ViewId
}

export function StickyActionFooter({ t, locale, onNavigate, activeView }: StickyActionFooterProps) {
  const { recentActivity, cta, ticker } = t.stickyFooter

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
      className={cn(
        "fixed bottom-0 right-0 z-40 flex items-center justify-between",
        "w-full lg:left-64 lg:w-[calc(100%-16rem)]", // Desktop offset
        "bg-[#020406]/90 backdrop-blur-xl border-t border-[#C5A059]/30",
        "px-4 py-3 sm:px-6 sm:py-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]"
      )}
    >
      {/* ── Left: Activity Label (Desktop) ── */}
      <div className="hidden sm:flex items-center gap-3 shrink-0 mr-6">
        <div className="relative flex items-center justify-center w-2.5 h-2.5">
          <span className="absolute w-full h-full rounded-full bg-[#C5A059] opacity-75 animate-ping" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
        </div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-semibold">
          {recentActivity}
        </span>
      </div>

      {/* ── Center: Infinite Ticker ── */}
      <div className="flex-1 overflow-hidden relative mask-linear-fade mx-2 sm:mx-4">
        <div className="flex absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#020406]/90 to-transparent z-10" />
        <div className="flex absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#020406]/90 to-transparent z-10" />

        <motion.div
          className="flex items-center gap-12 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
        >
          {/* Double the items for seamless loop */}
          {[...ticker, ...ticker].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#C5A059] opacity-60" />
              <span className="text-xs font-mono text-[#d4d4d4] tracking-wide">
                {item}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right: CTA Button ── */}
      <button
        onClick={() => onNavigate("syndication")}
        className={cn(
          "shrink-0 ml-4 group relative overflow-hidden rounded-lg px-5 py-2 sm:px-6 sm:py-2.5",
          "bg-gradient-to-br from-[#C5A059] to-[#9A7B3E] text-[#000000]",
          "transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] hover:scale-[1.02]",
          activeView === "syndication" && "opacity-50 pointer-events-none grayscale"
        )}
      >
        <span className="relative z-10 flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase">
          {cta}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>

        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
      </button>
    </motion.div>
  )
}
