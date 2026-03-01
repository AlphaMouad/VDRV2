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
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      <motion.svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0" />
            <stop offset="50%" stopColor="#C5A059" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFBD69" stopOpacity="0" />
            <stop offset="50%" stopColor="#DFBD69" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#DFBD69" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lgV" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" stopOpacity="0" />
            <stop offset="50%" stopColor="#C5A059" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Animated Diagonal lines */}
        <motion.line
          x1="-10%" y1="110%" x2="110%" y2="-10%"
          stroke="url(#lg1)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        <motion.line
          x1="-10%" y1="90%"  x2="90%"  y2="-10%"
          stroke="url(#lg2)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.line
          x1="-10%" y1="70%"  x2="70%"  y2="-10%"
          stroke="url(#lg1)" strokeWidth="0.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.line
          x1="-10%" y1="130%" x2="130%" y2="-10%"
          stroke="url(#lg2)" strokeWidth="0.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4.5, ease: "easeInOut", delay: 0.6 }}
        />

        {/* Animated Grid lines */}
        <motion.line
          x1="33%" y1="0%"   x2="33%" y2="100%"
          stroke="url(#lgV)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.line
          x1="67%" y1="0%"   x2="67%" y2="100%"
          stroke="url(#lgV)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 1 }}
        />
        <motion.line
          x1="0%"  y1="33%"  x2="100%" y2="33%"
          stroke="rgba(197,160,89,0.05)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 1.2 }}
        />
        <motion.line
          x1="0%"  y1="67%"  x2="100%" y2="67%"
          stroke="rgba(197,160,89,0.05)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 1.4 }}
        />
      </motion.svg>

      {/* Slow pulsing glows */}
      <motion.div
        className="absolute top-[20%] left-[15%] w-[800px] h-[800px] rounded-full mix-blend-screen"
        style={{ background: "radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen"
        style={{ background: "radial-gradient(circle, rgba(223,189,105,0.06) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
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
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >

            {/* ── LEFT: Brand Manifesto Panel ───────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-16 overflow-hidden"
            >
              {/* Animated geometry */}
              <GoldGeometry />

              {/* Radial glow center */}
              <div
                className="absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full pointer-events-none mix-blend-screen"
                style={{ background: "radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 60%)" }}
              />
              {/* Corner glow */}
              <div
                className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none mix-blend-screen"
                style={{ background: "radial-gradient(circle, rgba(197,160,89,0.06) 0%, transparent 60%)" }}
              />

              {/* Top: Logo + title */}
              <div className="relative z-10">
                <motion.img
                  initial={{ opacity: 0, filter: "blur(4px)", y: -10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
                  className="logo-white h-14 mb-8"
                  alt="AMG Building"
                  crossOrigin="anonymous"
                />

                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                  className="w-24 h-[1px] bg-gradient-to-r from-[#C5A059] to-transparent mb-8 origin-left"
                />

                <motion.div
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                >
                  <h1 className="font-[var(--font-playfair)] text-[3.5rem] text-white leading-[1.1] tracking-tight mb-3">
                    Ambassadeur<br />
                    <span className="gold-text-gradient font-medium">6&amp;7</span>
                  </h1>
                  <p className="text-[11px] tracking-[0.5em] uppercase text-[#a3a3a3] mb-6 font-medium">
                    Palmeraie · Marrakech · Maroc
                  </p>
                  <p className="font-[var(--font-playfair)] text-[15px] italic text-[#C5A059] opacity-80 tracking-wider">
                    {locale === "fr"
                      ? "« Là où la structure rencontre la souveraineté »"
                      : '"Where Structure Meets Sovereignty"'}
                  </p>
                </motion.div>
              </div>

              {/* Middle: Investment stats */}
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
              >
                <p className="text-[9px] tracking-[0.4em] uppercase text-[#C5A059] mb-6 opacity-80 font-medium">
                  {locale === "fr"
                    ? "Paramètres Institutionnels Clés"
                    : "Key Institutional Parameters"}
                </p>

                <div className="space-y-2">
                  {leftStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + i * 0.15, duration: 0.6, ease: "easeOut" }}
                      className="flex items-center justify-between py-4 border-b border-[rgba(255,255,255,0.06)] group"
                    >
                      <div>
                        <p className="text-[11px] tracking-[0.15em] uppercase text-[#a3a3a3] group-hover:text-white transition-colors duration-300">
                          {stat.label}
                        </p>
                        <p className="text-[10px] text-[#a3a3a3] opacity-50 mt-1 tracking-wide">
                          {stat.sub}
                        </p>
                      </div>
                      <span
                        className="font-[var(--font-jetbrains)] text-2xl font-bold tracking-tight group-hover:scale-105 transition-transform duration-300 origin-right"
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
                transition={{ delay: 1.5, duration: 0.8 }}
                className="relative z-10"
              >
                <div className="w-full h-[1px] bg-gradient-to-r from-[rgba(197,160,89,0.2)] to-transparent mb-5" />
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#a3a3a3] opacity-60 mb-2">
                  AMG Building · {new Date().getFullYear()} ·{" "}
                  {locale === "fr" ? "Tous droits réservés" : "All Rights Reserved"}
                </p>
                <p className="text-[8.5px] text-[#a3a3a3] opacity-40 leading-relaxed max-w-[80%]">
                  {locale === "fr"
                    ? "Document confidentiel — réservé aux investisseurs qualifiés au sens des réglementations applicables"
                    : "Confidential document — restricted to qualified purchasers under applicable securities regulations"}
                </p>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Authentication Form ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center relative px-6 py-12 lg:py-0"
              style={{
                background: "linear-gradient(160deg, rgba(8,8,8,0.98) 0%, rgba(0,0,0,1) 100%)",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Subtle ambient light on the form side */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none mix-blend-screen opacity-20"
                   style={{ background: "radial-gradient(circle at top right, rgba(197,160,89,0.1) 0%, transparent 60%)" }} />

              {/* Language switcher */}
              <button
                onClick={onSwitchLocale}
                className="absolute top-6 right-6 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-lg glass-form border border-[rgba(197,160,89,0.2)] text-[#a3a3a3] hover:text-[#C5A059] hover:border-[rgba(197,160,89,0.4)] transition-all duration-300 text-[10px] shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              >
                <Globe className="w-4 h-4" />
                <span className="tracking-[0.2em] uppercase font-mono font-medium">
                  {locale === "en" ? "FR" : "EN"}
                </span>
              </button>

              {/* Mobile: compact logo */}
              <div className="lg:hidden flex flex-col items-center mb-10">
                <motion.img
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  src="https://amg-building.com/wp-content/uploads/2025/04/Logo.svg"
                  className="logo-white h-10 mb-4"
                  alt="AMG Building"
                  crossOrigin="anonymous"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-[10px] tracking-[0.4em] uppercase text-[#a3a3a3] font-medium"
                >
                  {t.login.title}
                </motion.p>
              </div>

              {/* Form wrapper */}
              <div className="w-full max-w-[400px] glass-form p-8 relative overflow-hidden group">

                {/* Subtle top border glow */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(197,160,89,0.4)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#C5A059] blur-[20px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500" />

                {/* Header */}
                <div className="mb-8 relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.25)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(197,160,89,0.15)]">
                        <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                      </div>
                      <span className="text-[9px] tracking-[0.3em] uppercase text-[#C5A059] font-medium">
                        {t.login.portalLabel}
                      </span>
                    </div>
                  </div>

                  <h2 className="font-[var(--font-playfair)] text-3xl text-white leading-tight mb-2 tracking-wide">
                    {locale === "fr" ? "Accès Sécurisé" : "Secure Access"}
                  </h2>
                  <p className="text-[11px] text-[#a3a3a3] leading-relaxed tracking-wide">
                    {locale === "fr"
                      ? "Identifiez-vous avec votre email ou votre identifiant investisseur AMG."
                      : "Authenticate with your email address or AMG investor ID."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">

                  {/* Identifier */}
                  <div className="relative group/input">
                    <input
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setError("") }}
                      className="peer w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] text-[#ffffff] pt-5 pb-2 px-1 text-sm focus:border-[#C5A059] focus:outline-none transition-colors duration-300 font-[var(--font-jetbrains)] placeholder-transparent"
                      placeholder={t.login.emailPlaceholder}
                      id="identifier"
                    />
                    <label
                      htmlFor="identifier"
                      className="absolute left-1 top-5 text-[11px] tracking-[0.1em] text-[#a3a3a3] transition-all duration-300 peer-focus:-top-1 peer-focus:text-[9px] peer-focus:text-[#C5A059] peer-focus:uppercase peer-focus:tracking-[0.2em] peer-[&:not(:placeholder-shown)]:-top-1 peer-[&:not(:placeholder-shown)]:text-[9px] peer-[&:not(:placeholder-shown)]:text-[rgba(255,255,255,0.7)] peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-[0.2em] cursor-text"
                    >
                      {t.login.emailLabel}
                    </label>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C5A059] to-transparent scale-x-0 peer-focus:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>

                  {/* Password */}
                  <div className="relative group/input">
                    <input
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError("") }}
                      className="peer w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] text-[#ffffff] pt-5 pb-2 px-1 pr-8 text-sm focus:border-[#C5A059] focus:outline-none transition-colors duration-300 font-[var(--font-jetbrains)] placeholder-transparent"
                      placeholder={t.login.passwordPlaceholder}
                      id="password"
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-1 top-5 text-[11px] tracking-[0.1em] text-[#a3a3a3] transition-all duration-300 peer-focus:-top-1 peer-focus:text-[9px] peer-focus:text-[#C5A059] peer-focus:uppercase peer-focus:tracking-[0.2em] peer-[&:not(:placeholder-shown)]:-top-1 peer-[&:not(:placeholder-shown)]:text-[9px] peer-[&:not(:placeholder-shown)]:text-[rgba(255,255,255,0.7)] peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-[0.2em] cursor-text"
                    >
                      {t.login.passwordLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                      className="absolute right-1 top-1/2 text-[rgba(255,255,255,0.3)] hover:text-[#C5A059] transition-colors duration-200"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye    className="w-4 h-4" />}
                    </button>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#C5A059] to-transparent scale-x-0 peer-focus:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>

                  {/* NDA checkbox */}
                  <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(197,160,89,0.3)] hover:bg-[rgba(197,160,89,0.02)] transition-all duration-300 group mt-2">
                    <div className="relative mt-0.5 shrink-0" onClick={() => setAgreed(!agreed)}>
                      <div
                        className={`w-[18px] h-[18px] rounded-[4px] border transition-all duration-300 flex items-center justify-center ${
                          agreed
                            ? "bg-[#C5A059] border-[#C5A059] shadow-[0_0_12px_rgba(197,160,89,0.5)] scale-105"
                            : "border-[rgba(255,255,255,0.3)] bg-[rgba(0,0,0,0.5)] group-hover:border-[rgba(197,160,89,0.6)]"
                        }`}
                      >
                        <AnimatePresence>
                          {agreed && (
                            <motion.svg
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="w-3 h-3 text-black"
                              fill="none"
                              viewBox="0 0 12 12"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <span className="text-[10px] leading-[1.6] text-[#a3a3a3] group-hover:text-[rgba(255,255,255,0.85)] transition-colors duration-300 tracking-wide">
                      {t.login.ndaCheckbox}
                    </span>
                  </label>

                  {/* Error message */}
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] shadow-[0_4px_12px_rgba(239,68,68,0.1)]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                        <p className="text-[#EF4444] text-[11px] leading-relaxed tracking-wide">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn-gold w-full mt-4 h-12 flex items-center justify-center tracking-[0.2em] shadow-[0_0_20px_rgba(197,160,89,0.15)] hover:shadow-[0_0_30px_rgba(197,160,89,0.3)] transition-all duration-300"
                    disabled={loading}
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t.login.submitting}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="submit"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          {t.login.submitButton}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </form>

                {/* Confidential notice */}
                <p className="mt-10 text-[8px] text-[#a3a3a3] opacity-50 tracking-[0.15em] leading-[1.8] text-center uppercase font-medium">
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
            className="flex h-full w-full items-center justify-center relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Background ambient glow matching avatar color */}
            {(() => {
              const cat = getCategoryInfo(authAccount.avatarType, locale)
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <div
                    className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full mix-blend-screen opacity-30"
                    style={{ background: `radial-gradient(circle, ${cat.glow} 0%, transparent 60%)` }}
                  />
                </motion.div>
              )
            })()}

            {(() => {
              const cat    = getCategoryInfo(authAccount.avatarType, locale)
              const CatIcon = cat.icon

              return (
                <div className="flex flex-col items-center text-center px-6 max-w-lg w-full z-10">

                  {/* Shield check circle */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                    className="relative w-28 h-28 rounded-full flex items-center justify-center mb-8 bg-[#0a0a0a]"
                    style={{
                      border: "1px solid rgba(16,185,129,0.4)",
                      boxShadow: "0 0 50px rgba(16,185,129,0.15), inset 0 0 20px rgba(16,185,129,0.1)",
                    }}
                  >
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    >
                      <CheckCircle2 className="w-14 h-14 text-[#10B981]" strokeWidth={1.5} />
                    </motion.div>

                    {/* Multi-layered Pulsing rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[rgba(16,185,129,0.4)]"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[rgba(16,185,129,0.2)]"
                      animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                    />
                  </motion.div>

                  {/* Verified label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_5px_#10B981]" />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-[#10B981] font-medium">
                      {locale === "fr"
                        ? "Identité Vérifiée · Accès Accordé"
                        : "Identity Verified · Access Granted"}
                    </span>
                  </motion.div>

                  {/* Greeting */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <p className="font-[var(--font-playfair)] text-[2rem] text-[rgba(255,255,255,0.7)] mb-1 leading-tight">
                      {locale === "fr" ? "Bienvenue," : "Welcome,"}
                    </p>
                    <p className="gold-text-gradient font-[var(--font-playfair)] text-4xl font-semibold mb-2 tracking-wide leading-tight">
                      {authAccount.fullName}
                    </p>
                    <p className="text-[11px] tracking-[0.3em] uppercase text-[#a3a3a3] mb-10 font-medium">
                      {authAccount.companyName}&nbsp;&mdash;&nbsp;<span className="text-[#C5A059]">{authAccount.investorId}</span>
                    </p>
                  </motion.div>

                  {/* Investor category badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.9, duration: 0.6, type: "spring", stiffness: 150 }}
                    className="inline-flex items-center gap-4 px-7 py-5 rounded-2xl mb-12 relative overflow-hidden group"
                    style={{
                      border: `1px solid ${cat.border}`,
                      background: cat.bg,
                      boxShadow: `0 10px 40px ${cat.glow}`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative z-10"
                      style={{ background: `${cat.glow}`, border: `1px solid ${cat.border}` }}
                    >
                      <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <div className="text-left relative z-10 pr-2">
                      <p className="text-[8.5px] tracking-[0.25em] uppercase text-[#a3a3a3] mb-1">
                        {locale === "fr"
                          ? "Classification Investisseur"
                          : "Investor Classification"}
                      </p>
                      <p className="text-[17px] font-semibold tracking-wide" style={{ color: cat.color }}>
                        {cat.label}
                      </p>
                    </div>
                    <span
                      className="ml-2 text-[9px] font-mono font-bold tracking-widest px-2.5 py-1.5 rounded-md relative z-10"
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
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"
                          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
                      {locale === "fr"
                        ? "Déchiffrement de la salle de données..."
                        : "Decrypting data room..."}
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
