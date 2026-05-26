import { useState, useEffect, useRef } from 'react';
import { ALL_TAGS, ALL_STYLES, TAG_COLORS, PAPER_COLORS, ACCENT_COLORS } from './data';
import styles from './Modal.module.css';

function resizeImage(file, maxPx = 480) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddNoteModal({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState('wishlist');
  const [style, setStyle] = useState('sticky');
  const [paperColor, setPaperColor] = useState(null);
  const [accentColor, setAccentColor] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const titleRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTitle(''); setBody(''); setTag('wishlist'); setStyle('sticky');
      setPaperColor(null); setAccentColor(null); setImageUrl(null);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleImagePick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await resizeImage(file);
    setImageUrl(url);
  };

  const handleSave = () => {
    if (!title.trim() && !body.trim() && !imageUrl) { titleRef.current?.focus(); return; }
    onAdd({ title: title.trim(), body: body.trim(), tag, style, paperColor, accentColor, imageUrl });
    onClose();
  };

  if (!open) return null;

  const hasTape = style === 'torn' || style === 'envelope';
  const accentLabel = hasTape ? 'tape color' : 'pin color';

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

        <div className={styles.field}>
          <label>paper</label>
          <div className={styles.swatches}>
            <button
              className={[styles.swatch, styles.swatchAuto, paperColor === null ? styles.swatchActive : ''].join(' ')}
              onClick={() => setPaperColor(null)}
              title="tag default"
            />
            {PAPER_COLORS.map(c => (
              <button
                key={c}
                className={[styles.swatch, paperColor === c ? styles.swatchActive : ''].join(' ')}
                style={{ background: c }}
                onClick={() => setPaperColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>{accentLabel}</label>
          <div className={styles.swatches}>
            <button
              className={[styles.swatch, styles.swatchAuto, accentColor === null ? styles.swatchActive : ''].join(' ')}
              onClick={() => setAccentColor(null)}
              title="default"
            />
            {ACCENT_COLORS.map(c => (
              <button
                key={c}
                className={[styles.swatch, accentColor === c ? styles.swatchActive : ''].join(' ')}
                style={{ background: c }}
                onClick={() => setAccentColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>image <span className={styles.opt}>(optional)</span></label>
          {imageUrl ? (
            <div className={styles.imagePreviewWrap}>
              <img src={imageUrl} alt="" className={styles.imagePreview} />
              <button className={styles.imageRemove} onClick={() => { setImageUrl(null); fileRef.current.value = ''; }}>×</button>
            </div>
          ) : (
            <button className={styles.imageUpload} onClick={() => fileRef.current.click()}>
              + upload image
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImagePick}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>cancel</button>
          <button className={styles.save} onClick={handleSave}>pin it ✦</button>
        </div>
      </div>
    </div>
  );
}
