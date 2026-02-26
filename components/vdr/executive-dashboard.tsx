"use client"

import { useMemo } from "react"
import { Reveal } from "./reveal"
import { VideoExplainer } from "./video-explainer"
import { Explain } from "./elite-explainer"
import { AnimatedValue } from "./animated-value"
import type { MacroState } from "./macro-assumptions"
import type { Dictionary } from "@/lib/i18n/types"
import type { Locale } from "@/lib/i18n"
import {
  calcTotals,
  calcWaterfall,
  calcIrrApprox,
  calcPeakEquity,
  calcBearCaseYield,
  calcAllScenarios,
} from "@/lib/calculations"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Percent,
  DollarSign,
  Zap,
  Shield,
  Target,
  BarChart3,
  Users2,
  Building2,
  Crown,
} from "lucide-react"
import type { VDRAccount } from "@/lib/accounts"

interface ExecutiveDashboardProps {
  macro: MacroState
  t: Dictionary
  locale: Locale
  account: VDRAccount
}

export function ExecutiveDashboard({ macro, t, locale, account }: ExecutiveDashboardProps) {
  const { totalGDV, totalGDC, grossMarginPct, lpCommitment } = calcTotals(macro)
  const sv = t.syndicationView

  const waterfall = useMemo(() => calcWaterfall(totalGDV, macro), [totalGDV, macro])
  const peakEquity = useMemo(() => calcPeakEquity(macro, true), [macro])
  const bearYield = useMemo(() => calcBearCaseYield(macro, 350, 45), [macro])
  const years = macro.projectMonths / 12
  const baseIrr = calcIrrApprox(waterfall.lpMOIC, years)
  const { weighted } = useMemo(() => calcAllScenarios(macro), [macro])

  // Sort avatar cards: investor's own type always FIRST, highlighted in gold
  const sortedAvatarCards = useMemo(() => {
    const cards = [
      {
        type: "REPE" as const,
        name: sv.avatarRepeName,
        title: sv.avatarRepeTitle,
        desc: sv.avatarRepeDesc,
        Icon: TrendingUp,
        accentColor: "#C5A059",
        iconBg: "rgba(197,160,89,0.15)",
      },
      {
        type: "FamilyOffice" as const,
        name: sv.avatarFoName,
        title: sv.avatarFoTitle,
        desc: sv.avatarFoDesc,
        Icon: Building2,
        accentColor: "#10B981",
        iconBg: "rgba(16,185,129,0.12)",
      },
      {
        type: "UHNWI" as const,
        name: sv.avatarUhnwiName,
        title: sv.avatarUhnwiTitle,
        desc: sv.avatarUhnwiDesc,
        Icon: Crown,
        accentColor: "#C5A059",
        iconBg: "rgba(197,160,89,0.1)",
      },
    ]
    const idx = cards.findIndex((c) => c.type === account.avatarType)
    if (idx > 0) {
      const [matched] = cards.splice(idx, 1)
      cards.unshift(matched)
    }
    return cards
  }, [account.avatarType, sv])

  const alphaWedgeData = [
    { name: t.dashboard.alphaWedgeCostLabel, value: macro.gdcPerVilla, fill: "#C5A059" },
    { name: t.dashboard.alphaWedgeRetailLabel, value: macro.avgVillaGDV, fill: "#10B981" },
  ]

  const heroMetrics = useMemo(
    () => [
      {
        label: t.dashboard.irrLabel,
        numValue: baseIrr,
        displayValue: null as null,
        badge: t.dashboard.irrBadge,
        icon: TrendingUp,
        badgeColor: "#10B981",
        sublabel: t.dashboard.irrSublabel,
        termKey: "irr",
        format: "irr" as const,
      },
      {
        label: t.dashboard.moicLabel,
        numValue: waterfall.lpMOIC,
        displayValue: null as null,
        subtitle: t.dashboard.moicSubtitle,
        icon: Percent,
        termKey: "moic",
        format: "moic" as const,
      },
      {
        label: t.dashboard.lpLabel,
        numValue: lpCommitment,
        displayValue: null as null,
        icon: DollarSign,
        sublabel: `${t.dashboard.peakLabel}: €${totalGDC.toLocaleString()}`,
        termKey: "lp",
        format: "dollar" as const,
      },
      {
        label: t.dashboard.peakLabel,
        numValue: peakEquity,
        displayValue: null as null,
        highlight: t.dashboard.peakHighlight,
        icon: Zap,
        termKey: "peak-equity",
        format: "dollar" as const,
      },
      {
        label: t.dashboard.gdvLabel,
        numValue: totalGDV,
        displayValue: null as null,
        icon: Target,
        sublabel: `${macro.totalVillas} villas @ €${macro.avgVillaGDV.toLocaleString()}`,
        termKey: "gdv",
        format: "dollar" as const,
      },
      {
        label: t.dashboard.bearLabel,
        numValue: bearYield.lpDividendYield,
        displayValue: null as null,
        icon: Shield,
        sublabel: t.dashboard.bearSublabel,
        badgeColor: "#C5A059",
        badge: t.dashboard.bearBadge,
        termKey: "bear-case",
        format: "bearYield" as const,
      },
    ],
    [waterfall, peakEquity, bearYield, lpCommitment, totalGDV, totalGDC, macro, t, baseIrr]
  )

  return (
    <div>
      <VideoExplainer
        title={t.dashboard.videoTitle}
        subtitle={t.dashboard.videoSubtitle}
        locale={locale}
      />

      {/* ═══════════════════════════════════════════════════════
          INVESTOR PROFILE — PREMIUM CARD TREATMENT
          ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.05}>
        <div className="card-premium p-6 sm:p-8 mb-8 sm:mb-10 relative overflow-hidden group">
          {/* Subtle animated sheen */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.03)] to-transparent -translate-x-[200%] group-hover:animate-[shimmer_2s_infinite]" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Users2 className="w-4 h-4 text-[#C5A059]" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3] font-medium">
                {locale === "fr" ? "Profil Investisseur" : "Investor Profile Alignment"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {sortedAvatarCards.map((card) => {
                const isMatch = card.type === account.avatarType
                return isMatch ? (
                  /* ── YOUR PROFILE — Main Highlight ── */
                  <div
                    key={card.type}
                    className="relative overflow-hidden rounded-xl p-5 sm:p-6 transition-all duration-500"
                    style={{
                      background: "linear-gradient(145deg, rgba(197,160,89,0.08) 0%, rgba(0,0,0,0.4) 100%)",
                      border: "1px solid rgba(197,160,89,0.3)",
                      boxShadow: "0 10px 30px -5px rgba(197,160,89,0.15)",
                    }}
                  >
                    {/* Active Indicator Dot */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5A059] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
                      </span>
                      <span className="text-[8px] font-mono font-bold text-[#C5A059] tracking-[0.2em] uppercase">
                        {sv.yourProfileBadge}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                        style={{
                          background: card.iconBg,
                          border: "1px solid rgba(197,160,89,0.3)",
                        }}
                      >
                        <card.Icon className="w-6 h-6" style={{ color: card.accentColor }} />
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-1">
                          {card.name}
                        </p>
                        <h3 className="gold-text-gradient font-[var(--font-playfair)] text-lg sm:text-xl font-bold leading-tight">
                          {card.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-[#d0d0d0] leading-relaxed font-light">
                      {card.desc}
                    </p>
                  </div>
                ) : (
                  /* ── OTHER PROFILES — Dimmed ── */
                  <div
                    key={card.type}
                    className="glass-form rounded-xl p-5 sm:p-6 transition-all duration-300 hover:opacity-80 opacity-40 grayscale hover:grayscale-0"
                    style={{ border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <card.Icon className="w-5 h-5 text-[#a3a3a3]" />
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.15em] uppercase text-[#666]">
                          {card.name}
                        </p>
                        <h3 className="text-sm font-semibold text-[#a3a3a3] font-[var(--font-playfair)]">
                          {card.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#666] leading-relaxed">{card.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          HERO METRICS — CRYSTAL CARDS
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {heroMetrics.map((metric, i) => (
          <Reveal key={metric.label} delay={0.1 + 0.07 * i}>
            <div className="glass-form glass-card-hover p-5 sm:p-7 h-full flex flex-col justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <metric.icon className="w-4 h-4 text-[#C5A059] shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] font-medium leading-tight">
                    {metric.termKey ? (
                      <Explain k={metric.termKey}>{metric.label}</Explain>
                    ) : (
                      metric.label
                    )}
                  </span>
                </div>
                <div className="gold-text-gradient font-mono text-2xl sm:text-4xl font-bold leading-none tracking-tight mb-2">
                  {metric.format === "irr" ? (
                    <>
                      <AnimatedValue value={baseIrr - 2} format="percent" decimals={0} />
                      {"% – "}
                      <AnimatedValue value={baseIrr + 2} format="percent" decimals={0} />%
                    </>
                  ) : metric.format === "moic" ? (
                    <>
                      <AnimatedValue value={waterfall.lpMOIC} format="multiplier" />x
                    </>
                  ) : metric.format === "dollar" ? (
                    <>
                      €<AnimatedValue value={metric.numValue} format="currency" />
                    </>
                  ) : metric.format === "bearYield" ? (
                    <>
                      <AnimatedValue value={bearYield.lpDividendYield - 2} format="percent" decimals={0} />
                      {"% – "}
                      <AnimatedValue value={bearYield.lpDividendYield + 3} format="percent" decimals={0} />%
                    </>
                  ) : null}
                </div>
              </div>

              <div>
                {"subtitle" in metric && metric.subtitle && (
                  <p className="text-[#a3a3a3] text-[10px] sm:text-xs font-light">{metric.subtitle}</p>
                )}
                {"sublabel" in metric && metric.sublabel && (
                  <p className="text-[#a3a3a3] text-[10px] sm:text-xs font-light leading-snug">{metric.sublabel}</p>
                )}
                {"badge" in metric && metric.badge && (
                  <span
                    className="elite-badge mt-3 border-opacity-50"
                    style={{ borderColor: metric.badgeColor, color: metric.badgeColor }}
                  >
                    {metric.badge}
                  </span>
                )}
                {"highlight" in metric && metric.highlight && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse" />
                    <p className="text-[#10B981] text-[10px] sm:text-xs font-semibold tracking-wide uppercase">
                      {metric.highlight}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ── Probability-Weighted Expected Return ── */}
      <Reveal delay={0.5}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10 relative overflow-hidden">
          {/* Background Gradient Spot */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,_var(--gold),_transparent_70%)] opacity-10 pointer-events-none" />

          <div className="flex items-center gap-2 mb-6 relative z-10">
            <BarChart3 className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#a3a3a3] font-medium">
              {t.common.expectedReturn}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
            <div className="text-center p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.common.weightedMoic}
              </p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-5xl font-bold">
                <AnimatedValue value={weighted.moic} format="multiplier" />x
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.common.weightedIrr}
              </p>
              <p className="font-mono text-3xl sm:text-5xl font-bold text-[#10B981] drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <AnimatedValue value={weighted.irr} format="percent" decimals={0} />%
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.common.weightedProfit}
              </p>
              <p className="font-mono text-3xl sm:text-5xl font-bold text-[#ffffff]">
                €<AnimatedValue value={weighted.profit} format="currency" />
              </p>
            </div>
          </div>
          <p className="text-[10px] text-[#a3a3a3] text-center mt-6 opacity-60 font-light tracking-wide">
            {t.common.basedOnScenarios}
          </p>
        </div>
      </Reveal>

      {/* ── Alpha Wedge ── */}
      <Reveal delay={0.55}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3]">
              <Explain k="alpha-wedge">{t.dashboard.alphaWedgeLabel}</Explain>
            </span>
          </div>
          <h3 className="font-[var(--font-playfair)] text-xl sm:text-2xl text-[#ffffff] mb-3">
            {t.dashboard.alphaWedgeTitle}
          </h3>
          <p className="view-intro mb-8 text-sm text-[#a3a3a3] font-light max-w-2xl">
            {t.dashboard.alphaWedgeIntro
              .split("{gdcPerVilla}")
              .join(`€${macro.gdcPerVilla.toLocaleString()}`)
              .split("{avgVillaGDV}")
              .join(`€${macro.avgVillaGDV.toLocaleString()}`)
              .split("{grossMargin}")
              .join(`${grossMarginPct}`)}
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-2/3 h-48 sm:h-64 lg:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alphaWedgeData}
                  layout="vertical"
                  margin={{ left: 0, right: 36, top: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    stroke="#a3a3a3"
                    tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)", fill: "#666" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#a3a3a3"
                    tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={130}
                  />
                  <Tooltip
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      background: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "#fff",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 12,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    barSize={48}
                    animationDuration={1000}
                    animationEasing="cubic-bezier(0.16, 1, 0.3, 1)"
                  >
                    {alphaWedgeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 text-center lg:text-left w-full lg:pl-8 lg:border-l border-[rgba(255,255,255,0.06)]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.dashboard.alphaWedgeArbitrageLabel}
              </p>
              <p className="gold-text-gradient font-mono text-5xl sm:text-6xl font-bold mb-4">
                <AnimatedValue value={grossMarginPct} format="integer" />%
              </p>
              <p className="text-[#a3a3a3] text-xs leading-relaxed max-w-xs mx-auto lg:mx-0 font-light">
                {t.dashboard.alphaWedgeExplainer}
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Explain k="vefa" className="text-xs text-[#C5A059] hover:text-[#fff] transition-colors flex items-center justify-center lg:justify-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                  How VEFA pre-sales recycle capital
                </Explain>
                <Explain k="spv" className="text-xs text-[#C5A059] hover:text-[#fff] transition-colors flex items-center justify-center lg:justify-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                  SPV ring-fence & liability structure
                </Explain>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Unlevered vs Levered Comparison ── */}
      <Reveal delay={0.6}>
        <div className="glass-form p-6 sm:p-8 mb-8 sm:mb-10">
          <h3 className="font-[var(--font-playfair)] text-xl text-[#ffffff] mb-3">
            {t.dashboard.comparisonTitle}
          </h3>
          <p className="text-xs text-[#a3a3a3] mb-8 leading-relaxed max-w-3xl">
            {t.dashboard.comparisonSubtitle}{" "}
            <Explain k="unlevered" className="text-[#C5A059] hover:underline">What "unlevered" means for your downside</Explain>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Conventional */}
            <div className="glass-form p-6 border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.03)]">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_10px_#EF4444]" />
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#EF4444] font-bold">
                  {t.dashboard.conventionalLabel}
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: t.dashboard.convBankDebt, value: t.dashboard.convBankDebtVal },
                  { label: t.dashboard.convInterest, value: t.dashboard.convInterestVal },
                  { label: t.dashboard.convCovenant, value: t.dashboard.convCovenantVal },
                  { label: t.dashboard.convBearCase, value: t.dashboard.convBearCaseVal },
                  { label: t.dashboard.convControl, value: t.dashboard.convControlVal },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(239,68,68,0.1)] last:border-0"
                  >
                    <span className="text-[11px] text-[#a3a3a3]">{row.label}</span>
                    <span className="font-mono text-[11px] font-semibold text-[#EF4444] text-right shrink-0">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambassadeur */}
            <div className="glass-form p-6 border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.03)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981] opacity-5 blur-[50px] pointer-events-none" />

              <div className="flex items-center gap-3 mb-5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981]" />
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#10B981] font-bold">
                  {t.dashboard.ambassadeurLabel}
                </span>
              </div>
              <div className="space-y-3 relative z-10">
                {[
                  { label: t.dashboard.ambBankDebt, value: t.dashboard.ambBankDebtVal },
                  { label: t.dashboard.ambInterest, value: t.dashboard.ambInterestVal },
                  { label: t.dashboard.ambCovenant, value: t.dashboard.ambCovenantVal },
                  { label: t.dashboard.ambBearCase, value: t.dashboard.ambBearCaseVal },
                  { label: t.dashboard.ambControl, value: t.dashboard.ambControlVal },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(16,185,129,0.15)] last:border-0"
                  >
                    <span className="text-[11px] text-[#e0e0e0]">{row.label}</span>
                    <span className="font-mono text-[11px] font-semibold text-[#10B981] text-right shrink-0 shadow-none">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059] font-medium opacity-80">
              {t.dashboard.comparisonTagline}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Investment Thesis ── */}
      <Reveal delay={0.7}>
        <div className="glass-form p-6 sm:p-8 border-l-4 border-[#C5A059]">
          <h3 className="font-[var(--font-playfair)] text-xl sm:text-2xl text-[#ffffff] mb-4">
            {t.dashboard.thesisTitle}
          </h3>
          <p className="view-intro text-sm sm:text-base leading-relaxed text-[#d4d4d4]">
            {t.dashboard.thesisParagraph}
          </p>
        </div>
      </Reveal>
    </div>
  )
}
