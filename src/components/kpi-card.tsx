"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | null;
  target: number;
  unit?: string;
  invertColor?: boolean; // for IFR/ISR lower is better
  compareTo?: number | null; // previous value for delta
  format?: "decimal" | "integer"; // value formatting
  neutral?: boolean; // no target badge (for non-rate metrics like hours)
}

export function KpiCard({
  title,
  value,
  target,
  unit = "",
  invertColor = true,
  compareTo,
  format = "decimal",
  neutral = false,
}: KpiCardProps) {
  const hasValue = value !== null && !Number.isNaN(value);
  const isOver = hasValue && value > target;
  const isOk = hasValue && value <= target;

  const statusColor = neutral
    ? hasValue
      ? "text-slate-800"
      : "text-slate-400"
    : !hasValue
    ? "text-slate-400"
    : isOver
    ? "text-rose-600"
    : "text-emerald-600";

  const statusBg = !hasValue
    ? "bg-slate-100"
    : isOver
    ? "bg-rose-50 ring-1 ring-rose-100"
    : "bg-emerald-50 ring-1 ring-emerald-100";

  let delta: number | null = null;
  if (hasValue && compareTo !== null && compareTo !== undefined && !Number.isNaN(compareTo)) {
    delta = (value as number) - compareTo;
  }

  const better = delta !== null ? (invertColor ? delta <= 0 : delta >= 0) : null;
  const deltaColor = neutral
    ? "text-slate-500"
    : better
    ? "text-emerald-600"
    : "text-rose-600";

  const fmtValue = (n: number) =>
    format === "integer" ? Math.round(n).toLocaleString("en-US") : n.toFixed(2);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className={`mt-2 text-3xl font-bold tabular-nums ${statusColor}`}>
            {hasValue ? fmtValue(value as number) : "—"}
            {hasValue && unit && (
              <span className="ml-1 text-base font-medium text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>
        {!neutral && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBg} ${statusColor}`}>
            {!hasValue
              ? "ไม่มีข้อมูล"
              : isOver
              ? "เกินเป้า"
              : "ถูกเป้า"}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="text-slate-500">
          {neutral ? (
            <span>เทียบเดือนก่อน</span>
          ) : (
            <>
              เป้า ≤{" "}
              <span className="font-semibold text-slate-700">{fmtValue(target)}{unit}</span>
            </>
          )}
        </div>
        {delta !== null && (
          <div
            className={`inline-flex items-center gap-1 font-semibold ${deltaColor}`}
          >
            {delta === 0 ? (
              <Minus className="h-3.5 w-3.5" />
            ) : delta > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {delta > 0 ? "+" : ""}
            {format === "integer"
              ? Math.round(delta).toLocaleString("en-US")
              : delta.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}