import { useRef, useCallback } from 'react';
import { TAG_COLORS, INDEX_BORDERS, PAPER_TEXTURES } from './data';
import styles from './Card.module.css';

function hashId(id) {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export default function Card({ note, onMove, onUpdate, onDelete, hidden, scale, mode, onCardClick }) {
  const dragState = useRef(null);
  const elRef = useRef(null);
  const colors = TAG_COLORS[note.tag] || TAG_COLORS.idea;

  const handleMouseDown = useCallback((e) => {
    if (e.target.dataset.delete || e.target.dataset.handle) return;
    if (mode === 'edit') return;
    e.stopPropagation();
    e.preventDefault();

    dragState.current = { startX: e.clientX, startY: e.clientY, startNX: note.x, startNY: note.y };
    elRef.current.style.zIndex = 999;
    elRef.current.classList.add(styles.dragging);

    const onDragMove = (me) => {
      if (!dragState.current) return;
      const dx = (me.clientX - dragState.current.startX) / scale;
      const dy = (me.clientY - dragState.current.startY) / scale;
      elRef.current.style.left = (dragState.current.startNX + dx) + 'px';
      elRef.current.style.top  = (dragState.current.startNY + dy) + 'px';
    };

    const onUp = (me) => {
      if (!dragState.current) return;
      const dx = (me.clientX - dragState.current.startX) / scale;
      const dy = (me.clientY - dragState.current.startY) / scale;
      onMove(note.id, dragState.current.startNX + dx, dragState.current.startNY + dy);
      dragState.current = null;
      elRef.current.style.zIndex = '';
      elRef.current.classList.remove(styles.dragging);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onUp);
  }, [note, scale, onMove, mode]);

  const handleRotDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = elRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRot = note.rot || 0;
    let live = startRot;

    const onRotMove = (me) => {
      const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      live = startRot + (angle - startAngle);
      elRef.current.style.setProperty('--rot', `${live}deg`);
    };
    const onRotUp = () => {
      onUpdate(note.id, { rot: live });
      document.removeEventListener('mousemove', onRotMove);
      document.removeEventListener('mouseup', onRotUp);
    };
    document.addEventListener('mousemove', onRotMove);
    document.addEventListener('mouseup', onRotUp);
  }, [note, onUpdate]);

  const handleResizeDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = elRef.current.getBoundingClientRect().width / scale;
    let live = startW;

    const onResizeMove = (me) => {
      live = Math.max(120, startW + (me.clientX - startX) / scale);
      elRef.current.style.width = `${live}px`;
    };
    const onResizeUp = () => {
      onUpdate(note.id, { width: live });
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeUp);
    };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeUp);
  }, [note, scale, onUpdate]);

  const handleClick = useCallback(() => {
    if (mode === 'edit' && note.style !== 'sticker') onCardClick(note);
  }, [mode, note, onCardClick]);

  // sticker cards
  if (note.style === 'sticker') {
    return (
      <div
        ref={elRef}
        className={[styles.card, styles.card_sticker, hidden ? styles.hidden : ''].join(' ')}
        style={{ left: note.x, top: note.y, '--rot': `${note.rot || 0}deg` }}
        onMouseDown={handleMouseDown}
      >
        <span className={styles.stickerEmoji}>{note.emoji}</span>
        <button
          className={styles.delete}
          data-delete="true"
          onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        >×</button>
      </div>
    );
  }

  const texture = note.paperTexture
    ? PAPER_TEXTURES.find(t => t.id === note.paperTexture)
    : null;

  const cardClass = [
    styles.card,
    texture ? styles.card_textured : styles[`card_${note.style}`],
    hidden ? styles.hidden : '',
    mode === 'edit' ? styles.editMode : '',
  ].join(' ');

  const paperBg = note.paperColor || (note.style === 'sticky' ? colors.bg : null);

  const cardStyle = {
    left: note.x,
    top: note.y,
    '--rot': `${note.rot || 0}deg`,
    ...(note.width ? { width: note.width } : {}),
    ...(texture
      ? { backgroundImage: `url(${texture.src})` }
      : {
          ...(paperBg ? { background: paperBg } : {}),
          ...(note.style === 'index' ? { borderTopColor: INDEX_BORDERS[note.tag] || '#ccc' } : {}),
        }
    ),
  };

  const tapeStyle = note.accentColor ? { background: note.accentColor, opacity: 0.7 } : undefined;

  return (
    <div
      ref={elRef}
      className={cardClass}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* rotate handle */}
      {mode === 'drag' && (
        <div
          className={styles.rotHandle}
          data-handle="true"
          onMouseDown={handleRotDown}
          title="rotate"
        >↻</div>
      )}

      {/* resize handle */}
      {mode === 'drag' && (
        <div
          className={styles.resizeHandle}
          data-handle="true"
          onMouseDown={handleResizeDown}
          title="resize"
        />
      )}

      {/* tape decoration */}
      {!texture && (note.style === 'torn' || note.style === 'envelope') && (
        <div className={styles.tape} style={tapeStyle} />
      )}

      {/* image */}
      {note.imageUrl && (
        <img src={note.imageUrl} alt="" className={styles.noteImage} draggable={false} />
      )}

      {/* content */}
      {note.title && <div className={styles.title}>{note.title}</div>}
      <div className={styles.body}>{note.body}</div>

      {/* tag */}
      <div className={styles.tag} style={{ background: colors.tag, color: colors.tagText }}>
        #{note.tag}
      </div>

      {/* delete */}
      <button
        className={styles.delete}
        data-delete="true"
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
      >×</button>
    </div>
  );
}
