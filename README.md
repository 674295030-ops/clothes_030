# Thawinee

เว็บไซต์เช่าชุดสำหรับโอกาสพิเศษ พร้อมระบบเข้าสู่ระบบด้วย Google, การจองชุด, โปรไฟล์ผู้ใช้, หน้าจัดการสำหรับผู้ดูแล และ AI Stylist ที่ตอบจากข้อมูลของร้านเท่านั้น

Live site: [https://vela-rental.pages.dev](https://vela-rental.pages.dev)

> ชื่อ Cloudflare project และ URL เดิมถูกคงไว้เพื่อไม่ให้ deployment และ OAuth redirect เดิมเสียหาย ส่วนชื่อแบรนด์ที่แสดงในระบบใช้ `Thawinee`

## Features

- แคตตาล็อกชุดเช่าพร้อมการค้นหาและแยกหมวดหมู่
- ดูรายละเอียดชุดและเลือกวันใช้งานเพื่อเริ่มการจอง
- Google OAuth ผ่าน Supabase Auth
- แยกสิทธิ์ `user` และ `admin` พร้อม redirect ตาม role
- ผู้ใช้ดูและแก้ไขโปรไฟล์ รวมถึงออกจากระบบได้
- Admin dashboard สำหรับดูภาพรวม จัดการการจอง และเพิ่ม/แก้ไขชุด
- AI Stylist ผ่าน Supabase Edge Function และ Gemini
- AI จำกัดคำตอบให้อยู่ในขอบเขตข้อมูลเว็บไซต์ เช่น ชุด ราคา สาขา ขั้นตอนการจอง และนโยบายร้าน
- Deploy ได้บน Cloudflare Pages

## Tech stack

- React 19 + TypeScript
- Vite
- Supabase Auth, Postgres และ Edge Functions
- Gemini API สำหรับ AI Stylist
- Cloudflare Pages
- Lucide React สำหรับไอคอน

## Requirements

- Node.js 20 หรือใหม่กว่า
- npm
- Supabase project
- Google OAuth client ที่ตั้งค่าใน Supabase Auth
- Gemini API key สำหรับเปิดใช้งาน AI Stylist
- Wrangler ที่ login ด้วยบัญชี Cloudflare ที่มีสิทธิ์ deploy Pages

## Local development

1. ติดตั้ง dependencies

   ```bash
   npm install
   ```

2. สร้างไฟล์ `.env.local` จาก `.env.example`

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

3. เริ่ม development server

   ```bash
   npm run dev
   ```

   เปิด [http://localhost:5173](http://localhost:5173)

4. ตรวจ type และ build production

   ```bash
   npm run lint
   npm run build
   ```

ห้าม commit `.env.local` หรือ API key ใด ๆ ลง GitHub

## Supabase setup

รัน migrations ในโฟลเดอร์ `supabase/migrations` ตามลำดับ หรือใช้ Supabase CLI กับ project ที่ link ไว้:

```bash
npx supabase db push
```

ตั้งค่า Google provider ใน Supabase Dashboard และเพิ่ม redirect URL ของทั้ง local และ production เช่น:

```text
http://localhost:5173
https://vela-rental.pages.dev
```

สำหรับ AI Stylist ให้ตั้งค่า secrets ของ Edge Function:

```bash
npx supabase secrets set GEMINI_API_KEY=your-gemini-key
npx supabase secrets set GEMINI_MODEL=gemini-3.8-flash
```

Deploy function:

```bash
npx supabase functions deploy chat --use-api
```

`SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะฝั่ง Edge Function และต้องไม่ใส่ใน frontend หรือ commit ลง repository

## Cloudflare Pages deployment

Build โปรเจกต์ก่อน แล้ว deploy โฟลเดอร์ `dist`:

```bash
npm run build
npx wrangler pages deploy dist --project-name vela-rental
```

ตั้งค่า environment variables ฝั่ง Cloudflare Pages ให้ตรงกับ `.env.local` ของ environment นั้น ๆ โดยใช้เฉพาะ publishable Supabase key ฝั่ง browser

## Project structure

```text
src/
  App.tsx                 หน้า storefront และ user flow
  AdminPage.tsx           หน้าหลักของ admin
  admin/                  components ของ admin dashboard
  components/             shared UI components
  lib/                    Supabase client, catalog และ types
supabase/
  migrations/             schema และ seed data
  functions/chat/         Edge Function สำหรับ AI Stylist
public/assets/            รูปภาพและ static assets
specs/                    เอกสาร design และ technical specification
```

## Roles

- `user`: ดูชุด แก้ไขโปรไฟล์ และสร้าง/ติดตามการจอง
- `admin`: เข้าหน้า `/admin` ดูภาพรวม จัดการแคตตาล็อก และจัดการรายการจอง

สิทธิ์ admin ถูกตรวจสอบจาก profile/allowlist ฝั่ง Supabase ไม่ควรเชื่อ role จากข้อมูลที่ส่งมาจาก browser เพียงอย่างเดียว

## AI response policy

Edge Function `chat` จะดึงข้อมูลชุดและบริบทของร้านจาก Supabase ก่อนส่งให้ Gemini และกำหนด system prompt ให้ตอบเฉพาะเรื่องที่มีข้อมูลในเว็บไซต์ หากคำถามอยู่นอกขอบเขต ระบบควรแจ้งว่าไม่พบข้อมูลในเว็บไซต์และแนะนำหัวข้อที่ช่วยได้

## Git workflow

```bash
git status
git add .
git commit -m "describe the change"
git push origin main
```

