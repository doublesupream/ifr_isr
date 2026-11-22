"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FISCAL_YEARS, THAI_MONTHS, type MonthRow } from "@/lib/ifrisr-data";
import { KpiCard } from "@/components/kpi-card";
import {
  IfrLineChart,
  IsrLineChart,
  InjuriesBarChart,
  LostDaysBarChart,
} from "@/components/charts";
import { DataTable } from "@/components/data-table";
import { ShieldCheck, CalendarDays, AlertTriangle, Info, RefreshCw } from "lucide-react";

type Group = "all" | "emp" | "lab";

const FY_LABELS: Record<number, string> = {
  2568: "ปีงบประมาณ 2568 (ต.ค. 67 – ก.ย. 68)",
  2569: "ปีงบประมาณ 2569 (ต.ค. 68 – ก.ย. 69)",
  2570: "ปีงบประมาณ 2570 (ต.ค. 69 – ก.ย. 70)",
};

interface DashboardProps {
  /** ข้อมูลรายเดือนที่โหลดจาก Google Sheet (หรือ static หากโหลดไม่สำเร็จ) */
  data: MonthRow[];
  /** true = ดึงสดจาก Google Sheet, false = ใช้ข้อมูล static */
  live: boolean;
  /** เวลาที่ดึงข้อมูลล่าสุด (แสดงบนหน้าเว็บ) */
  fetchedAt: string;
}

