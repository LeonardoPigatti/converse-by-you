import { useState } from 'react'
import { PARTS, DEFAULT_COLORS } from './data/parts'
import PartsList from './components/PartsList'
import ColorPanel from './components/ColorPanel'
import Viewer from './components/Viewer'
import styles from './App.module.css'

export default function App() {
  const [colorMap, setColorMap] = useState({ ...DEFAULT_COLORS })
  const [activePart, setActivePart] = useState('outsideBody')
  const [targetView, setTargetView] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const handleColorChange = (color) => {
    setColorMap(prev => ({ ...prev, [activePart]: color }))
  }

  const handleReset = () => {
    setColorMap({ ...DEFAULT_COLORS })
  }

  const activeParlLabel = PARTS.find(p => p.id === activePart)?.label

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>★</div>
          <div>
            <p className={styles.logoBrand}>Converse</p>
            <p className={styles.logoTitle}>Chuck Taylor — By You</p>
          </div>
        </div>

        <div className={styles.editingBadge}>
          {loaded ? (
            <>Editando: <strong>{activeParlLabel}</strong></>
          ) : (
            <span className={styles.loadingDots}>Carregando modelo 3D<span>...</span></span>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={handleReset}>Reset</button>
          <button className={styles.btnPrimary}>Add to Cart — $95</button>
        </div>
      </header>

      {/* Layout */}
      <div className={styles.layout}>
        <PartsList
          parts={PARTS}
          colorMap={colorMap}
          activePart={activePart}
          onSelect={setActivePart}
        />

        <Viewer
          colorMap={colorMap}
          activePart={activePart}
          targetView={targetView}
          onLoaded={() => setLoaded(true)}
        />

        <ColorPanel
          activePart={activePart}
          colorMap={colorMap}
          onColorChange={handleColorChange}
          onViewChange={setTargetView}
          onReset={handleReset}
        />
      </div>
    </div>
  )
}
