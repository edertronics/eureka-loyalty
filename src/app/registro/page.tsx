'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const GREEN  = '#00C896'
const TEAL   = '#063f3a'
const CARBON = '#111111'
const FONT_STACK = `'HKGroteskWide', system-ui, -apple-system, sans-serif`
const SYS = `system-ui, -apple-system, sans-serif`

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55
}

function hexToRgba(hex: string, alpha: number): string {
  const c = (hex || '#000000').replace('#', '').padEnd(6, '0')
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const BRAND_COLORS = [
  { label: 'Morado',  value: '#6366f1' },
  { label: 'Azul',    value: '#3b82f6' },
  { label: 'Verde',   value: '#10b981' },
  { label: 'Rojo',    value: '#ef4444' },
  { label: 'Naranja', value: '#ea580c' },
  { label: 'Café',    value: '#92400e' },
  { label: 'Rosa',    value: '#ec4899' },
  { label: 'Negro',   value: '#1a1a1a' },
]
const ACCENT_COLORS = [
  { label: 'Dorado',  value: '#f59e0b' },
  { label: 'Naranja', value: '#fb923c' },
  { label: 'Coral',   value: '#f43f5e' },
  { label: 'Lima',    value: '#a3e635' },
  { label: 'Menta',   value: '#34d399' },
  { label: 'Cian',    value: '#38bdf8' },
  { label: 'Lavanda', value: '#c084fc' },
  { label: 'Blanco',  value: '#f8fafc' },
]

/* ── Phone mockup — replica exacta del pase de Wallet ── */
function IPhoneWalletPreview({ primaryColor, accentColor, name, logoPreview, stampGoal, rewardDescription, stripImage, stripFocalPoint, stripScale, logoSize, logoTint }: {
  primaryColor: string; accentColor: string; name: string
  logoPreview: string | null; stampGoal: number; rewardDescription: string
  stripImage: string | null; stripFocalPoint: string; stripScale: number; logoSize: number; logoTint?: string
}) {
  const FRAME_W = 300, FRAME_H = 620, BEZEL = 13
  const SCREEN_W = FRAME_W - BEZEL * 2
  const STRIP_H = Math.round((SCREEN_W - 24) * 144 / 375)
  const qrDot = isColorDark(primaryColor) ? 'ffffff' : '000000'
  const qrBg = primaryColor.replace('#', '')

  return (
    <div style={{ position: 'relative', width: FRAME_W, height: FRAME_H, flexShrink: 0 }}>
      {/* Frame */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 48, background: 'linear-gradient(145deg,#2d2d2d 0%,#1a1a1a 40%,#252525 100%)', boxShadow: '0 60px 120px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.08),inset 0 1px 0 rgba(255,255,255,0.1)' }} />
      {/* Buttons */}
      <div style={{ position: 'absolute', left: -3, top: 100, width: 4, height: 28, borderRadius: '2px 0 0 2px', background: '#2a2a2a' }} />
      <div style={{ position: 'absolute', left: -3, top: 138, width: 4, height: 56, borderRadius: '2px 0 0 2px', background: '#2a2a2a' }} />
      <div style={{ position: 'absolute', left: -3, top: 204, width: 4, height: 56, borderRadius: '2px 0 0 2px', background: '#2a2a2a' }} />
      <div style={{ position: 'absolute', right: -3, top: 170, width: 4, height: 76, borderRadius: '0 2px 2px 0', background: '#2a2a2a' }} />
      {/* Screen */}
      <div style={{ position: 'absolute', top: BEZEL, left: BEZEL, width: SCREEN_W, height: FRAME_H - BEZEL * 2, borderRadius: 36, backgroundColor: '#1c1c1e', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Status bar */}
        <div style={{ position: 'relative', height: 54, flexShrink: 0, display: 'flex', alignItems: 'flex-end', paddingBottom: 8, paddingLeft: 18, paddingRight: 14 }}>
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 90, height: 26, background: '#000', borderRadius: 14 }} />
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700, fontFamily: SYS }}>9:41</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="7" width="2" height="3" rx="0.5" fill="white"/><rect x="3" y="5" width="2" height="5" rx="0.5" fill="white"/><rect x="6" y="3" width="2" height="7" rx="0.5" fill="white"/><rect x="9" y="1" width="2" height="9" rx="0.5" fill="white"/></svg>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><circle cx="6.5" cy="9" r="1" fill="white"/><path d="M3.2 6a4.7 4.7 0 0 1 6.6 0" stroke="white" strokeWidth="1.3" strokeLinecap="round"/><path d="M1 3.8a7.5 7.5 0 0 1 11 0" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div style={{ width: 23, height: 11, borderRadius: 3, border: '1.5px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', padding: 1.5 }}>
                <div style={{ width: '82%', height: '100%', background: 'white', borderRadius: 1.5 }} />
              </div>
            </div>
          </div>
        </div>
        {/* Nav bar */}
        <div style={{ height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"><polyline points="7 1 1 6.5 7 12"/></svg>
            <span style={{ fontSize: 14, color: '#007AFF', fontFamily: SYS }}>Tarjetas</span>
          </div>
          <span style={{ color: 'white', fontSize: 15, fontWeight: 700, fontFamily: SYS }}>Tarjetas</span>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </div>
        {/* Wallet scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 24px' }}>
          {/* Loyalty card */}
          <div style={{ borderRadius: 16, background: primaryColor, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'background 0.4s' }}>
            {/* Header: logo + sellos */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 6px' }}>
              {logoPreview
                ? logoTint
                  ? <div style={{ height: Math.round(22 * logoSize), width: Math.round(80 * logoSize), background: logoTint, WebkitMaskImage: `url(${logoPreview})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'left center', maskImage: `url(${logoPreview})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'left center', transition: 'height 0.15s', flexShrink: 0 }} />
                  : <img src={logoPreview} alt="" style={{ height: Math.round(22 * logoSize), maxWidth: `${Math.min(44 * logoSize, 70)}%`, objectFit: 'contain', display: 'block', transition: 'height 0.15s' }} />
                : <span style={{ color: 'white', fontWeight: 900, fontSize: 10, lineHeight: 1.2, fontFamily: SYS }}>{name || 'Tu negocio'}</span>
              }
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: SYS }}>SELLOS</div>
                <div style={{ color: 'white', fontSize: 15, fontWeight: 900, lineHeight: 1, fontFamily: SYS }}>0/{stampGoal}</div>
              </div>
            </div>
            {/* Strip image */}
            <div style={{ position: 'relative', width: '100%', height: STRIP_H, overflow: 'hidden', background: hexToRgba(primaryColor, 0.6), flexShrink: 0 }}>
              {stripImage
                ? <img src={stripImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: stripFocalPoint, transform: `scale(${stripScale})`, transformOrigin: stripFocalPoint, display: 'block' }} />
                : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7, fontFamily: SYS }}>imagen del negocio</span>
                  </div>
              }
              {/* Customer name overlay */}
              <div style={{ position: 'absolute', bottom: 8, left: 12 }}>
                <div style={{ color: 'white', fontWeight: 900, fontSize: 17, lineHeight: 1, textShadow: '0 1px 8px rgba(0,0,0,0.7)', fontFamily: SYS }}>Cliente</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 6, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2, fontFamily: SYS }}>CLIENTE</div>
              </div>
            </div>
            {/* Programa / Premio */}
            <div style={{ display: 'flex', gap: 12, padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1, fontFamily: SYS }}>PROGRAMA</div>
                <div style={{ color: 'white', fontSize: 8, fontWeight: 700, lineHeight: 1.3, fontFamily: SYS }}>{name || 'Tu programa'}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 1, fontFamily: SYS }}>PREMIO</div>
                <div style={{ color: accentColor, fontSize: 8, fontWeight: 700, lineHeight: 1.3, fontFamily: SYS }}>{rewardDescription || 'Premio especial'}</div>
              </div>
            </div>
            {/* QR */}
            <div style={{ background: primaryColor, padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=easyloyalty-preview&size=100x100&color=${qrDot}&bgcolor=${qrBg}&qzone=1`} alt="QR" style={{ width: 76, height: 76 }} />
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: SYS }}>Easy Loyalty Program</span>
            </div>
          </div>
          {/* iOS stacked card effect */}
          <div style={{ marginTop: -8, marginLeft: 12, marginRight: 12, height: 16, borderRadius: '0 0 12px 12px', background: `${primaryColor}aa` }} />
          <div style={{ marginTop: -4, marginLeft: 24, marginRight: 24, height: 14, borderRadius: '0 0 10px 10px', background: `${primaryColor}55` }} />
        </div>
        {/* Home bar */}
        <div style={{ height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </div>
  )
}

/* ── Strip dragger — arrastra para reencuadrar la imagen ── */
function StripDragger({ src, focalPoint, scale, onFocalChange, onScaleChange, onChangeFile, onRemove }: {
  src: string; focalPoint: string; scale: number
  onFocalChange: (v: string) => void; onScaleChange: (v: number) => void
  onChangeFile: (e: React.ChangeEvent<HTMLInputElement>) => void; onRemove: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ active: boolean; startX: number; startY: number; startFX: number; startFY: number } | null>(null)
  const pinch = useRef<{ startDist: number; startScale: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const cb = useRef({ onFocalChange, onScaleChange, focalPoint, scale })
  cb.current = { onFocalChange, onScaleChange, focalPoint, scale }

  const parseFocal = (fp: string) => {
    const [x = '50', y = '50'] = fp.split(' ')
    return { x: parseFloat(x), y: parseFloat(y) }
  }
  const getSensitivity = (currentScale: number) => {
    if (!containerRef.current || !imgRef.current) return { x: 0.3, y: 0.3 }
    const img = imgRef.current
    if (!img.naturalWidth) return { x: 0.3, y: 0.3 }
    const cW = containerRef.current.offsetWidth, cH = containerRef.current.offsetHeight
    const baseScale = Math.max(cW / img.naturalWidth, cH / img.naturalHeight) * currentScale
    const overflowX = img.naturalWidth * baseScale - cW
    const overflowY = img.naturalHeight * baseScale - cH
    return { x: overflowX > 1 ? 100 / overflowX : 0, y: overflowY > 1 ? 100 / overflowY : 0 }
  }

  useEffect(() => {
    const move = (clientX: number, clientY: number) => {
      if (!drag.current?.active) return
      const dx = clientX - drag.current.startX, dy = clientY - drag.current.startY
      const { x: sx, y: sy } = getSensitivity(cb.current.scale)
      const newX = Math.max(0, Math.min(100, drag.current.startFX - dx * sx))
      const newY = Math.max(0, Math.min(100, drag.current.startFY - dy * sy))
      cb.current.onFocalChange(`${Math.round(newX)}% ${Math.round(newY)}%`)
    }
    const end = () => { if (drag.current) { drag.current.active = false; setIsDragging(false) }; pinch.current = null }
    const onMM = (e: MouseEvent) => move(e.clientX, e.clientY)
    const onTM = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch.current) {
        e.preventDefault()
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
        const newScale = Math.max(1, Math.min(3, pinch.current.startScale * (dist / pinch.current.startDist)))
        cb.current.onScaleChange(Math.round(newScale * 10) / 10)
      } else if (e.touches.length === 1) { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY) }
    }
    const onWheel = (e: WheelEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) return
      e.preventDefault()
      const newScale = Math.max(1, Math.min(3, cb.current.scale + (e.deltaY > 0 ? -0.1 : 0.1)))
      cb.current.onScaleChange(Math.round(newScale * 10) / 10)
    }
    window.addEventListener('mousemove', onMM)
    window.addEventListener('mouseup', end)
    window.addEventListener('touchmove', onTM, { passive: false })
    window.addEventListener('touchend', end)
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', end)
      window.removeEventListener('touchmove', onTM); window.removeEventListener('touchend', end)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  const { x: fx, y: fy } = parseFocal(focalPoint)
  return (
    <div>
      <div ref={containerRef}
        onMouseDown={e => { e.preventDefault(); const { x, y } = parseFocal(cb.current.focalPoint); drag.current = { active: true, startX: e.clientX, startY: e.clientY, startFX: x, startFY: y }; setIsDragging(true) }}
        onTouchStart={e => {
          if (e.touches.length === 2) { pinch.current = { startDist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), startScale: cb.current.scale } }
          else { e.preventDefault(); const { x, y } = parseFocal(cb.current.focalPoint); drag.current = { active: true, startX: e.touches[0].clientX, startY: e.touches[0].clientY, startFX: x, startFY: y }; setIsDragging(true) }
        }}
        style={{ position: 'relative', height: 110, borderRadius: 12, overflow: 'hidden', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none', marginBottom: 8 }}>
        <img ref={imgRef} src={src} alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${fx}% ${fy}%`, transform: `scale(${scale})`, transformOrigin: `${fx}% ${fy}%`, pointerEvents: 'none', display: 'block', transition: isDragging ? 'none' : 'transform 0.15s' }} />
        {!isDragging && (
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', borderRadius: 20, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
            <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>Arrastra · Pellizca o usa el slider para escalar</span>
          </div>
        )}
        {isDragging && <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(255,255,255,0.5)', borderRadius: 12, pointerEvents: 'none' }} />}
      </div>
      {/* Zoom slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="range" min={1} max={3} step={0.1} value={scale}
          onChange={e => onScaleChange(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: GREEN, cursor: 'pointer' }} />
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 9, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Cambiar imagen
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={onChangeFile} style={{ display: 'none' }} />
        </label>
        <button type="button" onClick={onRemove}
          style={{ padding: '7px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(239,68,68,0.7)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          Quitar
        </button>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stepError, setStepError] = useState('')
  const [done, setDone] = useState<{ name: string; slug: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [slugError, setSlugError] = useState('')
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([])
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [hexPrimary, setHexPrimary] = useState('#6366f1')
  const [hexAccent, setHexAccent] = useState('#f59e0b')
  const timerPassword = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerConfirm = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Media state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [stripFile, setStripFile] = useState<File | null>(null)
  const [stripPreview, setStripPreview] = useState<string | null>(null)
  const [stripFocalPoint, setStripFocalPoint] = useState('50% 50%')
  const [stripScale, setStripScale] = useState(1)
  const [logoSize, setLogoSize] = useState(1)
  const [logoTint, setLogoTint] = useState('')

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
  }
  function handleStripSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setStripFile(file)
    if (stripPreview) URL.revokeObjectURL(stripPreview)
    setStripPreview(URL.createObjectURL(file))
    setStripScale(1.5)
    setStripFocalPoint('50% 50%')
  }

  function toggleShow(current: boolean, setter: (v: boolean) => void, timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
    if (current) { if (timer.current) clearTimeout(timer.current); setter(false) }
    else { setter(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setter(false), 2000) }
  }
  function generateSuggestions(slug: string) {
    const rand = Math.floor(100 + Math.random() * 900)
    return [`${slug}-2`, `${slug}-mx`, `${slug}-${rand}`]
  }

  const [form, setForm] = useState({
    name: '', slug: '', tagline: '',
    primary_color: '#6366f1', accent_color: '#f59e0b',
    stamp_goal: '10', reward_description: '',
    admin_password: '', admin_password_confirm: '',
  })

  function handleHex(field: 'primary_color' | 'accent_color', val: string, setHex: (v: string) => void) {
    const v = val.startsWith('#') ? val : '#' + val
    setHex(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) set(field, v)
  }
  function set(field: string, value: string) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name') next.slug = value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
      return next
    })
  }

  useEffect(() => {
    const slug = form.slug
    if (!slug || slug.length < 2) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    if (checkTimer.current) clearTimeout(checkTimer.current)
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`)
        const data = await res.json()
        if (data.available) { setSlugStatus('available'); setSlugError(''); setSlugSuggestions([]) }
        else { setSlugStatus('taken'); setSlugError('Esa dirección ya la usa otro negocio'); setSlugSuggestions(generateSuggestions(slug)) }
      } catch { setSlugStatus('idle') }
    }, 600)
  }, [form.slug])

  function validateStep1(): string {
    if (!form.name || !form.slug) return 'Completa el nombre y la dirección'
    if (slugStatus === 'taken') return 'Esa dirección ya está en uso'
    if (slugStatus === 'checking') return 'Verificando dirección...'
    if (form.admin_password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
    if (form.admin_password !== form.admin_password_confirm) return 'Las contraseñas no coinciden'
    return ''
  }
  function goToStep2() {
    const err = validateStep1()
    if (err) { setStepError(err); return }
    setStepError('')
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.reward_description) { setError('Describe el premio para tus clientes'); return }
    setLoading(true)
    setError('')
    try {
      // 1. Crear negocio
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, slug: form.slug, tagline: form.tagline, primary_color: form.primary_color, accent_color: form.accent_color, stamp_goal: form.stamp_goal, reward_description: form.reward_description, admin_password: form.admin_password }),
      })
      const data = await res.json()
      if (res.status === 409) { setStep(1); setSlugError('Esa dirección ya la usa otro negocio'); setSlugSuggestions(generateSuggestions(form.slug)); return }
      if (!res.ok) throw new Error(data.error)
      const slug = data.business.slug

      // 2. Login para obtener cookie de auth
      await fetch(`/api/business/${slug}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.admin_password }),
      })

      // 3. Subir logo si se proporcionó
      if (logoFile) {
        const fd = new FormData()
        fd.append('logo', logoFile)
        await fetch(`/api/business/${slug}/upload-logo`, { method: 'POST', body: fd })
      }

      // 4. Subir banner si se proporcionó
      if (stripFile) {
        const fd = new FormData()
        fd.append('strip', stripFile)
        await fetch(`/api/business/${slug}/upload-strip`, { method: 'POST', body: fd })
        // Guardar posición y escala del banner
        await fetch(`/api/business/${slug}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strip_focal_point: stripFocalPoint, strip_scale: stripScale }),
        }).catch(() => {})
      }

      // 5. Guardar logo_tint y logo_size si aplica
      if (logoTint || logoSize !== 1) {
        await fetch(`/api/business/${slug}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo_tint: logoTint, logo_size: logoSize }),
        }).catch(() => {})
      }

      setDone({ name: data.business.name, slug })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  function copyUrl(path: string, key: string) {
    navigator.clipboard.writeText(`https://easyloyalty.io${path}`).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000) })
  }

  const LABEL = { color: `${GREEN}99`, fontSize: 10, fontWeight: 700, display: 'block', marginBottom: 7, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: FONT_STACK }
  const INPUT = { width: '100%', borderRadius: 10, padding: '13px 14px', color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 16, fontFamily: FONT_STACK, boxSizing: 'border-box' as const }
  const FONT_FACES = `
    @font-face{font-family:'HKGroteskWide';src:url('/fonts/HKGroteskWide-Black.otf');font-weight:900;}
    @font-face{font-family:'HKGroteskWide';src:url('/fonts/HKGroteskWide-ExtraBold.otf');font-weight:800;}
    @font-face{font-family:'HKGroteskWide';src:url('/fonts/HKGroteskWide-Bold.otf');font-weight:700;}
    @font-face{font-family:'HKGroteskWide';src:url('/fonts/HKGroteskWide-SemiBold.otf');font-weight:600;}
    @font-face{font-family:'HKGroteskWide';src:url('/fonts/HKGroteskWide-Medium.otf');font-weight:500;}
    @font-face{font-family:'HKGroteskWide';src:url('/fonts/HKGroteskWide-Regular.otf');font-weight:400;}
  `

  // ── SUCCESS ──────────────────────────────────────────────────────
  if (done) {
    const links = [
      { label: 'Tarjeta para tus clientes', path: `/${done.slug}`,         key: 'card'    },
      { label: 'Tu panel de control',        path: `/${done.slug}/admin`,   key: 'admin'   },
      { label: 'Scanner de sellos',           path: `/${done.slug}/scanner`, key: 'scanner' },
    ]
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: `linear-gradient(160deg,${TEAL} 0%,${CARBON} 60%)`, fontFamily: FONT_STACK }}>
        <style>{`${FONT_FACES} @keyframes popIn{from{transform:scale(0.5) rotate(-8deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}} @keyframes fadeUp{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: `0 0 40px ${GREEN}60` }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.03em', animation: 'fadeUp 0.4s ease 0.2s both', fontFamily: FONT_STACK }}>¡{done.name} ya tiene lealtad!</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0, animation: 'fadeUp 0.4s ease 0.3s both', fontFamily: FONT_STACK }}>Tu programa está activo. Comparte estas URLs.</p>
          </div>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(0,200,150,0.2)`, marginBottom: 14, animation: 'fadeUp 0.4s ease 0.4s both' }}>
            {links.map(({ label, path, key }, i) => (
              <div key={key} onClick={() => copyUrl(path, key)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', borderBottom: i < links.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: copied === key ? 'rgba(0,200,150,0.06)' : 'transparent', transition: 'background 0.2s' }}>
                <div style={{ textAlign: 'left', minWidth: 0 }}>
                  <p style={{ color: `${GREEN}80`, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px', fontFamily: FONT_STACK }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>easyloyalty.io{path}</p>
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginLeft: 12, background: copied === key ? `${GREEN}20` : 'rgba(255,255,255,0.07)', border: `1px solid ${copied === key ? GREEN : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
                  {copied === key ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, animation: 'fadeUp 0.4s ease 0.5s both' }}>
            <button onClick={() => router.push(`/${done.slug}`)} style={{ flex: 1, padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: FONT_STACK }}>Ver tarjeta</button>
            <button onClick={() => router.push(`/${done.slug}/admin`)} style={{ flex: 2, padding: '14px 0', borderRadius: 14, fontWeight: 900, fontSize: 14, color: TEAL, background: GREEN, border: 'none', cursor: 'pointer', fontFamily: FONT_STACK, letterSpacing: '-0.01em' }}>Ir a mi panel →</button>
          </div>
        </div>
      </main>
    )
  }

  // ── FORM ─────────────────────────────────────────────────────────
  const STEPS = [{ n: 1, label: 'Tu negocio' }, { n: 2, label: 'Tu tarjeta' }]
  const step1Valid = !!(form.name && form.slug && slugStatus !== 'taken' && slugStatus !== 'checking' && form.admin_password.length >= 6 && form.admin_password === form.admin_password_confirm)

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: step === 2 ? 'flex-start' : 'center', padding: '32px 16px', background: `linear-gradient(160deg,${TEAL} 0%,${CARBON} 65%)`, fontFamily: FONT_STACK }}>
      <style>{`${FONT_FACES} @keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(255,255,255,0.2);} input:focus{border-color:rgba(0,200,150,0.5)!important;}`}</style>

      <div style={{ width: '100%', maxWidth: step === 2 ? 860 : 360, transition: 'max-width 0.4s ease' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/img/logo-dark.png" alt="Easy Loyalty" style={{ height: 55, width: 'auto', filter: 'invert(1)', opacity: 0.95, display: 'inline-block' }} />
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
          {STEPS.map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, transition: 'all 0.35s ease', fontFamily: FONT_STACK, background: step >= n ? GREEN : 'rgba(255,255,255,0.08)', color: step >= n ? TEAL : 'rgba(255,255,255,0.2)', opacity: step < n ? 0.4 : 1, boxShadow: step === n ? `0 0 20px ${GREEN}60` : 'none', outline: step === n ? `2px solid rgba(0,200,150,0.35)` : 'none', outlineOffset: '3px' }}>
                  {step > n ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> : n}
                </div>
                <span style={{ color: step >= n ? `${GREEN}90` : 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'color 0.3s', fontFamily: FONT_STACK }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, borderRadius: 1, marginTop: 13, background: step > n ? `${GREEN}60` : 'rgba(255,255,255,0.08)', transition: 'background 0.35s ease' }} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── PASO 1: Negocio + Contraseña ── */}
          {step === 1 && (
            <div style={{ borderRadius: 20, padding: 24, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(0,200,150,0.15)`, backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 3px', letterSpacing: '-0.02em', fontFamily: FONT_STACK }}>Tu negocio</h2>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0, fontFamily: FONT_STACK }}>Cuéntanos sobre tu local</p>
              </div>
              <div>
                <label style={LABEL}>Nombre del negocio *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej. Café Luna" required style={INPUT} />
              </div>
              <div>
                <label style={LABEL}>Dirección de tu tarjeta *</label>
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: 10, overflow: 'hidden', border: `1px solid ${slugStatus === 'taken' ? 'rgba(239,68,68,0.5)' : slugStatus === 'available' ? `${GREEN}60` : 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.06)', transition: 'border 0.3s' }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: '13px 10px', borderRight: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>easyloyalty.io/</span>
                  <input type="text" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="mi-negocio" required style={{ flex: 1, padding: '13px 10px', color: '#fff', outline: 'none', background: 'transparent', border: 'none', fontSize: 16, fontFamily: 'monospace', boxSizing: 'border-box' as const }} />
                  <div style={{ paddingRight: 12, flexShrink: 0 }}>
                    {slugStatus === 'checking'  && <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid rgba(0,200,150,0.2)`, borderTopColor: GREEN, animation: 'spin 0.7s linear infinite' }} />}
                    {slugStatus === 'available' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {slugStatus === 'taken'     && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                  </div>
                </div>
                {slugStatus === 'available' && <p style={{ color: GREEN, fontSize: 11, fontWeight: 600, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontFamily: FONT_STACK }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Dirección disponible</p>}
                {slugStatus === 'taken' && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ color: '#f87171', fontSize: 12, fontWeight: 600, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5, fontFamily: FONT_STACK }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{slugError}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{slugSuggestions.map(s => <button key={s} type="button" onClick={() => set('slug', s)} style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>{s}</button>)}</div>
                  </div>
                )}
              </div>
              <div>
                <label style={LABEL}>Slogan <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(opcional)</span></label>
                <input type="text" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Ej. El mejor café de la colonia" style={INPUT} />
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: '0 0 14px', fontFamily: FONT_STACK }}>Contraseña de acceso</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={LABEL}>Contraseña *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPassword ? 'text' : 'password'} value={form.admin_password} onChange={e => set('admin_password', e.target.value)} placeholder="Mínimo 6 caracteres" required style={{ ...INPUT, paddingRight: 44 }} />
                      <button type="button" onClick={() => toggleShow(showPassword, setShowPassword, timerPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                        {showPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={LABEL}>Confirmar contraseña *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPasswordConfirm ? 'text' : 'password'} value={form.admin_password_confirm} onChange={e => set('admin_password_confirm', e.target.value)} placeholder="Repite la contraseña" required style={{ ...INPUT, paddingRight: 44 }} />
                      <button type="button" onClick={() => toggleShow(showPasswordConfirm, setShowPasswordConfirm, timerConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                        {showPasswordConfirm ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {stepError && <p style={{ fontSize: 13, textAlign: 'center', padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', margin: 0, border: '1px solid rgba(239,68,68,0.2)', fontFamily: FONT_STACK }}>{stepError}</p>}
              <button type="button" onClick={goToStep2} style={{ width: '100%', padding: '15px 0', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: step1Valid ? 'pointer' : 'not-allowed', opacity: step1Valid ? 1 : 0.35, border: 'none', fontFamily: FONT_STACK, letterSpacing: '-0.01em', background: GREEN, color: TEAL, transition: 'opacity 0.2s' }}>
                Diseña tu tarjeta →
              </button>
            </div>
          )}

          {/* ── PASO 2: Constructor visual ── */}
          {step === 2 && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>

              {/* Controls — LEFT */}
              <div style={{ flex: '1 1 320px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 0 }}>

                {/* Logo del negocio */}
                <div style={{ borderRadius: 16, padding: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,200,150,0.15)', marginBottom: 10 }}>
                  <p style={{ ...LABEL, marginBottom: 14 }}>Logo del negocio</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {logoPreview
                        ? logoTint
                          ? <div style={{ width: '80%', height: '80%', background: logoTint, WebkitMaskImage: `url(${logoPreview})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${logoPreview})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
                          : <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginBottom: 8, fontFamily: FONT_STACK }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                        <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={handleLogoSelect} style={{ display: 'none' }} />
                      </label>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 2px', lineHeight: 1.5, fontFamily: FONT_STACK }}>PNG sin fondo para mejor resultado</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', margin: 0, fontFamily: FONT_STACK }}>PNG, JPG, SVG · Máx 2MB</p>
                      {logoPreview && <button type="button" onClick={() => { setLogoFile(null); if (logoPreview) URL.revokeObjectURL(logoPreview); setLogoPreview(null); setLogoTint('') }} style={{ marginTop: 6, background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: 12, cursor: 'pointer', padding: 0, fontFamily: FONT_STACK }}>Quitar logo</button>}
                    </div>
                  </div>
                  {logoPreview && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: FONT_STACK }}>Tamaño del logo</span>
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{Math.round(logoSize * 100)}%</span>
                        </div>
                        <input type="range" min={0.5} max={2.5} step={0.05} value={logoSize} onChange={e => setLogoSize(parseFloat(e.target.value))} style={{ width: '100%', accentColor: GREEN, cursor: 'pointer' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: FONT_STACK }}>Color del logo</span>
                          {logoTint && <button type="button" onClick={() => setLogoTint('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', fontSize: 11, cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: FONT_STACK }}>Quitar color</button>}
                        </div>
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                          <button type="button" onClick={() => setLogoTint('')} title="Sin tinte"
                            style={{ width: 34, height: 34, borderRadius: 9, cursor: 'pointer', background: 'white', position: 'relative', overflow: 'hidden', padding: 0, flexShrink: 0,
                              border: !logoTint ? '2.5px solid white' : '2px solid rgba(255,255,255,0.12)',
                              transform: !logoTint ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.12s',
                              boxShadow: !logoTint ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none' }}>
                            <svg style={{ position: 'absolute', inset: 0 }} width="34" height="34" viewBox="0 0 34 34">
                              <line x1="4" y1="4" x2="30" y2="30" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          </button>
                          {([
                            { label: 'Blanco',  value: '#ffffff' },
                            { label: 'Negro',   value: '#1a1a1a' },
                            { label: 'Dorado',  value: '#f59e0b' },
                            { label: 'Rosa',    value: '#ec4899' },
                            { label: 'Rojo',    value: '#ef4444' },
                            { label: 'Verde',   value: '#10b981' },
                            { label: 'Azul',    value: '#3b82f6' },
                            { label: 'Morado',  value: '#8b5cf6' },
                          ] as { label: string; value: string }[]).map(c => (
                            <button key={c.value} type="button" title={c.label} onClick={() => setLogoTint(c.value)}
                              style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: c.value, cursor: 'pointer', flexShrink: 0, padding: 0,
                                border: logoTint === c.value ? '2.5px solid white' : '2px solid rgba(255,255,255,0.08)',
                                transform: logoTint === c.value ? 'scale(1.12)' : 'scale(1)', transition: 'transform 0.12s',
                                boxShadow: logoTint === c.value ? '0 0 0 3px rgba(255,255,255,0.18)' : 'none',
                                outline: c.value === '#ffffff' ? '1px solid rgba(255,255,255,0.2)' : 'none' }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Imagen del banner */}
                <div style={{ borderRadius: 16, padding: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,200,150,0.15)', marginBottom: 10 }}>
                  <p style={{ ...LABEL, marginBottom: 14 }}>Imagen del banner</p>
                  {!stripPreview ? (
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, height: 90, borderRadius: 12, border: '1.5px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: FONT_STACK }}>Subir imagen del negocio</span>
                      <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, fontFamily: FONT_STACK }}>JPG, PNG, WebP · Máx 5MB · Recomendado horizontal</span>
                      <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleStripSelect} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <StripDragger
                      src={stripPreview}
                      focalPoint={stripFocalPoint}
                      scale={stripScale}
                      onFocalChange={setStripFocalPoint}
                      onScaleChange={setStripScale}
                      onChangeFile={handleStripSelect}
                      onRemove={() => { setStripFile(null); if (stripPreview) URL.revokeObjectURL(stripPreview); setStripPreview(null); setStripFocalPoint('50% 50%'); setStripScale(1) }}
                    />
                  )}
                </div>

                {/* Colores + programa */}
                <div style={{ borderRadius: 16, padding: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,200,150,0.15)', display: 'flex', flexDirection: 'column', gap: 18 }}>

                  <div>
                    <label style={LABEL}>Color principal</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 8 }}>
                      {BRAND_COLORS.map(c => <button key={c.value} type="button" onClick={() => { set('primary_color', c.value); setHexPrimary(c.value) }} style={{ height: 30, borderRadius: 7, background: c.value, cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.2s', outline: form.primary_color === c.value ? `2.5px solid ${GREEN}` : '2px solid transparent', outlineOffset: '2px', transform: form.primary_color === c.value ? 'scale(1.18)' : 'scale(1)', boxShadow: c.value === '#1a1a1a' ? 'inset 0 0 0 1px rgba(255,255,255,0.15)' : 'none' }} title={c.label} />)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.primary_color} onChange={e => { set('primary_color', e.target.value); setHexPrimary(e.target.value) }} style={{ width: 38, height: 38, padding: 3, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                      <input type="text" value={hexPrimary} maxLength={7} placeholder="#000000" onChange={e => handleHex('primary_color', e.target.value, setHexPrimary)} onBlur={e => { const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) { set('primary_color', v); setHexPrimary(v) } else setHexPrimary(form.primary_color) }} style={{ ...INPUT, fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.05em' }} />
                    </div>
                  </div>

                  <div>
                    <label style={LABEL}>Color de acento <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>texto del premio</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 8 }}>
                      {ACCENT_COLORS.map(c => <button key={c.value} type="button" onClick={() => { set('accent_color', c.value); setHexAccent(c.value) }} style={{ height: 30, borderRadius: 7, background: c.value, cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.2s', outline: form.accent_color === c.value ? `2.5px solid ${GREEN}` : '2px solid transparent', outlineOffset: '2px', transform: form.accent_color === c.value ? 'scale(1.18)' : 'scale(1)', boxShadow: c.value === '#f8fafc' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : 'none' }} title={c.label} />)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.accent_color} onChange={e => { set('accent_color', e.target.value); setHexAccent(e.target.value) }} style={{ width: 38, height: 38, padding: 3, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, cursor: 'pointer', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                      <input type="text" value={hexAccent} maxLength={7} placeholder="#000000" onChange={e => handleHex('accent_color', e.target.value, setHexAccent)} onBlur={e => { const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) { set('accent_color', v); setHexAccent(v) } else setHexAccent(form.accent_color) }} style={{ ...INPUT, fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.05em' }} />
                    </div>
                  </div>

                  <div>
                    <label style={LABEL}>Sellos para el premio *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {['5', '8', '10', '12'].map(n => <button key={n} type="button" onClick={() => set('stamp_goal', n)} style={{ padding: '11px 0', borderRadius: 10, fontSize: 16, fontWeight: 900, cursor: 'pointer', transition: 'all 0.2s', fontFamily: FONT_STACK, border: 'none', background: form.stamp_goal === n ? GREEN : 'rgba(255,255,255,0.07)', color: form.stamp_goal === n ? TEAL : 'rgba(255,255,255,0.35)', transform: form.stamp_goal === n ? 'scale(1.06)' : 'scale(1)', boxShadow: form.stamp_goal === n ? `0 4px 16px ${GREEN}40` : 'none' }}>{n}</button>)}
                    </div>
                  </div>

                  <div>
                    <label style={LABEL}>¿Cuál es el premio? *</label>
                    <input type="text" value={form.reward_description} onChange={e => set('reward_description', e.target.value)} placeholder="Ej. 1 café gratis" required style={INPUT} />
                  </div>

                  {error && <p style={{ fontSize: 13, textAlign: 'center', padding: '11px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', margin: 0, border: '1px solid rgba(239,68,68,0.2)', fontFamily: FONT_STACK }}>{error}</p>}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '13px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: FONT_STACK }}>← Atrás</button>
                    <button type="submit" disabled={loading || !form.reward_description} style={{ flex: 2, padding: '13px 0', borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: (loading || !form.reward_description) ? 'not-allowed' : 'pointer', opacity: (loading || !form.reward_description) ? 0.35 : 1, border: 'none', fontFamily: FONT_STACK, background: GREEN, color: TEAL, letterSpacing: '-0.01em' }}>
                      {loading ? 'Creando tu programa...' : '¡Crear mi programa! →'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone preview — RIGHT */}
              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'sticky', top: 24 }}>
                <p style={{ color: `${GREEN}70`, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0, fontFamily: FONT_STACK }}>Vista previa real</p>
                <IPhoneWalletPreview
                  primaryColor={form.primary_color}
                  accentColor={form.accent_color}
                  name={form.name}
                  logoPreview={logoPreview}
                  stampGoal={parseInt(form.stamp_goal)}
                  rewardDescription={form.reward_description}
                  stripImage={stripPreview}
                  stripFocalPoint={stripFocalPoint}
                  stripScale={stripScale}
                  logoSize={logoSize}
                  logoTint={logoTint}
                />
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: FONT_STACK, textAlign: 'center', maxWidth: 280 }}>
                  Así se verá en Apple Wallet. Cada cambio se refleja en tiempo real.
                </p>
              </div>

            </div>
          )}
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.1)', fontSize: 11, marginTop: 20, letterSpacing: '0.04em', fontFamily: FONT_STACK }}>
          Easy Loyalty · Plataforma de lealtad digital
        </p>
      </div>
    </main>
  )
}
