import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Heart,
  Instagram,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { dresses } from './lib/mockData'
import { COLORS, OCCASIONS, SIZES, type Dress } from './lib/types'
import { dateAfterDaysIso, formatDateThai, isUuid, mapSupabaseDress, todayIso } from './lib/catalog'
import { signInWithGoogle, supabase } from './lib/supabase'
import { GoogleLogo } from './components/GoogleLogo'
import type { Session } from '@supabase/supabase-js'
import AdminPage from './AdminPage'

const formatBaht = (amount: number) => `฿${amount.toLocaleString('th-TH')}`

type BookingStatus = 'pending' | 'confirmed' | 'ready' | 'returned' | 'cancelled'
type CustomerBooking = {
  id: string
  pickupDate: string
  returnDate: string
  branch: string
  status: BookingStatus
  dressName: string
  image: string
  price: number
}

type UserProfile = {
  displayName: string
  email: string
  avatarUrl: string
  phone: string
}

const profileFromSession = (session: Session): UserProfile => ({
  displayName: String(session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? 'ลูกค้า Vela'),
  email: session.user.email ?? '',
  avatarUrl: String(session.user.user_metadata?.avatar_url ?? session.user.user_metadata?.picture ?? ''),
  phone: '',
})

function App() {
  const isAdminRoute = window.location.pathname === '/admin'
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null)
  const [selectedOccasion, setSelectedOccasion] = useState('ทั้งหมด')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [sort, setSort] = useState('แนะนำ')
  const [catalog, setCatalog] = useState<Dress[]>(dresses)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)
  const [booked, setBooked] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const [chatConversationId, setChatConversationId] = useState<string>()
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    { role: 'assistant', content: 'อยากได้ชุดสำหรับโอกาสไหน หรือมีวันที่ต้องการใช้ชุดแล้วคะ?' },
  ])
  const [bookingPickupDate, setBookingPickupDate] = useState(() => dateAfterDaysIso(7))
  const [bookingReturnDate, setBookingReturnDate] = useState(() => dateAfterDaysIso(8))
  const [branch, setBranch] = useState('สาขาหาดใหญ่ จังหวัดสงขลา')
  const [contactPhone, setContactPhone] = useState('')
  const [bookingNote, setBookingNote] = useState('')
  const [bookingBusy, setBookingBusy] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingAvailability, setBookingAvailability] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [bookingId, setBookingId] = useState('')
  const [myBookings, setMyBookings] = useState<CustomerBooking[]>([])
  const [myBookingsLoading, setMyBookingsLoading] = useState(false)
  const [myBookingsError, setMyBookingsError] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (!supabase) return

    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session || !supabase) {
      setProfile(null)
      setProfileOpen(false)
      return
    }
    let mounted = true
    const fallback = profileFromSession(session)
    setProfile(fallback)
    supabase
      .from('profiles')
      .select('display_name, email, avatar_url, phone')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!mounted || !data) return
        setProfile({
          displayName: String(data.display_name ?? fallback.displayName),
          email: String(data.email ?? fallback.email),
          avatarUrl: String(data.avatar_url ?? fallback.avatarUrl),
          phone: String(data.phone ?? ''),
        })
      })
    return () => { mounted = false }
  }, [session])

  useEffect(() => {
    if (!session || !supabase || isAdminRoute) return
    let mounted = true
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (mounted && data?.role === 'admin') window.location.replace('/admin')
      })
    return () => { mounted = false }
  }, [isAdminRoute, session])

  useEffect(() => {
    if (!supabase) return
    let mounted = true
    supabase
      .from('dresses')
      .select('id, name, designer, price_per_day, occasion, sizes, color_name, color_hex, image_url, available, description')
      .eq('available', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (mounted && data?.length) setCatalog(data.map((row) => mapSupabaseDress(row)))
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!selectedDress || !session || !supabase || !isUuid(selectedDress.id)) {
      setBookingAvailability('idle')
      return
    }
    if (bookingReturnDate < bookingPickupDate) {
      setBookingAvailability('unavailable')
      return
    }
    let mounted = true
    setBookingAvailability('checking')
    supabase.rpc('check_dress_availability', {
      p_dress_id: selectedDress.id,
      p_pickup_date: bookingPickupDate,
      p_return_date: bookingReturnDate,
    }).then(({ data, error }) => {
      if (mounted) setBookingAvailability(error ? 'idle' : data ? 'available' : 'unavailable')
    })
    return () => { mounted = false }
  }, [bookingPickupDate, bookingReturnDate, selectedDress, session])

  useEffect(() => {
    if (!session || !supabase) {
      setMyBookings([])
      return
    }
    let mounted = true
    setMyBookingsLoading(true)
    setMyBookingsError('')
    supabase
      .from('bookings')
      .select('id, pickup_date, return_date, branch, status, dresses(name, image_url, price_per_day)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return
        if (error) {
          setMyBookingsError('ยังโหลดรายการจองไม่ได้ ลองรีเฟรชอีกครั้งค่ะ')
        } else {
          setMyBookings((data ?? []).map((row) => {
            const dress = Array.isArray(row.dresses) ? row.dresses[0] : row.dresses
            return {
              id: String(row.id),
              pickupDate: String(row.pickup_date),
              returnDate: String(row.return_date),
              branch: String(row.branch),
              status: row.status as BookingStatus,
              dressName: String(dress?.name ?? 'ชุดจากคลัง'),
              image: String(dress?.image_url ?? dresses[0].image),
              price: Number(dress?.price_per_day ?? 0),
            }
          }))
        }
        setMyBookingsLoading(false)
      })
    return () => { mounted = false }
  }, [session])

  const filteredDresses = useMemo(() => {
    const result = catalog.filter((dress) => {
      const occasionMatch = selectedOccasion === 'ทั้งหมด' || dress.occasion === selectedOccasion
      const sizeMatch = !selectedSize || dress.sizes.includes(selectedSize as (typeof SIZES)[number])
      const colorMatch = !selectedColor || dress.colorName === selectedColor
      return occasionMatch && sizeMatch && colorMatch
    })
    return [...result].sort((a, b) => {
      if (sort === 'ราคาต่ำสุด') return a.price - b.price
      if (sort === 'ราคาสูงสุด') return b.price - a.price
      return 0
    })
  }, [catalog, selectedColor, selectedOccasion, selectedSize, sort])

  const resetFilters = () => {
    setSelectedOccasion('ทั้งหมด')
    setSelectedSize('')
    setSelectedColor('')
  }

  const handleLogin = async () => {
    if (!supabase) {
      setSignInOpen(true)
      return
    }
    await signInWithGoogle()
  }

  const handleLogout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) return
    setSignInOpen(false)
    setProfileOpen(false)
    setSelectedDress(null)
    setBooked(false)
    setBookingId('')
    setBookingError('')
    setChatConversationId(undefined)
    setChatMessages([{ role: 'assistant', content: 'อยากได้ชุดสำหรับโอกาสไหน หรือมีวันที่ต้องการใช้ชุดแล้วคะ?' }])
  }

  const saveProfile = async (displayName: string, phone: string) => {
    if (!supabase || !session) return 'กรุณาเข้าสู่ระบบใหม่อีกครั้งค่ะ'
    const cleanName = displayName.trim()
    const cleanPhone = phone.trim()
    if (!cleanName || cleanName.length > 80) return 'กรุณากรอกชื่อที่มีความยาวไม่เกิน 80 ตัวอักษรค่ะ'
    if (cleanPhone && !/^[0-9+() -]{8,20}$/.test(cleanPhone)) return 'กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้งค่ะ'
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: cleanName, phone: cleanPhone || null })
      .eq('id', session.user.id)
      .select('display_name, email, avatar_url, phone')
      .single()
    if (error) return 'บันทึกโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้งค่ะ'
    setProfile({ displayName: String(data.display_name ?? cleanName), email: String(data.email ?? session.user.email ?? ''), avatarUrl: String(data.avatar_url ?? profile?.avatarUrl ?? ''), phone: String(data.phone ?? '') })
    setProfileOpen(false)
    return null
  }

  const handleBooking = async () => {
    if (!session) {
      setSignInOpen(true)
      return
    }
    if (!selectedDress) return
    if (!supabase || !isUuid(selectedDress.id)) {
      setBookingError('ชุดนี้ยังอยู่ในโหมดตัวอย่าง กรุณาเชื่อมข้อมูลคลังชุดใน Supabase ก่อนจองจริงค่ะ')
      return
    }
    if (!contactPhone.trim() || !/^[0-9+() -]{8,20}$/.test(contactPhone.trim())) {
      setBookingError('กรุณากรอกเบอร์โทรศัพท์ที่ติดต่อได้ค่ะ')
      return
    }
    if (bookingReturnDate < bookingPickupDate) {
      setBookingError('วันที่คืนต้องไม่ก่อนวันที่รับชุดค่ะ')
      return
    }
    if (bookingAvailability === 'unavailable') {
      setBookingError('ช่วงวันนี้มีคนจองชุดนี้แล้ว ลองเปลี่ยนวันที่หรือเลือกชุดอื่นค่ะ')
      return
    }

    setBookingBusy(true)
    setBookingError('')
    const { data, error } = await supabase.rpc('create_booking', {
      p_dress_id: selectedDress.id,
      p_pickup_date: bookingPickupDate,
      p_return_date: bookingReturnDate,
      p_branch: branch,
      p_contact_phone: contactPhone.trim(),
      p_note: bookingNote.trim() || null,
    })
    setBookingBusy(false)
    if (error) {
      const message = error.message.includes('DRESS_UNAVAILABLE')
        ? 'ช่วงวันนี้มีคนจองชุดนี้แล้ว ลองเปลี่ยนวันที่หรือเลือกชุดอื่นค่ะ'
        : error.message.includes('INVALID_PHONE')
          ? 'กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้งค่ะ'
          : 'บันทึกการจองไม่สำเร็จ ลองใหม่อีกครั้งค่ะ'
      setBookingError(message)
      setBookingAvailability('unavailable')
      return
    }
    setBookingId(String(data?.id ?? ''))
    setBooked(true)
    setBookingAvailability('available')
  }

  const cancelBooking = async (id: string) => {
    if (!supabase) return
    setMyBookingsError('')
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    if (error) {
      setMyBookingsError('ยกเลิกรายการไม่สำเร็จ ลองใหม่อีกครั้งค่ะ')
      return
    }
    setMyBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status: 'cancelled' } : booking))
  }

  const getLocalStylistReply = (message: string) => {
    const text = message.toLowerCase()
    const websiteTerms = [
      'ชุด', 'เดรส', 'เช่า', 'ราคา', 'บาท', 'ไซซ์', 'สี', 'งานแต่ง', 'ราตรี', 'ออกงาน',
      'ร้านอาหาร', 'ดินเนอร์', 'ทานข้าว', 'มื้อค่ำ', 'เดต', 'อีเวนต์', 'พร้อมเช่า', 'จอง',
      'รับชุด', 'จัดส่ง', 'สาขา', 'หาดใหญ่', 'สงขลา', 'ขั้นตอนการจอง', 'วิธีจอง',
    ]
    if (!websiteTerms.some((term) => text.includes(term))) {
      return 'ขออภัยค่ะ ฉันตอบได้เฉพาะข้อมูลที่มีอยู่ในเว็บไซต์ Vela เช่น ชุด ราคา ไซซ์ สี ความพร้อมเช่า สาขา และขั้นตอนการจองค่ะ'
    }
    const bookingIntent = text.includes('ขั้นตอนการจอง') || text.includes('วิธีจอง') || text.includes('เริ่มจอง') || (text.includes('ขั้นตอน') && text.includes('จอง'))
    if (bookingIntent) {
      return 'ขั้นตอนการจอง Vela: 1) เลือกชุดที่ชอบและดูรายละเอียดไซซ์ 2) เลือกวันที่ต้องการใช้งาน 3) เลือกจุดรับชุด ได้แก่ สาขาหาดใหญ่ จังหวัดสงขลา หรือจัดส่งถึงบ้าน 4) กดเริ่มจองและเข้าสู่ระบบเพื่อยืนยันคำขอ 5) รับชุดที่ร้านหรือตามช่องทางจัดส่ง และคืนตามวันที่นัดหมายค่ะ'
    }
    if (text.includes('สาขา') || text.includes('รับชุด') || text.includes('จัดส่ง')) {
      return 'Vela มีจุดรับชุดที่สาขาหาดใหญ่ จังหวัดสงขลา และมีบริการจัดส่งถึงบ้านค่ะ'
    }
    const restaurantIntent = ['ร้านอาหาร', 'ดินเนอร์', 'ทานข้าว', 'มื้อค่ำ', 'เดต'].some((keyword) => text.includes(keyword))
    const occasion = text.includes('งานแต่ง')
      ? 'ชุดไปงานแต่ง'
      : text.includes('ราตรี') || text.includes('กลางคืน')
        ? 'ชุดราตรี'
        : text.includes('ออกงาน') || text.includes('อีเวนต์')
          ? 'ชุดออกงาน'
          : ''
    const size = SIZES.find((item) => text.includes(item.toLowerCase()))
    const recommendationIntent = restaurantIntent || Boolean(occasion) || Boolean(size) || text.includes('ชุด') || text.includes('เดรส') || text.includes('สี')
    if (!recommendationIntent) {
      return 'ฉันช่วยแนะนำชุดได้ค่ะ กรุณาระบุโอกาส ไซซ์ สี หรือชื่อชุดจากเว็บไซต์ Vela เพื่อให้แนะนำได้ตรงข้อมูลค่ะ'
    }
    const matches = catalog.filter((dress) => {
      const occasionMatch = restaurantIntent || !occasion || dress.occasion === occasion
      const sizeMatch = !size || dress.sizes.includes(size)
      return occasionMatch && sizeMatch
    }).sort((a, b) => {
      if (!restaurantIntent) return 0
      const score = (dress: Dress) => {
        const description = dress.description.toLowerCase()
        return (description.includes('ดินเนอร์') ? 3 : 0) + (description.includes('กลางคืน') ? 2 : 0) + (dress.occasion === 'ชุดออกงาน' ? 1 : 0)
      }
      return score(b) - score(a)
    }).slice(0, 2)

    if (!matches.length) {
      return 'ลองบอกโอกาส ไซซ์ หรือโทนสีที่ชอบเพิ่มได้เลยค่ะ เช่น “งานแต่งกลางวัน ไซซ์ M โทนชมพู” แล้วฉันจะช่วยคัดชุดให้ค่ะ'
    }

    const names = matches.map((dress) => `${dress.name} (${formatBaht(dress.price)}/วัน)`).join(' และ ')
    const context = [restaurantIntent ? 'ลุคไปร้านอาหาร' : occasion, size ? `ไซซ์ ${size}` : ''].filter(Boolean).join(' ')
    return `ถ้าเป็น${context || 'ลุคที่คุณกำลังมองหา'} ฉันแนะนำ ${names} ค่ะ ลองกดที่การ์ดเพื่อดูรายละเอียดและเลือกวันใช้งานได้เลย`
  }

  const sendChat = async () => {
    const message = chatInput.trim()
    if (!message || chatBusy) return
    setChatInput('')
    setChatMessages((current) => [...current, { role: 'user', content: message }])
    setChatBusy(true)
    if (!session) {
      setChatMessages((current) => [...current, { role: 'assistant', content: getLocalStylistReply(message) }])
      setChatBusy(false)
      return
    }
    if (!supabase) {
      setChatMessages((current) => [...current, { role: 'assistant', content: 'เข้าสู่ระบบด้วย Google ก่อน เพื่อให้ฉันช่วยจำบทสนทนาและแนะนำชุดให้ตรงกับคุณนะคะ' }])
      setChatBusy(false)
      return
    }
    const { data, error } = await supabase.functions.invoke('chat', { body: { message, conversation_id: chatConversationId } })
    setChatMessages((current) => [...current, { role: 'assistant', content: error ? 'ตอนนี้ผู้ช่วยไม่พร้อมใช้งาน ลองใหม่อีกครั้งได้เลยค่ะ' : data.reply }])
    if (data?.conversation_id) setChatConversationId(data.conversation_id)
    setChatBusy(false)
  }

  if (isAdminRoute) return <AdminPage />

  return (
    <div className="site-shell">
      <a className="skip-link" href="#catalog">ข้ามไปยังชุดทั้งหมด</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Vela Rental หน้าหลัก">VELA</a>
        <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="เมนูหลัก">
          <a href="#catalog" onClick={() => setMobileMenuOpen(false)}>ชุดราตรี</a>
          <a href="#catalog" onClick={() => setMobileMenuOpen(false)}>ชุดออกงาน</a>
          <a href="#catalog" onClick={() => setMobileMenuOpen(false)}>ชุดไปงานแต่ง</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>วิธีเช่า</a>
        </nav>
        <div className="header-actions">
          {session ? <><button className="profile-trigger" onClick={() => setProfileOpen(true)} aria-label="เปิดโปรไฟล์"><span className="profile-avatar">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : (profile?.displayName?.charAt(0) ?? 'V')}</span><span className="profile-trigger-copy"><strong>{profile?.displayName || 'บัญชีของฉัน'}</strong><small>{profile?.email || session.user.email}</small></span></button><a className="text-action hide-mobile" href="#my-bookings"><CircleUserRound size={16} strokeWidth={1.5} /> การจองของฉัน</a><button className="text-action logout-action" onClick={() => void handleLogout()}><LogOut size={16} strokeWidth={1.5} /><span>ออกจากระบบ</span></button></> : <button className="text-action hide-mobile" onClick={handleLogin}><CircleUserRound size={16} strokeWidth={1.5} /> เข้าสู่ระบบ</button>}
          <button className="icon-button menu-toggle" aria-label="เปิดเมนู" onClick={() => setMobileMenuOpen((value) => !value)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <img src="/assets/vela-hero.png" alt="นางแบบสวมชุดราตรีสีเขียวเข้มในสตูดิโอ" />
          <div className="hero-copy">
            <h1 id="hero-title">เช่าชุดที่ทำให้<br />วันสำคัญของคุณ<br />พิเศษขึ้น</h1>
            <p>ชุดที่คัดมาเพื่อค่ำคืนที่อยากจดจำ<br />เริ่มต้นที่ ฿1,600 / วัน</p>
            <a className="button button-dark" href="#catalog">ดูชุดทั้งหมด <ArrowRight size={17} /></a>
          </div>
        </section>

        <section className="category-strip" aria-label="หมวดหมู่ชุด">
          <span className="eyebrow">เลือกตามโอกาส</span>
          {['ทั้งหมด', ...OCCASIONS].map((occasion) => (
            <button key={occasion} className={selectedOccasion === occasion ? 'category-link active' : 'category-link'} onClick={() => setSelectedOccasion(occasion)}>
              {occasion}
            </button>
          ))}
        </section>

        <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
          <div className="catalog-heading">
            <div>
              <span className="eyebrow">CURATED FOR YOU</span>
              <h2 id="catalog-title">ชุดพร้อมเช่าวันนี้</h2>
            </div>
            <p className="catalog-count">{filteredDresses.length} ลุคที่พร้อมให้คุณเลือก</p>
          </div>

          <div className="catalog-layout">
            <aside className={`filter-rail ${mobileFiltersOpen ? 'is-open' : ''}`} aria-label="ตัวกรองชุด">
              <div className="filter-mobile-heading">
                <strong>ตัวกรอง</strong>
                <button className="icon-button" aria-label="ปิดตัวกรอง" onClick={() => setMobileFiltersOpen(false)}><X size={18} /></button>
              </div>
              <FilterGroup title="โอกาส">
                {['ทั้งหมด', ...OCCASIONS].map((occasion) => <FilterOption key={occasion} label={occasion} checked={selectedOccasion === occasion} onChange={() => setSelectedOccasion(occasion)} />)}
              </FilterGroup>
              <FilterGroup title="ไซซ์">
                {SIZES.map((size) => <FilterOption key={size} label={size} checked={selectedSize === size} onChange={() => setSelectedSize(selectedSize === size ? '' : size)} />)}
              </FilterGroup>
              <FilterGroup title="สี">
                <div className="color-options">
                  {COLORS.map((color) => <button key={color.name} className={`color-swatch ${selectedColor === color.name ? 'selected' : ''}`} style={{ backgroundColor: color.value }} aria-label={color.name} onClick={() => setSelectedColor(selectedColor === color.name ? '' : color.name)}><Check size={12} /></button>)}
                </div>
              </FilterGroup>
              <button className="clear-filter" onClick={resetFilters}>ล้างตัวกรอง</button>
            </aside>

            <div className="catalog-results">
              <div className="catalog-toolbar">
                <button className="filter-trigger" onClick={() => setMobileFiltersOpen(true)}><SlidersHorizontal size={15} /> ตัวกรอง</button>
                <div className="result-toolbar-right">
                  <span className="result-count">{filteredDresses.length} ลุค</span>
                  <label className="sort-control">เรียงตาม
                    <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="เรียงสินค้า">
                      <option>แนะนำ</option>
                      <option>ราคาต่ำสุด</option>
                      <option>ราคาสูงสุด</option>
                    </select>
                    <ChevronDown size={15} />
                  </label>
                </div>
              </div>
              {filteredDresses.length ? <div className="product-grid">{filteredDresses.map((dress) => <ProductCard key={dress.id} dress={dress} selected={selectedDress?.id === dress.id} onSelect={() => setSelectedDress(dress)} />)}</div> : <EmptyState onReset={resetFilters} />}
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-heading"><span className="eyebrow">HOW IT WORKS</span><h2>เช่าง่าย ได้ชุดที่ใช่</h2></div>
          <div className="how-steps">
            <Step number="01" title="เลือกชุดที่ชอบ" description="ดูภาพจริงและรายละเอียดไซซ์ของชุดแต่ละแบบ" />
            <Step number="02" title="ระบุวันและสาขา" description="เลือกวันที่ต้องการใช้งานและจุดรับชุดที่สะดวก" />
            <Step number="03" title="พร้อมออกงาน" description="รับชุดที่ร้าน ลองไซซ์ และคืนตามวันที่นัดหมาย" />
          </div>
        </section>

        <RentalInfoSection />
        {session && <BookingHistorySection bookings={myBookings} loading={myBookingsLoading} error={myBookingsError} onCancel={cancelBooking} />}
      </main>

      {selectedDress && <BookingTray dress={selectedDress} pickupDate={bookingPickupDate} returnDate={bookingReturnDate} branch={branch} phone={contactPhone} note={bookingNote} requiresLogin={!session} busy={bookingBusy} error={bookingError} availability={bookingAvailability} onPickupDateChange={setBookingPickupDate} onReturnDateChange={setBookingReturnDate} onBranchChange={setBranch} onPhoneChange={setContactPhone} onNoteChange={setBookingNote} onBook={() => void handleBooking()} onClose={() => { setSelectedDress(null); setBookingError('') }} />}
      {booked && <BookingConfirmation dress={selectedDress} bookingId={bookingId} pickupDate={bookingPickupDate} returnDate={bookingReturnDate} branch={branch} onClose={() => { setBooked(false); setSelectedDress(null); setBookingId(''); setBookingNote(''); setContactPhone('') }} />}
      {signInOpen && <SignInDialog onClose={() => setSignInOpen(false)} onContinue={handleLogin} />}
      {profileOpen && profile && <ProfileDialog profile={profile} onClose={() => setProfileOpen(false)} onSave={saveProfile} />}
      <ChatWidget open={chatOpen} messages={chatMessages} input={chatInput} busy={chatBusy} onToggle={() => setChatOpen((value) => !value)} onInput={setChatInput} onSend={sendChat} />
      <Footer />
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="filter-group"><div className="filter-group-title"><span>{title}</span><ChevronDown size={15} /></div>{children}</div>
}

function FilterOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return <label className="filter-option"><input type="checkbox" checked={checked} onChange={onChange} /><span className="fake-checkbox">{checked && <Check size={12} />}</span><span>{label}</span></label>
}

function ProductCard({ dress, selected, onSelect }: { dress: Dress; selected: boolean; onSelect: () => void }) {
  return <article className={`product-card ${selected ? 'selected' : ''}`}>
    <button className="product-image-button" aria-label={`ดูรายละเอียด ${dress.name}`} onClick={onSelect}>
      <img src={dress.image} alt={dress.name} loading="lazy" />
      <span className="product-quick-view">ดูรายละเอียด <ArrowRight size={14} /></span>
      <span className="heart-button" aria-hidden="true"><Heart size={17} strokeWidth={1.4} /></span>
    </button>
    <button className="product-info" onClick={onSelect}>
      <span className="product-name">{dress.name}</span>
      <span className="product-designer">{dress.designer}</span>
      <span className="product-meta"><strong>{formatBaht(dress.price)} / วัน</strong><span>{dress.available}</span></span>
    </button>
  </article>
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return <div className="empty-state"><Search size={20} /><h3>ยังไม่พบชุดในตัวกรองนี้</h3><p>ลองเลือกตัวกรองอื่นเพื่อดูชุดที่พร้อมเช่า</p><button className="button button-outline" onClick={onReset}>ล้างตัวกรอง</button></div>
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="step"><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></div>
}

