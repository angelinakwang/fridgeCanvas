import { STICKER_EMOJIS, IMAGE_STICKERS } from './data';
import styles from './StickerPicker.module.css';

export default function StickerPicker({ onPick, onClose }) {
  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.title}>pick a sticker</span>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        {IMAGE_STICKERS.length > 0 && (
          <>
            <div className={styles.sectionLabel}>images</div>
            <div className={styles.grid}>
              {IMAGE_STICKERS.map(src => (
                <button key={src} className={styles.emoji} onClick={() => onPick({ type: 'image', src })}>
                  <img src={src} alt="" className={styles.stickerImg} />
                </button>
              ))}
            </div>
            <div className={styles.sectionLabel}>emojis</div>
          </>
        )}

        <div className={styles.grid}>
          {STICKER_EMOJIS.map(emoji => (
            <button key={emoji} className={styles.emoji} onClick={() => onPick({ type: 'emoji', value: emoji })}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
