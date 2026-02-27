"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  SlidersHorizontal,
  TrendingUp,
  Calculator,
  Shield,
  FileText,
  LogOut,
  BarChart3,
  Menu,
  X,
  Users2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n/types"

export type ViewId =
  | "dashboard"
  | "syndication"
  | "financial-engine"
  | "moic-waterfall"
  | "sensitivity"
  | "fortress"
  | "repatriation"
  | "macro"

interface SidebarNavProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
  onLogout: () => void
  t: Dictionary
}

export const navItemsDef: { id: ViewId; navKey: keyof Dictionary["nav"]; icon: React.ElementType; tab: string }[] = [
  { id: "dashboard", navKey: "dashboard", icon: LayoutDashboard, tab: "1" },
  { id: "syndication", navKey: "syndication", icon: Users2, tab: "2" },
  { id: "financial-engine", navKey: "financialEngine", icon: TrendingUp, tab: "3" },
  { id: "moic-waterfall", navKey: "moicWaterfall", icon: Calculator, tab: "4" },
  { id: "sensitivity", navKey: "sensitivity", icon: BarChart3, tab: "5" },
  { id: "fortress", navKey: "fortress", icon: Shield, tab: "6" },
  { id: "repatriation", navKey: "repatriation", icon: FileText, tab: "7" },
  { id: "macro", navKey: "macro", icon: SlidersHorizontal, tab: "8" },
]

export function SidebarNav({ activeView, onNavigate, onLogout, t }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (view: ViewId) => {
    onNavigate(view)
    setMobileOpen(false)
  }

  const currentIndex = navItemsDef.findIndex((item) => item.id === activeView)
  const progressPct = Math.round(((currentIndex + 1) / navItemsDef.length) * 100)

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-lg glass-form flex items-center justify-center border border-[rgba(197,160,89,0.3)]"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-[#C5A059]" />
        ) : (
          <Menu className="w-5 h-5 text-[#C5A059]" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-[#050505] border-r border-[rgba(255,255,255,0.08)] flex flex-col z-40 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
          <img
            src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
            className="logo-white h-8 mb-2"
            alt="AMG Building"
            crossOrigin="anonymous"
          />
          <p className="text-[9px] tracking-[0.25em] uppercase text-[#a3a3a3]">
            {t.common.vdrTitle}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8px] tracking-[0.2em] uppercase text-[#a3a3a3]">
              {t.common.reviewProgress}
            </span>
            <span className="text-[8px] font-mono text-[#C5A059]">{progressPct}%</span>
          </div>
          <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #C5A059, #DFBD69)",
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItemsDef.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 w-full group",
                  isActive
                    ? "bg-[rgba(197,160,89,0.12)] text-[#C5A059]"
                    : "text-[#a3a3a3] hover:text-[#ffffff] hover:bg-[rgba(255,255,255,0.04)]"
                )}
              >
                <span className="text-[9px] font-mono text-[#a3a3a3] opacity-50 w-3 shrink-0">
                  {item.tab}
                </span>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs tracking-wide">{t.nav[item.navKey]}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => { onLogout(); setMobileOpen(false) }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#a3a3a3] hover:text-[#EF4444] transition-colors duration-200 w-full text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span className="tracking-wide">{t.common.signOut}</span>
          </button>
          <p className="text-[8px] text-[#a3a3a3] mt-3 tracking-wider text-center opacity-50">
            {t.common.confidential}
          </p>
        </div>
      </aside>
    </>
  )
}
