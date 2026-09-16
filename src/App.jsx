import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { INGREDIENT_GROUPS, ALL_ITEMS, findItem } from './ingredients.js'
import { MEALS, MENU, scoreDish } from './menu.js'

const LS_SELECTED = 'wic_selected'

function loadSelected() {
  try {
    const raw = localStorage.getItem(LS_SELECTED)
    if (!raw) return new Set()
    const ids = JSON.parse(raw).filter(id => findItem(id))
    return new Set(ids)
  } catch { return new Set() }
}

function Squiggle({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 10" fill="none" aria-hidden="true">
      <path d="M2 7 Q 12 2, 22 6 T 42 6 T 62 6 T 82 6 T 102 6 T 118 5"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// deterministic little tilt so shelf items feel hand-placed
function tilt(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
  return (h % 11) - 5 // -5..5 deg
}

function ShelfItem({ item, onRemove }) {
  return (
    <button
      className="shelf-item"
      style={{ '--tilt': `${tilt(item.id)}deg` }}
      onClick={() => onRemove(item.id)}
      aria-label={`Put ${item.name} back`}
      title={`${item.name} - tap to put back`}
    >
      <span className="shelf-item-emoji" aria-hidden="true">{item.emoji}</span>
      <span className="shelf-item-name">{item.name}</span>
    </button>
  )
}

function ZoneShelf({ zoneId, label, selected, onRemove, className = '' }) {
  const items = ALL_ITEMS.filter(i => i.zone === zoneId && selected.has(i.id))
  return (
    <div className={`zone ${className} ${items.length > 8 ? 'crowded' : ''}`} data-zone={zoneId}>
      <div className="zone-items">
        {items.map(item => <ShelfItem key={item.id} item={item} onRemove={onRemove} />)}
      </div>
      <span className="zone-label">{label}</span>
    </div>
  )
}

function Kitchen({ selected, onRemove, closing }) {
  return (
    <div className={`kitchen ${closing ? 'closing' : ''}`}>
      <div className="fridge-door" aria-label="Fridge door rack">
        <div className="door-rack">
          <ZoneShelf zoneId="door" label="door rack" selected={selected} onRemove={onRemove} />
        </div>
        <span className="door-handle" aria-hidden="true" />
      </div>

      <div className="fridge" aria-label="Fridge">
        <div className="freezer">
          <ZoneShelf zoneId="freezer" label="freezer" selected={selected} onRemove={onRemove} />
        </div>
        <div className="fridge-body">
          <ZoneShelf zoneId="shelf-top" label="top shelf" selected={selected} onRemove={onRemove} className="shelf" />
          <ZoneShelf zoneId="shelf-mid" label="middle shelf" selected={selected} onRemove={onRemove} className="shelf" />
          <ZoneShelf zoneId="crisper" label="crisper drawer" selected={selected} onRemove={onRemove} className="crisper" />
        </div>
      </div>

      <div className="pantry" aria-label="Pantry">
        <div className="pantry-shelf">
          <ZoneShelf zoneId="pantry" label="pantry" selected={selected} onRemove={onRemove} />
        </div>
      </div>
    </div>
  )
}

function IngChip({ id, have, missing }) {
  const item = findItem(id)
  if (!item) return null
  const cls = have ? 'ing-chip have' : missing ? 'ing-chip missing' : 'ing-chip'
  return <span className={cls}>{item.emoji} {item.name}</span>
}

function DishCard({ scored, selectedSet, index }) {
  const { dish, isPick, matched, missing, anyMissing } = scored
  const needsAny = dish.needsAny || []
  const gap = missing.length + (anyMissing ? 1 : 0)
  const farOff = !matched && !isPick && gap > 2
  return (
    <article className={`dish-card ${matched ? 'matched' : ''}`}
      style={{ animationDelay: `${Math.min(index || 0, 16) * 30}ms` }}>
      <div className="dish-head">
        <h3 className="dish-name">{dish.name}</h3>
        <span className={`dish-tag ${matched ? 'tag-match' : (isPick || farOff) ? 'tag-pick' : 'tag-almost'}`}>
          {matched ? 'from your fridge' : (isPick || farOff) ? 'menu pick' : 'almost'}
        </span>
      </div>
      {dish.desc && <p className="dish-desc">{dish.desc}</p>}
      {!isPick && selectedSet.size > 0 && (
        <div className="dish-ings">
          {(dish.needs || []).map(id => (
            <IngChip key={id} id={id} have={selectedSet.has(id)} missing={!selectedSet.has(id)} />
          ))}
          {needsAny.length > 0 && (
            anyMissing
              ? <span className="ing-chip missing">🍗 chicken or fish</span>
              : <span className="ing-chip have">🍗 chicken or fish</span>
          )}
        </div>
      )}
    </article>
  )
}

function MealSection({ meal, dishes, selectedSet }) {
  const matched = []
  const almost = []
  const picks = []
  dishes.forEach(s => {
    if (s.matched) { matched.push(s); return }
    const gap = s.missing.length + (s.anyMissing ? 1 : 0)
    if (!s.isPick && gap <= 2) { almost.push(s); return }
    picks.push(s)
  })

  let idx = 0
  return (
    <section className="meal-section">
      <div className="meal-header">
        <span className="meal-emoji" aria-hidden="true">{meal.emoji}</span>
        <h2 className="meal-title">{meal.label}</h2>
        {matched.length > 0 && <span className="meal-count">{matched.length} from your fridge</span>}
      </div>

      {matched.length > 0 && (
        <div className="dish-grid">
          {matched.map(s => <DishCard key={s.dish.id} scored={s} selectedSet={selectedSet} index={idx++} />)}
        </div>
      )}

      {almost.length > 0 && (
        <>
          <p className="sub-label">a thing or two away</p>
          <div className="dish-grid">
            {almost.map(s => <DishCard key={s.dish.id} scored={s} selectedSet={selectedSet} index={idx++} />)}
          </div>
        </>
      )}

      {picks.length > 0 && (
        <>
          <p className="sub-label">{matched.length > 0 || almost.length > 0 ? 'also on the menu' : 'on the menu'}</p>
          <div className="dish-grid">
            {picks.map(s => <DishCard key={s.dish.id} scored={s} selectedSet={selectedSet} index={idx++} />)}
          </div>
        </>
      )}
    </section>
  )
}

const TRANSITION_BEATS = ['closing the fridge…', 'peeking at the menu…', 'plating up…']

export default function App() {
  const [selected, setSelected] = useState(loadSelected)
  const [view, setView] = useState('fridge') // fridge | transition | results
  const [closing, setClosing] = useState(false)
  const [beat, setBeat] = useState(0)
  const [pickerSearch, setPickerSearch] = useState('')
  const timers = useRef([])

  useEffect(() => {
    try { localStorage.setItem(LS_SELECTED, JSON.stringify([...selected])) } catch {}
  }, [selected])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const toggle = useCallback(id => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const generate = useCallback(() => {
    if (view !== 'fridge') return
    setClosing(true)
    timers.current.push(setTimeout(() => { setView('transition'); setBeat(0) }, 750))
    TRANSITION_BEATS.forEach((_, i) => {
      if (i > 0) timers.current.push(setTimeout(() => setBeat(i), 750 + i * 550))
    })
    timers.current.push(setTimeout(() => {
      setView('results')
      setClosing(false)
      window.scrollTo({ top: 0 })
    }, 750 + TRANSITION_BEATS.length * 550 + 250))
  }, [view])

  const backToFridge = () => {
    setView('fridge')
    window.scrollTo({ top: 0 })
  }

  const visibleGroups = useMemo(() => {
    if (!pickerSearch.trim()) return INGREDIENT_GROUPS
    const q = pickerSearch.toLowerCase()
    return INGREDIENT_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(i => i.name.toLowerCase().includes(q)),
    })).filter(g => g.items.length > 0)
  }, [pickerSearch])

  const scoredMenu = useMemo(() => MENU.map(d => scoreDish(d, selected)), [selected])

  const matchCount = useMemo(() => scoredMenu.filter(s => s.matched).length, [scoredMenu])

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <h1 className="wordmark">
              what can i cook?
              <Squiggle className="wordmark-squiggle" />
            </h1>
            <p className="brand-sub">stock the fridge · get tonight's menu</p>
          </div>
          {view === 'results' ? (
            <button className="btn btn-ghost" onClick={backToFridge}>← restock the fridge</button>
          ) : (
            <span className="stock-count">{selected.size} stocked</span>
          )}
        </div>
      </header>

      {view !== 'results' && (
        <main className={`fridge-view ${view === 'transition' ? 'transitioning' : ''}`}>
          <div className="kitchen-wrap">
            <Kitchen selected={selected} onRemove={toggle} closing={closing} />
          </div>

          <aside className="picker">
            <div className="picker-head">
              <h2 className="picker-title">stock your kitchen</h2>
              {selected.size > 0 && (
                <button className="clear-btn" onClick={() => setSelected(new Set())}>empty it all</button>
              )}
            </div>
            <p className="picker-hint">tap what you have - it lands right on the shelf</p>

            <input
              className="picker-search"
              placeholder="filter ingredients…"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              aria-label="Filter ingredients"
            />

            {visibleGroups.length === 0 && (
              <p className="picker-empty">nothing matches “{pickerSearch}”</p>
            )}

            {visibleGroups.map(group => {
              const picked = group.items.filter(i => selected.has(i.id)).length
              return (
                <section key={group.label} className="group">
                  <h3 className="group-label">
                    {group.label}
                    {picked > 0 && <span className="group-picked">{picked}</span>}
                  </h3>
                  <div className="group-items">
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        className={`ing-btn ${selected.has(item.id) ? 'selected' : ''}`}
                        onClick={() => toggle(item.id)}
                        aria-pressed={selected.has(item.id)}
                      >
                        <span className="ing-emoji" aria-hidden="true">{item.emoji}</span>
                        <span className="ing-name">{item.name}</span>
                        {selected.has(item.id) && <span className="ing-check" aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </aside>

          <div className="generate-bar">
            <div className="generate-inner">
              <span className="generate-note">
                {selected.size === 0
                  ? 'the fridge is empty - the whole menu it is'
                  : `${selected.size} thing${selected.size === 1 ? '' : 's'} in the kitchen`}
              </span>
              <button className="btn btn-primary btn-generate" onClick={generate}>
                what can i cook? →
              </button>
            </div>
          </div>

          {view === 'transition' && (
            <div className="transition-overlay" role="status" aria-live="polite">
              <div className="transition-card">
                <span className="transition-emoji" aria-hidden="true">🍽️</span>
                <p className="transition-text">{TRANSITION_BEATS[beat]}</p>
                <div className="transition-dots" aria-hidden="true">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {view === 'results' && (
        <main className="results-view">
          <div className="menu-frame">
            <p className="menu-kicker">tonight's menu, from your fridge</p>
            <h2 className="menu-wordmark">hon's kitchen</h2>
            <p className="menu-sub">
              {matchCount > 0
                ? `${matchCount} dish${matchCount === 1 ? '' : 'es'} ready with what you stocked`
                : 'nothing fully stocked - here is the whole menu anyway'}
            </p>
          </div>

          {MEALS.map(meal => (
            <MealSection
              key={meal.id}
              meal={meal}
              dishes={scoredMenu.filter(s => s.dish.meal === meal.id)}
              selectedSet={selected}
            />
          ))}

          <div className="results-foot-row">
            <button className="btn btn-primary" onClick={backToFridge}>← restock the fridge</button>
          </div>

          <footer className="foot">
            made by <a href="https://lormaigai.github.io" target="_blank" rel="noreferrer">angela</a> ·
            your picks stay in your browser
          </footer>
        </main>
      )}
    </div>
  )
}
