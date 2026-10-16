import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Dress } from '../lib/types'

export type AdminView = 'overview' | 'bookings' | 'catalog'
export type BookingStatus = 'pending' | 'confirmed' | 'ready' | 'returned' | 'cancelled'
export type AccessState = 'checking' | 'allowed' | 'preview' | 'signed-out' | 'forbidden' | 'unavailable'
export type StatusFilter = 'all' | BookingStatus

export type AdminBooking = {
  id: string
  customer: string
  email: string
  dress: string
  image: string
  pickup: string
  returnDate: string
  branch: string
  status: BookingStatus
  total: number
}

export type AdminStats = {
  total: number
  pending: number
  confirmed: number
  revenue: number
}

export type NewDressForm = {
  name: string
  designer: string
  price: string
  occasion: Dress['occasion']
  sizes: string[]
  colorName: string
  colorHex: string
  imageUrl: string
  description: string
}

export type AdminShellProps = {
  view: AdminView
  sidebarOpen: boolean
  dataSource: 'live' | 'demo'
  session: Session | null
  errorMessage: string
  stats: AdminStats
  onNavigate: (nextView: AdminView) => void
  onCloseNotice: () => void
  onToggleSidebar: (open: boolean) => void
  onLogout: () => void
  children: ReactNode
}

export type BookingTableProps = {
  bookings: AdminBooking[]
  compact?: boolean
  onStatusChange?: (id: string, status: BookingStatus) => void
  updatingId?: string | null
}
