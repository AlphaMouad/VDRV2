"use client"

import { useState, useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import { Shield, Building2, TrendingUp, Lock } from "lucide-react"
import { Explain } from "./elite-explainer"

/**
 * The Fortress Strategy (Source Doc):
 * - If 0% VEFA sales: pivot to Luxury Short-Term Rental
 * - 600k - 3M MAD annually (source says this range)
 * - Demonstrates 7% - 12% annual dividend yield in foreign currency
 * - "Too safe to ignore" mathematical proof
 */

interface FortressProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
}

export function Fortress({ macro, t, locale }: FortressProps) {
  const fv = t.fortressView

  const [isBearCase, setIsBearCase] = useState(false)
  // Research-backed Marrakech luxury Palmeraie defaults:
  // ADR €350–500/night; sustainable annual occupancy 60–70% for luxury STR
  const [adr, setAdr] = useState(400)
  const [occupancy, setOccupancy] = useState(65)

  const totalGDC = macro.totalVillas * macro.gdcPerVilla
  const totalGDV = macro.totalVillas * macro.avgVillaGDV

  const hospitality = useMemo(() => {
    const assetBasis = totalGDC
    const grossRev = adr * 365 * (occupancy / 100) * macro.totalVillas
    const opexRatio = macro.opexRatio / 100
    const noi = grossRev * (1 - opexRatio)
    const yieldPct = (noi / assetBasis) * 100

    // Annual Ijarah dividend per LP unit (90%)
    const lpAnnualDividend = noi * 0.9
    const lpDividendYield = (lpAnnualDividend / (assetBasis * 0.9)) * 100

    // Revenue in MAD for source reference (600k - 3M MAD range)
    const grossRevMAD = grossRev * macro.fxUsdMad

    return {
      grossRev,
      noi,
      yieldPct,
      lpAnnualDividend,
      lpDividendYield,
      assetBasis,
      grossRevMAD,
      opexRatio,
    }
  }, [adr, occupancy, macro, totalGDC])

  // 5-year projection for bear case
  const projectionData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const year = i + 1
      // Assume 3% annual ADR growth and 2% occupancy improvement (capped at 70%)
      const projAdr = adr * Math.pow(1.03, year)
      const projOcc = Math.min(occupancy + year * 2, 70)
      const grossRev = projAdr * 365 * (projOcc / 100) * macro.totalVillas
      const noi = grossRev * (1 - macro.opexRatio / 100)
      const yieldPct = (noi / totalGDC) * 100
      return {
        year: `Y${year}`,
        noi: Math.round(noi),
        yield: Number(yieldPct.toFixed(1)),
      }
    })
  }, [adr, occupancy, macro, totalGDC])

  const yieldBreakdownData = [
    { name: fv.grossRevenue, value: hospitality.grossRev, fill: "#C5A059" },
    { name: `${fv.opexLabel} (${macro.opexRatio}%)`, value: hospitality.grossRev * hospitality.opexRatio, fill: "#EF4444" },
    { name: fv.noiLabel, value: hospitality.noi, fill: "#10B981" },
  ]

  return (
    <div>
      <VideoExplainer
        title={fv.videoTitle}
        subtitle={fv.videoSubtitle}
        locale={locale}
      />

      {/* Zero Debt Badge */}
      <Reveal delay={0.05}>
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 rounded-full border border-[#C5A059] text-[#C5A059] bg-[rgba(197,160,89,0.05)] shadow-[0_0_15px_rgba(197,160,89,0.15)]">
            <Lock className="w-3 h-3" />
            {fv.zeroDebtBadge}
          </span>
        </div>
      </Reveal>

      {/* Case Toggle */}
      <Reveal delay={0.1}>
        <div className="glass-form p-2 mb-8 mx-auto max-w-2xl rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBearCase(false)}
              className={`flex-1 py-3 rounded-lg text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                !isBearCase
                  ? "bg-[rgba(197,160,89,0.15)] text-[#C5A059] border border-[#C5A059] shadow-[0_0_10px_rgba(197,160,89,0.2)]"
                  : "text-[#a3a3a3] border border-transparent hover:text-[#ffffff] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              {fv.baseCaseBtn}
            </button>
            <button
              onClick={() => setIsBearCase(true)}
              className={`flex-1 py-3 rounded-lg text-center text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                isBearCase
                  ? "bg-[rgba(239,68,68,0.15)] text-[#EF4444] border border-[#EF4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                  : "text-[#a3a3a3] border border-transparent hover:text-[#ffffff] hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              {fv.bearCaseBtn}
            </button>
          </div>
        </div>
      </Reveal>

      {!isBearCase ? (
        /* Base Case */
        <Reveal delay={0.2}>
          <div className="glass-form p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3] font-medium">
                {fv.baseCaseLabel}
              </span>
            </div>
            <h3 className="font-[var(--font-playfair)] text-2xl text-[#ffffff] mb-8">
              {fv.baseCaseTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-form p-6 border border-[rgba(197,160,89,0.1)] bg-[rgba(197,160,89,0.03)]">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                  {fv.gdvLabel}
                </p>
                <p className="gold-text-gradient font-mono text-3xl font-bold">
                  €{totalGDV.toLocaleString()}
                </p>
              </div>
              <div className="glass-form p-6 border border-[rgba(255,255,255,0.06)]">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                  {fv.gdcLabel}
                </p>
                <p className="font-mono text-3xl text-[#ffffff] font-bold">
                  €{totalGDC.toLocaleString()}
                </p>
              </div>
              <div className="glass-form p-6 border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.03)]">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                  {fv.grossProfitLabel}
                </p>
                <p className="text-[#10B981] font-mono text-3xl font-bold drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  €{(totalGDV - totalGDC).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-4xl mx-auto text-center font-light">
              {fv.baseCaseDesc
                .replace('{totalVillas}', String(macro.totalVillas))
                .replace('{avgVillaGDV}', `€${macro.avgVillaGDV.toLocaleString()}`)
                .replace('{totalGDV}', `€${totalGDV.toLocaleString()}`)
                .replace('{totalGDC}', `€${totalGDC.toLocaleString()}`)}
            </p>
          </div>
        </Reveal>
      ) : (
        /* Bear Case - Hospitality P&L */
        <>
          <Reveal delay={0.2}>
            <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#EF4444]" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3] font-medium">
                  {fv.bearCaseLabel}
                </span>
              </div>
              <p className="text-xs text-[#a3a3a3] mb-8 leading-relaxed max-w-3xl font-light">
                {fv.bearCaseDesc.replace('{totalVillas}', String(macro.totalVillas))}
              </p>

              {/* Asset Basis */}
              <div className="glass-form p-5 mb-8 flex items-center justify-between border border-[rgba(255,255,255,0.06)]">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
                    {fv.debtFreeAssetBasis}
                  </p>
                  <p className="text-xs text-[#a3a3a3] mt-1 opacity-70">
                    {fv.debtFreeAssetBasisSub.replace('{totalVillas}', String(macro.totalVillas))}
                  </p>
                </div>
                <p className="gold-text-gradient font-mono text-3xl font-bold">
                  €{totalGDC.toLocaleString()}
                </p>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
                      <Explain k="adr">{fv.adrLabel}</Explain>
                    </p>
                    <p className="font-mono text-sm text-[#C5A059] font-bold">
                      €{adr}
                    </p>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={1000}
                    step={10}
                    value={adr}
                    onChange={(e) => setAdr(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-[#a3a3a3] font-mono mt-2">
                    <span>€150</span>
                    <span>€1,000</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium">
                      <Explain k="occupancy-rate">{fv.occupancyLabel}</Explain>
                    </p>
                    <p className="font-mono text-sm text-[#C5A059] font-bold">
                      {occupancy}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    step={1}
                    value={occupancy}
                    onChange={(e) => setOccupancy(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-[#a3a3a3] font-mono mt-2">
                    <span>10%</span>
                    <span>80%</span>
                  </div>
                </div>
              </div>

              {/* Yield Result */}
              <div className="glass-form p-8 text-center mb-8 border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.02)]">
                <p className="text-[9px] tracking-[0.25em] uppercase text-[#a3a3a3] mb-4 font-medium">
                  <Explain k="ijarah">{fv.annualCashDividend}</Explain>
                </p>
                <p className={`font-mono text-6xl font-bold mb-4 drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] ${hospitality.yieldPct >= 7 ? "text-[#10B981]" : "text-[#C5A059]"}`}>
                  {hospitality.yieldPct.toFixed(2)}%
                </p>
                <p className="text-[#a3a3a3] text-sm font-light mb-2">
                  {fv.perpetualYield.replace('{lpYield}', hospitality.lpDividendYield.toFixed(2))}
                </p>
                <p className="text-[10px] text-[#a3a3a3] font-mono opacity-60">
                  {fv.grossRevenue}: {Math.round(hospitality.grossRevMAD).toLocaleString()} MAD/year
                </p>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-form p-5 border border-[rgba(255,255,255,0.06)]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                    {fv.grossAnnualRevenue}
                  </p>
                  <p className="font-mono text-lg text-[#ffffff] font-bold">
                    €{Math.round(hospitality.grossRev).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-5 border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                    {fv.opexLabel} ({macro.opexRatio}%)
                  </p>
                  <p className="font-mono text-lg text-[#EF4444] font-bold">
                    -€{Math.round(hospitality.grossRev * hospitality.opexRatio).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-5 border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.02)]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                    <Explain k="noi">{fv.noiLabel}</Explain>
                  </p>
                  <p className="font-mono text-lg text-[#10B981] font-bold">
                    €{Math.round(hospitality.noi).toLocaleString()}
                  </p>
                </div>
                <div className="glass-form p-5 border border-[rgba(197,160,89,0.15)] bg-[rgba(197,160,89,0.02)]">
                  <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 font-medium">
                    {fv.lpAnnualDividend}
                  </p>
                  <p className="font-mono text-lg text-[#C5A059] font-bold">
                    €{Math.round(hospitality.lpAnnualDividend).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Revenue Breakdown Chart */}
          <Reveal delay={0.3}>
            <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
              <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-6">
                {fv.revenueBreakdown}
              </h3>
              <div className="h-56 sm:h-64 md:h-72 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yieldBreakdownData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 10, fontFamily: "var(--font-inter)" }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    />
                    <YAxis
                      stroke="#a3a3a3"
                      tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
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
                      formatter={(value: number) => [`€${Math.round(value).toLocaleString()}`]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      barSize={60}
                      animationDuration={1000}
                      animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                    >
                      {yieldBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          {/* 10-Year Projection */}
          <Reveal delay={0.4}>
            <div className="glass-form p-6 sm:p-8">
              <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-2">
                {fv.projectionTitle}
              </h3>
              <p className="text-[10px] text-[#a3a3a3] mb-4 flex flex-wrap gap-2">
                <Explain k="palmeraie" className="px-2 py-1 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[#C5A059] transition-colors">
                  Why Palmeraie luxury assets hold value →
                </Explain>
                <Explain k="occupancy-rate" className="px-2 py-1 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[#C5A059] transition-colors">
                  Occupancy rate benchmarks →
                </Explain>
              </p>
              <p className="text-xs text-[#a3a3a3] mb-8 leading-relaxed max-w-3xl font-light">
                {fv.projectionDesc}
              </p>
              <div className="h-64 sm:h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 10, fontFamily: "var(--font-inter)" }}
                      tickLine={false}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    />
                    <YAxis
                      yAxisId="noi"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                      tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                      tickLine={false}
                      orientation="left"
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="yield"
                      stroke="#a3a3a3"
                      tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                      tickFormatter={(v) => `${v}%`}
                      tickLine={false}
                      orientation="right"
                      axisLine={false}
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
                      formatter={(value: number, name: string) => {
                        if (name === "noi") return [`€${value.toLocaleString()}`, fv.noiLegend]
                        return [`${value}%`, fv.yieldLegend]
                      }}
                    />
                    <Line
                      yAxisId="noi"
                      type="monotone"
                      dataKey="noi"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1000}
                      animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                    />
                    <Line
                      yAxisId="yield"
                      type="monotone"
                      dataKey="yield"
                      stroke="#C5A059"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#C5A059", strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1000}
                      animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-8 mt-6 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wide">{fv.noiLegend}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C5A059]" />
                  <span className="text-[10px] text-[#a3a3a3] uppercase tracking-wide">{fv.yieldLegend}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </>
      )}
    </div>
  )
}
