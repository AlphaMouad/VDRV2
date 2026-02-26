"use client"

import React from "react"
import type { TooltipProps } from "recharts"
import { type NameType, type ValueType } from "recharts/types/component/DefaultTooltipContent"

interface EliteTooltipProps extends TooltipProps<ValueType, NameType> {
  formatter?: (value: number, name: string, props: any) => [string, string]
}

export function EliteTooltip({ active, payload, label, formatter }: EliteTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  return (
    <div className="glass-form p-3 border border-[#C5A059] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] min-w-[200px] backdrop-blur-xl bg-[rgba(5,5,5,0.95)]">
      {label && (
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#a3a3a3] mb-2 border-b border-[rgba(255,255,255,0.1)] pb-1.5">
          {label}
        </p>
      )}
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          // Use formatter if provided, otherwise default formatting
          const formattedValue = formatter
            ? formatter(Number(entry.value), String(entry.name), entry)
            : [entry.value, entry.name]

          const displayValue = formattedValue[0]
          const displayName = formattedValue[1]

          return (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-[11px] text-[#e5e5e5] font-medium truncate max-w-[120px]">
                  {displayName}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#C5A059] whitespace-nowrap">
                {displayValue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
