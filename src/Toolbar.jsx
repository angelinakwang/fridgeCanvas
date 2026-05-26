import { TAG_COLORS, ALL_TAGS } from './data';
import styles from './Toolbar.module.css';

export default function Toolbar({ filter, onFilter, search, onSearch, noteCount, totalCount, onAdd }) {
  return (
    <div className={styles.toolbar}>
      <h1 className={styles.logo}>✦ my fridge</h1>

      <div className={styles.sep} />

      <div className={styles.searchWrap}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          className={styles.search}
          placeholder="search notes..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      <div className={styles.sep} />

      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>tag:</span>
        <button
          className={[styles.pill, filter === 'all' ? styles.pillActive : ''].join(' ')}
          onClick={() => onFilter('all')}
        >
          all
        </button>
        {ALL_TAGS.map(tag => {
          const active = filter === tag;
          const colors = TAG_COLORS[tag];
          return (
            <button
              key={tag}
              className={[styles.pill, active ? styles.pillActive : ''].join(' ')}
              style={active ? { background: colors.tag, borderColor: colors.tag, color: colors.tagText } : {}}
              onClick={() => onFilter(tag)}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <span className={styles.count}>
        {filter === 'all' && !search ? `${totalCount} notes` : `${noteCount} / ${totalCount}`}
      </span>

      <button className={styles.addBtn} onClick={onAdd}>+ add note</button>
    </div>
  );
}
