export const OCCASIONS = ['ชุดราตรี', 'ชุดออกงาน', 'ชุดไปงานแต่ง'] as const
export const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const
export const COLORS = [
  { name: 'Forest', value: '#214d40' },
  { name: 'Black', value: '#171717' },
  { name: 'Sand', value: '#d5ab7f' },
  { name: 'Rose', value: '#d7a7a3' },
  { name: 'Ruby', value: '#7a1f29' },
  { name: 'Silver', value: '#d9dde1' },
] as const

export type Occasion = (typeof OCCASIONS)[number]
export type Size = (typeof SIZES)[number]

export type Dress = {
  id: string
  name: string
  designer: string
  price: number
  occasion: Occasion
  sizes: readonly Size[]
  color: string
  colorName: string
  image: string
  available: string
  description: string
}

export type UserProfile = {
  id: string
  email: string
  displayName: string
  avatarUrl?: string
  role: 'user' | 'admin'
}
