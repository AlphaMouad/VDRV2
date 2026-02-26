"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck, Lock, Globe, Loader2,
  Eye, EyeOff, CheckCircle2,
  TrendingUp, Building2, Star, Users2,
} from "lucide-react"
import type { VDRAccount } from "@/lib/accounts"
import { authenticateFromSheet } from "@/lib/auth"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "login" | "welcome"

interface LoginGateProps {
  onLogin: (account: VDRAccount) => void
  t: Dictionary
  locale: Locale
  onSwitchLocale: () => void
}

// ── Investor category metadata ─────────────────────────────────────────────────
// This data comes directly from the Google Sheet field[6] (avatarType).

function getCategoryInfo(type: VDRAccount["avatarType"], locale: Locale) {
  switch (type) {
    case "REPE":
      return {
        label: locale === "fr" ? "Fonds Immobilier Institutionnel" : "Real Estate Private Equity",
        badge: "REPE",
        icon: TrendingUp,
        color: "#10B981",
        border: "rgba(16,185,129,0.35)",
        bg: "rgba(16,185,129,0.07)",
        glow: "rgba(16,185,129,0.15)",
      }
    case "FamilyOffice":
      return {
        label: locale === "fr" ? "Family Office" : "Family Office",
        badge: "FO",
        icon: Building2,
        color: "#C5A059",
        border: "rgba(197,160,89,0.45)",
        bg: "rgba(197,160,89,0.08)",
        glow: "rgba(197,160,89,0.2)",
      }
    case "UHNWI":
      return {
        label: locale === "fr" ? "Ultra Haute Valeur Nette" : "Ultra High Net Worth",
        badge: "UHNWI",
        icon: Star,
        color: "#DFBD69",
        border: "rgba(223,189,105,0.45)",
        bg: "rgba(223,189,105,0.07)",
        glow: "rgba(223,189,105,0.18)",
      }
    default:
      return {
        label: locale === "fr" ? "Investisseur Qualifié" : "Qualified Investor",
        badge: "QI",
        icon: Users2,
        color: "#a3a3a3",
        border: "rgba(163,163,163,0.3)",
        bg: "rgba(163,163,163,0.05)",
        glow: "rgba(163,163,163,0.1)",
      }
  }
}

// ── Animated diagonal gold lines (left panel background) ─────────────────────

