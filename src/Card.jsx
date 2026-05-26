import { useRef, useCallback } from 'react';
import { TAG_COLORS, INDEX_BORDERS, PAPER_TEXTURES } from './data';
import { getCardSize } from './cardSizes';
import styles from './Card.module.css';

const DRAG_THRESHOLD = 4;

export default function Card({
  note,
  onMove,
  onUpdate,
  onDelete,
  hidden,
  scale,
  mode,
  onCardClick,
  selected,
  onSelect,
}) {
  const dragState = useRef(null);
  const elRef = useRef(null);
  const colors = TAG_COLORS[note.tag] || TAG_COLORS.idea;
  const { width, height } = getCardSize(note);
  const posX = Number(note.x) || 0;
  const posY = Number(note.y) || 0;

  const baseTransform = `rotate(${note.rot || 0}deg)`;

  const handleMouseDown = useCallback((e) => {
    if (e.target.dataset.delete || e.target.dataset.handle) return;
    if (mode === 'edit' && note.style !== 'sticker') return;
    e.stopPropagation();
    e.preventDefault();
    onSelect(note.id);

    const el = elRef.current;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startNX: posX,
      startNY: posY,
      moved: false,
    };

    el.style.zIndex = '999';
    el.classList.add(styles.dragging);

    const handlePointerMove = (me) => {
      if (!dragState.current) return;
      const dx = me.clientX - dragState.current.startX;
      const dy = me.clientY - dragState.current.startY;
      if (!dragState.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      dragState.current.moved = true;
      const canvasDx = dx / scale;
      const canvasDy = dy / scale;
      el.style.left = (dragState.current.startNX + canvasDx) + 'px';
      el.style.top = (dragState.current.startNY + canvasDy) + 'px';
    };

    const handlePointerUp = (me) => {
      if (!dragState.current) return;
      const dx = me.clientX - dragState.current.startX;
      const dy = me.clientY - dragState.current.startY;
      const moved = dragState.current.moved || Math.hypot(dx, dy) >= DRAG_THRESHOLD;

      if (moved) {
        const x = dragState.current.startNX + dx / scale;
        const y = dragState.current.startNY + dy / scale;
        onMove(note.id, x, y);
      }

      dragState.current = null;
      el.style.zIndex = '';
      el.classList.remove(styles.dragging);
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
  }, [note, posX, posY, scale, onMove, onSelect, mode]);

  const handleClick = useCallback(() => {
    if (mode === 'edit' && note.style !== 'sticker') onCardClick(note);
  }, [mode, note, onCardClick]);

  const handleRotateStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const el = elRef.current;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startRot = note.rot || 0;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);

    const handlePointerMove = (me) => {
      const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      const rot = startRot + (angle - startAngle);
      el.style.transform = `rotate(${rot}deg)`;
    };

    const handlePointerUp = (me) => {
      const angle = Math.atan2(me.clientY - cy, me.clientX - cx) * (180 / Math.PI);
      const rot = startRot + (angle - startAngle);
      el.style.transform = '';
      onUpdate(note.id, { rot: Math.round(rot * 10) / 10 });
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
  }, [note, onUpdate]);

  const handleResizeStart = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const el = elRef.current;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;
    const minW = note.style === 'sticker' ? 24 : 80;
    const minH = note.style === 'sticker' ? 24 : 60;

    const handlePointerMove = (me) => {
      const newW = Math.max(minW, startW + (me.clientX - startX) / scale);
      const newH = Math.max(minH, startH + (me.clientY - startY) / scale);
      el.style.width = newW + 'px';
      el.style.height = newH + 'px';
    };

    const handlePointerUp = (me) => {
      const newW = Math.max(minW, startW + (me.clientX - startX) / scale);
      const newH = Math.max(minH, startH + (me.clientY - startY) / scale);
      onUpdate(note.id, { width: Math.round(newW), height: Math.round(newH) });
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
    };

    document.addEventListener('mousemove', handlePointerMove);
    document.addEventListener('mouseup', handlePointerUp);
  }, [note, width, height, scale, onUpdate]);

  const sizeStyle = { width, height, minHeight: height };
  const transformStyle = { transform: baseTransform, '--rot': `${note.rot || 0}deg` };

  const handles = selected && !hidden && mode === 'drag' && (
    <div className={styles.handles}>
      <div
        className={styles.rotateHandle}
        data-handle="rotate"
        onMouseDown={handleRotateStart}
        title="Rotate"
      />
      <div
        className={styles.resizeHandle}
        data-handle="resize"
        onMouseDown={handleResizeStart}
        title="Resize"
      />
    </div>
  );

  if (note.style === 'sticker') {
    if (!note.imageUrl) return null;
    return (
      <div
        ref={elRef}
        className={[
          styles.card,
          styles.card_sticker,
          hidden ? styles.hidden : '',
          selected ? styles.selected : '',
        ].join(' ')}
        style={{ left: posX, top: posY, ...sizeStyle, ...transformStyle }}
        onMouseDown={handleMouseDown}
      >
        <img src={note.imageUrl} alt="" className={styles.stickerImg} draggable={false} />
        {handles}
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
    selected ? styles.selected : '',
  ].join(' ');

  const paperBg = note.paperColor || (note.style === 'sticky' ? colors.bg : null);

  const cardStyle = {
    left: posX,
    top: posY,
    ...sizeStyle,
    ...transformStyle,
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
      {!texture && (note.style === 'torn' || note.style === 'envelope') && (
        <div className={styles.tape} style={tapeStyle} />
      )}

      {note.imageUrl && (
        <img src={note.imageUrl} alt="" className={styles.noteImage} draggable={false} />
      )}

      {note.title && <div className={styles.title}>{note.title}</div>}
      <div className={styles.body}>{note.body}</div>

      <div className={styles.tag} style={{ background: colors.tag, color: colors.tagText }}>
        #{note.tag}
      </div>

      {handles}

      <button
        className={styles.delete}
        data-delete="true"
        onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
      >×</button>
    </div>
  );
}