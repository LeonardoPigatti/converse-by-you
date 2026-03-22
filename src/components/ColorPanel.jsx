import { useState } from 'react'
import { PALETTES, PARTS, VIEWS } from '../data/parts'
import styles from './ColorPanel.module.css'

export default function ColorPanel({ activePart, colorMap, onColorChange, onViewChange, onReset }) {
  const [activeView, setActiveView] = useState('side')
  const part = PARTS.find(p => p.id === activePart)
  const palette = PALETTES[activePart] || []
  const currentColor = colorMap[activePart] || '#ffffff'

  const handleViewChange = (viewName) => {
    setActiveView(viewName)
    onViewChange(VIEWS[viewName])
  }

  const handleHexInput = (val) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onColorChange(val)
    }
  }

  return (
    <aside className={styles.panel}>
      {/* Color section */}
      <div className={styles.section}>
        <p className={styles.label}>{part?.label}</p>
        <p className={styles.sublabel}>{part?.description}</p>

        <div className={styles.swatchGrid}>
          {palette.map(color => (
            <button
              key={color}
              className={`${styles.swatch} ${currentColor === color ? styles.selected : ''}`}
              style={{ background: color }}
              onClick={() => onColorChange(color)}
              title={color}
            />
          ))}
        </div>

        <div className={styles.customRow}>
          <p className={styles.customLabel}>Cor personalizada</p>
          <div className={styles.inputRow}>
            <input
              type="color"
              value={currentColor}
              onChange={e => onColorChange(e.target.value)}
              className={styles.colorPicker}
            />
            <input
              type="text"
              value={currentColor}
              onChange={e => handleHexInput(e.target.value)}
              className={styles.hexInput}
              maxLength={7}
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* View angle */}
      <div className={styles.section}>
        <p className={styles.label}>Ângulo de visão</p>
        <div className={styles.viewGrid}>
          {Object.keys(VIEWS).map(v => (
            <button
              key={v}
              className={`${styles.viewBtn} ${activeView === v ? styles.viewActive : ''}`}
              onClick={() => handleViewChange(v)}
            >
              {{ side: 'Lateral', front: 'Frente', top: 'Topo', back: 'Traseira' }[v]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Summary */}
      <div className={styles.section}>
        <div className={styles.summaryHeader}>
          <p className={styles.label}>Seu design</p>
          <button className={styles.resetBtn} onClick={onReset}>Reset</button>
        </div>
        <div className={styles.summary}>
          {PARTS.map(p => (
            <div key={p.id} className={styles.summaryRow}>
              <span className={styles.summaryName}>{p.label}</span>
              <div className={styles.summaryRight}>
                <span
                  className={styles.summaryDot}
                  style={{ background: colorMap[p.id] }}
                />
                <span className={styles.summaryHex}>{colorMap[p.id]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
