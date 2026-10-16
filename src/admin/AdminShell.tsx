import { Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Package, ShieldCheck, ShoppingBag, X } from 'lucide-react'
import type { AdminShellProps } from './types'

const viewTitles = {
  overview: 'ภาพรวมร้าน',
  bookings: 'จัดการรายการจอง',
  catalog: 'คลังชุดเช่า',
} as const

export function AdminShell({
  view,
  sidebarOpen,
  dataSource,
  session,
  errorMessage,
  stats,
  onNavigate,
  onCloseNotice,
  onToggleSidebar,
  onLogout,
  children,
}: AdminShellProps) {
  return (
    <div className="admin-shell">
      <aside className={'admin-sidebar ' + (sidebarOpen ? 'is-open' : '')}>
        <div className="admin-sidebar-top">
          <a href="/" className="admin-brand" aria-label="กลับหน้า Thawinee">
            <span>THAWINEE</span>
            <small>THAI DRESS RENTAL</small>
            <em>ADMIN STUDIO</em>
          </a>
          <button className="admin-close-sidebar" aria-label="ปิดเมนู Admin" onClick={() => onToggleSidebar(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-workspace">
          <span className="admin-avatar">V</span>
          <div><strong>Thawinee</strong><small>Hat Yai · Songkhla</small></div>
          <ChevronDown size={14} />
        </div>

        <nav className="admin-nav" aria-label="เมนู Admin">
          <button className={view === 'overview' ? 'active' : ''} onClick={() => { onNavigate('overview'); onToggleSidebar(false) }}>
            <LayoutDashboard size={17} /> ภาพรวม
          </button>
          <button className={view === 'bookings' ? 'active' : ''} onClick={() => { onNavigate('bookings'); onToggleSidebar(false) }}>
            <ShoppingBag size={17} /> รายการจอง <span>{stats.pending}</span>
          </button>
          <button className={view === 'catalog' ? 'active' : ''} onClick={() => { onNavigate('catalog'); onToggleSidebar(false) }}>
            <Package size={17} /> คลังชุด
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-security-note">
            <ShieldCheck size={17} />
            <span>สิทธิ์ Admin<br /><strong>ตรวจสอบโดย Supabase</strong></span>
          </div>
          <a href="/"><ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} /> กลับหน้าร้าน</a>
          <button className="admin-logout-button" onClick={onLogout}><LogOut size={16} /> ออกจากระบบ</button>
        </div>
      </aside>

      {sidebarOpen && <button className="admin-sidebar-scrim" aria-label="ปิดเมนู" onClick={() => onToggleSidebar(false)} />}

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-trigger" aria-label="เปิดเมนู Admin" onClick={() => onToggleSidebar(true)}>
            <Menu size={20} />
          </button>
          <div>
            <span className="eyebrow">THAWINEE / ADMIN</span>
            <h1>{viewTitles[view]}</h1>
          </div>
          <div className="admin-topbar-actions">
            <span className={'data-badge ' + (dataSource === 'live' ? 'is-live' : '')}><span />{dataSource === 'live' ? 'LIVE DATA' : 'ข้อมูลตัวอย่าง'}</span>
            <button className="admin-notification" aria-label="การแจ้งเตือน"><Bell size={17} /><i /></button>
            <button className="admin-user-menu" title={session?.user.email || 'Admin preview'}>
              <span className="admin-user-avatar">{session?.user.email?.slice(0, 1).toUpperCase() || 'V'}</span>
              <span><strong>{session?.user.email?.split('@')[0] || 'ทีม Thawinee'}</strong><small>ผู้ดูแลระบบ</small></span>
              <ChevronDown size={13} />
            </button>
            <button className="admin-logout-top" onClick={onLogout}><LogOut size={15} /> <span>ออกจากระบบ</span></button>
          </div>
        </header>

        {errorMessage && (
          <div className="admin-notice">
            <span>{errorMessage}</span>
            <button aria-label="ปิดข้อความ" onClick={onCloseNotice}><X size={15} /></button>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}
