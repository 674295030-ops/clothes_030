import { ChevronDown, Package } from 'lucide-react'
import { formatBaht, statusMeta } from './constants'
import type { BookingTableProps } from './types'

export function BookingTable({ bookings, compact = false, onStatusChange, updatingId }: BookingTableProps) {
  return (
    <div className={'admin-table-wrap ' + (compact ? 'is-compact' : '')}>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ลูกค้า</th>
            <th>ชุดที่จอง</th>
            <th>วันรับชุด</th>
            <th>จุดรับ</th>
            <th>สถานะ</th>
            <th>ยอดรวม</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <div className="admin-customer">
                  <span>{booking.customer.slice(0, 1)}</span>
                  <div>
                    <strong>{booking.customer}</strong>
                    <small>{booking.id.length > 12 ? booking.id.slice(0, 8).toUpperCase() : booking.id}</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="admin-dress-cell">
                  <img src={booking.image} alt="" />
                  <span>{booking.dress}</span>
                </div>
              </td>
              <td>
                <strong>{booking.pickup}</strong>
                <small>คืน {booking.returnDate}</small>
              </td>
              <td>{booking.branch}</td>
              <td>
                {onStatusChange ? (
                  <label className={'admin-status-select ' + statusMeta[booking.status].className}>
                    <select
                      value={booking.status}
                      disabled={updatingId === booking.id}
                      onChange={(event) => onStatusChange(booking.id, event.target.value as typeof booking.status)}
                      aria-label={'สถานะ ' + booking.customer}
                    >
                      <option value="pending">รอตรวจสอบ</option>
                      <option value="confirmed">ยืนยันแล้ว</option>
                      <option value="ready">พร้อมรับชุด</option>
                      <option value="returned">คืนแล้ว</option>
                      <option value="cancelled">ยกเลิก</option>
                    </select>
                    <ChevronDown size={12} />
                  </label>
                ) : (
                  <span className={'admin-status ' + statusMeta[booking.status].className}>
                    <i />
                    {statusMeta[booking.status].label}
                  </span>
                )}
              </td>
              <td><strong>{formatBaht(booking.total)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!bookings.length && (
        <div className="admin-empty">
          <Package size={20} />
          <p>ยังไม่มีรายการในตัวกรองนี้</p>
        </div>
      )}
    </div>
  )
}
