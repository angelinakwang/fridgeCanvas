import { useRef, useCallback } from 'react';
import { TAG_COLORS, INDEX_BORDERS, PIN_COLORS, PAPER_TEXTURES } from './data';
import styles from './Card.module.css';

function hashId(id) {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

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

  const texture = note.paperTexture
    ? PAPER_TEXTURES.find(t => t.id === note.paperTexture)
    : null;

  const cardClass = [
    styles.card,
    texture ? styles.card_textured : styles[`card_${note.style}`],
    hidden ? styles.hidden : '',
  ].join(' ');

  const paperBg = note.paperColor || (note.style === 'sticky' ? colors.bg : null);

  const cardStyle = {
    left: note.x,
    top: note.y,
    '--rot': `${note.rot || 0}deg`,
    ...(texture
      ? { backgroundImage: `url(${texture.src})` }
      : {
          ...(paperBg ? { background: paperBg } : {}),
          ...(note.style === 'index' ? { borderTopColor: INDEX_BORDERS[note.tag] || '#ccc' } : {}),
        }
    ),
  };

  const pinColor = note.accentColor || PIN_COLORS[hashId(note.id) % PIN_COLORS.length];
  const tapeStyle = note.accentColor ? { background: note.accentColor, opacity: 0.7 } : undefined;

  return (
    <div
      ref={elRef}
      className={cardClass}
      style={cardStyle}
      onMouseDown={handleMouseDown}
    >
      {/* decorations — hidden for textured cards (image has its own decoration) */}
      {!texture && (note.style === 'sticky' || note.style === 'index') && (
        <div className={styles.pin} style={{ background: pinColor }} />
      )}
      {!texture && (note.style === 'torn' || note.style === 'envelope') && (
        <div className={styles.tape} style={tapeStyle} />
      )}

      {/* image */}
      {note.imageUrl && (
        <img
          src={note.imageUrl}
          alt=""
          className={styles.noteImage}
          draggable={false}
        />
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
