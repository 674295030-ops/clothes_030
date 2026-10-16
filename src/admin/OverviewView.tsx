import { ArrowRight, BarChart3, Check, Clock3, Plus, ShoppingBag } from 'lucide-react'
import { AdminPanelHeading } from './AdminPanelHeading'
import { AdminStat } from './AdminStat'
import { AdminTaskPanel } from './AdminTaskPanel'
import { BookingTable } from './BookingTable'
import { CatalogView } from './CatalogView'
import { formatBaht } from './constants'
import type { AdminBooking, AdminStats, BookingStatus } from './types'
import type { Dress } from '../lib/types'

export function OverviewView({
  stats,
  bookings,
  catalog,
  onOpenBookings,
  onStatClick,
  onAddDress,
  onEditDress,
  onToggleAvailability,
}: {
  stats: AdminStats
  bookings: AdminBooking[]
  catalog: Dress[]
  onOpenBookings: () => void
  onStatClick: (filter: 'all' | BookingStatus) => void
  onAddDress: () => void
  onEditDress: (dress: Dress) => void
  onToggleAvailability: (dress: Dress) => void
}) {
  const todayLabel = new Intl.DateTimeFormat('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  return (
    <>
      <section className="admin-welcome">
        <div>
          <span className="eyebrow">{todayLabel}</span>
          <h2>สวัสดีค่ะ, ทีม Vela <span>✦</span></h2>
          <p>สรุปภาพรวมร้านเช่าชุดของคุณในวันนี้</p>
        </div>
        <div className="admin-welcome-actions"><button className="admin-secondary-button" onClick={onOpenBookings}>ดูรายการจอง <ArrowRight size={15} /></button><button className="admin-primary-button" onClick={onAddDress}><Plus size={15} /> เพิ่มชุดใหม่</button></div>
      </section>

      <section className="admin-stat-grid" aria-label="สรุปตัวเลขร้าน">
        <AdminStat icon={<ShoppingBag size={18} />} label="รายการจองทั้งหมด" value={String(stats.total)} helper="รายการในระบบ" onClick={() => onStatClick('all')} />
        <AdminStat icon={<Clock3 size={18} />} label="รอตรวจสอบ" value={String(stats.pending)} helper="ต้องดำเนินการ" tone="warm" onClick={() => onStatClick('pending')} />
        <AdminStat icon={<Check size={18} />} label="ยืนยัน / พร้อมรับ" value={String(stats.confirmed)} helper="รายการที่เดินต่อได้" tone="green" onClick={() => onStatClick('all')} />
        <AdminStat icon={<BarChart3 size={18} />} label="มูลค่ารวม" value={formatBaht(stats.revenue)} helper="จากรายการที่แสดง" tone="rose" onClick={() => onStatClick('all')} />
      </section>

      <section className="admin-overview-grid">
        <div className="admin-panel admin-panel-large">
          <AdminPanelHeading eyebrow="LATEST ACTIVITY" title="รายการจองล่าสุด" action={<button className="admin-link-button" onClick={onOpenBookings}>ดูทั้งหมด <span>↗</span></button>} />
          <BookingTable bookings={bookings.slice(0, 4)} compact />
        </div>
        <div className="admin-right-stack">
          <div className="admin-panel admin-insight-panel">
            <AdminPanelHeading eyebrow="AT A GLANCE" title="สถานะวันนี้" />
            <div className="progress-ring">
              <strong>{Math.round((stats.confirmed / Math.max(stats.total, 1)) * 100)}<small>%</small></strong>
              <span>ยืนยันแล้ว</span>
            </div>
            <div className="admin-mini-stats">
              <span><i className="dot dot-warm" />รอตรวจสอบ <b>{stats.pending}</b></span>
              <span><i className="dot dot-green" />ยืนยันแล้ว <b>{stats.confirmed}</b></span>
            </div>
            <button className="admin-outline-button" onClick={onOpenBookings}>จัดการรายการจอง</button>
          </div>
          <AdminTaskPanel pending={stats.pending} catalogSize={catalog.length} onOpenBookings={onOpenBookings} onAddDress={onAddDress} />
        </div>
      </section>

      <CatalogView compact catalog={catalog} onAddDress={onAddDress} onEditDress={onEditDress} onToggleAvailability={onToggleAvailability} />
    </>
  )
}