function RentalInfoSection() {
  return <section className="rental-info-section" id="rental-info" aria-labelledby="rental-info-title">
    <div className="rental-info-heading"><span className="eyebrow">RENTAL GUIDE</span><h2 id="rental-info-title">ข้อมูลก่อนเช่า</h2><p>รายละเอียดสำคัญที่ช่วยให้เตรียมตัวได้ง่ายขึ้น</p></div>
    <div className="rental-info-grid">
      <article><strong>ราคาและระยะเวลา</strong><p>ราคาที่แสดงเป็นค่าเช่าต่อวัน เลือกวันรับและวันคืนให้ตรงกับช่วงเวลาที่ต้องการใช้งาน</p></article>
      <article><strong>รับชุดที่ไหน</strong><p>รับชุดได้ที่สาขาหาดใหญ่ จังหวัดสงขลา หรือเลือกจัดส่งถึงบ้านในขั้นตอนการจอง</p></article>
      <article><strong>วันรับและคืน</strong><p>ลองไซซ์และตรวจสภาพชุดเมื่อรับสินค้า จากนั้นคืนตามวันที่นัดหมายในรายการจอง</p></article>
    </div>
  </section>
}

const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: 'รอตรวจสอบ',
  confirmed: 'ยืนยันแล้ว',
  ready: 'พร้อมรับชุด',
  returned: 'คืนแล้ว',
  cancelled: 'ยกเลิก',
}

