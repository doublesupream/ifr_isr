"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts";
import type { MonthRow } from "@/lib/ifrisr-data";

interface ChartProps {
  data: MonthRow[];
  target?: number;
}

const MONTH_LABELS = [
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
];

/**
 * คำนวณช่วงแกน Y ให้ครอบคลุมทั้งข้อมูลและเส้นเป้าเสมอ
 * กันไม่ให้เส้นเป้าหายไปในปีที่ข้อมูลเป็นศูนย์หรือว่าง (เช่น 2569, 2570)
 */
function computeYDomain(
  values: Array<number | null>,
  target: number,
): [number, number] {
  let max = target;
  for (const v of values) {
    if (v !== null && Number.isFinite(v)) {
      max = Math.max(max, v);
    }
  }
  // เผื่อพื้นที่ด้านบนให้เส้นเป้าและป้ายบอกตัวเลขไม่ถูกตัดขอบ
  const upper = max > 0 ? max * 1.15 : 1;
  return [0, upper];
}

/** เส้นเป้า (Target) พร้อมป้ายบอกตัวเลขบนกราฟ */
function TargetReferenceLine({ y, text }: { y: number; text: string }) {
  return (
    <ReferenceLine
      y={y}
      stroke="#dc2626"
      strokeDasharray="6 4"
      label={{
        value: text,
        position: "insideRight",
        fill: "#dc2626",
        fontSize: 11,
        background: { fill: "#ffffff", stroke: "#dc2626", rx: 4, padding: 3 },
      }}
    />
  );
}

export function IfrLineChart({ data, target = 2.38 }: ChartProps) {
  const chart = data.map((d) => ({
    label: MONTH_LABELS[d.monthIndex],
    IFR: d.ifr,
    IFREmp: d.ifrEmp,
    IFRLab: d.ifrLab,
  }));
  const yDomain = computeYDomain(
    chart.flatMap((d) => [d.IFR, d.IFREmp, d.IFRLab]),
    target,
  );

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            แนวโน้ม IFR รายเดือน
          </h3>
          <p className="text-xs text-slate-500">Incident Frequency Rate (ต่ำกว่าดีกว่า)</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis domain={yDomain} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <TargetReferenceLine y={target} text={`เป้า ${target}`} />
          <Line
            type="monotone"
            dataKey="IFR"
            name="รวม"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="IFREmp"
            name="พนักงาน"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="IFRLab"
            name="ลูกจ้าง"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IsrLineChart({ data, target = 5.95 }: ChartProps) {
  const chart = data.map((d) => ({
    label: MONTH_LABELS[d.monthIndex],
    ISR: d.isr,
    ISREmp: d.isrEmp,
    ISRLab: d.isrLab,
  }));
  const yDomain = computeYDomain(
    chart.flatMap((d) => [d.ISR, d.ISREmp, d.ISRLab]),
    target,
  );

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          แนวโน้ม ISR รายเดือน
        </h3>
        <p className="text-xs text-slate-500">Incident Severity Rate (ต่ำกว่าดีกว่า)</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis domain={yDomain} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <TargetReferenceLine y={target} text={`เป้า ${target}`} />
          <Line
            type="monotone"
            dataKey="ISR"
            name="รวม"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="ISREmp"
            name="พนักงาน"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="ISRLab"
            name="ลูกจ้าง"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 2.5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InjuriesBarChart({ data }: { data: MonthRow[] }) {
  const chart = data.map((d) => ({
    label: MONTH_LABELS[d.monthIndex],
    พนักงาน: d.injEmp,
    ลูกจ้าง: d.injLab,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          จำนวนผู้บาดเจ็บรายเดือน
        </h3>
        <p className="text-xs text-slate-500">แยกพนักงาน / ลูกจ้าง (คน)</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="พนักงาน" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]}>
            {chart.map((_, i) => (
              <Cell key={i} fill="#0ea5e9" />
            ))}
          </Bar>
          <Bar dataKey="ลูกจ้าง" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LostDaysBarChart({ data }: { data: MonthRow[] }) {
  const chart = data.map((d) => ({
    label: MONTH_LABELS[d.monthIndex],
    พนักงาน: d.lostEmp,
    ลูกจ้าง: d.lostLab,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          วันหยุดงานจากอุบัติเหตุ (วัน)
        </h3>
        <p className="text-xs text-slate-500">แยกพนักงาน / ลูกจ้าง</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="พนักงาน" stackId="a" fill="#7c3aed" />
          <Bar dataKey="ลูกจ้าง" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
