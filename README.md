# IFR / ISR Dashboard

Dashboard สำหรับ **เจ้าหน้าที่ความปลอดภัย** เพื่อติดตาม **IFR (Incident Frequency Rate)** และ **ISR (Incident Severity Rate)** แยกพนักงาน / ลูกจ้าง ตามปีงบประมาณ (ต.ค.–ก.ย.)

## สูตรการคำนวณ

```
IFR = (บาดเจ็บสะสม ÷ ชม.ทำงานสะสม) × ชม.มาตรฐานสะสม
ISR = (วันหยุดงานสะสม ÷ ชม.ทำงานสะสม) × ชม.มาตรฐานสะสม
```

- **ชม.มาตรฐานสะสม** = 16,667 × จำนวนเดือน (200,004 ชม. ≈ 100 FTE × 2,000 ชม./ปี)
- **เป้า**: IFR ≤ 2.38 / ISR ≤ 5.95
- ค่าแยกพนักงาน/ลูกจ้าง: หารด้วยชั่วโมงทำงานสะสมของแต่ละกลุ่ม

## ฟีเจอร์

- KPI cards (IFR/ISR ล่าสุด, เทียบกับเดือนก่อน, สถานะเกิน/ถูกเป้า)
- Line chart แนวโน้ม IFR/ISR รายเดือน (รวม/พนักงาน/ลูกจ้าง)
- Bar chart จำนวนผู้บาดเจ็บ และ วันหยุดงาน แยกกลุ่ม
- ตารางข้อมูลรายเดือน พร้อม badge แสดงเกิน/ถูกเป้า
- ตัวกรองปีงบประมาณ (2568/2569/2570) และกลุ่ม (รวม/พนักงาน/ลูกจ้าง)
- สรุปภาพรวมประจำเดือน

## เทคนิค

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS v4**
- **Recharts** สำหรับ chart
- **Lucide React** สำหรับ icon
- **Noto Sans Thai** สำหรับฟอนต์ไทย

## โครงสร้าง

```
src/
├─ app/
│  ├─ layout.tsx        # html/body + font
│  ├─ globals.css       # Tailwind + theme
│  └─ page.tsx          # Dashboard หลัก (client)
├─ components/
│  ├─ kpi-card.tsx      # KPI card พร้อม delta + status badge
│  ├─ charts.tsx        # IFR/ISR line chart, injury/lost-day bar chart
│  └─ data-table.tsx    # ตารางข้อมูลรายเดือน
└─ lib/
   ├─ ifrisr-data.ts    # ข้อมูล static (ดึงจาก Google Sheet แล้ว)
   └─ sheet-fetcher.ts # Fetcher + parser สำหรับต่อ CSV จริง
```

## การดึงข้อมูลจาก Google Sheet (ภายหลัง)

ปัจจุบันใช้ static data ที่ embed ไว้ใน `src/lib/ifrisr-data.ts`

เมื่อต้องการดึงสด:
1. ใน Google Sheet → **File → Share → Publish to web**
2. เลือกแท็บ `gid=421279616` แล้วคัดลอก **ลิงก์ CSV**
3. ตั้งค่า ENV ใน Vercel:
   ```
   SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
   ```
4. ใน `page.tsx` เปลี่ยนจากใช้ `DATA` เป็นเรียก `fetchSheetCsv()` + `parseSheetCsv()` ใน server component

## Deploy ขึ้น Vercel

### วิธี 1: ผ่าน GitHub (แนะนำ)

```bash
# ในโปรเจกต์นี้
git init
git add .
git commit -m "init: IFR/ISR dashboard"
# สร้าง repo บน GitHub แล้ว push
```

จากนั้น:
1. เข้า https://vercel.com/new
2. Import repo จาก GitHub
3. Framework: **Next.js** (ตรวจจับอัตโนมัติ)
4. กด **Deploy** (ไม่ต้อง ENV ก็ได้ถ้าใช้ static data)

### วิธี 2: ผ่าน Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Local dev

```bash
npm install
npm run dev
# เปิด http://localhost:3000
```