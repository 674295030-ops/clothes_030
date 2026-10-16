import { dresses as mockDresses } from './mockData'
import { COLORS, OCCASIONS, SIZES, type Dress } from './types'

export type SupabaseDressRow = {
  id: string
  slug?: string | null
  name?: string | null
  designer?: string | null
  price_per_day?: number | null
  occasion?: string | null
  sizes?: string[] | null
  color_name?: string | null
  color_hex?: string | null
  image_url?: string | null
  available?: boolean | null
  description?: string | null
}

export const mapSupabaseDress = (row: SupabaseDressRow): Dress => ({
  id: String(row.id),
  name: String(row.name ?? 'ชุดใหม่'),
  designer: String(row.designer ?? 'THAWINEE ATELIER'),
  price: Number(row.price_per_day ?? 0),
  occasion: OCCASIONS.includes(row.occasion as (typeof OCCASIONS)[number]) ? row.occasion as Dress['occasion'] : OCCASIONS[0],
  sizes: (row.sizes ?? []).filter((size): size is (typeof SIZES)[number] => SIZES.includes(size as (typeof SIZES)[number])),
  color: String(row.color_hex ?? COLORS[0].value),
  colorName: String(row.color_name ?? COLORS[0].name),
  image: String(row.image_url ?? mockDresses[0].image),
  available: row.available === false ? 'ไม่พร้อมเช่า' : 'พร้อมเช่า',
  description: String(row.description ?? ''),
})

export const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

export const formatDateThai = (value: string) => {
  if (!value) return 'ยังไม่ระบุวันที่'
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const dateAfterDaysIso = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
