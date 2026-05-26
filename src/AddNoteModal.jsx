import { useState, useEffect, useRef } from 'react';
import { ALL_TAGS, ALL_STYLES, TAG_COLORS } from './data';
import styles from './Modal.module.css';

export default function AddNoteModal({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('wishlist');
  const [style, setStyle] = useState('sticky');
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle(''); setBody(''); setTag('wishlist'); setStyle('sticky');
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim() && !body.trim()) { titleRef.current?.focus(); return; }
    onAdd({ title: title.trim(), body: body.trim(), tag, style });
    onClose();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h2 className={styles.heading}>pin a new note</h2>

        <div className={styles.field}>
          <label>title <span className={styles.opt}>(optional)</span></label>
          <input ref={titleRef} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="give it a name..." onKeyDown={e => e.key === 'Enter' && handleSave()} />
        </div>

        <div className={styles.field}>
          <label>note</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="write something..." />
        </div>

        <div className={styles.field}>
          <label>tag</label>
          <div className={styles.chips}>
            {ALL_TAGS.map(t => {
              const colors = TAG_COLORS[t];
              const active = tag === t;
              return (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={styles.chip}
                  style={active ? { background: colors.tag, borderColor: colors.tag, color: colors.tagText } : {}}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.field}>
          <label>style</label>
          <div className={styles.chips}>
            {ALL_STYLES.map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={[styles.chip, style === s ? styles.chipActive : ''].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>cancel</button>
          <button className={styles.save} onClick={handleSave}>pin it ✦</button>
        </div>
      </div>
    </div>
  );
}