function BookingHistorySection({ bookings, loading, error, onCancel }: { bookings: CustomerBooking[]; loading: boolean; error: string; onCancel: (id: string) => void }) {
  return <section className="account-section" id="my-bookings" aria-labelledby="my-bookings-title">
    <div className="account-heading"><div><span className="eyebrow">MY VELA</span><h2 id="my-bookings-title">การจองของฉัน</h2></div><span className="account-count">{bookings.length} รายการ</span></div>
    {error && <p className="inline-error" role="alert">{error}</p>}
    {loading ? <div className="account-empty"><p>กำลังโหลดรายการจอง…</p></div> : bookings.length ? <div className="booking-history-grid">{bookings.map((booking) => <article className="booking-history-card" key={booking.id}><img src={booking.image} alt={booking.dressName} /><div className="booking-history-content"><div className="booking-history-top"><strong>{booking.dressName}</strong><span className={'booking-status status-' + booking.status}>{bookingStatusLabels[booking.status]}</span></div><p>{formatDateThai(booking.pickupDate)} – {formatDateThai(booking.returnDate)}</p><small>{booking.branch} · {formatBaht(booking.price)} / วัน</small>{(booking.status === 'pending' || booking.status === 'confirmed') && <button className="text-action booking-cancel" onClick={() => { if (window.confirm('ต้องการยกเลิกรายการจองนี้หรือไม่')) onCancel(booking.id) }}>ยกเลิกรายการ</button>}</div></article>)}</div> : <div className="account-empty"><p>ยังไม่มีรายการจองในบัญชีนี้</p><a className="button button-outline" href="#catalog">เลือกชุดเพื่อเริ่มจอง</a></div>}
  </section>
}

