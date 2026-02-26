"use client"

import { useState, useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import { AnimatedValue } from "./animated-value"
import { Explain } from "./elite-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  calcTotals,
  calcWaterfall,
  calcIrrApprox,
  calcBearCaseYield,
  calcSyndicateSlice,
  calcScenario,
  calcPeakEquity,
  SCENARIO_PARAMS,
} from "@/lib/calculations"
import {
  Users2,
  Calculator,
  ChevronRight,
  TrendingUp,
  Percent,
  DollarSign,
  Shield,
  CheckCircle2,
  ArrowDown,
  ArrowUp,
  Zap,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SyndicationProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

const SCENARIO_ORDER = ["bull", "base", "bear", "catastrophic"] as const
const SCENARIO_COLORS: Record<string, string> = {
  bull: "#10B981",
  base: "#C5A059",
  bear: "#F59E0B",
  catastrophic: "#EF4444",
}
const SCENARIO_BG: Record<string, string> = {
  bull: "rgba(16,185,129,0.05)",
  base: "rgba(197,160,89,0.05)",
  bear: "rgba(245,158,11,0.05)",
  catastrophic: "rgba(239,68,68,0.05)",
}
const SCENARIO_NAMES: Record<string, { en: string; fr: string }> = {
  bull: { en: "Bull", fr: "Haussier" },
  base: { en: "Base", fr: "Base" },
  bear: { en: "Bear", fr: "Baissier" },
  catastrophic: { en: "Catastrophic", fr: "Catastrophique" },
}

function fmt(v: number) {
  return `€${Math.round(v).toLocaleString()}`
}
function fmtShort(v: number) {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`
  return fmt(v)
}

export function Syndication({ macro, t, locale }: SyndicationProps) {
  const sv = t.syndicationView
  const { totalGDC, lpCommitment } = calcTotals(macro)
  const gpCommitment = totalGDC * 0.1
  const impliedSlots = Math.floor(lpCommitment / macro.minTicketSize)

  // Slider always goes from min ticket to FULL LP commitment
  const sliderMin = macro.minTicketSize
  const sliderMax = lpCommitment

  // Commitment state — default to €1M (institutional entry)
  const [ticket, setTicket] = useState(1_000_000)
  const clampedTicket = Math.min(sliderMax, Math.max(sliderMin, ticket))

  const isSoleLP = clampedTicket >= lpCommitment * 0.9999

  // Presets: Min, €1M (institutional standard), 25%, Full Deal
  const presets = [
    { label: sv.presetMin, value: sliderMin },
    { label: "€1M", value: 1_000_000 },
    { label: "25%", value: Math.round(lpCommitment * 0.25 / 50000) * 50000 },
    { label: sv.presetFullDeal, value: lpCommitment },
  ]

  // Core calculations
  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const waterfall = useMemo(() => calcWaterfall(totalGDV, macro), [totalGDV, macro])
  const bearYield = useMemo(() => calcBearCaseYield(macro, 350, 45), [macro])
  const peakEquityTotal = useMemo(() => calcPeakEquity(macro, true), [macro])
  const years = macro.projectMonths / 12

  const slice = useMemo(
    () => calcSyndicateSlice(clampedTicket, macro, waterfall, bearYield.lpAnnualDividend),
    [clampedTicket, macro, waterfall, bearYield]
  )

  const investorPeakEquity = peakEquityTotal * slice.ownershipPct
  const vefaRecycled = Math.max(0, clampedTicket - investorPeakEquity)

  // Capital calls (investor-specific)
  const call1 = clampedTicket * 0.35
  const call2 = clampedTicket * 0.30
  const callRem = clampedTicket * 0.35

  // Per-scenario projections — use proper 4-tier waterfall for consistency with main calculator
  const scenarioProjections = useMemo(() =>
    SCENARIO_ORDER.map((id) => {
      const params = SCENARIO_PARAMS[id]
      const result = calcScenario(params, macro)
      const ownershipPct = lpCommitment > 0 ? clampedTicket / lpCommitment : 0
      // Use same waterfall engine as main calculator (not simplified 90/10)
      const scenarioWf = calcWaterfall(result.totalValue, macro)
      const lpCash = scenarioWf.totalLP * ownershipPct
      const moic = clampedTicket > 0 ? lpCash / clampedTicket : 0
      const irr = calcIrrApprox(moic, years)
      const netProfit = lpCash - clampedTicket
      // Annual Ijarah income for yield scenarios (bear/catastrophic with rental pivot)
      const investorAnnualIncome = result.annualRentalNOI * 0.9 * ownershipPct
      const isYieldScenario = result.villasRental > 0 && params.sellThrough < 100
      return { id, probability: params.probability, lpCash, moic, irr, netProfit, investorAnnualIncome, isYieldScenario, annualYield: result.annualYield }
    }),
    [clampedTicket, macro, lpCommitment, years]
  )

  const baseCaseProfit = slice.projectedLP - clampedTicket

  return (
    <div>
      <VideoExplainer
        title={sv.videoTitle}
        subtitle={sv.videoSubtitle}
        locale={locale}
      />

      {/* ── Syndicate Structure ── */}
      <Reveal delay={0.05}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10 border border-[rgba(197,160,89,0.2)]">
          <div className="flex items-center gap-2 mb-6">
            <Users2 className="w-4 h-4 text-[#C5A059]" />
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
              {sv.structureTitle}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="glass-form p-5 border border-[rgba(197,160,89,0.2)] bg-[rgba(197,160,89,0.02)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.totalLpRaise}</p>
              <p className="gold-text-gradient font-mono text-xl font-bold">{fmt(lpCommitment)}</p>
              <p className="text-[9px] text-[#a3a3a3] mt-1 opacity-70">90% of total cost</p>
            </div>
            <div className="glass-form p-5 border border-[rgba(255,255,255,0.06)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.gpCoInvest}</p>
              <p className="font-mono text-xl font-bold text-[#ffffff]">{fmt(gpCommitment)}</p>
              <p className="text-[9px] text-[#a3a3a3] mt-1 opacity-70">Aligned GP skin-in-game</p>
            </div>
            <div className="glass-form p-5 border border-[rgba(16,185,129,0.2)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.minTicket}</p>
              <p className="font-mono text-xl font-bold text-[#10B981]">{fmt(macro.minTicketSize)}</p>
            </div>
            <div className="glass-form p-5 border border-[rgba(16,185,129,0.2)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.maxTicket}</p>
              <p className="font-mono text-xl font-bold text-[#10B981]">
                {macro.maxTicketSize >= lpCommitment ? "Full Deal" : fmt(macro.maxTicketSize)}
              </p>
            </div>
            <div className="glass-form p-5 border border-[rgba(197,160,89,0.15)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.impliedSlots}</p>
              <p className="gold-text-gradient font-mono text-xl font-bold">{impliedSlots}</p>
              <p className="text-[9px] text-[#a3a3a3] mt-1 opacity-70">at min ticket</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Commitment Calculator ── */}
      <Reveal delay={0.1}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10 border border-[rgba(197,160,89,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#C5A059]" />
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
                {sv.calculatorTitle}
              </h2>
            </div>
            {isSoleLP && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#C5A059] bg-[rgba(197,160,89,0.1)] shadow-[0_0_15px_rgba(197,160,89,0.2)]">
                <Crown className="w-3 h-3 text-[#C5A059]" />
                <span className="text-[9px] font-mono font-bold text-[#C5A059] tracking-widest">
                  {sv.soleLpBadge}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#a3a3a3] mb-8 leading-relaxed max-w-2xl">{sv.calculatorDesc}</p>

          {/* Quick-select presets */}
          <div className="flex flex-wrap gap-3 mb-8">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setTicket(p.value)}
                className={cn(
                  "px-4 py-2 rounded-md text-[10px] font-mono font-semibold tracking-wider border transition-all duration-300",
                  Math.abs(clampedTicket - p.value) < 1000
                    ? "border-[#C5A059] bg-[rgba(197,160,89,0.15)] text-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.1)]"
                    : "border-[rgba(255,255,255,0.1)] text-[#a3a3a3] hover:border-[rgba(197,160,89,0.4)] hover:text-[#ffffff]"
                )}
              >
                {p.label}
                {p.label !== sv.presetMin && p.label !== sv.presetFullDeal && p.label !== "€1M" && (
                  <span className="ml-2 opacity-50">{fmtShort(p.value)}</span>
                )}
              </button>
            ))}
          </div>

          {/* Ticket Slider */}
          <div className="mb-10">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-3 font-medium">{sv.yourCommitment}</p>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mb-6">
              <span className="font-mono text-5xl sm:text-6xl font-bold gold-text-gradient leading-none tracking-tight">
                {fmt(clampedTicket)}
              </span>
              <span className="font-mono text-xs text-[#a3a3a3] leading-none px-3 py-1 rounded bg-[rgba(255,255,255,0.05)]">
                {(slice.ownershipPct * 100).toFixed(2)}%&nbsp;
                {locale === "fr" ? "participation LP" : "LP ownership"}
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-[rgba(255,255,255,0.1)] mb-2">
              <div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#F9E5AA]"
                style={{ width: `${((clampedTicket - sliderMin) / (sliderMax - sliderMin)) * 100}%` }}
              />
              <input
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={Math.max(10000, Math.round(sliderMax / 200 / 10000) * 10000)}
                value={clampedTicket}
                onChange={(e) => setTicket(Number(e.target.value))}
                className="absolute top-[-9px] left-0 w-full h-6 opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#C5A059] border-2 border-black shadow-[0_0_15px_rgba(197,160,89,0.5)] pointer-events-none transition-all duration-75"
                style={{ left: `${((clampedTicket - sliderMin) / (sliderMax - sliderMin)) * 100}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#a3a3a3] mt-2">
              <span>{fmt(sliderMin)} (min)</span>
              <span>{fmt(sliderMax)} (full deal)</span>
            </div>
          </div>

          {/* ── PRIMARY RETURN SUMMARY ── */}
          {/* Row 1: The 3 big numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* LP Cash Back */}
            <div className="glass-form p-6 border border-[rgba(197,160,89,0.25)] text-center bg-[rgba(197,160,89,0.02)]">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#a3a3a3] mb-3">{sv.lpCashLabel}</p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-4xl font-bold mb-1">
                €<AnimatedValue value={slice.projectedLP} format="currency" />
              </p>
              <p className="text-[9px] text-[#a3a3a3] opacity-60">{sv.baseCaseLabel}</p>
            </div>
            {/* MOIC */}
            <div className="glass-form p-6 border border-[rgba(197,160,89,0.25)] text-center bg-[rgba(197,160,89,0.02)]">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#a3a3a3] mb-3">
                <Explain k="moic">{sv.projectedMoic}</Explain>
              </p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-4xl font-bold mb-1">
                <AnimatedValue value={slice.projectedMOIC} format="multiplier" />x
              </p>
              <p className="text-[9px] text-[#a3a3a3] opacity-60">{sv.baseCaseLabel}</p>
            </div>
            {/* IRR */}
            <div className="glass-form p-6 border border-[rgba(16,185,129,0.25)] text-center bg-[rgba(16,185,129,0.02)]">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#a3a3a3] mb-3">
                <Explain k="irr">{sv.projectedIrr}</Explain>
              </p>
              <p className="font-mono text-3xl sm:text-4xl font-bold text-[#10B981] mb-1">
                <AnimatedValue value={slice.projectedIRR} format="percent" decimals={1} />%
              </p>
              <p className="text-[9px] text-[#a3a3a3] opacity-60">p.a. · {macro.projectMonths}-month hold</p>
            </div>
          </div>

          {/* Row 2: Net profit + Peak Equity + Bear Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-form p-5 border border-[rgba(255,255,255,0.06)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.netProfitLabel}</p>
              <p className={cn("font-mono text-2xl font-bold mb-1", baseCaseProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
                {baseCaseProfit >= 0 ? "+" : ""}€<AnimatedValue value={Math.abs(baseCaseProfit)} format="currency" />
              </p>
              <p className="text-[9px] text-[#a3a3a3] opacity-60">{locale === "fr" ? "Profit net cas de base" : "Net profit · base case"}</p>
            </div>
            <div className="glass-form p-5 border border-[rgba(197,160,89,0.1)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.peakDeployedLabel}</p>
              <p className="font-mono text-2xl font-bold text-[#C5A059] mb-1">
                €<AnimatedValue value={investorPeakEquity} format="currency" />
              </p>
              <p className="text-[9px] text-[#10B981] opacity-90">
                {vefaRecycled > 0 ? `${fmt(Math.round(vefaRecycled))} VEFA recycled` : "full draw required"}
              </p>
            </div>
            <div className="glass-form p-5 border border-[rgba(197,160,89,0.1)]">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] mb-2">{sv.bearCaseYield}</p>
              <p className="gold-text-gradient font-mono text-2xl font-bold mb-1">
                €<AnimatedValue value={slice.bearCaseAnnualYield} format="currency" />
                <span className="text-xs font-normal text-[#a3a3a3] ml-1">/yr</span>
              </p>
              <p className="text-[9px] text-[#a3a3a3] opacity-60">full hospitality pivot · 45% occ.</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Your Capital Journey ── */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#C5A059]" />
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">{sv.flowTitle}</h2>
          </div>
          <p className="text-xs text-[#a3a3a3] mb-8 leading-relaxed max-w-3xl">{sv.flowDesc}</p>

          <div className="relative pl-2 sm:pl-4">
            {/* Vertical connector line */}
            <div
              className="absolute left-[27px] sm:left-[35px] top-6 bottom-6 w-px"
              style={{ background: "linear-gradient(180deg, #C5A059 0%, rgba(197,160,89,0.1) 100%)" }}
            />

            {/* Steps */}
            {[
              {
                month: sv.flowStep0Month,
                title: sv.flowStep0Title,
                amount: fmt(clampedTicket),
                sub: sv.flowStep0Sub,
                amtColor: "#a3a3a3",
                icon: <ArrowDown className="w-3 h-3 text-[#EF4444]" />,
                sign: "−",
              },
              {
                month: sv.flowStep1Month,
                title: sv.flowStep1Title,
                amount: fmt(call1),
                sub: sv.flowStep1Sub,
                amtColor: "#EF4444",
                icon: <ArrowDown className="w-3 h-3 text-[#EF4444]" />,
                sign: "−",
              },
              {
                month: sv.flowStep2Month,
                title: sv.flowStep2Title,
                amount: fmt(call2),
                sub: sv.flowStep2Sub,
                amtColor: "#EF4444",
                icon: <ArrowDown className="w-3 h-3 text-[#EF4444]" />,
                sign: "−",
              },
              {
                month: sv.flowStep3Month,
                title: sv.flowStep3Title,
                amount: `${fmt(Math.round(vefaRecycled))} recycled`,
                sub: sv.flowStep3Sub,
                amtColor: "#10B981",
                icon: <ArrowUp className="w-3 h-3 text-[#10B981]" />,
                sign: "↩",
              },
              {
                month: sv.flowStep4Month,
                title: sv.flowStep4Title,
                amount: fmt(slice.projectedLP),
                sub: sv.flowStep4Sub,
                amtColor: "#C5A059",
                icon: <ArrowUp className="w-3 h-3 text-[#10B981]" />,
                sign: "+",
              },
            ].map((step, i) => (
              <div key={i} className="relative flex gap-4 sm:gap-6 mb-5 last:mb-0 group">
                <div className="relative z-10 shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-form border border-[rgba(197,160,89,0.3)] flex items-center justify-center bg-[#050505] group-hover:border-[#C5A059] transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-[#C5A059]">{i + 1}</span>
                </div>
                <div className="flex-1 glass-form p-4 sm:p-5 rounded-xl border border-[rgba(255,255,255,0.05)] group-hover:border-[rgba(255,255,255,0.1)] transition-all">
                  <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.15em] uppercase font-mono text-[#a3a3a3] mb-1">{step.month}</p>
                      <p className="text-sm font-semibold text-[#ffffff] mb-1">{step.title}</p>
                      <p className="text-[11px] text-[#a3a3a3] leading-relaxed">{step.sub}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0 mt-2 sm:mt-0">
                      <p className="text-[9px] tracking-wider uppercase text-[#a3a3a3] mb-0.5 hidden sm:block">{step.sign}</p>
                      <p className="font-mono text-base font-bold" style={{ color: step.amtColor }}>
                        {step.amount}
                      </p>
                    </div>
                  </div>
                  {/* Net profit callout on final step */}
                  {i === 4 && (
                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-[#a3a3a3]">{sv.netProfitLabel}</span>
                      <span className={cn("font-mono text-sm font-bold", baseCaseProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
                        {baseCaseProfit >= 0 ? "+" : ""}{fmt(baseCaseProfit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Peak equity summary */}
          <div className="mt-8 p-5 rounded-xl border border-[rgba(197,160,89,0.25)] bg-[rgba(197,160,89,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[9px] tracking-[0.18em] uppercase text-[#a3a3a3] mb-1">{sv.peakDeployedLabel}</p>
                <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-sm">{sv.peakDeployedSub}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="gold-text-gradient font-mono text-2xl font-bold">{fmt(Math.round(investorPeakEquity))}</p>
                {vefaRecycled > 0 && (
                  <p className="text-[10px] text-[#10B981] font-mono mt-1 font-medium">{sv.vefaRecycledLabel}: {fmt(Math.round(vefaRecycled))}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── All Scenarios — Your Numbers ── */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#C5A059]" />
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">{sv.scenarioTitle}</h2>
          </div>
          <p className="text-xs text-[#a3a3a3] mb-8 leading-relaxed max-w-3xl">{sv.scenarioDesc}</p>

          {/* Scenario cards (mobile-friendly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {scenarioProjections.map((s) => {
              const color = SCENARIO_COLORS[s.id]
              const bg = SCENARIO_BG[s.id]
              const name = locale === "fr" ? SCENARIO_NAMES[s.id].fr : SCENARIO_NAMES[s.id].en
              const isBase = s.id === "base"
              const isCatastrophic = s.id === "catastrophic"
              return (
                <div
                  key={s.id}
                  className={cn(
                    "p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1",
                    isBase ? "border-[rgba(197,160,89,0.4)] shadow-[0_0_20px_rgba(197,160,89,0.1)]" : "border-[rgba(255,255,255,0.06)]"
                  )}
                  style={{ background: bg }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
                      <span className="text-sm font-bold text-[#ffffff]">{name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#a3a3a3] border border-[rgba(255,255,255,0.1)] rounded px-2 py-1 bg-[rgba(0,0,0,0.2)]">
                      {(s.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-4">
                    {/* Primary metric */}
                    <div>
                      <p className="text-[9px] tracking-[0.12em] uppercase text-[#a3a3a3] mb-1">
                        {sv.thLpCash}
                      </p>
                      <p className="font-mono text-2xl font-bold tracking-tight" style={{ color }}>{fmt(s.lpCash)}</p>
                      {isCatastrophic && (
                        <p className="text-[9px] text-[#10B981] mt-1 font-medium italic">
                          Capital preserved — unencumbered hold
                        </p>
                      )}
                    </div>

                    {/* MOIC / IRR / Net Profit row */}
                    <div className="flex justify-between items-end border-t border-[rgba(255,255,255,0.05)] pt-3">
                      <div>
                        <p className="text-[9px] text-[#a3a3a3] mb-0.5">{sv.thMoic}</p>
                        <p className="font-mono text-sm font-semibold" style={{ color }}>
                          {s.moic.toFixed(2)}x
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-[#a3a3a3] mb-0.5">{sv.thIrr}</p>
                        <p className="font-mono text-sm font-semibold" style={{ color }}>
                          {isCatastrophic
                            ? `${s.annualYield.toFixed(1)}% Ijarah`
                            : s.irr > -50
                            ? `${s.irr.toFixed(1)}%`
                            : "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-[#a3a3a3] mb-0.5">{sv.thNetProfit}</p>
                        {isCatastrophic && Math.abs(s.netProfit) < 1000 ? (
                          <p className="font-mono text-sm font-semibold text-[#a3a3a3]">Preserved</p>
                        ) : (
                          <p className={cn("font-mono text-sm font-semibold", s.netProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
                            {s.netProfit >= 0 ? "+" : ""}{fmtShort(s.netProfit)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Annual Ijarah income overlay for yield scenarios */}
                    {s.isYieldScenario && s.investorAnnualIncome > 0 && (
                      <div
                        className="mt-2 pt-3 border-t border-[rgba(16,185,129,0.2)] flex items-center justify-between"
                        style={{ background: "rgba(16,185,129,0.04)", borderRadius: 6, padding: "10px 12px", margin: "0 -4px -4px -4px" }}
                      >
                        <div>
                          <p className="text-[8px] tracking-[0.12em] uppercase text-[#10B981] opacity-80 mb-0.5">
                            {locale === "fr" ? "Revenu Ijarah Annuel" : "Annual Ijarah Income"}
                          </p>
                          <p className="font-mono text-sm font-bold text-[#10B981]">
                            €{Math.round(s.investorAnnualIncome).toLocaleString()}/yr
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-[#a3a3a3] mb-0.5">
                            {locale === "fr" ? "Rendement perpétuel" : "Perpetual yield"}
                          </p>
                          <p className="font-mono text-xs font-semibold text-[#10B981]">
                            {s.annualYield.toFixed(1)}% p.a.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Full precision table — desktop only; cards handle mobile */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-left py-3 pr-4 text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] font-normal">{sv.thScenario}</th>
                  <th className="text-right py-3 pr-4 text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] font-normal">{sv.thProbability}</th>
                  <th className="text-right py-3 pr-4 text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] font-normal">{sv.thLpCash}</th>
                  <th className="text-right py-3 pr-4 text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] font-normal">{sv.thMoic}</th>
                  <th className="text-right py-3 pr-4 text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] font-normal">{sv.thIrr}</th>
                  <th className="text-right py-3 text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] font-normal">{sv.thNetProfit}</th>
                </tr>
              </thead>
              <tbody>
                {scenarioProjections.map((s) => {
                  const color = SCENARIO_COLORS[s.id]
                  const name = locale === "fr" ? SCENARIO_NAMES[s.id].fr : SCENARIO_NAMES[s.id].en
                  return (
                    <tr key={s.id} className="border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: color, color }} />
                          <span className="text-[#ffffff] font-medium">{name}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right font-mono text-[#a3a3a3]">
                        {(s.probability * 100).toFixed(0)}%
                      </td>
                      <td className="py-4 pr-4 text-right font-mono font-bold" style={{ color }}>{fmt(s.lpCash)}</td>
                      <td className="py-4 pr-4 text-right font-mono" style={{ color }}>{s.moic.toFixed(2)}x</td>
                      <td className="py-4 pr-4 text-right font-mono" style={{ color }}>
                        {s.id === "catastrophic"
                          ? `${s.annualYield.toFixed(1)}% Ijarah`
                          : s.irr > -50
                          ? `${s.irr.toFixed(1)}%`
                          : "—"}
                      </td>
                      <td className="py-4 text-right font-mono font-bold">
                        {s.id === "catastrophic" && Math.abs(s.netProfit) < 1000 ? (
                          <span className="text-[#a3a3a3]">Preserved</span>
                        ) : (
                          <span className={s.netProfit >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                            {s.netProfit >= 0 ? "+" : ""}{fmt(s.netProfit)}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ── How to Commit ── */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">{sv.howToTitle}</h2>
          </div>
          <div className="space-y-0">
            {(
              [
                { label: sv.step1Label, desc: sv.step1Desc },
                { label: sv.step2Label, desc: sv.step2Desc },
                { label: sv.step3Label, desc: sv.step3Desc },
                { label: sv.step4Label, desc: sv.step4Desc },
                { label: sv.step5Label, desc: sv.step5Desc },
              ] as { label: string; desc: string }[]
            ).map((step, i) => (
              <div key={i} className="flex gap-5 items-start py-5 border-b border-[rgba(255,255,255,0.04)] last:border-0 group hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-lg px-2">
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full glass-form flex items-center justify-center border border-[rgba(197,160,89,0.35)] group-hover:border-[#C5A059] transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-[#C5A059]">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#ffffff] mb-1.5">{step.label}</p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed max-w-2xl">{step.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#a3a3a3] opacity-30 shrink-0 mt-1 group-hover:translate-x-1 transition-all group-hover:text-[#C5A059] group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
