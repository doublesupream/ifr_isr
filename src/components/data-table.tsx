"use client";

import type { MonthRow } from "@/lib/ifrisr-data";
import { THAI_MONTHS } from "@/lib/ifrisr-data";

interface DataTableProps {
  data: MonthRow[];
  showAll?: boolean;
}

function fmt(n: number | null, digits = 2): string {
  if (n === null || Number.isNaN(n)) return "—";
  if (n === 0) return "0";
  return n.toFixed(digits);
}

function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function IfrBadge({ value, target }: { value: number | null; target: number }) {
  if (value === null) {
    return <span className="text-slate-400">—</span>;
  }
  const over = value > target;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${
        over
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      }`}
    >
      {value.toFixed(2)}
    </span>
  );
}

export function DataTable({ data }: DataTableProps) {
  const targetIfr = data.find((d) => Number.isFinite(d.targetIfr))?.targetIfr ?? 2.38;
  const targetIsr = data.find((d) => Number.isFinite(d.targetIsr))?.targetIsr ?? 5.95;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">ตารางข้อมูลรายเดือน</h3>
        <p className="text-xs text-slate-500">
          ค่า IFR/ISR คำนวณจากยอดสะสม · เป้า IFR ≤ {targetIfr} / ISR ≤ {targetIsr}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">เดือน</th>
              <th className="px-4 py-3 text-right">ชม.ทำงาน (สะสม)</th>
              <th className="px-4 py-3 text-right">บาดเจ็บ (คน)</th>
              <th className="px-4 py-3 text-right">วันหยุด (วัน)</th>
              <th className="px-4 py-3 text-right">IFR รวม</th>
              <th className="px-4 py-3 text-right">IFR พนักงาน</th>
              <th className="px-4 py-3 text-right">IFR ลูกจ้าง</th>
              <th className="px-4 py-3 text-right">ISR รวม</th>
              <th className="px-4 py-3 text-right">ISR พนักงาน</th>
              <th className="px-4 py-3 text-right">ISR ลูกจ้าง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((d) => (
              <tr key={`${d.fiscalYear}-${d.month}`} className="hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                  {THAI_MONTHS[d.monthIndex]}
                  <span className="ml-1 text-xs text-slate-400">/{d.calendarYear + 2500}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                  {fmtInt(d.hoursCum)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="font-semibold text-slate-800">{d.injCum}</span>
                  <span className="ml-1 text-xs text-slate-400">
                    (พ.{d.injCumEmp}/ล.{d.injCumLab})
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span className="font-semibold text-slate-800">{d.lostCum}</span>
                  <span className="ml-1 text-xs text-slate-400">
                    (พ.{d.lostCumEmp}/ล.{d.lostCumLab})
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <IfrBadge value={d.ifr} target={d.targetIfr} />
                </td>
                <td className="px-4 py-3 text-right">
                  <IfrBadge value={d.ifrEmp} target={d.targetIfr} />
                </td>
                <td className="px-4 py-3 text-right">
                  <IfrBadge value={d.ifrLab} target={d.targetIfr} />
                </td>
                <td className="px-4 py-3 text-right">
                  <IfrBadge value={d.isr} target={d.targetIsr} />
                </td>
                <td className="px-4 py-3 text-right">
                  <IfrBadge value={d.isrEmp} target={d.targetIsr} />
                </td>
                <td className="px-4 py-3 text-right">
                  <IfrBadge value={d.isrLab} target={d.targetIsr} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          ไม่พบข้อมูลปีงบประมาณนี้
        </div>
      )}
    </div>
  );
}