function BookingTray({ dress, pickupDate, returnDate, branch, phone, note, requiresLogin, busy, error, availability, onPickupDateChange, onReturnDateChange, onBranchChange, onPhoneChange, onNoteChange, onBook, onClose }: { dress: Dress; pickupDate: string; returnDate: string; branch: string; phone: string; note: string; requiresLogin: boolean; busy: boolean; error: string; availability: 'idle' | 'checking' | 'available' | 'unavailable'; onPickupDateChange: (value: string) => void; onReturnDateChange: (value: string) => void; onBranchChange: (value: string) => void; onPhoneChange: (value: string) => void; onNoteChange: (value: string) => void; onBook: () => void; onClose: () => void }) {
  const availabilityLabel = availability === 'checking' ? 'กำลังตรวจวันว่าง…' : availability === 'available' ? 'ช่วงวันนี้ยังว่าง' : availability === 'unavailable' ? 'ช่วงวันนี้ไม่ว่าง' : 'เลือกวันเพื่อเช็กคิวชุด'
  return <aside className="booking-tray" aria-label="สรุปการจอง">
    <div className="booking-dress"><img src={dress.image} alt="" /><div><span>เลือกชุดแล้ว · {dress.occasion}</span><strong>{dress.name}</strong><small>{formatBaht(dress.price)} / วัน · ไซซ์ {dress.sizes.join(', ')}</small><p>{dress.description}</p></div></div>
    <div className="booking-field"><CalendarDays size={18} /><label>วันที่รับชุด<input type="date" min={todayIso()} value={pickupDate} onChange={(event) => onPickupDateChange(event.target.value)} /></label></div>
    <div className="booking-field"><CalendarDays size={18} /><label>วันที่คืนชุด<input type="date" min={pickupDate || todayIso()} value={returnDate} onChange={(event) => onReturnDateChange(event.target.value)} /></label></div>
    <div className="booking-field"><MapPin size={18} /><label>จุดรับชุด<select value={branch} onChange={(event) => onBranchChange(event.target.value)}><option>สาขาหาดใหญ่ จังหวัดสงขลา</option><option>จัดส่งถึงบ้าน</option></select></label><ChevronDown size={16} /></div>
    <div className="booking-contact"><label><Phone size={15} /> เบอร์โทรศัพท์สำหรับติดต่อ<input type="tel" value={phone} onChange={(event) => onPhoneChange(event.target.value)} placeholder="08x-xxx-xxxx" /></label><label>หมายเหตุเพิ่มเติม<textarea rows={1} maxLength={500} value={note} onChange={(event) => onNoteChange(event.target.value)} placeholder="เช่น ต้องการรับช่วงเช้า" /></label></div>
    <div className={'booking-availability ' + (availability === 'available' ? 'is-available' : availability === 'unavailable' ? 'is-unavailable' : '')}>{availabilityLabel}</div>
    {error && <p className="booking-error" role="alert">{error}</p>}
    <button className="button button-dark booking-submit" onClick={onBook} disabled={busy || availability === 'unavailable'}>{busy ? 'กำลังบันทึก…' : requiresLogin ? 'เข้าสู่ระบบเพื่อจอง' : 'เริ่มจอง'} <ArrowRight size={17} /></button>
    <button className="booking-close" aria-label="ยกเลิกการเลือกชุด" onClick={onClose}><X size={17} /></button>
  </aside>
}

