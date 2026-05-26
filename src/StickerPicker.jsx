import { STICKER_EMOJIS } from './data';
import styles from './StickerPicker.module.css';

export default function StickerPicker({ onPick, onClose }) {
  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>pick a sticker</span>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>
        <div className={styles.grid}>
          {STICKER_EMOJIS.map(emoji => (
            <button key={emoji} className={styles.emoji} onClick={() => onPick(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
