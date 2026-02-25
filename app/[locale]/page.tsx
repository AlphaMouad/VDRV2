"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoginGate } from "@/components/vdr/login-gate"
import { SidebarNav, type ViewId } from "@/components/vdr/sidebar-nav"
import type { VDRAccount } from "@/lib/accounts"
import { MacroAssumptions, defaultMacro, type MacroState } from "@/components/vdr/macro-assumptions"
import { ExecutiveDashboard } from "@/components/vdr/executive-dashboard"
import { FinancialEngine } from "@/components/vdr/financial-engine"
import { MoicWaterfall } from "@/components/vdr/moic-waterfall"
import { SensitivityMatrix } from "@/components/vdr/sensitivity-matrix"
import { Fortress } from "@/components/vdr/fortress"
import { Repatriation } from "@/components/vdr/repatriation"
import { Syndication } from "@/components/vdr/syndication"
import { StatsRibbon } from "@/components/vdr/stats-ribbon"
import { GlossaryProvider } from "@/lib/i18n/glossary-context"
import { getDict, type Locale } from "@/lib/i18n"
import { AnimatePresence, motion } from "framer-motion"
import { Globe } from "lucide-react"

export default function VDRApp() {
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const locale = (params.locale === "fr" ? "fr" : "en") as Locale
  const t = getDict(locale)

  const [account, setAccount] = useState<VDRAccount | null>(null)
  const [activeView, setActiveView] = useState<ViewId>("dashboard")
  const [macro, setMacro] = useState<MacroState>(defaultMacro)

  const switchLocale = () => {
    const target = locale === "en" ? "fr" : "en"
    router.push(`/${target}`)
  }

  const handleLogin = (acct: VDRAccount) => {
    setAccount(acct)
    setMacro(prev => ({
      ...prev,
      totalVillas: acct.numberOfVillas,
    }))
  }

  if (!account) {
    return (
      <GlossaryProvider glossary={t.glossary}>
        <LoginGate
          onLogin={handleLogin}
          t={t}
          locale={locale}
          onSwitchLocale={switchLocale}
        />
      </GlossaryProvider>
    )
  }

  return (
    <GlossaryProvider glossary={t.glossary}>
      <div className="min-h-screen bg-[#000000]">
        <div className="noise-overlay" />

        <SidebarNav
          activeView={activeView}
          onNavigate={setActiveView}
          onLogout={() => setAccount(null)}
          t={t}
        />

        <main className="lg:ml-64 min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 lg:px-8 py-4">
              <div className="ml-12 lg:ml-0">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#a3a3a3]">
                  {t.common.vdrTitle}
                </p>
                <h1 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mt-1">
                  {t.viewTitles[
                    activeView === "financial-engine" ? "financialEngine"
                    : activeView === "moic-waterfall" ? "moicWaterfall"
                    : activeView as keyof typeof t.viewTitles
                  ]}
                </h1>
              </div>
              <div className="flex items-center gap-4 lg:gap-6">
                {/* Language Switcher */}
                <button
                  onClick={switchLocale}
                  className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-[#a3a3a3] hover:text-[#C5A059] transition-colors font-mono border border-[rgba(255,255,255,0.1)] rounded px-2 py-1.5 hover:border-[rgba(197,160,89,0.3)]"
                >
                  <Globe className="w-3 h-3" />
                  {locale === "en" ? "FR" : "EN"}
                </button>

                <div className="hidden md:flex flex-col items-end gap-0.5">
                  <span className="text-[10px] tracking-[0.15em] text-[#C5A059] font-medium">
                    {account.fullName}
                  </span>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3]">
                    {account.companyName} &mdash; {account.investorId}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] text-[#10B981]">{t.common.secure}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Ribbon */}
          <StatsRibbon macro={macro} t={t} />

          {/* View Content */}
          <div className="p-4 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {activeView === "dashboard" && <ExecutiveDashboard macro={macro} t={t} locale={locale} account={account} />}
                {activeView === "syndication" && <Syndication macro={macro} t={t} locale={locale} />}
                {activeView === "financial-engine" && <FinancialEngine macro={macro} t={t} locale={locale} />}
                {activeView === "moic-waterfall" && <MoicWaterfall macro={macro} t={t} locale={locale} />}
                {activeView === "sensitivity" && <SensitivityMatrix macro={macro} t={t} locale={locale} />}
                {activeView === "fortress" && <Fortress macro={macro} t={t} locale={locale} />}
                {activeView === "repatriation" && <Repatriation macro={macro} t={t} locale={locale} />}
                {activeView === "macro" && <MacroAssumptions macro={macro} onChange={setMacro} t={t} locale={locale} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="border-t border-[rgba(255,255,255,0.06)] px-4 lg:px-8 py-4 flex items-center justify-between">
            <p className="text-[9px] text-[#a3a3a3] tracking-wider">
              {t.common.footer.location}
            </p>
            <p className="text-[9px] text-[#a3a3a3] tracking-wider hidden sm:block">
              €{(macro.totalVillas * macro.gdcPerVilla).toLocaleString()} {t.common.footer.syndication}
            </p>
          </footer>
        </main>
      </div>
    </GlossaryProvider>
  )
}