function BookingConfirmation({ dress, bookingId, pickupDate, returnDate, branch, onClose }: { dress: Dress | null; bookingId: string; pickupDate: string; returnDate: string; branch: string; onClose: () => void }) {
  if (!dress) return null
  return <div className="modal-backdrop" role="presentation"><section className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title"><button className="modal-close" onClick={onClose} aria-label="ปิด"><X size={19} /></button><div className="success-mark"><Check size={22} /></div><span className="eyebrow">REQUEST RECEIVED</span><h2 id="confirmation-title">ส่งคำขอจองแล้ว</h2><p>{dress.name} · {formatDateThai(pickupDate)} – {formatDateThai(returnDate)}<br />{branch}<br />ทีม Vela จะติดต่อกลับเพื่อยืนยันรายละเอียด</p>{bookingId && <small className="confirmation-id">รหัสการจอง {bookingId.slice(0, 8).toUpperCase()}</small>}<button className="button button-dark" onClick={onClose}>ดูชุดต่อ <ArrowRight size={17} /></button></section></div>
}

function ProfileDialog({ profile, onClose, onSave }: { profile: UserProfile; onClose: () => void; onSave: (displayName: string, phone: string) => Promise<string | null> }) {
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [phone, setPhone] = useState(profile.phone)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const initial = profile.displayName.trim().charAt(0) || 'V'

  const submit = async () => {
    setBusy(true)
    setError('')
    const message = await onSave(displayName, phone)
    setBusy(false)
    if (message) setError(message)
  }

  return <div className="modal-backdrop" role="presentation"><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title"><button className="modal-close" onClick={onClose} aria-label="ปิด"><X size={19} /></button><div className="profile-modal-heading"><span className="profile-modal-avatar">{profile.avatarUrl ? <img src={profile.avatarUrl} alt="รูปโปรไฟล์" /> : initial}</span><div><span className="eyebrow">MY PROFILE</span><h2 id="profile-title">โปรไฟล์ของฉัน</h2></div></div><div className="profile-email"><span>อีเมล</span><strong>{profile.email}</strong><small>อีเมลจาก Google ไม่สามารถแก้ไขได้</small></div><label className="profile-field">ชื่อที่แสดง<input value={displayName} maxLength={80} onChange={(event) => setDisplayName(event.target.value)} placeholder="ชื่อของคุณ" /></label><label className="profile-field">เบอร์โทรศัพท์<input type="tel" value={phone} maxLength={20} onChange={(event) => setPhone(event.target.value)} placeholder="08x-xxx-xxxx" /></label>{error && <p className="profile-error" role="alert">{error}</p>}<div className="profile-actions"><button className="button button-outline" onClick={onClose} disabled={busy}>ยกเลิก</button><button className="button button-dark" onClick={() => void submit()} disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึกโปรไฟล์'}</button></div></section></div>
}