function GoldGeometry() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A059" stopOpacity="0" />
          <stop offset="50%" stopColor="#C5A059" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFBD69" stopOpacity="0" />
          <stop offset="50%" stopColor="#DFBD69" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#DFBD69" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lgV" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C5A059" stopOpacity="0" />
          <stop offset="50%" stopColor="#C5A059" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Diagonal lines */}
      <line x1="-10%" y1="110%" x2="110%" y2="-10%" stroke="url(#lg1)" strokeWidth="1" />
      <line x1="-10%" y1="90%"  x2="90%"  y2="-10%" stroke="url(#lg2)" strokeWidth="1" />
      <line x1="-10%" y1="70%"  x2="70%"  y2="-10%" stroke="url(#lg1)" strokeWidth="0.6" />
      <line x1="-10%" y1="130%" x2="130%" y2="-10%" stroke="url(#lg2)" strokeWidth="0.6" />
      {/* Grid lines */}
      <line x1="33%" y1="0%"   x2="33%" y2="100%" stroke="url(#lgV)" strokeWidth="1" />
      <line x1="67%" y1="0%"   x2="67%" y2="100%" stroke="url(#lgV)" strokeWidth="1" />
      <line x1="0%"  y1="33%"  x2="100%" y2="33%" stroke="rgba(197,160,89,0.04)" strokeWidth="1" />
      <line x1="0%"  y1="67%"  x2="100%" y2="67%" stroke="rgba(197,160,89,0.04)" strokeWidth="1" />
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LoginGate({ onLogin, t, locale, onSwitchLocale }: LoginGateProps) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword]     = useState("")
  const [showPw, setShowPw]         = useState(false)
  const [agreed, setAgreed]         = useState(false)
  const [error, setError]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [phase, setPhase]           = useState<Phase>("login")
  const [authAccount, setAuthAccount] = useState<VDRAccount | null>(null)

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password) { setError(t.login.errorRequired); return }
    if (!agreed)                          { setError(t.login.errorNda);      return }

    setError("")
    setLoading(true)

    try {
      const result = await authenticateFromSheet(identifier.trim(), password)
      if (!result) {
        setError(t.login.errorInvalid)
        setLoading(false)
        return
      }

      // avatarType comes directly from Google Sheet field[6]
      const account: VDRAccount = {
        investorId:    result.investorId,
        fullName:      result.fullName,
        companyName:   result.companyName,
        email:         result.email,
        role:          "investor",
        numberOfVillas: result.numberOfVillas,
        avatarType:    result.avatarType,   // ← from sheet
      }

      setAuthAccount(account)
      setPhase("welcome")
    } catch {
      setError(t.login.errorNetwork)
      setLoading(false)
    }
  }

  // Auto-enter VDR after the personalized welcome screen
  useEffect(() => {
    if (phase === "welcome" && authAccount) {
      const timer = setTimeout(() => onLogin(authAccount), 3000)
      return () => clearTimeout(timer)
    }
  }, [phase, authAccount, onLogin])

  // ── LEFT PANEL KEY STATS (hardcoded project params) ──────────────────────

  const leftStats = [
    {
      label: locale === "fr" ? "TRI Cible Sans Levier" : "Target Unlevered IRR",
      value: "~15%",
      sub:   locale === "fr" ? "Scénario de base · 36 mois" : "Base case · 36 months",
      color: "#10B981",
    },
    {
      label: locale === "fr" ? "MOIC LP Cible" : "Target LP MOIC",
      value: "1.52×",
      sub:   locale === "fr" ? "Net de tous impôts marocains" : "Net of all Moroccan taxes",
      color: "#C5A059",
    },
    {
      label: locale === "fr" ? "Engagement LP (90%)" : "LP Commitment (90%)",
      value: "€6.3M",
      sub:   locale === "fr" ? "Appels échelonnés · Zéro levier" : "Staged calls · Zero leverage",
      color: "#ffffff",
    },
  ]

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-[#020202] overflow-hidden font-sans">
      <div className="noise-overlay opacity-[0.03] pointer-events-none" />

      {/* Background Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(197, 160, 89, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.03) 0%, transparent 40%)"
        }}
      />

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════ LOGIN SCREEN ══════════════════════ */}

        {phase === "login" && (
          <motion.div
            key="login"
            className="flex h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* ── LEFT: Brand Manifesto Panel ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden bg-black/40 backdrop-blur-sm"
              style={{ borderRight: "1px solid rgba(255,255,255,0.03)" }}
            >
              {/* Animated geometry */}
              <GoldGeometry />

              {/* Radial glow center */}
              <div
                className="absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full pointer-events-none opacity-60"
                style={{ background: "radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%)" }}
              />

              {/* Top: Logo + title */}
              <div className="relative z-10">
                <motion.img
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
                  className="logo-white h-14 mb-8 opacity-90"
                  alt="AMG Building"
                />

                <div className="w-16 h-[1px] bg-gradient-to-r from-[#C5A059] to-transparent mb-8 opacity-50" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.8 }}
                >
                  <h1 className="font-[var(--font-playfair)] text-[3.5rem] text-white leading-[1.1] tracking-tight mb-4 drop-shadow-lg">
                    Ambassadeur<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#EBCB8B] via-[#C5A059] to-[#8C6D36]">6&amp;7</span>
                  </h1>
                  <p className="text-[10px] tracking-[0.4em] uppercase text-[#a3a3a3] mb-6 font-medium">
                    Palmeraie · Marrakech · Maroc
                  </p>
                  <p className="font-[var(--font-playfair)] text-sm italic text-[#C5A059] opacity-80 tracking-wide max-w-md leading-relaxed">
                    {locale === "fr"
                      ? "« Là où la structure rencontre la souveraineté »"
                      : '"Where Structure Meets Sovereignty"'}
                  </p>
                </motion.div>
              </div>

              {/* Middle: Investment stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.7 }}
                className="relative z-10 mt-auto mb-12"
              >
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#888] mb-6 opacity-60">
                  {locale === "fr"
                    ? "Paramètres Institutionnels Clés"
                    : "Key Institutional Parameters"}
                </p>

                <div className="space-y-0.5">
                  {leftStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12, duration: 0.6 }}
                      className="flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.03)] group hover:bg-white/[0.02] transition-colors duration-300 px-2 -mx-2 rounded"
                    >
                      <div>
                        <p className="text-[10px] tracking-[0.15em] uppercase text-[#999] group-hover:text-[#bbb] transition-colors">
                          {stat.label}
                        </p>
                        <p className="text-[9px] text-[#666] mt-1 group-hover:text-[#888] transition-colors">
                          {stat.sub}
                        </p>
                      </div>
                      <span
                        className="font-[var(--font-jetbrains)] text-xl font-bold tracking-tight"
                        style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}
                      >
                        {stat.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Bottom: Legal footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="relative z-10"
              >
                <div className="w-full h-[1px] bg-white/[0.05] mb-4" />
                <div className="flex justify-between items-end opacity-40 hover:opacity-60 transition-opacity duration-300">
                  <div>
                     <p className="text-[8px] tracking-[0.2em] uppercase text-[#a3a3a3]">
                      AMG Building · {new Date().getFullYear()} ·{" "}
                      {locale === "fr" ? "Tous droits réservés" : "All Rights Reserved"}
                    </p>
                    <p className="text-[7.5px] text-[#a3a3a3] mt-1.5 leading-relaxed max-w-xs">
                      {locale === "fr"
                        ? "Document confidentiel — réservé aux investisseurs qualifiés au sens des réglementations applicables"
                        : "Confidential document — restricted to qualified purchasers under applicable securities regulations"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Authentication Form ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col items-center justify-center relative px-6 py-12 lg:py-0"
              style={{
                background:
                  "linear-gradient(145deg, rgba(5,5,5,1) 0%, rgba(12,12,12,1) 100%)",
              }}
            >
              {/* Language switcher */}
              <button
                onClick={onSwitchLocale}
                className="absolute top-8 right-8 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-black/20 text-[#888] hover:text-[#C5A059] hover:border-[#C5A059]/30 hover:bg-[#C5A059]/5 transition-all duration-300 text-[10px] tracking-widest backdrop-blur-md"
              >
                <Globe className="w-3 h-3" />
                <span className="font-mono font-medium">
                  {locale === "en" ? "FR" : "EN"}
                </span>
              </button>

              {/* Mobile: compact logo */}
              <div className="lg:hidden flex flex-col items-center mb-10">
                <img
                  src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
                  className="logo-white h-10 mb-4 opacity-90"
                  alt="AMG Building"
                />
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#a3a3a3] opacity-70">
                  {t.login.title}
                </p>
              </div>

              {/* Form wrapper */}
              <div className="w-full max-w-[380px] p-1">

                {/* Header */}
                <div className="mb-10 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full border border-[rgba(197,160,89,0.15)] bg-[rgba(197,160,89,0.03)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="text-[9px] tracking-[0.25em] uppercase text-[#C5A059] font-medium">
                      {t.login.portalLabel}
                    </span>
                  </div>

                  <h2 className="font-[var(--font-playfair)] text-3xl text-white leading-tight mb-3 tracking-wide">
                    {locale === "fr" ? "Accès Sécurisé" : "Secure Access"}
                  </h2>
                  <p className="text-[12px] text-[#888] leading-relaxed max-w-sm mx-auto lg:mx-0 font-light">
                    {locale === "fr"
                      ? "Veuillez vous identifier pour accéder à la Data Room."
                      : "Please identify yourself to access the Data Room."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {/* Identifier */}
                  <div className="group">
                    <label className="text-[9px] tracking-[0.2em] uppercase text-[#666] block mb-2 group-focus-within:text-[#C5A059] transition-colors duration-300 ml-1">
                      {t.login.emailLabel}
                    </label>
                    <input
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setError("") }}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl text-[#eee] py-3.5 px-5 text-[13px] focus:border-[#C5A059]/50 focus:bg-[#C5A059]/[0.02] focus:ring-1 focus:ring-[#C5A059]/20 focus:outline-none transition-all duration-300 font-[var(--font-jetbrains)] placeholder-[#333] tracking-wide shadow-inner"
                      placeholder={t.login.emailPlaceholder}
                    />
                  </div>

                  {/* Password */}
                  <div className="group">
                    <label className="text-[9px] tracking-[0.2em] uppercase text-[#666] block mb-2 group-focus-within:text-[#C5A059] transition-colors duration-300 ml-1">
                      {t.login.passwordLabel}
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError("") }}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl text-[#eee] py-3.5 px-5 pr-12 text-[13px] focus:border-[#C5A059]/50 focus:bg-[#C5A059]/[0.02] focus:ring-1 focus:ring-[#C5A059]/20 focus:outline-none transition-all duration-300 font-[var(--font-jetbrains)] placeholder-[#333] tracking-wide shadow-inner"
                        placeholder={t.login.passwordPlaceholder}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        tabIndex={-1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#C5A059] transition-colors duration-200 p-1"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye    className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* NDA checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-[#C5A059]/30 transition-all duration-300 group mt-2">
                    {/* Custom checkbox */}
                    <div className="relative mt-0.5 shrink-0" onClick={() => setAgreed(!agreed)}>
                      <div
                        className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center ${
                          agreed
                            ? "bg-[#C5A059] border-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.3)]"
                            : "border-white/20 bg-transparent group-hover:border-[#C5A059]/60"
                        }`}
                      >
                        {agreed && (
                          <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 12 12">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] leading-relaxed text-[#999] group-hover:text-[#ccc] transition-colors duration-300 selection:bg-[#C5A059] selection:text-black">
                      {t.login.ndaCheckbox}
                    </span>
                  </label>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{   opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/[0.08] border border-red-500/20 mb-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                           <p className="text-red-400 text-[11px] font-medium leading-relaxed tracking-wide">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="group relative w-full mt-2 overflow-hidden rounded-xl bg-[#C5A059] p-[1px] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                     <div className="relative flex items-center justify-center gap-2 w-full h-full bg-black hover:bg-[#1a1814] text-[#C5A059] py-3.5 rounded-[10px] transition-all duration-300 group-hover:text-[#EBCB8B]">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#C5A059]/10 to-transparent transition-opacity duration-500" />
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{t.login.submitting}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{t.login.submitButton}</span>
                          </>
                        )}
                     </div>
                  </button>
                </form>

                {/* Confidential notice */}
                <p className="mt-10 text-[9px] text-[#666] opacity-60 tracking-wider leading-relaxed text-center font-light uppercase">
                  {t.login.confidentialNotice}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ══════════════════════════ WELCOME SCREEN ════════════════════════ */}

        {phase === "welcome" && authAccount && (
          <motion.div
            key="welcome"
            className="flex h-full w-full items-center justify-center bg-[#050505]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Background ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A059]/5 rounded-full blur-[100px]" />
            </div>

            {(() => {
              const cat    = getCategoryInfo(authAccount.avatarType, locale)
              const CatIcon = cat.icon

              return (
                <div className="relative flex flex-col items-center text-center px-8 max-w-2xl w-full z-10">

                  {/* Shield check circle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 200, damping: 20 }}
                    className="relative w-28 h-28 rounded-full flex items-center justify-center mb-8"
                    style={{
                      border: "1px solid rgba(16,185,129,0.2)",
                      background: "rgba(16,185,129,0.03)",
                      boxShadow: "0 0 60px rgba(16,185,129,0.08)",
                    }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#10B981] drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    {/* Pulsing rings */}
                    {[0, 1].map(i => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border border-[rgba(16,185,129,0.15)]"
                        animate={{ scale: [1, 1.4, 1.4], opacity: [0.6, 0, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                      />
                    ))}
                  </motion.div>

                  {/* Verified label */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex items-center gap-2 mb-6"
                  >
                     <div className="h-[1px] w-8 bg-[#10B981]/30" />
                     <p className="text-[10px] tracking-[0.4em] uppercase text-[#10B981] font-bold shadow-[#10B981]/20 drop-shadow-sm">
                       {locale === "fr"
                         ? "Identité Vérifiée"
                         : "Identity Verified"}
                     </p>
                     <div className="h-[1px] w-8 bg-[#10B981]/30" />
                  </motion.div>

                  {/* Greeting */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.7 }}
                    className="mb-8"
                  >
                    <p className="font-[var(--font-playfair)] text-3xl text-[rgba(255,255,255,0.5)] mb-2">
                      {locale === "fr" ? "Bienvenue," : "Welcome,"}
                    </p>
                    <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#EBCB8B] via-[#C5A059] to-[#8C6D36] font-[var(--font-playfair)] text-5xl md:text-6xl font-medium tracking-tight drop-shadow-sm pb-2">
                      {authAccount.fullName}
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85, duration: 0.8 }}
                    className="flex flex-col items-center gap-1 mb-12"
                  >
                    <p className="text-[11px] tracking-[0.25em] uppercase text-white/80 font-medium">
                      {authAccount.companyName}
                    </p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono">
                      ID: {authAccount.investorId}
                    </p>
                  </motion.div>

                  {/* Investor category badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1,   y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6, type: "spring", stiffness: 100 }}
                    className="relative group cursor-default"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-20 transition-opacity duration-500 group-hover:opacity-30"
                      style={{ background: cat.glow }}
                    />
                    <div
                      className="relative flex items-center gap-5 px-8 py-5 rounded-2xl bg-[#0A0A0A]/80 backdrop-blur-xl border transition-all duration-300 group-hover:bg-[#0A0A0A]/90"
                      style={{
                        borderColor: cat.border,
                        boxShadow: `0 0 0 1px ${cat.border}`,
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${cat.bg} 0%, transparent 100%)`, border: `1px solid ${cat.border}` }}
                      >
                        <CatIcon className="w-6 h-6" style={{ color: cat.color }} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] tracking-[0.25em] uppercase text-[#666] mb-1">
                          {locale === "fr" ? "Classification" : "Classification"}
                        </p>
                        <div className="flex items-center gap-3">
                           <p className="text-lg font-semibold tracking-wide text-white" style={{ textShadow: `0 0 20px ${cat.color}40` }}>
                             {cat.label}
                           </p>
                           <span
                             className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border opacity-80"
                             style={{
                               color: cat.color,
                               borderColor: cat.border,
                               background: cat.bg,
                             }}
                           >
                             {cat.badge}
                           </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Loading status */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 1 }}
                    className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-3"
                  >
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-[#C5A059]"
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#666] tracking-widest uppercase font-light">
                      {locale === "fr"
                        ? "Initialisation VDR..."
                        : "Initializing VDR..."}
                    </span>
                  </motion.div>
                </div>
              )
            })()}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
