import { AdminPanelHeading } from './AdminPanelHeading'

export function AdminTaskPanel({
  pending,
  catalogSize,
  onOpenBookings,
  onAddDress,
}: {
  pending: number
  catalogSize: number
  onOpenBookings: () => void
  onAddDress: () => void
}) {
  return (
    <section className="admin-panel admin-task-panel">
      <AdminPanelHeading eyebrow="TODAY'S FOCUS" title="งานที่ต้องดำเนินการ" />
      <button className="admin-task-row" onClick={onOpenBookings}>
        <span className="task-count">{pending}</span>
        <span><strong>ตรวจสอบรายการจอง</strong><small>{pending ? 'มีรายการรอการยืนยัน' : 'ไม่มีรายการค้าง'}</small></span>
        <span className="task-arrow">→</span>
      </button>
      <button className="admin-task-row" onClick={onAddDress}>
        <span className="task-count task-count-soft">+</span>
        <span><strong>เพิ่มชุดเข้าคลัง</strong><small>{catalogSize} ชุดพร้อมจัดการ</small></span>
        <span className="task-arrow">→</span>
      </button>
    </section>
  )
}
