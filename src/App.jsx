import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { INITIAL_NOTES } from './data';
import { useLocalStorage } from './useLocalStorage';
import Card from './Card';
import Toolbar from './Toolbar';
import AddNoteModal from './AddNoteModal';
import styles from './App.module.css';

export default function App() {
  const [notes, setNotes] = useLocalStorage('fridge-notes', INITIAL_NOTES);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
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
    setNotes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  }, [setNotes]);

  const handleDelete = useCallback((id) => {
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

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.target !== canvasRef.current && !e.target.classList.contains('canvas-inner')) return;
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
      if (e.key === 'n' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setModalOpen(true);
      }
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
              onDelete={handleDelete}
              hidden={!isVisible(note)}
              scale={scale}
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

      <div className={styles.hint}>drag to pan · scroll to zoom · press n to add</div>

      <AddNoteModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </>
  );
}
