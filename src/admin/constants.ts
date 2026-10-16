import { dresses } from '../lib/mockData'
import { COLORS, OCCASIONS, type Dress } from '../lib/types'
import { mapSupabaseDress } from '../lib/catalog'
import type { AdminBooking, BookingStatus, NewDressForm } from './types'

export const demoBookings: AdminBooking[] = [
  { id: 'VL-26041', customer: 'มินตรา วัฒนกิจ', email: 'mintra@example.com', dress: 'เดรสกำมะหยี่คอเหลี่ยม', image: dresses[6].image, pickup: '22 ต.ค. 2569', returnDate: '23 ต.ค. 2569', branch: 'หาดใหญ่ สงขลา', status: 'pending', total: 4200 },
  { id: 'VL-26040', customer: 'พิมพ์ชนก ศรีสุข', email: 'pimchanok@example.com', dress: 'เดรสคอวีผ้าซาติน', image: dresses[5].image, pickup: '20 ต.ค. 2569', returnDate: '21 ต.ค. 2569', branch: 'หาดใหญ่ สงขลา', status: 'confirmed', total: 3200 },
  { id: 'VL-26039', customer: 'ณัฐชา อรุณวรรณ', email: 'natcha@example.com', dress: 'เดรสลูกไม้สีแชมเปญ', image: dresses[14].image, pickup: '18 ต.ค. 2569', returnDate: '19 ต.ค. 2569', branch: 'หาดใหญ่ สงขลา', status: 'ready', total: 3800 },
  { id: 'VL-26038', customer: 'ศศิธร วงศ์ดี', email: 'sasithorn@example.com', dress: 'เดรสหางปลาสีทับทิม', image: dresses[9].image, pickup: '15 ต.ค. 2569', returnDate: '16 ต.ค. 2569', branch: 'จัดส่งถึงบ้าน', status: 'returned', total: 4600 },
]

export const statusMeta: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'รอตรวจสอบ', className: 'status-pending' },
  confirmed: { label: 'ยืนยันแล้ว', className: 'status-confirmed' },
  ready: { label: 'พร้อมรับชุด', className: 'status-ready' },
  returned: { label: 'คืนแล้ว', className: 'status-returned' },
  cancelled: { label: 'ยกเลิก', className: 'status-cancelled' },
}

export const formatBaht = (amount: number) => '฿' + amount.toLocaleString('th-TH')

export const emptyDressForm = (): NewDressForm => ({
  name: '',
  designer: 'THAWINEE ATELIER',
  price: '1600',
  occasion: OCCASIONS[0],
  sizes: ['S', 'M'],
  colorName: COLORS[0].name,
  colorHex: COLORS[0].value,
  imageUrl: dresses[0].image,
  description: '',
})

export const mapLiveDress = mapSupabaseDress
