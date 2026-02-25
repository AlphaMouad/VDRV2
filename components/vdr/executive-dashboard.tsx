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
          INVESTOR PROFILE — ALWAYS FIRST, PROMINENTLY HIGHLIGHTED
          ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.05}>
        <div
          className="p-5 sm:p-6 mb-6 sm:mb-8 rounded-xl"
          style={{
            border: "1px solid rgba(197,160,89,0.22)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Users2 className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3]">
              {locale === "fr" ? "Profil Investisseur" : "Investor Profile Alignment"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {sortedAvatarCards.map((card) => {
              const isMatch = card.type === account.avatarType
              return isMatch ? (
                /* ── YOUR PROFILE — gold glow treatment ── */
                <div
                  key={card.type}
                  className="relative overflow-hidden rounded-xl p-4 sm:p-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(197,160,89,0.11) 0%, rgba(8,8,8,0.97) 100%)",
                    border: "2px solid rgba(197,160,89,0.62)",
                    boxShadow:
                      "0 0 42px rgba(197,160,89,0.17), 0 0 0 1px rgba(197,160,89,0.08) inset",
                  }}
                >
                  {/* Gold shimmer top edge */}
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(197,160,89,0.75) 50%, transparent 100%)",
                    }}
                  />

                  {/* YOUR PROFILE badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 sm:mb-4 w-fit"
                    style={{
                      background: "rgba(197,160,89,0.16)",
                      border: "1px solid rgba(197,160,89,0.45)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
                    <span className="text-[8px] font-mono font-bold text-[#C5A059] tracking-[0.22em] uppercase">
                      {sv.yourProfileBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: card.iconBg,
                        border: "1px solid rgba(197,160,89,0.25)",
                      }}
                    >
                      <card.Icon className="w-5 h-5" style={{ color: card.accentColor }} />
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.18em] uppercase text-[#a3a3a3]">
                        {card.name}
                      </p>
                      <h3 className="gold-text-gradient font-[var(--font-playfair)] text-[15px] sm:text-base font-semibold leading-tight">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#c0c0c0] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ) : (
                /* ── OTHER PROFILES — dimmed ── */
                <div
                  key={card.type}
                  className="glass-form rounded-xl p-4 sm:p-5 transition-opacity duration-300 hover:opacity-90"
                  style={{
                    border: "1px solid rgba(255,255,255,0.05)",
                    opacity: 0.55,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: card.iconBg }}
                    >
                      <card.Icon className="w-4 h-4" style={{ color: card.accentColor }} />
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.18em] uppercase text-[#a3a3a3]">
                        {card.name}
                      </p>
                      <h3 className="text-sm font-semibold text-[#e0e0e0] font-[var(--font-playfair)]">
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#a3a3a3] leading-relaxed">{card.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          HERO METRICS — 2-col on mobile
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {heroMetrics.map((metric, i) => (
          <Reveal key={metric.label} delay={0.1 + 0.07 * i}>
            <div className="glass-form glass-card-hover p-4 sm:p-6 h-full">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <metric.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] shrink-0" />
                <span className="text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] uppercase text-[#a3a3a3] leading-tight">
                  {metric.termKey ? (
                    <Explain k={metric.termKey}>{metric.label}</Explain>
                  ) : (
                    metric.label
                  )}
                </span>
              </div>
              <p className="gold-text-gradient font-mono text-xl sm:text-3xl font-bold leading-none">
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
              </p>
              {"subtitle" in metric && metric.subtitle && (
                <p className="text-[#a3a3a3] text-[9px] sm:text-xs mt-1">{metric.subtitle}</p>
              )}
              {"sublabel" in metric && metric.sublabel && (
                <p className="text-[#a3a3a3] text-[9px] sm:text-xs mt-1 leading-snug">{metric.sublabel}</p>
              )}
              {"badge" in metric && metric.badge && (
                <span
                  className="elite-badge mt-2 sm:mt-3"
                  style={{ borderColor: metric.badgeColor, color: metric.badgeColor }}
                >
                  {metric.badge}
                </span>
              )}
              {"highlight" in metric && metric.highlight && (
                <p className="text-[#10B981] text-[9px] sm:text-xs mt-1.5 font-semibold tracking-wide">
                  {metric.highlight}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {/* ── Probability-Weighted Expected Return ── */}
      <Reveal delay={0.5}>
        <div className="glass-form p-5 sm:p-6 mb-6 sm:mb-8 border border-[rgba(197,160,89,0.2)]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3]">
              {t.common.expectedReturn}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.common.weightedMoic}
              </p>
              <p className="gold-text-gradient font-mono text-3xl sm:text-4xl font-bold">
                <AnimatedValue value={weighted.moic} format="multiplier" />x
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.common.weightedIrr}
              </p>
              <p className="font-mono text-3xl sm:text-4xl font-bold text-[#10B981]">
                <AnimatedValue value={weighted.irr} format="percent" decimals={0} />%
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.common.weightedProfit}
              </p>
              <p className="font-mono text-3xl sm:text-4xl font-bold text-[#ffffff]">
                €<AnimatedValue value={weighted.profit} format="currency" />
              </p>
            </div>
          </div>
          <p className="text-[10px] text-[#a3a3a3] text-center mt-4">
            {t.common.basedOnScenarios}
          </p>
        </div>
      </Reveal>

      {/* ── Alpha Wedge ── */}
      <Reveal delay={0.55}>
        <div className="glass-form p-5 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3]">
              <Explain k="alpha-wedge">{t.dashboard.alphaWedgeLabel}</Explain>
            </span>
          </div>
          <h3 className="font-[var(--font-playfair)] text-base sm:text-lg text-[#ffffff] mb-2">
            {t.dashboard.alphaWedgeTitle}
          </h3>
          <p className="view-intro mb-5 sm:mb-6">
            {t.dashboard.alphaWedgeIntro
              .split("{gdcPerVilla}")
              .join(`€${macro.gdcPerVilla.toLocaleString()}`)
              .split("{avgVillaGDV}")
              .join(`€${macro.avgVillaGDV.toLocaleString()}`)
              .split("{grossMargin}")
              .join(`${grossMarginPct}`)}
          </p>

          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full lg:w-2/3 h-44 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alphaWedgeData}
                  layout="vertical"
                  margin={{ left: 8, right: 36, top: 8, bottom: 8 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    stroke="#a3a3a3"
                    tick={{ fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#a3a3a3"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={115}
                  />
                  <Tooltip
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                    contentStyle={{
                      background: "rgba(10,10,10,0.9)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      color: "#fff",
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    barSize={36}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {alphaWedgeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 text-center lg:text-left w-full">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2">
                {t.dashboard.alphaWedgeArbitrageLabel}
              </p>
              <p className="gold-text-gradient font-mono text-4xl sm:text-5xl font-bold">
                <AnimatedValue value={grossMarginPct} format="integer" />%
              </p>
              <p className="text-[#a3a3a3] text-xs sm:text-sm mt-3 leading-relaxed max-w-xs mx-auto lg:mx-0">
                {t.dashboard.alphaWedgeExplainer}
              </p>
              <div className="mt-4 flex flex-col gap-1.5">
                <Explain k="vefa">How VEFA pre-sales recycle capital →</Explain>
                <Explain k="spv">SPV ring-fence & liability structure →</Explain>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Unlevered vs Levered Comparison ── */}
      <Reveal delay={0.6}>
        <div className="glass-form p-5 sm:p-6 mb-6 sm:mb-8">
          <h3 className="font-[var(--font-playfair)] text-base sm:text-lg text-[#ffffff] mb-2">
            {t.dashboard.comparisonTitle}
          </h3>
          <p className="text-xs text-[#a3a3a3] mb-5 leading-relaxed">
            {t.dashboard.comparisonSubtitle}{" "}
            <Explain k="unlevered">What "unlevered" means for your downside →</Explain>
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-5">
            {/* Conventional */}
            <div className="glass-form p-4 sm:p-5 border border-[rgba(239,68,68,0.2)]">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#EF4444] font-bold">
                  {t.dashboard.conventionalLabel}
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: t.dashboard.convBankDebt, value: t.dashboard.convBankDebtVal },
                  { label: t.dashboard.convInterest, value: t.dashboard.convInterestVal },
                  { label: t.dashboard.convCovenant, value: t.dashboard.convCovenantVal },
                  { label: t.dashboard.convBearCase, value: t.dashboard.convBearCaseVal },
                  { label: t.dashboard.convControl, value: t.dashboard.convControlVal },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-2 py-1.5 border-b border-[rgba(255,255,255,0.04)]"
                  >
                    <span className="text-[10px] text-[#a3a3a3] leading-tight">{row.label}</span>
                    <span className="font-mono text-[10px] font-semibold text-[#EF4444] text-right shrink-0">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ambassadeur */}
            <div className="glass-form p-4 sm:p-5 border border-[rgba(16,185,129,0.3)]">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#10B981] font-bold">
                  {t.dashboard.ambassadeurLabel}
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: t.dashboard.ambBankDebt, value: t.dashboard.ambBankDebtVal },
                  { label: t.dashboard.ambInterest, value: t.dashboard.ambInterestVal },
                  { label: t.dashboard.ambCovenant, value: t.dashboard.ambCovenantVal },
                  { label: t.dashboard.ambBearCase, value: t.dashboard.ambBearCaseVal },
                  { label: t.dashboard.ambControl, value: t.dashboard.ambControlVal },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-2 py-1.5 border-b border-[rgba(255,255,255,0.04)]"
                  >
                    <span className="text-[10px] text-[#a3a3a3] leading-tight">{row.label}</span>
                    <span className="font-mono text-[10px] font-semibold text-[#10B981] text-right shrink-0">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#C5A059]">
              {t.dashboard.comparisonTagline}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ── Investment Thesis ── */}
      <Reveal delay={0.7}>
        <div className="glass-form p-5 sm:p-6 border-l-2 border-[#C5A059]">
          <h3 className="font-[var(--font-playfair)] text-base sm:text-lg text-[#ffffff] mb-3">
            {t.dashboard.thesisTitle}
          </h3>
          <p className="view-intro">{t.dashboard.thesisParagraph}</p>
        </div>
      </Reveal>
    </div>
  )
}
