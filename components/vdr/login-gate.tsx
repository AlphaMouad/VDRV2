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

function getCategoryInfo(type: VDRAccount["avatarType"], locale: Locale) {
  switch (type) {
    case "REPE":
      return {
        label: locale === "fr" ? "Fonds Immobilier Institutionnel" : "Real Estate Private Equity",
        badge: "REPE",
        icon: TrendingUp,
        color: "#000000",
        border: "rgba(0,0,0,0.1)",
        bg: "rgba(0,0,0,0.02)",
      }
    case "FamilyOffice":
      return {
        label: locale === "fr" ? "Family Office" : "Family Office",
        badge: "FO",
        icon: Building2,
        color: "#000000",
        border: "rgba(0,0,0,0.1)",
        bg: "rgba(0,0,0,0.02)",
      }
    case "UHNWI":
      return {
        label: locale === "fr" ? "Ultra Haute Valeur Nette" : "Ultra High Net Worth",
        badge: "UHNWI",
        icon: Star,
        color: "#000000",
        border: "rgba(0,0,0,0.1)",
        bg: "rgba(0,0,0,0.02)",
      }
    default:
      return {
        label: locale === "fr" ? "Investisseur Qualifié" : "Qualified Investor",
        badge: "QI",
        icon: Users2,
        color: "#000000",
        border: "rgba(0,0,0,0.1)",
        bg: "rgba(0,0,0,0.02)",
      }
  }
}

// ── Minimalist Triangle Logo ─────────────────────────────────────────────────

function EliteLogo() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
      <circle cx="32" cy="16" r="5" fill="black" />
      <circle cx="16" cy="44" r="5" fill="black" />
      <circle cx="48" cy="44" r="5" fill="black" />
      <line x1="29.5" y1="20" x2="18.5" y2="40" stroke="black" strokeWidth="2.5" strokeDasharray="5 5" />
      <line x1="34.5" y1="20" x2="45.5" y2="40" stroke="black" strokeWidth="2.5" strokeDasharray="5 5" />
      <line x1="21" y1="44" x2="43" y2="44" stroke="black" strokeWidth="2.5" strokeDasharray="5 5" />
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

      const account: VDRAccount = {
        investorId:    result.investorId,
        fullName:      result.fullName,
        companyName:   result.companyName,
        email:         result.email,
        role:          "investor",
        numberOfVillas: result.numberOfVillas,
        avatarType:    result.avatarType,
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

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-white overflow-hidden text-black font-sans">
      <AnimatePresence mode="wait">

        {/* ══════════════════════════════ LOGIN SCREEN ══════════════════════ */}

        {phase === "login" && (
          <motion.div
            key="login"
            className="flex h-full w-full items-center justify-center relative px-6 py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >

            {/* Language switcher */}
            <button
              onClick={onSwitchLocale}
              className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-500 hover:text-black hover:border-gray-300 transition-colors duration-200 text-xs tracking-widest uppercase"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === "en" ? "FR" : "EN"}</span>
            </button>

            {/* Form wrapper */}
            <div className="w-full max-w-sm flex flex-col items-center">

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <EliteLogo />
              </motion.div>

              {/* Header */}
              <div className="mb-10 text-center w-full">
                <h2 className="text-2xl font-light tracking-wide text-black mb-2">
                  {locale === "fr" ? "Accès Sécurisé" : "Secure Access"}
                </h2>
                <p className="text-sm text-gray-500 font-light">
                  {locale === "fr"
                    ? "Identifiez-vous pour accéder au portail."
                    : "Authenticate to access the portal."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">

                {/* Identifier */}
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError("") }}
                    className="w-full bg-transparent border-b border-gray-300 text-black py-3 px-1 text-sm focus:border-black focus:outline-none transition-colors duration-200 placeholder-gray-400 font-light"
                    placeholder={t.login.emailPlaceholder}
                  />
                  <label className="absolute -top-3 left-1 text-[10px] tracking-widest uppercase text-gray-400 pointer-events-none">
                    {t.login.emailLabel}
                  </label>
                </div>

                {/* Password */}
                <div className="relative mt-2">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError("") }}
                    className="w-full bg-transparent border-b border-gray-300 text-black py-3 px-1 pr-10 text-sm focus:border-black focus:outline-none transition-colors duration-200 placeholder-gray-400 font-light"
                    placeholder={t.login.passwordPlaceholder}
                  />
                  <label className="absolute -top-3 left-1 text-[10px] tracking-widest uppercase text-gray-400 pointer-events-none">
                    {t.login.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-150"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* NDA checkbox */}
                <label className="flex items-start gap-3 cursor-pointer mt-4 group">
                  <div className="relative mt-0.5 shrink-0" onClick={() => setAgreed(!agreed)}>
                    <div
                      className={`w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center ${
                        agreed
                          ? "bg-black border-black"
                          : "border-gray-300 bg-transparent group-hover:border-gray-400"
                      }`}
                    >
                      {agreed && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
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
                  <span className="text-xs leading-relaxed text-gray-500 font-light">
                    {t.login.ndaCheckbox}
                  </span>
                </label>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -5, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-red-500 text-xs font-medium text-center bg-red-50 py-2 rounded-md"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 rounded-md text-xs tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.login.submitting}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {t.login.submitButton}
                    </>
                  )}
                </button>
              </form>

              {/* Confidential notice */}
              <p className="mt-12 text-[10px] text-gray-400 uppercase tracking-widest text-center">
                {t.login.confidentialNotice}
              </p>
            </div>
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
              const cat = getCategoryInfo(authAccount.avatarType, locale)
              const CatIcon = cat.icon

              return (
                <div className="flex flex-col items-center text-center px-6 max-w-sm w-full">

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-gray-50 border border-gray-100"
                  >
                    <CheckCircle2 className="w-8 h-8 text-black" />
                  </motion.div>

                  {/* Greeting */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-light text-gray-400 mb-1"
                  >
                    {locale === "fr" ? "Bienvenue," : "Welcome,"}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-medium text-black mb-2"
                  >
                    {authAccount.fullName}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs tracking-widest uppercase text-gray-500 mb-10"
                  >
                    {authAccount.companyName} &mdash; {authAccount.investorId}
                  </motion.p>

                  {/* Investor badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 w-full mb-10"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200 shrink-0">
                      <CatIcon className="w-5 h-5 text-black" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                        {locale === "fr" ? "Classification" : "Classification"}
                      </p>
                      <p className="text-sm font-medium text-black">
                        {cat.label}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-gray-200 text-black uppercase">
                      {cat.badge}
                    </span>
                  </motion.div>

                  {/* Loading */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-xs text-gray-500 uppercase tracking-widest">
                      {locale === "fr" ? "Chargement..." : "Loading..."}
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
