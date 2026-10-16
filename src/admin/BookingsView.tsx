import { ChevronDown, Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminPanelHeading } from './AdminPanelHeading'
import { BookingTable } from './BookingTable'
import type { AdminBooking, BookingStatus, StatusFilter } from './types'

export function BookingsView({
  bookings,
  statusFilter,
  onFilterChange,
  onStatusChange,
  updatingId,
}: {
  bookings: AdminBooking[]
  statusFilter: StatusFilter
  onFilterChange: (value: StatusFilter) => void
  onStatusChange: (id: string, status: BookingStatus) => void
  updatingId: string | null
}) {
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState('all')
  const branches = useMemo(() => ['all', ...new Set(bookings.map((booking) => booking.branch))], [bookings])
  const visibleBookings = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return bookings.filter((booking) => {
      const matchesQuery = !normalized || [booking.id, booking.customer, booking.email, booking.dress].join(' ').toLowerCase().includes(normalized)
      return matchesQuery && (branch === 'all' || booking.branch === branch)
    })
  }, [bookings, branch, query])
  const exportCsv = () => {
    const headers = ['รหัส', 'ลูกค้า', 'อีเมล', 'ชุด', 'วันรับ', 'วันคืน', 'จุดรับ', 'สถานะ', 'ยอดรวม']
    const rows = visibleBookings.map((booking) => [booking.id, booking.customer, booking.email, booking.dress, booking.pickup, booking.returnDate, booking.branch, booking.status, String(booking.total)])
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'vela-bookings.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <section className="admin-panel admin-bookings-page">
      <AdminPanelHeading
        eyebrow="BOOKING OPERATIONS"
        title="รายการจองทั้งหมด"
        action={
          <div className="admin-booking-tools"><label className="admin-booking-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาลูกค้า, ชุด, รหัส..." aria-label="ค้นหารายการจอง" /></label><label className="admin-filter-select">
            แสดง
            <select value={statusFilter} onChange={(event) => onFilterChange(event.target.value as StatusFilter)}>
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="ready">พร้อมรับชุด</option>
              <option value="returned">คืนแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
            <ChevronDown size={14} />
          </label><label className="admin-filter-select"><select value={branch} onChange={(event) => setBranch(event.target.value)} aria-label="กรองตามจุดรับ"><option value="all">ทุกจุดรับ</option>{branches.slice(1).map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown size={14} /></label><button className="admin-export-button" onClick={exportCsv}><Download size={14} /> CSV</button></div>
        }
      />
      <BookingTable bookings={visibleBookings} onStatusChange={onStatusChange} updatingId={updatingId} />
    </section>
  )
}
