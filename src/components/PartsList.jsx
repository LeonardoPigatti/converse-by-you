import styles from './PartsList.module.css'

export default function PartsList({ parts, colorMap, activePart, onSelect }) {
  return (
    <aside className={styles.panel}>
      <p className={styles.label}>Customize</p>
      <ul className={styles.list}>
        {parts.map(part => (
          <li
            key={part.id}
            className={`${styles.item} ${activePart === part.id ? styles.active : ''}`}
            onClick={() => onSelect(part.id)}
          >
            <span
              className={styles.swatch}
              style={{ background: colorMap[part.id] }}
            />
            <div className={styles.info}>
              <span className={styles.name}>{part.label}</span>
              <span className={styles.desc}>{part.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}