export function Dashboard({ data, live, fetchedAt }: DashboardProps) {
  const [fy, setFy] = useState<number>(2568);
  const [group, setGroup] = useState<Group>("all");
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const rows = useMemo(
    () => data.filter((r) => r.fiscalYear === fy),
    [data, fy],
  );

  // Latest row with data
  const latest = useMemo(() => {
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i];
      if (group === "emp" ? r.ifrEmp !== null : group === "lab" ? r.ifrLab !== null : r.ifr !== null) {
        return r;
      }
    }
    return rows[rows.length - 1];
  }, [rows, group]);

  const prev = useMemo(() => {
    const idx = rows.findIndex((r) => r === latest);
    if (idx <= 0) return null;
    return rows[idx - 1];
  }, [rows, latest]);

  const pick = (r: MonthRow | undefined | null, key: "ifr" | "ifrEmp" | "ifrLab" | "isr" | "isrEmp" | "isrLab") => {
    if (!r) return null;
    const v = r[key];
    return v === null || Number.isNaN(v) ? null : v;
  };

  const ifrVal = group === "emp" ? pick(latest, "ifrEmp") : group === "lab" ? pick(latest, "ifrLab") : pick(latest, "ifr");
  const isrVal = group === "emp" ? pick(latest, "isrEmp") : group === "lab" ? pick(latest, "isrLab") : pick(latest, "isr");
  const ifrPrev = group === "emp" ? pick(prev, "ifrEmp") : group === "lab" ? pick(prev, "ifrLab") : pick(prev, "ifr");
  const isrPrev = group === "emp" ? pick(prev, "isrEmp") : group === "lab" ? pick(prev, "isrLab") : pick(prev, "isr");

  // ค่าบาดเจ็บ / วันหยุดงานสะสม ตามกลุ่มที่เลือก (รวม / พนักงาน / ลูกจ้าง)
  const injVal =
    group === "emp" ? latest?.injCumEmp ?? null
    : group === "lab" ? latest?.injCumLab ?? null
    : latest?.injCum ?? null;
  const injPrev =
    group === "emp" ? prev?.injCumEmp ?? null
    : group === "lab" ? prev?.injCumLab ?? null
    : prev?.injCum ?? null;
  const lostVal =
    group === "emp" ? latest?.lostCumEmp ?? null
    : group === "lab" ? latest?.lostCumLab ?? null
    : latest?.lostCum ?? null;
  const lostPrev =
    group === "emp" ? prev?.lostCumEmp ?? null
    : group === "lab" ? prev?.lostCumLab ?? null
    : prev?.lostCum ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                IFR / ISR Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                ติดตามอัตราความถี่และความรุนแรงของอุบัติเหตุ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 sm:flex">
              <CalendarDays className="h-4 w-4" />
              <span>ปีงบประมาณ ต.ค. – ก.ย.</span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "กำลังโหลด..." : "รีเฟรช"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-slate-600">ปีงบประมาณ:</label>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              {FISCAL_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setFy(y)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    fy === y
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            <span className="hidden text-xs text-slate-400 md:inline">
              {FY_LABELS[fy]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600">กลุ่ม:</label>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              {([
                ["all", "รวม"],
                ["emp", "พนักงาน"],
                ["lab", "ลูกจ้าง"],
              ] as [Group, string][]).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setGroup(k)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    group === k
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data source badge */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
              live
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : "bg-amber-50 text-amber-700 ring-amber-100"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500" : "bg-amber-500"}`} />
            {live ? "ข้อมูลสดจาก Google Sheet" : "ใช้ข้อมูลสำรอง (โหลดจาก Sheet ไม่สำเร็จ)"}
          </span>
          <span className="text-xs text-slate-400">อัปเดตล่าสุด {fetchedAt}</span>
        </div>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="IFR (ล่าสุด)"
            value={ifrVal}
            target={2.38}
            compareTo={ifrPrev}
            invertColor
          />
          <KpiCard
            title="ISR (ล่าสุด)"
            value={isrVal}
            target={5.95}
            compareTo={isrPrev}
            invertColor
          />
          <KpiCard
            title="ผู้บาดเจ็บสะสม (คน)"
            value={injVal}
            target={0}
            compareTo={injPrev}
            format="integer"
            invertColor
          />
          <KpiCard
            title="วันหยุดงานสะสม (วัน)"
            value={lostVal}
            target={0}
            compareTo={lostPrev}
            format="integer"
            invertColor
          />
        </div>

        {/* Charts */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <IfrLineChart data={rows} target={2.38} />
          <IsrLineChart data={rows} target={5.95} />
          <InjuriesBarChart data={rows} />
          <LostDaysBarChart data={rows} />
        </div>

        {/* Insight banner */}
        {latest && (ifrVal !== null || isrVal !== null) && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold text-slate-800">
                สรุปภาพเดือน {THAI_MONTHS[latest.monthIndex]} / {latest.calendarYear + 2500}
              </p>
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-slate-600">
                <li>
                  IFR{" "}
                  <span className="font-semibold">
                    {ifrVal !== null ? ifrVal.toFixed(2) : "—"}
                  </span>{" "}
                  {ifrVal !== null && ifrVal > 2.38 ? (
                    <span className="font-semibold text-rose-600">(เกินเป้า 2.38)</span>
                  ) : (
                    <span className="font-semibold text-emerald-600">(ถูกเป้า)</span>
                  )}
                  , ISR{" "}
                  <span className="font-semibold">
                    {isrVal !== null ? isrVal.toFixed(2) : "—"}
                  </span>{" "}
                  {isrVal !== null && isrVal > 5.95 ? (
                    <span className="font-semibold text-rose-600">(เกินเป้า 5.95)</span>
                  ) : (
                    <span className="font-semibold text-emerald-600">(ถูกเป้า)</span>
                  )}
                </li>
                <li>
                  ผู้บาดเจ็บสะสม {latest.injCum} คน (พนักงาน {latest.injCumEmp} / ลูกจ้าง {latest.injCumLab}) ·
                  วันหยุดงานสะสม {latest.lostCum} วัน
                </li>
                <li>
                  ชั่วโมงทำงานสะสมจริง {Math.round(latest.hoursCum).toLocaleString()} ชม.
                  · ค่ามาตรฐานสะสม {latest.stdHoursCum.toLocaleString()} ชม.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Data table */}
        <div className="mb-6">
          <DataTable data={rows} />
        </div>

        {/* Formula note */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">สูตรการคำนวณ</h3>
          </div>
          <div className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3 font-mono">
              <p className="font-semibold text-slate-800">IFR</p>
              <p>= (บาดเจ็บสะสม ÷ ชม.ทำงานสะสม) × ชม.มาตรฐานสะสม</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 font-mono">
              <p className="font-semibold text-slate-800">ISR</p>
              <p>= (วันหยุดงานสะสม ÷ ชม.ทำงานสะสม) × ชม.มาตรฐานสะสม</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            หมายเหตุ: ชม.มาตรฐานสะสม = 16,667 × จำนวนเดือน (200,004 ชม. ≈ 100 FTE × 2,000 ชม./ปี)
            · IFR/ISR แยกพนักงาน/ลูกจ้างจะหารด้วยชั่วโมงทำงานสะสมของแต่ละกลุ่ม
          </p>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          ข้อมูลจาก Google Sheet · IFR/ISR Dashboard
        </footer>
      </main>
    </div>
  );
}
