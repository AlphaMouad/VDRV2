"use client"

import { useState, useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import type { MacroState } from "./macro-assumptions"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts"
import { Sparkles, AlertTriangle, ShieldCheck } from "lucide-react"
import { Explain } from "./elite-explainer"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"

/**
 * Sharia-Compliant Waterfall — Source-Accurate Tiers:
 *
 *  Tier 0 (LOSS): 90% LP / 10% GP loss allocation
 *  Tier 1 (RoC):  100% pari passu — 90% LP / 10% GP until all drawn capital recovered
 *  Tier 2 (Alignment): 80% LP / 20% GP until LP achieves 1.25x MOIC
 *  Tier 3 (GP Promote): 60% LP / 40% GP on all remaining profits
 */

function calculateWaterfall(gdv: number, macro: MacroState) {
  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalCommitment = totalGDC

  // TPI tax on capital gain
  const capitalGain = Math.max(0, gdv - totalGDC)
  const tpiTax = capitalGain * (macro.tpiRate / 100)

  const netProceeds = gdv - tpiTax
  const distributableCash = netProceeds - 0 // no debt service

  const lpCommitment = totalCommitment * 0.90
  const gpCommitment = totalCommitment * 0.10

  // Check for loss
  const isLoss = distributableCash < totalCommitment

  if (isLoss) {
    // Tier 0: Loss provision — 90/10
    const lossLP = distributableCash * 0.90
    const lossGP = distributableCash * 0.10
    return {
      isLoss: true,
      tpiTax,
      netProceeds,
      distributableCash,
      tier0LP: lossLP,
      tier0GP: lossGP,
      tier1LP: 0, tier1GP: 0,
      tier2LP: 0, tier2GP: 0,
      tier3LP: 0, tier3GP: 0,
      totalLP: lossLP,
      totalGP: lossGP,
      lpMOIC: lossLP / lpCommitment,
      gpMOIC: lossGP / gpCommitment,
    }
  }

  // Tier 1: Return of Capital — 90% LP / 10% GP pari passu
  const tier1LP = lpCommitment
  const tier1GP = gpCommitment
  let remaining = distributableCash - totalCommitment

  // Tier 2: Alignment Phase (80/20) until LP reaches 1.25x MOIC
  const lpTarget125 = lpCommitment * 1.25
  const lpNeededFor125 = lpTarget125 - tier1LP
  let tier2LP = 0
  let tier2GP = 0

  if (remaining > 0 && lpNeededFor125 > 0) {
    // For every $0.80 to LP, $0.20 to GP -- so total consumed = LP / 0.8
    const maxTier2LP = Math.min(remaining * 0.8, lpNeededFor125)
    tier2LP = maxTier2LP
    tier2GP = (tier2LP / 0.8) * 0.2
    remaining -= (tier2LP + tier2GP)
    if (remaining < 0) remaining = 0
  }

  // Tier 3: GP Promote — 60/40
  const tier3LP = remaining * 0.6
  const tier3GP = remaining * 0.4

  const totalLP = tier1LP + tier2LP + tier3LP
  const totalGP = tier1GP + tier2GP + tier3GP

  return {
    isLoss: false,
    tpiTax,
    netProceeds,
    distributableCash,
    tier0LP: 0, tier0GP: 0,
    tier1LP, tier1GP,
    tier2LP, tier2GP,
    tier3LP, tier3GP,
    totalLP,
    totalGP,
    lpMOIC: totalLP / lpCommitment,
    gpMOIC: totalGP / gpCommitment,
  }
}

interface MoicWaterfallProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

export function MoicWaterfall({ macro, t, locale }: MoicWaterfallProps) {
  const totalGDV = macro.totalVillas * macro.avgVillaGDV
  const [gdv, setGdv] = useState(totalGDV)
  const result = useMemo(() => calculateWaterfall(gdv, macro), [gdv, macro])

  const w = t.waterfall
  const chartData = result.isLoss
    ? [
        { name: `${w.tier0Label}: ${w.tier0Title} (90/10)`, lp: result.tier0LP, gp: result.tier0GP },
      ]
    : [
        { name: `${w.tier1Label}: ${w.returnOfCapital} (90/10)`, lp: result.tier1LP, gp: result.tier1GP },
        { name: `${w.tier2Label}: ${w.alignmentPhase} (80/20)`, lp: result.tier2LP, gp: result.tier2GP },
        { name: `${w.tier3Label}: ${w.gpPromote} (60/40)`, lp: result.tier3LP, gp: result.tier3GP },
      ]

  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const lpCommitment = totalGDC * 0.9

  return (
    <div>
      <VideoExplainer
        title={w.videoTitle}
        subtitle={w.videoSubtitle}
        locale={locale}
      />

      {/* Halal Badge */}
      <Reveal delay={0.1}>
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 rounded-full border border-[#10B981] text-[#10B981] bg-[rgba(16,185,129,0.05)] shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-[rgba(16,185,129,0.1)] transition-colors cursor-default">
            <Sparkles className="w-3 h-3" />
            <Explain k="musharakah">{w.halalBadge}</Explain>
          </span>
        </div>
      </Reveal>

      {/* Tier Explanation Cards */}
      <Reveal delay={0.15}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-10">
          <div className="glass-form p-5 border-l-4 border-[#EF4444] bg-[rgba(239,68,68,0.02)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#EF4444] font-bold">{w.tier0Label}</span>
            </div>
            <p className="text-[11px] text-[#ffffff] font-semibold mb-1 uppercase tracking-wide">{w.tier0Title}</p>
            <p className="text-[10px] text-[#a3a3a3] leading-relaxed">{w.tier0Desc}</p>
          </div>
          <div className="glass-form p-5 border-l-4 border-[#C5A059] bg-[rgba(197,160,89,0.02)]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3 h-3 text-[#C5A059]" />
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#C5A059] font-bold">{w.tier1Label}</span>
            </div>
            <p className="text-[11px] text-[#ffffff] font-semibold mb-1 uppercase tracking-wide">{w.tier1Title}</p>
            <p className="text-[10px] text-[#a3a3a3] leading-relaxed">{w.tier1Desc}</p>
          </div>
          <div className="glass-form p-5 border-l-4 border-[#10B981] bg-[rgba(16,185,129,0.02)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#10B981] font-bold">{w.tier2Label}</span>
            </div>
            <p className="text-[11px] text-[#ffffff] font-semibold mb-1 uppercase tracking-wide">{w.tier2Title}</p>
            <p className="text-[10px] text-[#a3a3a3] leading-relaxed">{w.tier2Desc}</p>
          </div>
          <div className="glass-form p-5 border-l-4 border-[#DFBD69] bg-[rgba(223,189,105,0.02)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#DFBD69] font-bold">{w.tier3Label}</span>
            </div>
            <p className="text-[11px] text-[#ffffff] font-semibold mb-1 uppercase tracking-wide">
              <Explain k="gp-promote">{w.tier3Title}</Explain>
            </p>
            <p className="text-[10px] text-[#a3a3a3] leading-relaxed">{w.tier3Desc}</p>
          </div>
        </div>
      </Reveal>

      {/* GDV Slider */}
      <Reveal delay={0.2}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">
                {w.gdvSliderLabel}
              </p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-4xl font-bold">
                €{gdv.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">
                {w.lpMoicLabel}
              </p>
              <p className={`font-mono text-3xl sm:text-4xl font-bold ${result.isLoss ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                {result.lpMOIC.toFixed(2)}x
              </p>
            </div>
          </div>
          <input
            type="range"
            min={totalGDC * 0.5}
            max={totalGDV * 1.5}
            step={100000}
            value={gdv}
            onChange={(e) => setGdv(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-[#a3a3a3] font-mono mt-2">
            <span>€{(totalGDC * 0.5).toLocaleString()}</span>
            <span>€{(totalGDV * 1.5).toLocaleString()}</span>
          </div>

          {/* TPI Tax Badge */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="glass-form px-4 py-3 border border-[rgba(255,255,255,0.06)]">
              <span className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] block mb-1">
                <Explain k="tpi">{w.tpiTaxLabel}</Explain> ({macro.tpiRate}%)
              </span>
              <p className="font-mono text-lg text-[#EF4444] font-bold">
                -€{Math.round(result.tpiTax).toLocaleString()}
              </p>
            </div>
            <div className="glass-form px-4 py-3 border border-[rgba(255,255,255,0.06)]">
              <span className="text-[9px] tracking-[0.15em] uppercase text-[#a3a3a3] block mb-1">{w.netProceedsLabel}</span>
              <p className="font-mono text-lg text-[#ffffff] font-bold">
                €{Math.round(result.netProceeds).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Loss Warning */}
      {result.isLoss && (
        <Reveal delay={0.25}>
          <div className="glass-form p-5 mb-8 border border-[#EF4444] flex items-center gap-4 bg-[rgba(239,68,68,0.05)]">
            <AlertTriangle className="w-6 h-6 text-[#EF4444] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#EF4444] uppercase tracking-wide mb-1">{w.lossScenarioTitle}</p>
              <p className="text-xs text-[#a3a3a3]">{w.lossScenarioDesc}</p>
            </div>
          </div>
        </Reveal>
      )}

      {/* Chart */}
      <Reveal delay={0.3}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-6">
            {w.chartTitle}
          </h3>
          <div className="h-64 sm:h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <XAxis
                  dataKey="name"
                  stroke="#666"
                  tick={{ fontSize: 9, fontFamily: "var(--font-inter)", fill: "#666" }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                />
                <YAxis
                  stroke="#666"
                  tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)", fill: "#666" }}
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `€${(v / 1000000).toFixed(1)}M`
                      : `€${(v / 1000).toFixed(0)}k`
                  }
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(8,8,8,0.95)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#fff",
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 11,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                  formatter={(value: number, name: string) => [
                    `€${Math.round(value).toLocaleString()}`,
                    name === "lp" ? w.lpShareLabel : w.gpShareLabel,
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px", fontSize: 11, color: "#a3a3a3", fontFamily: "var(--font-inter)" }}
                  formatter={(value) =>
                    value === "lp" ? w.lpShareLabel : w.gpShareLabel
                  }
                />
                <Bar
                  dataKey="lp"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  barSize={60}
                  animationDuration={1000}
                  animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`lp-${index}`} fill="#C5A059" stroke="#C5A059" strokeWidth={1} fillOpacity={0.9} />
                  ))}
                </Bar>
                <Bar
                  dataKey="gp"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  barSize={60}
                  animationDuration={1000}
                  animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`gp-${index}`} fill="rgba(197,160,89,0.2)" stroke="#C5A059" strokeWidth={1} strokeDasharray="4 4" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Reveal>

      {/* Summary Table */}
      <Reveal delay={0.4}>
        <div className="glass-form p-6 sm:p-8">
          <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-6">
            {w.summaryTitle}
          </h3>
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full min-w-[500px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] py-4 px-4 font-medium">{w.thTier}</th>
                  <th className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] py-4 px-4 font-medium">{w.thSplit}</th>
                  <th className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] py-4 px-4 text-right font-medium">
                    <Explain k="lp">{w.thLpCash}</Explain>
                  </th>
                  <th className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] py-4 px-4 text-right font-medium">
                    <Explain k="gp">{w.thGpCash}</Explain>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.isLoss ? (
                  <tr className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(239,68,68,0.02)]">
                    <td className="text-sm text-[#EF4444] py-4 px-4 font-medium">{w.lossProvision}</td>
                    <td className="text-sm text-[#a3a3a3] py-4 px-4 font-mono">90/10</td>
                    <td className="font-mono text-sm text-[#EF4444] py-4 px-4 text-right font-medium">
                      €{Math.round(result.tier0LP).toLocaleString()}
                    </td>
                    <td className="font-mono text-sm text-[#a3a3a3] py-4 px-4 text-right font-medium">
                      €{Math.round(result.tier0GP).toLocaleString()}
                    </td>
                  </tr>
                ) : (
                  <>
                    <tr className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="text-sm text-[#ffffff] py-4 px-4 font-medium">{w.returnOfCapital}</td>
                      <td className="text-sm text-[#a3a3a3] py-4 px-4 font-mono">90/10</td>
                      <td className="font-mono text-sm text-[#10B981] py-4 px-4 text-right font-medium">
                        €{Math.round(result.tier1LP).toLocaleString()}
                      </td>
                      <td className="font-mono text-sm text-[#a3a3a3] py-4 px-4 text-right font-medium">
                        €{Math.round(result.tier1GP).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="text-sm text-[#ffffff] py-4 px-4 font-medium">{w.alignmentPhase}</td>
                      <td className="text-sm text-[#a3a3a3] py-4 px-4 font-mono">80/20</td>
                      <td className="font-mono text-sm text-[#10B981] py-4 px-4 text-right font-medium">
                        €{Math.round(result.tier2LP).toLocaleString()}
                      </td>
                      <td className="font-mono text-sm text-[#a3a3a3] py-4 px-4 text-right font-medium">
                        €{Math.round(result.tier2GP).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="text-sm text-[#ffffff] py-4 px-4 font-medium">{w.gpPromote}</td>
                      <td className="text-sm text-[#a3a3a3] py-4 px-4 font-mono">60/40</td>
                      <td className="font-mono text-sm text-[#10B981] py-4 px-4 text-right font-medium">
                        €{Math.round(result.tier3LP).toLocaleString()}
                      </td>
                      <td className="font-mono text-sm text-[#a3a3a3] py-4 px-4 text-right font-medium">
                        €{Math.round(result.tier3GP).toLocaleString()}
                      </td>
                    </tr>
                  </>
                )}
                <tr className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(197,160,89,0.02)]">
                  <td className="text-sm font-bold text-[#C5A059] py-4 px-4 uppercase tracking-wider text-[11px]" colSpan={2}>{w.total}</td>
                  <td className="font-mono text-sm font-bold text-[#10B981] py-4 px-4 text-right">
                    €{Math.round(result.totalLP).toLocaleString()}
                  </td>
                  <td className="font-mono text-sm font-bold text-[#C5A059] py-4 px-4 text-right">
                    €{Math.round(result.totalGP).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-form px-5 py-4 border-l-2 border-[rgba(255,255,255,0.1)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">{w.lpMoic}</p>
              <p className={`font-mono text-2xl font-bold ${result.isLoss ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                {result.lpMOIC.toFixed(2)}x
              </p>
            </div>
            <div className="glass-form px-5 py-4 border-l-2 border-[rgba(255,255,255,0.1)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">{w.gpMoic}</p>
              <p className="gold-text-gradient font-mono text-2xl font-bold">
                {result.gpMOIC.toFixed(2)}x
              </p>
            </div>
            <div className="glass-form px-5 py-4 border-l-2 border-[rgba(255,255,255,0.1)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">{w.lpCommitment}</p>
              <p className="font-mono text-2xl font-bold text-[#ffffff]">
                €{Math.round(lpCommitment).toLocaleString()}
              </p>
            </div>
            <div className="glass-form px-5 py-4 border-l-2 border-[rgba(255,255,255,0.1)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">{w.netLpProfit}</p>
              <p className="font-mono text-2xl font-bold text-[#10B981]">
                €{Math.round(Math.max(0, result.totalLP - lpCommitment)).toLocaleString()}
              </p>
            </div>
          </div>

          {/* The Pitch */}
          <div className="mt-8 glass-form p-6 border-l-4 border-[#C5A059] bg-[rgba(197,160,89,0.03)]">
            <p className="text-sm italic text-[#a3a3a3] leading-relaxed">
              {w.pitchQuote}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
