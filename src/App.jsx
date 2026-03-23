import { useState } from 'react'
import { PARTS, DEFAULT_COLORS, PALETTES } from './data/parts'
import Viewer from './components/Viewer'

const COLOR_NAMES = {
  '#ffffff': 'White', '#f5f0e8': 'Cream', '#111111': 'Black',
  '#1a1a2e': 'Navy', '#c0392b': 'Converse Red', '#2471a3': 'Blue',
  '#1e8449': 'Green', '#d4ac0d': 'Yellow', '#7d3c98': 'Purple',
  '#e8d5b7': 'Sand', '#f5a7b8': 'Pink', '#2c3e50': 'Dark Navy',
  '#e74c3c': 'Red', '#f0e6d3': 'Ivory', '#ffd6d6': 'Light Pink',
  '#d6eaff': 'Light Blue', '#d6ffd6': 'Light Green', '#fffbd6': 'Light Yellow',
  '#f0d6ff': 'Lavender', '#e8e8e8': 'Light Gray', '#117a65': 'Teal',
  '#d35400': 'Orange', '#aaaaaa': 'Silver', '#c8a000': 'Gold',
  '#f0ede0': 'Off White', '#222222': 'Almost Black',
}

export default function App() {
  const [colorMap, setColorMap] = useState({ ...DEFAULT_COLORS })
  const [activeIndex, setActiveIndex] = useState(0)
  const [targetView, setTargetView] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredColor, setHoveredColor] = useState(null)
  const [panelOpen, setPanelOpen] = useState(true)

  const activePart = PARTS[activeIndex]
  const palette = PALETTES[activePart.id] || []
  const currentColor = colorMap[activePart.id]
  const displayColor = hoveredColor || currentColor
  const colorLabel = COLOR_NAMES[displayColor] || displayColor

  const setColor = (color) => setColorMap(prev => ({ ...prev, [activePart.id]: color }))
  const reset = () => setColorMap({ ...DEFAULT_COLORS })
  const goNext = () => setActiveIndex(i => Math.min(i + 1, PARTS.length - 1))
  const goPrev = () => setActiveIndex(i => Math.max(i - 1, 0))

  return (
    <div style={s.app}>

      {/* TOP BAR */}
      <div style={s.topBar}>
        <div>
          <div style={s.productName}>Converse Custom Chuck Taylor All Star High Top</div>
        </div>
        <button style={s.doneBtn}>Done</button>
      </div>

      {/* VIEWER — fills all available space */}
      <div style={s.viewerWrap}>
        <Viewer
          colorMap={colorMap}
          activePart={activePart.id}
          targetView={targetView}
          onLoaded={() => setLoaded(true)}
          bgColor="#ebebeb"
        />
        {!loaded && (
          <div style={s.loadingOverlay}>
            <div style={s.spinner} />
            <span style={{ fontSize: 13, color: '#888' }}>Carregando…</span>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL */}
      <div style={s.bottomPanel}>

        {/* Row 1: navigation */}
        <div style={s.navRow}>
          {/* Left: collapse button */}
          <button style={s.iconCircleBtn} onClick={() => setPanelOpen(o => !o)}>
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ transform: panelOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }}>
              <path d="M1 1.5L6 6.5L11 1.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Center: arrows + part name */}
          <div style={s.navCenter}>
            <button
              style={{ ...s.arrowBtn, opacity: activeIndex === 0 ? 0.25 : 1 }}
              onClick={goPrev}
              disabled={activeIndex === 0}
            >←</button>

            <div style={s.partNameWrap}>
              <span style={s.partNameText}>{activePart.label}</span>
              <span style={s.partCounter}> {activeIndex + 1}/{PARTS.length}</span>
            </div>

            <button
              style={{ ...s.arrowBtn, opacity: activeIndex === PARTS.length - 1 ? 0.25 : 1 }}
              onClick={goNext}
              disabled={activeIndex === PARTS.length - 1}
            >→</button>
          </div>

          {/* Right: menu */}
          <button style={s.menuBtn} onClick={() => setMenuOpen(true)}>
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
              <line x1="0" y1="1" x2="18" y2="1" stroke="#000000" strokeWidth="1.5"/>
              <line x1="0" y1="6.5" x2="18" y2="6.5" stroke="#000000" strokeWidth="1.5"/>
              <line x1="0" y1="12" x2="18" y2="12" stroke="#333" strokeWidth="1.5"/>
            </svg>
            <span style={s.menuLabel}>Menu</span>
          </button>
        </div>

        {/* Row 2: swatches */}
        {panelOpen && (
          <div style={s.swatchRow}>
            {palette.map(color => (
              <button
                key={color}
                onClick={() => setColor(color)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
                style={{
                  ...s.swatch,
                  background: color,
                  boxShadow: currentColor === color
                    ? '0 0 0 2px #fff, 0 0 0 4px #333'
                    : '0 0 0 1px rgba(0,0,0,0.15)',
                  transform: currentColor === color ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}

        {/* Row 3: color name */}
        {panelOpen && <div style={s.colorName}>{colorLabel}</div>}
      </div>

      {/* MENU DRAWER */}
      {menuOpen && (
        <div style={s.overlay} onClick={() => setMenuOpen(false)}>
          <div style={s.drawer} onClick={e => e.stopPropagation()}>
            <div style={s.drawerHeader}>
              <span style={s.drawerTitle}>Customizar</span>
              <button style={s.closeBtn} onClick={() => setMenuOpen(false)}>✕</button>
            </div>
            <div style={s.drawerList}>
              {PARTS.map((part, i) => (
                <div
                  key={part.id}
                  style={{
                    ...s.drawerRow,
                    background: i === activeIndex ? '#f5f5f5' : 'transparent',
                  }}
                  onClick={() => { setActiveIndex(i); setMenuOpen(false) }}
                >
                  <span style={{ ...s.drawerDot, background: colorMap[part.id] }} />
                  <div style={{ flex: 1 }}>
                    <div style={s.drawerPartName}>{part.label}</div>
                    <div style={s.drawerPartDesc}>{part.description}</div>
                  </div>
                  {i === activeIndex && <span style={s.drawerCheck}>✓</span>}
                </div>
              ))}
            </div>
            <div style={s.drawerFooter}>
              <button style={s.resetBtn} onClick={() => { reset(); setMenuOpen(false) }}>
                Resetar design
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── INLINE STYLES ──────────────────────────────────────
const s = {
  app: {
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    background: '#ebebeb',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 28px 16px',
    flexShrink: 0,
  },
  productName: {
    fontSize: 13,
    color: '#000000',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  price: {
    fontSize: 13,
    color: '#111',
    marginTop: 2,
  },
  doneBtn: {
    fontSize: 13,
    color: '#333',
    background: 'rgba(255,255,255,0.85)',
    border: '1.5px solid #ccc',
    borderRadius: 999,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
    padding: '7px 20px',
    backdropFilter: 'blur(4px)',
    letterSpacing: '0.02em',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  viewerWrap: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    background: '#ebebeb',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 10,
  },
  spinner: {
    width: 28,
    height: 28,
    border: '2px solid #ccc',
    borderTopColor: '#333',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  bottomPanel: {
    flexShrink: 0,
    background: '#ffffff',
    borderTop: '1px solid #d8d8d8',
    paddingTop: 20,
    paddingBottom: 28,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
    transition: 'padding 0.25s',
    overflow: 'hidden',
  },
  navRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1.5px solid #bbb',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  navCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    flex: 1,
    justifyContent: 'center',
    marginLeft: '90px',
  },
  arrowBtn: {
    fontSize: 20,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#111',
    fontFamily: 'inherit',
    lineHeight: 1,
    padding: '0 4px',
    transition: 'opacity 0.15s',
  },
  partNameWrap: {
    minWidth: 180,
    textAlign: 'center',
  },
  partNameText: {
    fontSize: 15,
    fontWeight: 500,
    color: '#111',
    letterSpacing: '0.01em',
  },
  partCounter: {
    fontSize: 14,
    color: '#888',
    fontWeight: 400,
  },
  menuBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.85)',
    border: '1.5px solid #ccc',
    borderRadius: 999,
    cursor: 'pointer',
    flexShrink: 0,
    padding: '7px 16px',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    transition: 'border-color 0.15s',
  },
  menuPillBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.85)',
    border: '1.5px solid #ccc',
    borderRadius: 999,
    cursor: 'pointer',
    padding: '7px 16px',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: '#111',
    flexShrink: 0,
    transition: 'border-color 0.15s',
  },
  menuLabel: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontWeight: 400,
  },
  swatchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '0 32px',
  },
  swatch: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.12s, box-shadow 0.12s',
    outline: 'none',
  },
  colorName: {
    fontSize: 12,
    color: '#444',
    letterSpacing: '0.03em',
    minHeight: 18,
  },
  // Drawer
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.25)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  drawer: {
    background: '#fff',
    width: '100%',
    maxWidth: 480,
    borderRadius: '16px 16px 0 0',
    maxHeight: '75vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 20px 14px',
    borderBottom: '1px solid #eee',
    flexShrink: 0,
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#111',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    color: '#888',
    cursor: 'pointer',
    padding: 4,
    lineHeight: 1,
    fontFamily: 'inherit',
  },
  drawerList: {
    overflowY: 'auto',
    flex: 1,
  },
  drawerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background 0.1s',
  },
  drawerDot: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    flexShrink: 0,
    border: '1px solid rgba(0,0,0,0.1)',
  },
  drawerPartName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#111',
  },
  drawerPartDesc: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  drawerCheck: {
    fontSize: 14,
    color: '#111',
    fontWeight: 600,
  },
  drawerFooter: {
    padding: '14px 20px',
    borderTop: '1px solid #eee',
    flexShrink: 0,
  },
  resetBtn: {
    width: '100%',
    padding: '11px',
    background: 'transparent',
    border: '1.5px solid #ddd',
    borderRadius: 8,
    fontSize: 13,
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    transition: 'all 0.15s',
  },
}