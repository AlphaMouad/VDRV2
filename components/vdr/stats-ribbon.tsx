"use client"

import { useMemo } from "react"
import { AnimatedValue } from "./animated-value"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import {
  calcTotals,
  calcWaterfall,
  calcIrrApprox,
  calcPeakEquity,
  calcBearCaseYield,
} from "@/lib/calculations"

interface StatsRibbonProps {
  macro: MacroState
  t: Dictionary
}

export function StatsRibbon({ macro, t }: StatsRibbonProps) {
  const { totalGDV, lpCommitment } = calcTotals(macro)
  const waterfall = useMemo(() => calcWaterfall(totalGDV, macro), [totalGDV, macro])
  const peakEquity = useMemo(() => calcPeakEquity(macro, true), [macro])
  const bearYield = useMemo(() => calcBearCaseYield(macro, 350, 30), [macro])
  const years = macro.projectMonths / 12
  const baseIrr = calcIrrApprox(waterfall.lpMOIC, years)

  const stats = [
    {
      label: t.common.statsRibbonMoic ?? "LP MOIC",
      content: (
        <span className="gold-text-gradient font-mono text-sm font-bold">
          <AnimatedValue value={waterfall.lpMOIC} format="multiplier" />x
        </span>
      ),
    },
    {
      label: t.common.statsRibbonIrr ?? "IRR Range",
      content: (
        <span className="font-mono text-sm font-bold text-[#10B981]">
          <AnimatedValue value={baseIrr - 2} format="percent" decimals={0} />
          % – <AnimatedValue value={baseIrr + 2} format="percent" decimals={0} />%
        </span>
      ),
    },
    {
      label: t.common.statsRibbonCommitment ?? "LP Commitment",
      content: (
        <span className="font-mono text-sm font-bold text-[#ffffff]">
          €<AnimatedValue value={lpCommitment} format="currency" />
        </span>
      ),
    },
    {
      label: t.common.statsRibbonPeak ?? "Peak Equity",
      content: (
        <span className="font-mono text-sm font-bold text-[#C5A059]">
          €<AnimatedValue value={peakEquity} format="currency" />
        </span>
      ),
    },
    {
      label: t.common.statsRibbonBear ?? "Bear Floor",
      content: (
        <span className="font-mono text-sm font-bold text-[#10B981]">
          <AnimatedValue value={bearYield.lpDividendYield} format="percent" decimals={1} />%
        </span>
      ),
    },
  ]

  return (
    <div className="border-b border-[rgba(197,160,89,0.15)] bg-[rgba(2,6,23,0.8)] backdrop-blur-md">
      <div className="overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-6 px-4 lg:px-8 py-2.5 min-w-max lg:min-w-0 lg:justify-between">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 shrink-0">
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#a3a3a3] whitespace-nowrap">
                {s.label}
              </span>
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