function SignInDialog({ onClose, onContinue }: { onClose: () => void; onContinue: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="signin-modal" role="dialog" aria-modal="true" aria-labelledby="signin-title"><button className="modal-close" onClick={onClose} aria-label="ปิด"><X size={19} /></button><CircleUserRound size={25} strokeWidth={1.3} /><h2 id="signin-title">เข้าสู่ระบบ Vela</h2><p>เข้าสู่ระบบเพื่อบันทึกการจอง ตรวจสอบวันว่าง และดูรายการจองของคุณได้ทุกเวลา</p><button className="google-button" onClick={onContinue}><GoogleLogo /> ดำเนินการต่อด้วย Google</button><button className="text-action" onClick={onClose}>ไว้ทีหลัง</button></section></div>
}

function ChatWidget({ open, messages, input, busy, onToggle, onInput, onSend }: { open: boolean; messages: Array<{ role: 'assistant' | 'user'; content: string }>; input: string; busy: boolean; onToggle: () => void; onInput: (value: string) => void; onSend: () => void }) {
  return <div className={`chat-widget ${open ? 'is-open' : ''}`}>
    {open && <section className="chat-panel" aria-label="ผู้ช่วยเลือกชุด"><div className="chat-header"><div><strong>Vela Stylist</strong><span>ช่วยเลือกชุดให้คุณ</span></div><button className="icon-button" onClick={onToggle} aria-label="ปิดผู้ช่วย"><X size={17} /></button></div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>)}{busy && <div className="chat-message assistant">กำลังคิดให้คุณอยู่…</div>}</div><form className="chat-form" onSubmit={(event) => { event.preventDefault(); onSend() }}><input aria-label="พิมพ์คำถาม" value={input} onChange={(event) => onInput(event.target.value)} placeholder="เช่น งานแต่งกลางวัน ไซซ์ M" /><button type="submit" aria-label="ส่งข้อความ" disabled={!input.trim() || busy}><ArrowRight size={16} /></button></form></section>}
    <button className="chat-launcher" onClick={onToggle} aria-label={open ? 'ปิดผู้ช่วยเลือกชุด' : 'เปิดผู้ช่วยเลือกชุด'}><MessageCircle size={17} /> <span>ช่วยเลือกชุด</span></button>
  </div>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-brand"><span className="wordmark">VELA</span><p>ชุดที่ทำให้ทุกช่วงเวลาของคุณพิเศษขึ้น</p></div><div className="footer-links"><div><strong>ช่วยเหลือ</strong><a href="#how-it-works">วิธีเช่า</a><a href="#catalog">คู่มือไซซ์</a><a href="#catalog">คำถามที่พบบ่อย</a></div><div><strong>เกี่ยวกับเรา</strong><a href="#top">เรื่องราวของ Vela</a><a href="#catalog">สาขาของเรา</a><a href="#top">ติดต่อเรา</a></div></div><div className="footer-social"><span>ติดตามเรา</span><a href="#top" aria-label="Instagram"><Instagram size={18} /></a><a href="#top" aria-label="Facebook"><MessageCircle size={18} /></a></div><div className="footer-bottom"><span>© 2026 VELA RENTAL</span><span>เงื่อนไขการเช่า · ความเป็นส่วนตัว</span></div></footer>
}

export default App
