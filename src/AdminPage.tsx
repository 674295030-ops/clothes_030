import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { dresses } from './lib/mockData'
import type { Dress } from './lib/types'
import { signInWithGoogle, supabase } from './lib/supabase'
import { DressFormDialog } from './admin/DressFormDialog'
import { AdminAccessState } from './admin/AdminAccessState'
import { AdminShell } from './admin/AdminShell'
import { BookingsView } from './admin/BookingsView'
import { CatalogView } from './admin/CatalogView'
import { demoBookings, mapLiveDress } from './admin/constants'
import { OverviewView } from './admin/OverviewView'
import type { AccessState, AdminView, BookingStatus, NewDressForm, StatusFilter } from './admin/types'

function AdminPage() {
  const isPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1'
  const [access, setAccess] = useState<AccessState>(isPreview ? 'preview' : 'checking')
  const [session, setSession] = useState<Session | null>(null)
  const [view, setView] = useState<AdminView>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookings, setBookings] = useState(demoBookings)
  const [catalog, setCatalog] = useState<Dress[]>(dresses)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dataSource, setDataSource] = useState<'live' | 'demo'>('demo')
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [addDressOpen, setAddDressOpen] = useState(false)
  const [editingDress, setEditingDress] = useState<Dress | null>(null)
  const [savingDress, setSavingDress] = useState(false)

  const loadLiveData = async (currentSession: Session) => {
    if (!supabase) {
      setAccess('unavailable')
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentSession.user.id)
      .maybeSingle()

    if (profileError) {
      setAccess('unavailable')
      setErrorMessage('ยังอ่านสิทธิ์ Admin จาก Supabase ไม่ได้ ตรวจสอบ migration และ RLS ก่อนใช้งานจริง')
      return
    }
    if (profile?.role !== 'admin') {
      window.location.replace('/')
      return
    }

    setAccess('allowed')
    const { data, error } = await supabase
      .from('bookings')
      .select('id, pickup_date, return_date, branch, status, dresses(name, image_url, price_per_day), profiles(display_name, email)')
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      setDataSource('demo')
      setErrorMessage('ยังอ่านข้อมูล booking จาก Supabase ไม่ได้ จึงแสดงข้อมูลตัวอย่างสำหรับดู layout')
    } else {
      const liveBookings = (data ?? []).map((row) => {
        const dress = Array.isArray(row.dresses) ? row.dresses[0] : row.dresses
        const customer = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
        const price = Number(dress?.price_per_day ?? 0)
        return {
          id: String(row.id),
          customer: customer?.display_name || customer?.email || 'ลูกค้า Vela',
          email: customer?.email || '',
          dress: dress?.name || 'ชุดจากคลัง',
          image: dress?.image_url || dresses[0].image,
          pickup: row.pickup_date,
          returnDate: row.return_date,
          branch: row.branch,
          status: row.status as BookingStatus,
          total: price,
        }
      })
      setBookings(liveBookings)
      setDataSource('live')
    }

    const { data: dressRows, error: dressError } = await supabase
      .from('dresses')
      .select('id, slug, name, designer, price_per_day, occasion, sizes, color_name, color_hex, image_url, available, description')
      .order('created_at', { ascending: false })
    if (!dressError && dressRows?.length) setCatalog(dressRows.map((row) => mapLiveDress(row)))
  }

  useEffect(() => {
    if (isPreview || !supabase) {
      if (!isPreview && !supabase) setAccess('unavailable')
      return
    }

    const client = supabase
    let mounted = true
    const bootstrap = async () => {
      const { data } = await client.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      if (!data.session) {
        setAccess('signed-out')
        return
      }
      await loadLiveData(data.session)
    }
    void bootstrap()

    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) setAccess('signed-out')
      else void loadLiveData(nextSession)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [isPreview])

  const filteredBookings = useMemo(
    () => statusFilter === 'all' ? bookings : bookings.filter((booking) => booking.status === statusFilter),
    [bookings, statusFilter],
  )
  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.status === 'pending').length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed' || booking.status === 'ready').length,
    revenue: bookings.reduce((sum, booking) => sum + booking.total, 0),
  }), [bookings])

  const updateBookingStatus = async (bookingId: string, nextStatus: BookingStatus) => {
    setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status: nextStatus } : booking))
    if (isPreview || !supabase || dataSource !== 'live') return

    setUpdatingId(bookingId)
    const { error } = await supabase.from('bookings').update({ status: nextStatus }).eq('id', bookingId)
    setUpdatingId(null)
    if (error) setErrorMessage('อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  }

  const handleLogout = async () => {
    if (supabase && !isPreview) await supabase.auth.signOut()
    window.location.replace('/')
  }

  const saveDress = async (form: NewDressForm) => {
    const price = Number(form.price)
    if (!form.name.trim() || !form.designer.trim() || !Number.isFinite(price) || price <= 0 || !form.sizes.length) {
      setErrorMessage('กรอกชื่อชุด ดีไซเนอร์ ราคา และเลือกไซซ์อย่างน้อย 1 รายการ')
      return
    }

    setSavingDress(true)
    setErrorMessage('')
    const formDress: Dress = {
      id: editingDress?.id ?? 'local-' + Date.now(),
      name: form.name.trim(),
      designer: form.designer.trim(),
      price,
      occasion: form.occasion,
      sizes: form.sizes as Dress['sizes'],
      color: form.colorHex,
      colorName: form.colorName,
      image: form.imageUrl.trim() || dresses[0].image,
      available: 'พร้อมเช่า',
      description: form.description.trim(),
    }

    const dressPayload = {
      name: formDress.name,
      designer: formDress.designer,
      price_per_day: formDress.price,
      occasion: formDress.occasion,
      sizes: formDress.sizes,
      color_name: formDress.colorName,
      color_hex: formDress.color,
      image_url: formDress.image,
      available: true,
      description: formDress.description,
    }

    if (!isPreview && access === 'allowed' && supabase) {
      const query = editingDress
        ? supabase.from('dresses').update(dressPayload).eq('id', editingDress.id)
        : supabase.from('dresses').insert({ slug: 'vela-' + Date.now(), ...dressPayload })
      const { data, error } = await query
        .select('id, name, designer, price_per_day, occasion, sizes, color_name, color_hex, image_url, available, description')
        .single()

      if (error) {
        setSavingDress(false)
        setErrorMessage(editingDress ? 'แก้ไขชุดไม่สำเร็จ ตรวจสอบตาราง dresses และสิทธิ์ RLS' : 'บันทึกชุดใหม่ไม่สำเร็จ ตรวจสอบตาราง dresses และสิทธิ์ RLS')
        return
      }
      setCatalog((current) => editingDress
        ? current.map((dress) => dress.id === editingDress.id ? mapLiveDress(data) : dress)
        : [mapLiveDress(data), ...current])
    } else {
      setCatalog((current) => editingDress
        ? current.map((dress) => dress.id === editingDress.id ? formDress : dress)
        : [formDress, ...current])
    }

    setSavingDress(false)
    setAddDressOpen(false)
    setEditingDress(null)
  }

  const toggleDressAvailability = async (dress: Dress) => {
    const nextAvailable = dress.available === 'ไม่พร้อมเช่า'
    setCatalog((current) => current.map((item) => item.id === dress.id ? { ...item, available: nextAvailable ? 'พร้อมเช่า' : 'ไม่พร้อมเช่า' } : item))
    if (isPreview || !supabase || dataSource !== 'live') return
    const { error } = await supabase.from('dresses').update({ available: nextAvailable }).eq('id', dress.id)
    if (error) {
      setCatalog((current) => current.map((item) => item.id === dress.id ? dress : item))
      setErrorMessage('อัปเดตสถานะชุดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    }
  }

  if (access !== 'allowed' && access !== 'preview') {
    return <AdminAccessState access={access} onLogin={() => void signInWithGoogle()} />
  }

  const openBookings = (filter: StatusFilter = 'all') => {
    setStatusFilter(filter)
    setView('bookings')
  }

  const openAddDress = () => {
    setEditingDress(null)
    setAddDressOpen(true)
  }

  const openEditDress = (dress: Dress) => {
    setEditingDress(dress)
    setAddDressOpen(true)
  }

  const closeDressDialog = () => {
    setAddDressOpen(false)
    setEditingDress(null)
  }

  return (
    <AdminShell
      view={view}
      sidebarOpen={sidebarOpen}
      dataSource={dataSource}
      session={session}
      errorMessage={errorMessage}
      stats={stats}
      onNavigate={setView}
      onCloseNotice={() => setErrorMessage('')}
      onToggleSidebar={setSidebarOpen}
      onLogout={() => void handleLogout()}
    >
      {view === 'overview' && (
        <OverviewView
          stats={stats}
          bookings={bookings}
          catalog={catalog}
          onOpenBookings={() => openBookings()}
          onStatClick={openBookings}
           onAddDress={openAddDress}
           onEditDress={openEditDress}
           onToggleAvailability={toggleDressAvailability}
        />
      )}
      {view === 'bookings' && (
        <BookingsView
          bookings={filteredBookings}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onStatusChange={updateBookingStatus}
          updatingId={updatingId}
        />
      )}
      {view === 'catalog' && <CatalogView catalog={catalog} onAddDress={openAddDress} onEditDress={openEditDress} onToggleAvailability={toggleDressAvailability} />}
      {addDressOpen && <DressFormDialog mode={editingDress ? 'edit' : 'add'} initialDress={editingDress} saving={savingDress} onClose={closeDressDialog} onSubmit={saveDress} />}
    </AdminShell>
  )
}

export default AdminPage
