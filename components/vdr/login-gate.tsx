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
    <div className="fixed inset-0 bg-[#000000] overflow-hidden">
      <div className="noise-overlay" />

      <AnimatePresence mode="wait">

        {/* ══════════════════════════════ LOGIN SCREEN ══════════════════════ */}

        {phase === "login" && (
          <motion.div
            key="login"
            className="flex h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >

            {/* ── LEFT: Brand Manifesto Panel ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14 overflow-hidden"
            >
              {/* Animated geometry */}
              <GoldGeometry />

              {/* Radial glow center */}
              <div
                className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(197,160,89,0.1) 0%, transparent 65%)" }}
              />
              {/* Corner glow */}
              <div
                className="absolute bottom-0 right-0 w-72 h-72 pointer-events-none"
                style={{ background: "radial-gradient(circle at bottom right, rgba(197,160,89,0.12) 0%, transparent 70%)" }}
              />

              {/* Top: Logo + title */}
              <div className="relative z-10">
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                  src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
                  className="logo-white h-12 mb-6"
                  alt="AMG Building"
                  crossOrigin="anonymous"
                />

                <div className="elite-divider mb-6" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.7 }}
                >
                  <h1 className="font-[var(--font-playfair)] text-5xl text-white leading-tight tracking-tight mb-2">
                    Ambassadeur<br />
                    <span className="gold-text-gradient">6&amp;7</span>
                  </h1>
                  <p className="text-[10px] tracking-[0.45em] uppercase text-[#a3a3a3] mb-4">
                    Palmeraie · Marrakech · Maroc
                  </p>
                  <p className="font-[var(--font-playfair)] text-[13px] italic text-[#C5A059] opacity-75 tracking-wide">
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
                className="relative z-10"
              >
                <p className="text-[8.5px] tracking-[0.35em] uppercase text-[#a3a3a3] mb-5 opacity-70">
                  {locale === "fr"
                    ? "Paramètres Institutionnels Clés"
                    : "Key Institutional Parameters"}
                </p>

                <div className="space-y-1">
                  {leftStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }}
                      className="flex items-center justify-between py-3.5 border-b border-[rgba(255,255,255,0.05)]"
                    >
                      <div>
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#a3a3a3]">
                          {stat.label}
                        </p>
                        <p className="text-[9px] text-[#a3a3a3] opacity-50 mt-0.5">
                          {stat.sub}
                        </p>
                      </div>
                      <span
                        className="font-[var(--font-jetbrains)] text-xl font-bold"
                        style={{ color: stat.color }}
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
                <div className="elite-divider" />
                <p className="text-[8px] tracking-[0.2em] uppercase text-[#a3a3a3] opacity-50">
                  AMG Building · {new Date().getFullYear()} ·{" "}
                  {locale === "fr" ? "Tous droits réservés" : "All Rights Reserved"}
                </p>
                <p className="text-[7.5px] text-[#a3a3a3] opacity-30 mt-1 leading-relaxed">
                  {locale === "fr"
                    ? "Document confidentiel — réservé aux investisseurs qualifiés au sens des réglementations applicables"
                    : "Confidential document — restricted to qualified purchasers under applicable securities regulations"}
                </p>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Authentication Form ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center relative px-6 py-12 lg:py-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(8,8,8,0.98) 0%, rgba(0,0,0,1) 100%)",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Language switcher */}
              <button
                onClick={onSwitchLocale}
                className="absolute top-5 right-5 z-30 flex items-center gap-1.5 px-3 py-2 rounded-lg glass-form border border-[rgba(197,160,89,0.2)] text-[#a3a3a3] hover:text-[#C5A059] transition-colors duration-200 text-[10px]"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="tracking-[0.15em] uppercase font-mono">
                  {locale === "en" ? "FR" : "EN"}
                </span>
              </button>

              {/* Mobile: compact logo */}
              <div className="lg:hidden flex flex-col items-center mb-8">
                <img
                  src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
                  className="logo-white h-9 mb-3"
                  alt="AMG Building"
                  crossOrigin="anonymous"
                />
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#a3a3a3]">
                  {t.login.title}
                </p>
              </div>

              {/* Form wrapper */}
              <div className="w-full max-w-[360px]">

                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.25)] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <span className="text-[9px] tracking-[0.3em] uppercase text-[#a3a3a3]">
                      {t.login.portalLabel}
                    </span>
                  </div>

                  <h2 className="font-[var(--font-playfair)] text-2xl text-white leading-tight mb-2 uppercase">
                    {locale === "fr" ? "SALLE DE DONNÉES VIRTUELLE" : t.login.title}
                  </h2>
                  <p className="text-[#a3a3a3] text-[13px] leading-[1.6]">
                    {locale === "fr"
                      ? "Accès Sécurisé"
                      : "Secure Access"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Identifier */}
                  <div className="relative group mt-2">
                    <div className="relative">
                      <input
                        type="text"
                        autoComplete="username"
                        required
                        value={identifier}
                        onChange={(e) => { setIdentifier(e.target.value); setError("") }}
                        className="peer w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] py-3 pl-0 pr-4 text-white placeholder-transparent focus:outline-none focus:border-[#C5A059] transition-all font-[var(--font-jetbrains)] text-sm"
                        placeholder={t.login.emailPlaceholder}
                      />
                      <label className="absolute left-0 -top-3.5 text-[10px] text-[rgba(197,160,89,0.7)] uppercase tracking-widest transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[rgba(255,255,255,0.4)] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[rgba(197,160,89,0.7)] pointer-events-none">
                        {t.login.emailLabel}
                      </label>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="relative group mt-6">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError("") }}
                        className="peer w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] py-3 pl-0 pr-10 text-white placeholder-transparent focus:outline-none focus:border-[#C5A059] transition-all font-[var(--font-jetbrains)] text-sm"
                        placeholder={t.login.passwordPlaceholder}
                      />
                      <label className="absolute left-0 -top-3.5 text-[10px] text-[rgba(197,160,89,0.7)] uppercase tracking-widest transition-all peer-placeholder-shown:text-xs peer-placeholder-shown:text-[rgba(255,255,255,0.4)] peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-[rgba(197,160,89,0.7)] pointer-events-none">
                        {t.login.passwordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[rgba(255,255,255,0.2)] hover:text-[#C5A059] peer-focus:text-[rgba(197,160,89,0.5)] transition-colors"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* NDA checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer p-3.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(197,160,89,0.2)] transition-colors duration-200 group mt-4">
                    {/* Custom checkbox */}
                    <div className="relative mt-0.5 shrink-0" onClick={() => setAgreed(!agreed)}>
                      <div
                        className={`w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center ${
                          agreed
                            ? "bg-[#C5A059] border-[#C5A059] shadow-[0_0_8px_rgba(197,160,89,0.4)]"
                            : "border-[rgba(255,255,255,0.25)] bg-transparent group-hover:border-[rgba(197,160,89,0.5)]"
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
                    <span className="text-[10px] leading-relaxed text-[#a3a3a3] group-hover:text-[rgba(255,255,255,0.65)] transition-colors duration-200">
                      {t.login.ndaCheckbox}
                    </span>
                  </label>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{   opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[rgba(239,68,68,0.07)] border border-[rgba(239,68,68,0.2)]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                        <p className="text-[#EF4444] text-[11px] leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-white hover:bg-[#fffbeb] text-black font-semibold h-12 flex items-center justify-center gap-2 uppercase tracking-[0.15em] text-[11px] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-[14px] h-[14px] animate-spin text-black" />
                        <span className="text-black">{t.login.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-[14px] h-[14px] mb-[1px] text-black" />
                        <span className="text-black">{t.login.submitButton}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Confidential notice */}
                <div className="mt-8 flex gap-2.5 p-3 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#C5A059] mt-[1px]" />
                  <p className="text-[9px] text-[#606060] leading-[1.6] uppercase tracking-wider font-[var(--font-jetbrains)]">
                    {t.login.confidentialNotice}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ══════════════════════════ WELCOME SCREEN ════════════════════════ */}

        {phase === "welcome" && authAccount && (
          <motion.div
            key="welcome"
            className="flex h-full w-full items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {(() => {
              const cat    = getCategoryInfo(authAccount.avatarType, locale)
              const CatIcon = cat.icon

              return (
                <div className="flex flex-col items-center text-center px-6 max-w-lg w-full">

                  {/* Shield check circle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 220, damping: 18 }}
                    className="relative w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{
                      border: "1px solid rgba(16,185,129,0.3)",
                      background: "rgba(16,185,129,0.06)",
                      boxShadow: "0 0 40px rgba(16,185,129,0.12)",
                    }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
                    {/* Pulsing ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[rgba(16,185,129,0.2)]"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                    />
                  </motion.div>

                  {/* Verified label */}
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[9px] tracking-[0.45em] uppercase text-[#10B981] mb-3"
                  >
                    {locale === "fr"
                      ? "Identité Vérifiée · Accès Accordé"
                      : "Identity Verified · Access Granted"}
                  </motion.p>

                  {/* Greeting */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="font-[var(--font-playfair)] text-3xl text-[rgba(255,255,255,0.65)] mb-0.5"
                  >
                    {locale === "fr" ? "Bienvenue," : "Welcome,"}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.62 }}
                    className="gold-text-gradient font-[var(--font-playfair)] text-3xl font-semibold mb-1"
                  >
                    {authAccount.fullName}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.72 }}
                    className="text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3] mb-7"
                  >
                    {authAccount.companyName}&nbsp;&mdash;&nbsp;{authAccount.investorId}
                  </motion.p>

                  {/* Investor category badge — sourced from Google Sheet field[6] */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1,   y: 0 }}
                    transition={{ delay: 0.82, duration: 0.5, type: "spring", stiffness: 180 }}
                    className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-10"
                    style={{
                      border: `1px solid ${cat.border}`,
                      background: cat.bg,
                      boxShadow: `0 0 30px ${cat.glow}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${cat.glow}`, border: `1px solid ${cat.border}` }}
                    >
                      <CatIcon className="w-4.5 h-4.5" style={{ color: cat.color }} />
                    </div>
                    <div className="text-left">
                      <p className="text-[8.5px] tracking-[0.25em] uppercase text-[#a3a3a3]">
                        {locale === "fr"
                          ? "Classification Investisseur — Source Feuille AMG"
                          : "Investor Classification — AMG Sheet Source"}
                      </p>
                      <p className="text-base font-semibold tracking-wide mt-0.5" style={{ color: cat.color }}>
                        {cat.label}
                      </p>
                    </div>
                    <span
                      className="ml-2 text-[8px] font-mono font-bold tracking-widest px-2 py-1 rounded-md opacity-70"
                      style={{
                        color: cat.color,
                        background: `${cat.glow}`,
                        border: `1px solid ${cat.border}`,
                      }}
                    >
                      {cat.badge}
                    </span>
                  </motion.div>

                  {/* Loading dots */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center gap-2"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"
                        animate={{ opacity: [0.25, 1, 0.25] }}
                        transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.25 }}
                      />
                    ))}
                    <span className="text-[10px] text-[#a3a3a3] ml-1.5">
                      {locale === "fr"
                        ? "Chargement de votre salle de données..."
                        : "Loading your data room..."}
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
