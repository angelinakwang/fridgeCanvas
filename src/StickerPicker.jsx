import { STICKER_ASSETS } from './data';
import styles from './StickerPicker.module.css';

export default function StickerPicker({ onPick, onClose }) {
  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>stickers</span>
          <button type="button" className={styles.close} onClick={onClose}>×</button>
        </div>
        <div className={styles.grid}>
          {STICKER_ASSETS.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              className={styles.stickerBtn}
              onClick={() => onPick(sticker.src)}
              title={sticker.label}
            >
              <img src={sticker.src} alt="" className={styles.thumb} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}