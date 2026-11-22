import { Suspense } from "react";
import { connection } from "next/server";
import { Dashboard } from "@/components/dashboard";
import { loadMonthRows } from "@/lib/sheet-fetcher";

async function DashboardData() {
  // รอเชื่อมต่อ request เพื่อให้ render ข้อมูลสดตอน request (รองรับ cacheComponents)
  await connection();
  const { rows, live } = await loadMonthRows();
  return <Dashboard data={rows} live={live} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          กำลังโหลดข้อมูลจาก Google Sheet…
        </div>
      }
    >
      <DashboardData />
    </Suspense>
  );
}