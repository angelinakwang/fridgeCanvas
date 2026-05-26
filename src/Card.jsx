import { useRef, useCallback } from 'react';
import { TAG_COLORS, INDEX_BORDERS, PIN_COLORS } from './data';
import styles from './Card.module.css';

export default function Card({ note, onMove, onDelete, hidden, scale }) {
  const dragState = useRef(null);
  const elRef = useRef(null);
  const colors = TAG_COLORS[note.tag] || TAG_COLORS.idea;

  const handleMouseDown = useCallback((e) => {
    if (e.target.dataset.delete) return;
    e.stopPropagation();
    e.preventDefault();

    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startNX: note.x,
      startNY: note.y,
    };

    elRef.current.style.zIndex = 999;
    elRef.current.classList.add(styles.dragging);

    const onMove = (me) => {
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
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [note, scale, onMove]);

  const cardClass = [
    styles.card,
    styles[`card_${note.style}`],
    hidden ? styles.hidden : '',
  ].join(' ');

  const cardStyle = {
    left: note.x,
    top: note.y,
    transform: `rotate(${note.rot || 0}deg)`,
    ...(note.style === 'sticky' ? { background: colors.bg } : {}),
    ...(note.style === 'index'  ? { borderTopColor: INDEX_BORDERS[note.tag] || '#ccc' } : {}),
  };

  return (
    <div
      ref={elRef}
      className={cardClass}
      style={cardStyle}
      onMouseDown={handleMouseDown}
    >
      {/* decorations */}
      {(note.style === 'sticky' || note.style === 'index') && (
        <div className={styles.pin} style={{ background: PIN_COLORS[parseInt(note.id) % PIN_COLORS.length] }} />
      )}
      {(note.style === 'torn' || note.style === 'envelope') && (
        <div className={styles.tape} />
      )}

      {/* content */}
      {note.title && <div className={styles.title}>{note.title}</div>}
      <div className={styles.body}>{note.body}</div>

      {/* tag */}
      <div
        className={styles.tag}
        style={{ background: colors.tag, color: colors.tagText }}
      >
        #{note.tag}
      </div>

      {/* delete */}
      <button
        className={styles.delete}
        data-delete="true"
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
        title="remove"
      >
        ×
      </button>
    </div>
  );
}
