import { useState } from 'react'
import { ChevronDown, Plus, Search } from 'lucide-react'
import { OCCASIONS, type Dress } from '../lib/types'
import { formatBaht } from './constants'
import { AdminPanelHeading } from './AdminPanelHeading'

export function CatalogView({ compact = false, catalog, onAddDress, onEditDress, onToggleAvailability }: { compact?: boolean; catalog: Dress[]; onAddDress: () => void; onEditDress: (dress: Dress) => void; onToggleAvailability: (dress: Dress) => void }) {
  const [query, setQuery] = useState('')
  const [occasion, setOccasion] = useState('ทั้งหมด')
  const filteredDresses = catalog.filter((dress) => {
    const matchesOccasion = occasion === 'ทั้งหมด' || dress.occasion === occasion
    const searchText = (dress.name + ' ' + dress.designer + ' ' + dress.colorName).toLowerCase()
    return matchesOccasion && searchText.includes(query.trim().toLowerCase())
  })
  const visibleDresses = compact ? filteredDresses.slice(0, 6) : filteredDresses
  const catalogAction = !compact ? (
    <div className="admin-catalog-actions">
      <label className="admin-catalog-search">
        <Search size={15} />
        <input aria-label="ค้นหาชุดในคลัง" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อชุด, ดีไซเนอร์..." />
      </label>
      <button className="admin-primary-button" onClick={onAddDress}><Plus size={15} /> เพิ่มชุดใหม่</button>
    </div>
  ) : <span className="admin-muted-count">{catalog.length} ชุดทั้งหมด</span>

  return (
    <section className={'admin-panel admin-catalog-panel ' + (compact ? 'is-compact' : '')}>
      <AdminPanelHeading eyebrow="DRESS INVENTORY" title={compact ? 'ชุดในคลังล่าสุด' : 'คลังชุดเช่า'} action={catalogAction} />
      {!compact && (
        <div className="admin-inventory-toolbar">
          <div className="admin-inventory-tabs" role="tablist" aria-label="กรองหมวดหมู่คลังชุด">
            {['ทั้งหมด', ...OCCASIONS].map((item) => (
              <button key={item} className={occasion === item ? 'active' : ''} onClick={() => setOccasion(item)}>
                {item}<span>{item === 'ทั้งหมด' ? catalog.length : catalog.filter((dress) => dress.occasion === item).length}</span>
              </button>
            ))}
          </div>
          <span className="admin-muted-count">แสดง {filteredDresses.length} จาก {catalog.length} ชุด</span>
        </div>
      )}
      <div className="admin-inventory-grid">
        {visibleDresses.map((dress) => (
          <article className="admin-inventory-card" key={dress.id}>
            <img src={dress.image} alt={dress.name} />
            <div>
              <span>{dress.occasion}</span>
              <strong>{dress.name}</strong>
              <small>{formatBaht(dress.price)} / วัน · {dress.sizes.join(', ')}</small>
            </div>
            <div className="admin-inventory-card-actions"><button className={'admin-availability-toggle ' + (dress.available === 'ไม่พร้อมเช่า' ? 'is-off' : '')} onClick={() => onToggleAvailability(dress)}>{dress.available === 'ไม่พร้อมเช่า' ? 'ปิดรับเช่า' : 'พร้อมเช่า'}</button><button aria-label={'แก้ไข ' + dress.name} onClick={() => onEditDress(dress)}><ChevronDown size={15} /></button></div>
          </article>
        ))}
      </div>
      {!visibleDresses.length && <div className="admin-empty"><Search size={20} /><p>ไม่พบชุดที่ตรงกับคำค้น</p></div>}
    </section>
  )
}
