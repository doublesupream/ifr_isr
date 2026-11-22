/**
 * Fetcher สำหรับดึงข้อมูลจาก Google Sheet (แท็บ "IFR_") ที่เผยแพร่เป็น CSV
 *
 * แท็บ IFR_ (gid=1109648749) มีข้อมูลรายเดือนครบถ้วน:
 *   ปีงบประมาณ, เดือน, ปีปฏิทิน, ชม.ทำงาน (พนักงาน/ลูกจ้าง/รวม/สะสม),
 *   จำนวนบาดเจ็บ, วันหยุดงาน, IFR/ISR (รวม/พนักงาน/ลูกจ้าง)
 *
 * หน้า Dashboard จะ fetch ข้อมูลสดจากชีตนี้ทุกครั้งที่เปิดหน้าเว็บ
 * หากดึงไม่สำเร็จ จะถอยไปใช้ข้อมูล static ใน ifrisr-data.ts ให้อัตโนมัติ
 */

import { DATA, THAI_MONTHS, type MonthRow } from "./ifrisr-data";

/** URL ดึง CSV ของแท็บ IFR_ (gid=1109648749) แบบไม่ต้องล็อกอิน */
export const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1iKsZSigjelsIVgdVG5JhLQx4k157oqDVsnWcTV6zGn0/export?format=csv&gid=1109648749";

function parseNumber(s: string): number | null {
  const t = s.trim().replace(/,/g, "");
  if (!t || t === "#" || t.includes("DIV")) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** แยกบรรทัด CSV โดย respect เครื่องหมาย " (รองรับค่าที่มี comma ภายใน) */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === "," && !inQuote) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export async function fetchSheetCsv(url: string): Promise<string> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet CSV: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export function parseSheetCsv(csv: string): MonthRow[] {
  const lines = csv.replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const rows: MonthRow[] = [];

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cols = splitCsvLine(line);
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? cols[idx] ?? "" : "";
    };

    const fy = parseNumber(get("ปีงบประมาณ"));
    const month = get("เดือน").trim();
    const cy = parseNumber(get("ปีปฏิทิน"));
    if (fy === null || !month || cy === null) continue;

    // จัดอันดับเดือนตามปีงบประมาณ (ต.ค.=0 ... ก.ย.=11)
    const monthIndex = THAI_MONTHS.findIndex((m) => m === month);

    rows.push({
      fiscalYear: fy,
      month,
      calendarYear: cy,
      monthIndex: monthIndex >= 0 ? monthIndex : 0,
      hoursEmployee: parseNumber(get("ชม.ทำงานพนักงาน")) ?? 0,
      hoursLaborer: parseNumber(get("ชม.ทำงานลูกจ้าง")) ?? 0,
      hoursTotal: parseNumber(get("รวมชม.ทำงานพนักงานลูกจ้าง")) ?? 0,
      hoursCum: parseNumber(get("ชม.ทำงานสะสม")) ?? 0,
      hoursCumEmp: parseNumber(get("ชม.ทำงานสะสม พนักงาน")) ?? 0,
      hoursCumLab: parseNumber(get("ชม.ทำงานสะสม ลูกจ้าง")) ?? 0,
      injEmp: parseNumber(get("พนักงานบาดเจ็บ(คน)")) ?? 0,
      injLab: parseNumber(get("ลูกจ้างบาดเจ็บ(คน)")) ?? 0,
      injTotal: parseNumber(get("รวมพนักงานและลูกจ้างบาดเจ็บ(คน)")) ?? 0,
      injCum: parseNumber(get("บาดเจ็บสะสม")) ?? 0,
      injCumEmp: parseNumber(get("พนักงานบาดเจ็บสะสม")) ?? 0,
      injCumLab: parseNumber(get("ลูกจ้างบาดเจ็บสะสม")) ?? 0,
      lostEmp: parseNumber(get("วันหยุดงานพนักงาน(วัน)")) ?? 0,
      lostLab: parseNumber(get("วันหยุดงานลูกจ้าง(วัน)")) ?? 0,
      lostTotal: parseNumber(get("วันหยุดงานรวม(วัน)")) ?? 0,
      lostCum: parseNumber(get("วันหยุดงานสะสม(วัน)")) ?? 0,
      lostCumEmp: parseNumber(get("วันหยุดงานสะสมพนักงาน(วัน)")) ?? 0,
      lostCumLab: parseNumber(get("วันหยุดงานสะสมลูกจ้าง(วัน)")) ?? 0,
      stdHoursCum: parseNumber(get("ชั่วโมงทำงานสะสม")) ?? 0,
      targetIfr: parseNumber(get("Target IFR")) ?? 2.38,
      ifr: parseNumber(get("IFR")),
      ifrEmp: parseNumber(get("IFR พนักงาน")),
      ifrLab: parseNumber(get("IFR ลูกจ้าง")),
      targetIsr: parseNumber(get("Target ISR")) ?? 5.95,
      isr: parseNumber(get("ISR")),
      isrEmp: parseNumber(get("ISR พนักงาน")),
      isrLab: parseNumber(get("ISR ลูกจ้าง")),
    });
  }
  return rows;
}

/**
 * โหลดข้อมูลสดจาก Google Sheet
 * - สำเร็จ: คืน rows ที่ parse จากชีต + live=true
 * - ล้มเหลว: คืน static DATA + live=false (กันไม่ให้หน้าเว็บพัง)
 */
export async function loadMonthRows(): Promise<{ rows: MonthRow[]; live: boolean }> {
  try {
    const csv = await fetchSheetCsv(SHEET_CSV_URL);
    const rows = parseSheetCsv(csv);
    if (rows.length === 0) {
      throw new Error("No rows parsed from sheet CSV");
    }
    return { rows, live: true };
  } catch (err) {
    console.error(
      "[IFR/ISR] โหลดข้อมูลจาก Google Sheet ไม่สำเร็จ — ใช้ข้อมูล static แทน:",
      err,
    );
    return { rows: DATA, live: false };
  }
}