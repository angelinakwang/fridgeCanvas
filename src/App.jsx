import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { INITIAL_NOTES } from './data';
import { getCardSize } from './cardSizes';
import { useLocalStorage } from './useLocalStorage';
import Card from './Card';
import Toolbar from './Toolbar';
import AddNoteModal from './AddNoteModal';
import StickerPicker from './StickerPicker';
import styles from './App.module.css';

export default function App() {
  const [notes, setNotes] = useLocalStorage('fridge-notes', INITIAL_NOTES);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('drag');
  const [selectedId, setSelectedId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const panState = useRef(null);
  const canvasRef = useRef(null);
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  const isVisible = useCallback((note) => {
    const tagOk = filter === 'all' || note.tag === filter;
    const q = search.toLowerCase();
    const searchOk = !q || (note.title + ' ' + note.body + ' ' + note.tag).toLowerCase().includes(q);
    return tagOk && searchOk;
  }, [filter, search]);

  const visibleCount = notes.filter(isVisible).length;

  const handleMove = useCallback((id, x, y) => {
    const nx = Number(x);
    const ny = Number(y);
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) return;

    setNotes(prev => {
      const moving = prev.find(n => n.id === id);
      if (!moving) return prev;

      if (moving.style === 'sticker') {
        const target = prev.find(n => {
          if (n.id === id || n.style === 'sticker') return false;
          const { width: w, height: h } = getCardSize(n);
          return nx > n.x - 30 && nx < n.x + w + 30 && ny > n.y - 30 && ny < n.y + h + 30;
        });
        return prev.map(n => n.id === id
          ? { ...n, x: nx, y: ny, attachedTo: target?.id ?? null }
          : n
        );
      }

      // Regular note: drag attached stickers along with it
      const dx = nx - moving.x;
      const dy = ny - moving.y;
      return prev.map(n => {
        if (n.id === id) return { ...n, x: nx, y: ny };
        if (n.style === 'sticker' && n.attachedTo === id) return { ...n, x: n.x + dx, y: n.y + dy };
        return n;
      });
    });
  }, [setNotes]);

  const handleUpdate = useCallback((id, fields) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...fields } : n));
  }, [setNotes]);

  const handleDelete = useCallback((id) => {
    setSelectedId(prev => (prev === id ? null : prev));
    setNotes(prev => prev.filter(n => n.id !== id));
  }, [setNotes]);

  const handleAdd = useCallback(({ title, body, tag, style, paperColor, accentColor, imageUrl, paperTexture }) => {
    const note = {
      id: uuidv4(),
      title, body, tag, style, paperColor, accentColor, imageUrl, paperTexture,
      x: Math.max(0, (200 - pan.x) / scale + Math.random() * 300),
      y: Math.max(0, (120 - pan.y) / scale + Math.random() * 180),
      rot: (Math.random() - 0.5) * 4.5,
    };
    setNotes(prev => [...prev, note]);
  }, [pan, scale, setNotes]);

  const handleEdit = useCallback((fields) => {
    if (!editingNote) return;
    setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...fields } : n));
    setEditingNote(null);
  }, [editingNote, setNotes]);

  const handleCardClick = useCallback((note) => {
    if (mode === 'edit' && note.style !== 'sticker') setEditingNote(note);
  }, [mode]);

  const handleAddSticker = useCallback((imageUrl) => {
    const note = {
      id: uuidv4(),
      style: 'sticker',
      imageUrl,
      tag: 'idea',
      title: '',
      body: '',
      width: 72,
      height: 72,
      x: Math.max(0, (300 - pan.x) / scale + Math.random() * 400),
      y: Math.max(0, (150 - pan.y) / scale + Math.random() * 200),
      rot: (Math.random() - 0.5) * 8,
    };
    setNotes(prev => [...prev, note]);
    setSelectedId(note.id);
    setStickerPickerOpen(false);
  }, [pan, scale, setNotes]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-inner')) return;
    setSelectedId(null);
    panState.current = { startX: e.clientX - pan.x, startY: e.clientY - pan.y };
    canvasRef.current.style.cursor = 'grabbing';
  }, [pan]);

  useEffect(() => {
    const onMove = (e) => {
      if (!panState.current) return;
      setPan({ x: e.clientX - panState.current.startX, y: e.clientY - panState.current.startY });
    };
    const onUp = () => {
      panState.current = null;
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;
    const prev = scaleRef.current;
    const next = Math.min(2.2, Math.max(0.25, prev * factor));
    const p = panRef.current;
    const newPan = {
      x: mx - (mx - p.x) * (next / prev),
      y: my - (my - p.y) * (next / prev),
    };
    scaleRef.current = next;
    panRef.current = newPan;
    setScale(next);
    setPan(newPan);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'n') setModalOpen(true);
      if (e.key === 'd') setMode('drag');
      if (e.key === 'e') setMode('edit');
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Toolbar
        filter={filter}
        onFilter={setFilter}
        search={search}
        onSearch={setSearch}
        noteCount={visibleCount}
        totalCount={notes.length}
        onAdd={() => setModalOpen(true)}
        mode={mode}
        onMode={setMode}
        onSticker={() => setStickerPickerOpen(true)}
      />

      <div ref={canvasRef} className={styles.canvas} onMouseDown={handleCanvasMouseDown}>
        <div
          className={'canvas-inner ' + styles.inner}
          style={{ transform: 'translate(' + pan.x + 'px,' + pan.y + 'px) scale(' + scale + ')' }}
        >
          {notes.map(note => (
            <Card
              key={note.id}
              note={note}
              onMove={handleMove}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              hidden={!isVisible(note)}
              scale={scale}
              mode={mode}
              onCardClick={handleCardClick}
              selected={selectedId === note.id}
              onSelect={setSelectedId}
            />
          ))}
        </div>
        <div className={styles.grid} />
      </div>

      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => setScale(s => Math.min(2.2, s + 0.15))}>+</button>
        <button className={styles.zoomBtn} onClick={() => setScale(s => Math.max(0.25, s - 0.15))}>−</button>
        <button className={styles.zoomBtn} style={{ fontSize: 14 }} onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}>⌂</button>
      </div>

      <div className={styles.hint}>
      {mode === 'drag'
          ? 'drag to pan · scroll to zoom · select a note to rotate or resize · press n to add'
          : 'click a note to edit · drag canvas to pan'}
      </div>

      {stickerPickerOpen && (
        <StickerPicker
          onPick={handleAddSticker}
          onClose={() => setStickerPickerOpen(false)}
        />
      )}

      <AddNoteModal
        open={modalOpen || !!editingNote}
        editNote={editingNote}
        onClose={() => { setModalOpen(false); setEditingNote(null); }}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />
    </>
  );
}
