"use client"

import { useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  ArrowRight,
  FileText,
  Download,
  Landmark,
  Banknote,
  Receipt,
  CheckCircle2,
  ShieldCheck,
  Globe,
} from "lucide-react"
import { Explain } from "./elite-explainer"

/**
 * Source-accurate Repatriation Engine:
 *  - 20% TPI on capital gain at SARL level
 *  - Quitus Fiscal trigger in Month 35
 *  - Garantie de Retransfert via Central Bank
 *  - Net-to-LP in USD, GBP, EUR corridors
 */

interface RepatriationProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

export function Repatriation({ macro, t, locale }: RepatriationProps) {
  const rv = t.repatriationView

  const flowSteps = [
    {
      icon: Banknote,
      label: rv.step1Label,
      description: rv.step1Desc,
      month: "Month 1",
    },
    {
      icon: Landmark,
      label: rv.step2Label,
      description: rv.step2Desc,
      month: "Ongoing",
    },
    {
      icon: Receipt,
      label: rv.step3Label,
      description: rv.step3Desc,
      month: `Month ${macro.projectMonths - 2}`,
    },
    {
      icon: CheckCircle2,
      label: rv.step4Label,
      description: rv.step4Desc,
      month: `Month ${macro.projectMonths - 1}`,
    },
    {
      icon: ShieldCheck,
      label: rv.step5Label,
      description: rv.step5Desc,
      month: `Month ${macro.projectMonths - 1}-${macro.projectMonths}`,
    },
  ]

  const documents = [
    {
      name: rv.doc1Name,
      file: "IGOC_2026_Repatriation_Protocol.pdf",
      desc: rv.doc1Desc,
    },
    {
      name: rv.doc2Name,
      file: "SARL_SPV_Liability_Shield.pdf",
      desc: rv.doc2Desc,
    },
    {
      name: rv.doc3Name,
      file: "VEFA_Notary_Escrow_Guarantee.pdf",
      desc: rv.doc3Desc,
    },
    {
      name: rv.doc4Name,
      file: "Titre_Foncier_Registry.pdf",
      desc: rv.doc4Desc,
    },
  ]

  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalGDV = macro.totalVillas * macro.avgVillaGDV

  const taxModel = useMemo(() => {
    const capitalGain = Math.max(0, totalGDV - totalGDC)
    const tpiTax = capitalGain * (macro.tpiRate / 100)
    const netAfterTPI = totalGDV - tpiTax

    // SARL-level net distributable
    const distributable = netAfterTPI

    // Net-to-LP by corridor (90% LP share, converted at FX rates)
    const lpShare = distributable * 0.9
    const lpShareMAD = lpShare * macro.fxUsdMad

    return {
      capitalGain,
      tpiTax,
      netAfterTPI,
      distributable,
      lpShare,
      lpShareMAD,
      corridors: [
        {
          name: "United States (USD)",
          flag: "US",
          netLP: lpShare,
          currency: "USD",
        },
        {
          name: "United Kingdom (GBP)",
          flag: "UK",
          netLP: lpShareMAD / macro.fxGbpMad,
          currency: "GBP",
        },
        {
          name: "Europe (EUR)",
          flag: "EU",
          netLP: lpShareMAD / macro.fxEurMad,
          currency: "EUR",
        },
        {
          name: "UAE (AED)",
          flag: "AE",
          netLP: lpShare * 3.67, // USD to AED peg
          currency: "AED",
        },
      ],
    }
  }, [macro, totalGDC, totalGDV])

  return (
    <div>
      <VideoExplainer
        title={rv.videoTitle}
        subtitle={rv.videoSubtitle}
        locale={locale}
      />

      {/* Dynamic TPI Tax Calculator */}
      <Reveal delay={0.1}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Receipt className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
              <Explain k="tpi">{rv.tpiEngineLabel}</Explain>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-form p-5 border border-[rgba(255,255,255,0.06)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                {rv.gdvLabel}
              </p>
              <p className="font-mono text-2xl text-[#ffffff] font-bold">
                €{totalGDV.toLocaleString()}
              </p>
            </div>
            <div className="glass-form p-5 border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.02)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                {rv.capitalGainLabel}
              </p>
              <p className="font-mono text-2xl text-[#10B981] font-bold">
                €{taxModel.capitalGain.toLocaleString()}
              </p>
            </div>
            <div className="glass-form p-5 border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                {rv.tpiTaxLabel} ({macro.tpiRate}%)
              </p>
              <p className="font-mono text-2xl text-[#EF4444] font-bold">
                -€{Math.round(taxModel.tpiTax).toLocaleString()}
              </p>
            </div>
            <div className="glass-form p-5 border border-[rgba(197,160,89,0.2)] bg-[rgba(197,160,89,0.02)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                {rv.netAfterTpi}
              </p>
              <p className="gold-text-gradient font-mono text-2xl font-bold">
                €{Math.round(taxModel.netAfterTPI).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Repatriation Corridors */}
          <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-3 font-medium">
            {rv.corridorsTitle}
          </h4>
          <p className="text-[10px] text-[#a3a3a3] mb-6 flex flex-wrap gap-2">
            <Explain k="convertible-account" className="px-2 py-1 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[#C5A059] transition-colors">
              Convertible Dirham Account structure →
            </Explain>
            <Explain k="swift-mt103" className="px-2 py-1 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[#C5A059] transition-colors">
              SWIFT MT103 inbound wire mechanics →
            </Explain>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {taxModel.corridors.map((corridor) => (
              <div
                key={corridor.name}
                className="glass-form p-6 border-l-4 border-[#C5A059] hover:bg-[rgba(197,160,89,0.05)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-[#C5A059] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wide font-medium">{corridor.name}</span>
                </div>
                <p className="font-mono text-2xl text-[#ffffff] font-bold mb-1">
                  {corridor.currency === "USD" ? "$" :
                    corridor.currency === "GBP" ? "\u00A3" :
                    corridor.currency === "EUR" ? "\u20AC" : "AED "}
                  {Math.round(corridor.netLP).toLocaleString()}
                </p>
                <p className="text-[9px] text-[#a3a3a3] opacity-60">
                  {rv.lpSharePost}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Repatriation Flow */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-8">
            {rv.flowTitle}
          </h3>

          {/* Desktop: horizontal flow */}
          <div className="hidden lg:flex items-start justify-between gap-4">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-start flex-1 group">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-16 h-16 rounded-2xl glass-form flex items-center justify-center mb-4 border border-[rgba(197,160,89,0.3)] bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:border-[#C5A059] group-hover:shadow-[0_0_20px_rgba(197,160,89,0.15)] transition-all duration-300">
                    <step.icon className="w-7 h-7 text-[#C5A059] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] text-[#C5A059] font-mono mb-2 px-2 py-0.5 rounded bg-[rgba(197,160,89,0.1)]">{step.month}</span>
                  <p className="text-sm font-semibold text-[#ffffff] mb-2 leading-tight px-2">
                    {step.label}
                  </p>
                  <p className="text-[10px] text-[#a3a3a3] leading-relaxed max-w-[160px] font-light">
                    {step.description}
                  </p>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="flex items-center justify-center h-16 w-8 mt-0">
                    <ArrowRight className="w-5 h-5 text-[#C5A059] opacity-30" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical flow */}
          <div className="lg:hidden flex flex-col gap-6">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="relative">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl glass-form flex items-center justify-center shrink-0 border border-[rgba(197,160,89,0.3)] bg-[#050505] z-10">
                    <step.icon className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#C5A059] font-mono mb-1 inline-block">{step.month}</span>
                    <p className="text-sm font-semibold text-[#ffffff] mb-1">
                      {step.label}
                    </p>
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="absolute left-7 top-14 bottom-[-24px] w-px border-l border-dashed border-[rgba(197,160,89,0.3)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Quitus Fiscal Trigger */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10 border-l-4 border-[#10B981] bg-[rgba(16,185,129,0.03)]">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <h3 className="text-lg font-semibold text-[#ffffff]">
              <Explain k="quitus-fiscal">{rv.quitusTitle}</Explain> — Month {macro.projectMonths - 1}
            </h3>
          </div>
          <p className="text-sm text-[#d4d4d4] mb-6 leading-relaxed max-w-3xl font-light">
            {rv.quitusDesc}
          </p>
          <p className="text-[10px] text-[#a3a3a3] flex flex-wrap gap-2">
            <Explain k="garantie-retransfert" className="px-2 py-1 rounded bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.1)] transition-colors text-[#10B981]">
              What the Garantie de Retransfert means for you →
            </Explain>
            <Explain k="igoc" className="px-2 py-1 rounded bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.1)] transition-colors text-[#10B981]">
              IGOC 2026 investor protections →
            </Explain>
          </p>
        </div>
      </Reveal>

      {/* Document Room */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6 sm:p-8">
          <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-2">
            {rv.documentRoom}
          </h3>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-8 font-medium">
            {rv.documentRoomSub}
          </p>

          <div className="flex flex-col gap-4">
            {documents.map((doc) => (
              <div
                key={doc.file}
                className="flex items-center justify-between p-5 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(197,160,89,0.2)] hover:bg-[rgba(255,255,255,0.03)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.1)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#ffffff] group-hover:text-[#C5A059] transition-colors mb-1">
                      {doc.file.includes("IGOC") ? <Explain k="igoc">{doc.name}</Explain> :
                       doc.file.includes("SARL") ? <Explain k="sarl">{doc.name}</Explain> :
                       doc.file.includes("VEFA") ? <Explain k="notary-escrow">{doc.name}</Explain> :
                       doc.file.includes("Titre") ? <Explain k="titre-foncier">{doc.name}</Explain> :
                       doc.name}
                    </p>
                    <p className="text-[11px] text-[#a3a3a3] leading-relaxed max-w-md font-light">
                      {doc.desc}
                    </p>
                  </div>
                </div>
                <button className="btn-gold flex items-center gap-2 px-4 py-2 text-[10px] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">{t.common.download}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
