import { useState } from 'react'
import { X } from 'lucide-react'
import { COLORS, OCCASIONS, SIZES, type Dress } from '../lib/types'
import { emptyDressForm } from './constants'
import type { NewDressForm } from './types'

const dressToForm = (dress: Dress): NewDressForm => ({
  name: dress.name,
  designer: dress.designer,
  price: String(dress.price),
  occasion: dress.occasion,
  sizes: [...dress.sizes],
  colorName: dress.colorName,
  colorHex: dress.color,
  imageUrl: dress.image,
  description: dress.description,
})

export function DressFormDialog({
  mode,
  initialDress,
  saving,
  onClose,
  onSubmit,
}: {
  mode: 'add' | 'edit'
  initialDress?: Dress | null
  saving: boolean
  onClose: () => void
  onSubmit: (form: NewDressForm) => void
}) {
  const [form, setForm] = useState<NewDressForm>(() => initialDress ? dressToForm(initialDress) : emptyDressForm())
  const isEditing = mode === 'edit'
  const title = isEditing ? 'แก้ไขข้อมูลชุด' : 'เพิ่มชุดใหม่'
  const update = <K extends keyof NewDressForm>(key: K, value: NewDressForm[K]) => setForm((current) => ({ ...current, [key]: value }))
  const toggleSize = (size: string) => update('sizes', form.sizes.includes(size) ? form.sizes.filter((item) => item !== size) : [...form.sizes, size])

  return (
    <div className="modal-backdrop admin-modal-backdrop">
      <section className="admin-form-modal" role="dialog" aria-modal="true" aria-labelledby="dress-form-title">
        <button className="modal-close" onClick={onClose} aria-label="ปิด"><X size={19} /></button>
        <span className="eyebrow">DRESS INVENTORY</span>
        <h2 id="dress-form-title">{title}</h2>
        <p className="admin-form-intro">{isEditing ? 'ปรับรายละเอียดชุดให้เป็นข้อมูลล่าสุดในคลังเช่า' : 'เพิ่มรายละเอียดชุดให้พร้อมแสดงในแคตตาล็อกและระบบเช่า'}</p>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(form) }}>
          <div className="admin-form-grid">
            <label>ชื่อชุด<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="เช่น เดรสซาตินคอวี" /></label>
            <label>ดีไซเนอร์<input required value={form.designer} onChange={(event) => update('designer', event.target.value)} placeholder="ชื่อแบรนด์ / สตูดิโอ" /></label>
            <label>ราคาเช่าต่อวัน<input required type="number" min="1" value={form.price} onChange={(event) => update('price', event.target.value)} /></label>
            <label>หมวดหมู่<select value={form.occasion} onChange={(event) => update('occasion', event.target.value as NewDressForm['occasion'])}>{OCCASIONS.map((occasion) => <option key={occasion}>{occasion}</option>)}</select></label>
            <label>สี<select value={form.colorName} onChange={(event) => { const color = COLORS.find((item) => item.name === event.target.value) ?? COLORS[0]; setForm((current) => ({ ...current, colorName: color.name, colorHex: color.value })) }}>{COLORS.map((color) => <option key={color.name}>{color.name}</option>)}</select></label>
            <label>ลิงก์รูปภาพ<input type="url" value={form.imageUrl} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://..." /></label>
          </div>
          <fieldset className="admin-size-fieldset">
            <legend>ไซซ์ที่มี</legend>
            <div>{SIZES.map((size) => <label key={size} className="admin-size-option"><input type="checkbox" checked={form.sizes.includes(size)} onChange={() => toggleSize(size)} /><span>{size}</span></label>)}</div>
          </fieldset>
          <label className="admin-description-field">รายละเอียด<textarea rows={3} value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="บอกจุดเด่นของชุดและโอกาสที่เหมาะสม" /></label>
          <div className="admin-form-actions">
            <button type="button" className="button button-outline" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="button button-dark" disabled={saving}>{saving ? 'กำลังบันทึก…' : isEditing ? 'บันทึกการแก้ไข' : 'บันทึกชุดใหม่'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}
