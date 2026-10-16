import { ShieldCheck } from 'lucide-react'
import type { AccessState } from './types'
import { GoogleLogo } from '../components/GoogleLogo'

export function AdminAccessState({ access, onLogin }: { access: AccessState; onLogin: () => void }) {
  const copy = access === 'forbidden'
    ? { title: 'บัญชีนี้ไม่มีสิทธิ์ Admin', description: 'หน้านี้เปิดสำหรับผู้ดูแลร้านที่ได้รับอนุญาตเท่านั้น' }
    : access === 'unavailable'
      ? { title: 'ยังเชื่อมต่อสิทธิ์ Admin ไม่ได้', description: 'ตรวจสอบ Supabase migration, Google Login และ RLS ก่อนเปิดใช้งานหน้านี้' }
      : access === 'checking'
        ? { title: 'กำลังตรวจสอบสิทธิ์', description: 'กำลังโหลด session และ role จาก Supabase' }
        : { title: 'เข้าสู่ระบบเพื่อเข้า Admin', description: 'ใช้ Google บัญชีที่อยู่ใน admin allowlist ของร้าน' }

  return (
    <div className="admin-gate">
      <div className="admin-gate-card">
        <span className="admin-gate-mark"><ShieldCheck size={25} /></span>
        <span className="eyebrow">VELA ADMIN STUDIO</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        {access === 'signed-out' && <button className="button button-dark admin-google-button" onClick={onLogin}><GoogleLogo /> เข้าสู่ระบบด้วย Google</button>}
        <a className="text-action" href="/">กลับหน้าร้าน</a>
      </div>
    </div>
  )
}
