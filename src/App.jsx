import { useState, useMemo, useEffect, useCallback } from 'react'
import { INGREDIENT_GROUPS, RECIPES } from './recipes.js'

const ALL_ITEMS = INGREDIENT_GROUPS.flatMap(g => g.items)
const findItem = id => ALL_ITEMS.find(i => i.id === id)

const LS_SELECTED = 'wic_selected'
const LS_FAVS = 'wic_favs'

function loadSet(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw))
  } catch { return new Set() }
}
function saveSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])) } catch {}
}

function scoreRecipe(recipe, selectedSet) {
  const required = recipe.required || []
  const optional = recipe.optional || []
  const cookware = recipe.cookware || []

  const missingRequired = required.filter(r => !selectedSet.has(r))
  const hasCookware = cookware.length === 0 || cookware.some(c => selectedSet.has(c))
  const missingCookware = (!hasCookware && cookware.length > 0) ? 1 : 0
  const totalMissing = missingRequired.length + missingCookware
  const bonusMatches = optional.filter(o => selectedSet.has(o)).length

  const needed = required.length + (cookware.length > 0 ? 1 : 0)
  const have = required.length - missingRequired.length + (cookware.length > 0 && hasCookware ? 1 : 0)

  return {
    recipe,
    totalMissing,
    missingRequired,
    missingCookware,
    bonusMatches,
    canMake: totalMissing === 0,
    needed,
    have,
  }
}

const stripEmoji = label => label.replace(/^[^\w&]+\s*/u, '')

function Squiggle({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 10" fill="none" aria-hidden="true">
      <path d="M2 7 Q 12 2, 22 6 T 42 6 T 62 6 T 82 6 T 102 6 T 118 5"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function IngChip({ id, have, optional, isCookware }) {
  const item = findItem(id)
  if (!item) return null
  let cls = 'ing-chip'
  if (have) cls += ' have'
  else if (!optional) cls += ' missing'
  if (optional) cls += ' optional'
  if (isCookware) cls += ' cookware'
  return (
    <span className={cls} title={`${optional ? 'Optional: ' : ''}${item.name}`}>
      {item.emoji} {item.name}
    </span>
  )
}

function MatchBar({ have, needed }) {
  const pct = needed === 0 ? 100 : Math.round((have / needed) * 100)
  return (
    <div className="match-row" aria-label={`You have ${have} of ${needed} needed items`}>
      <div className="match-bar"><span style={{ width: `${pct}%` }} /></div>
      <span className="match-label">{have}/{needed}</span>
    </div>
  )
}

function RecipeCard({ recipe, selectedSet, onSelect, isFav, onToggleFav, index }) {
  const required = recipe.required || []
  const optional = recipe.optional || []
  const cookware = recipe.cookware || []
  const s = scoreRecipe(recipe, selectedSet)

  return (
    <article
      className="recipe-card"
      onClick={() => onSelect(recipe)}
      style={{ animationDelay: `${Math.min(index || 0, 14) * 28}ms` }}
    >
      <button
        className={`fav-btn ${isFav ? 'on' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleFav(recipe.id) }}
        aria-label={isFav ? `Remove ${recipe.name} from favourites` : `Save ${recipe.name} to favourites`}
        aria-pressed={isFav}
      >
        {isFav ? '★' : '☆'}
      </button>
      <div className="card-top">
        <span className="card-emoji" aria-hidden="true">{recipe.emoji}</span>
        <div className="card-head">
          <h3 className="recipe-name">{recipe.name}</h3>
          <div className="card-meta">
            <span>⏱ {recipe.time}</span>
            <span className="dot" aria-hidden="true" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </div>
      <p className="recipe-desc">{recipe.description}</p>
      {selectedSet.size > 0 && <MatchBar have={s.have} needed={s.needed} />}
      <div className="recipe-ingredients">
        {required.map(id => (
          <IngChip key={id} id={id} have={selectedSet.has(id)} optional={false} />
        ))}
        {optional.map(id => (
          <IngChip key={id} id={id} have={selectedSet.has(id)} optional={true} />
        ))}
        {cookware.map(id => (
          <IngChip key={id} id={id} have={selectedSet.has(id)} optional={false} isCookware />
        ))}
      </div>
    </article>
  )
}

function RecipeModal({ recipe, selectedSet, onClose, isFav, onToggleFav }) {
  useEffect(() => {
    if (!recipe) return
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [recipe, onClose])

  if (!recipe) return null
  const s = scoreRecipe(recipe, selectedSet)

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={recipe.name}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close recipe">✕</button>
        <div className="modal-emoji" aria-hidden="true">{recipe.emoji}</div>
        <h2 className="modal-title">{recipe.name}</h2>
        <div className="card-meta modal-meta">
          <span>⏱ {recipe.time}</span>
          <span className="dot" aria-hidden="true" />
          <span>{recipe.difficulty}</span>
          {selectedSet.size > 0 && (
            <>
              <span className="dot" aria-hidden="true" />
              <span className={s.canMake ? 'meta-have' : 'meta-missing'}>
                {s.canMake ? 'you have everything' : `missing ${s.totalMissing}`}
              </span>
            </>
          )}
        </div>
        <p className="modal-desc">{recipe.description}</p>

        <div className="modal-section">
          <h4>Ingredients</h4>
          <div className="recipe-ingredients">
            {(recipe.required || []).map(id => (
              <IngChip key={id} id={id} have={selectedSet.has(id)} optional={false} />
            ))}
            {(recipe.optional || []).map(id => {
              const item = findItem(id)
              return item ? (
                <span key={id} className={`ing-chip optional ${selectedSet.has(id) ? 'have' : ''}`}>
                  {item.emoji} {item.name} <em>(optional)</em>
                </span>
              ) : null
            })}
            {(recipe.cookware || []).map(id => (
              <IngChip key={id} id={id} have={selectedSet.has(id)} optional={false} isCookware />
            ))}
          </div>
        </div>

        <div className="modal-section">
          <h4>Steps</h4>
          <ol className="steps-list">
            {(recipe.steps || []).map((step, i) => (
              <li key={i}><span className="step-num">{i + 1}</span><span>{step}</span></li>
            ))}
          </ol>
        </div>

        <button
          className={`btn btn-fav-wide ${isFav ? 'on' : ''}`}
          onClick={() => onToggleFav(recipe.id)}
          aria-pressed={isFav}
        >
          {isFav ? '★ saved to favourites' : '☆ save to favourites'}
        </button>
      </div>
    </div>
  )
}

const QUICK_STARTS = [
  { label: '🥞 breakfast staples', ids: ['pan', 'egg', 'butter', 'bread'] },
  { label: '🍝 pasta night', ids: ['pot', 'pasta', 'garlic', 'oliveoil', 'cheese'] },
  { label: '🍚 clean-out-the-fridge rice', ids: ['pan', 'rice', 'egg', 'soysauce'] },
]

export default function App() {
  const [selected, setSelected] = useState(() => loadSet(LS_SELECTED))
  const [favs, setFavs] = useState(() => loadSet(LS_FAVS))
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [showAlmost, setShowAlmost] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('results') // results | favourites
  const [pickerSearch, setPickerSearch] = useState('')
  const [mobileTab, setMobileTab] = useState('recipes')

  useEffect(() => saveSet(LS_SELECTED, selected), [selected])
  useEffect(() => saveSet(LS_FAVS, favs), [favs])

  const toggle = useCallback(id => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleFav = useCallback(id => {
    setFavs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const searching = search.trim().length > 0

  const filteredRecipes = useMemo(() => {
    if (!searching) return RECIPES
    const q = search.toLowerCase()
    return RECIPES.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    )
  }, [search, searching])

  const { canMake, almost } = useMemo(() => {
    if (selected.size === 0) return { canMake: [], almost: [] }

    const scored = filteredRecipes.map(r => scoreRecipe(r, selected))
    const canMake = scored
      .filter(s => s.canMake)
      .sort((a, b) => b.bonusMatches - a.bonusMatches)
    const almost = scored
      .filter(s => !s.canMake && s.totalMissing >= 1 && s.totalMissing <= 3)
      .sort((a, b) => a.totalMissing - b.totalMissing || b.bonusMatches - a.bonusMatches)
    return { canMake, almost }
  }, [selected, filteredRecipes])

  const almostByGroup = useMemo(() => {
    const groups = {}
    almost.forEach(s => {
      const k = s.totalMissing
      if (!groups[k]) groups[k] = []
      groups[k].push(s)
    })
    return groups
  }, [almost])

  const favRecipes = useMemo(
    () => RECIPES.filter(r => favs.has(r.id)),
    [favs]
  )

  const clearAll = () => setSelected(new Set())

  const surpriseMe = () => {
    const pool = canMake.length > 0
      ? canMake.map(s => s.recipe)
      : filteredRecipes
    const pick = pool[Math.floor(Math.random() * pool.length)]
    if (pick) setActiveRecipe(pick)
  }

  const applyQuickStart = ids => {
    setSelected(new Set(ids))
    setMobileTab('recipes')
  }

  const visibleGroups = useMemo(() => {
    if (!pickerSearch.trim()) return INGREDIENT_GROUPS
    const q = pickerSearch.toLowerCase()
    return INGREDIENT_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(i => i.name.toLowerCase().includes(q))
    })).filter(g => g.items.length > 0)
  }, [pickerSearch])

  const selectedItems = useMemo(
    () => ALL_ITEMS.filter(i => selected.has(i.id)),
    [selected]
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <h1 className="wordmark">
              what can i cook?
              <Squiggle className="wordmark-squiggle" />
            </h1>
            <p className="brand-sub">tell it what you have · {RECIPES.length} recipes</p>
          </div>
          <div className="top-actions">
            <label className="search-box">
              <svg viewBox="0 0 20 20" className="search-icon" aria-hidden="true">
                <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className="search-input"
                placeholder="search recipes…"
                value={search}
                onChange={e => { setSearch(e.target.value); setTab('results') }}
                aria-label="Search recipes"
              />
              {searching && (
                <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
              )}
            </label>
            <button className="btn btn-primary" onClick={surpriseMe}>
              🎲 surprise me
            </button>
            <button
              className={`btn btn-ghost ${tab === 'favourites' ? 'active' : ''}`}
              onClick={() => setTab(tab === 'favourites' ? 'results' : 'favourites')}
              aria-pressed={tab === 'favourites'}
            >
              ★ favourites{favs.size > 0 && <span className="count-pill">{favs.size}</span>}
            </button>
          </div>
        </div>
      </header>

      <nav className="mobile-tabs" aria-label="App sections">
        <button
          className={mobileTab === 'ingredients' ? 'on' : ''}
          onClick={() => setMobileTab('ingredients')}
        >
          ingredients{selected.size > 0 && <span className="count-pill">{selected.size}</span>}
        </button>
        <button
          className={mobileTab === 'recipes' ? 'on' : ''}
          onClick={() => setMobileTab('recipes')}
        >
          recipes{selected.size > 0 && canMake.length > 0 && <span className="count-pill">{canMake.length}</span>}
        </button>
      </nav>

      <div className="content" data-tab={mobileTab}>
        <aside className="picker">
          <div className="picker-head">
            <h2 className="picker-title">your kitchen</h2>
            <div className="picker-head-right">
              <span className="picker-count">{selected.size} picked</span>
              {selected.size > 0 && (
                <button className="clear-btn" onClick={clearAll}>clear</button>
              )}
            </div>
          </div>

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
                  {stripEmoji(group.label)}
                  {picked > 0 && <span className="group-picked">{picked}</span>}
                  {group.hint && <span className="group-hint">{group.hint}</span>}
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

          {selected.size > 0 && (
            <button className="btn btn-primary see-recipes" onClick={() => setMobileTab('recipes')}>
              see recipes →
            </button>
          )}
        </aside>

        <main className="results">
          {tab !== 'favourites' && selected.size > 0 && (
            <div className="shelf" aria-label="Your selected ingredients">
              <span className="shelf-label">on your shelf</span>
              <div className="shelf-chips">
                {selectedItems.map(item => (
                  <button key={item.id} className="shelf-chip" onClick={() => toggle(item.id)}
                    aria-label={`Remove ${item.name}`}>
                    {item.emoji} {item.name} <span className="shelf-x" aria-hidden="true">✕</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'favourites' ? (
            <section className="result-section">
              <div className="section-header sage">
                <h2 className="section-title">your favourites</h2>
                <span className="section-count">{favRecipes.length}</span>
              </div>
              {favRecipes.length === 0 ? (
                <div className="soft-empty">
                  <p className="soft-empty-title">nothing saved yet</p>
                  <p>tap the ☆ on any recipe and it waits for you here.</p>
                </div>
              ) : (
                <div className="recipe-grid">
                  {favRecipes.map((recipe, i) => (
                    <RecipeCard key={recipe.id} recipe={recipe} selectedSet={selected}
                      onSelect={setActiveRecipe} isFav={favs.has(recipe.id)}
                      onToggleFav={toggleFav} index={i} />
                  ))}
                </div>
              )}
            </section>
          ) : searching ? (
            <section className="result-section">
              <div className="section-header sage">
                <h2 className="section-title">results for “{search.trim()}”</h2>
                <span className="section-count">{filteredRecipes.length}</span>
              </div>
              {filteredRecipes.length === 0 ? (
                <div className="soft-empty">
                  <p className="soft-empty-title">no recipes match that</p>
                  <p>try a simpler word — “egg”, “rice”, “soup”.</p>
                </div>
              ) : (
                <div className="recipe-grid">
                  {filteredRecipes.map((recipe, i) => (
                    <RecipeCard key={recipe.id} recipe={recipe} selectedSet={selected}
                      onSelect={setActiveRecipe} isFav={favs.has(recipe.id)}
                      onToggleFav={toggleFav} index={i} />
                  ))}
                </div>
              )}
            </section>
          ) : selected.size === 0 ? (
            <div className="empty-state">
              <img
                className="empty-doodle"
                src={`${import.meta.env.BASE_URL}doodle-empty.png`}
                alt="Doodle of an open fridge surrounded by an egg, tomato, carrot, cheese and a milk bottle"
              />
              <h2 className="empty-title">open your fridge</h2>
              <p className="empty-copy">
                pick your cookware and whatever ingredients you have lying around,
                and i'll find something worth making. even one thing is enough — try 🥑 alone.
              </p>
              <div className="quick-starts">
                <span className="quick-label">or start with:</span>
                {QUICK_STARTS.map(q => (
                  <button key={q.label} className="quick-btn" onClick={() => applyQuickStart(q.ids)}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <section className="result-section">
                <div className="section-header sage">
                  <h2 className="section-title">make it now</h2>
                  <span className="section-count">{canMake.length}</span>
                </div>
                {canMake.length === 0 ? (
                  <div className="soft-empty">
                    <p>nothing complete yet — peek at <strong>almost there</strong> below, or add one or two more things.</p>
                  </div>
                ) : (
                  <div className="recipe-grid">
                    {canMake.map(({ recipe }, i) => (
                      <RecipeCard key={recipe.id} recipe={recipe} selectedSet={selected}
                        onSelect={setActiveRecipe} isFav={favs.has(recipe.id)}
                        onToggleFav={toggleFav} index={i} />
                    ))}
                  </div>
                )}
              </section>

              {almost.length > 0 && (
                <section className="result-section almost-section">
                  <button
                    className="section-header tan collapsible"
                    onClick={() => setShowAlmost(v => !v)}
                    aria-expanded={showAlmost}
                  >
                    <h2 className="section-title">almost there</h2>
                    <span className="section-count">{almost.length}</span>
                    <span className="collapse-icon" aria-hidden="true">{showAlmost ? '–' : '+'}</span>
                  </button>

                  {showAlmost && [1, 2, 3].map(n => {
                    const group = almostByGroup[n]
                    if (!group || group.length === 0) return null
                    return (
                      <div key={n} className="almost-group">
                        <div className="almost-group-label">
                          {n === 1 ? 'one thing away' : `${n} things away`} · {group.length}
                        </div>
                        <div className="recipe-grid">
                          {group.map(({ recipe, missingRequired, missingCookware }, i) => (
                            <div key={recipe.id} className="almost-card-wrapper">
                              <div className="missing-badge">
                                <span className="missing-word">missing</span>
                                {missingRequired.map(id => {
                                  const item = findItem(id)
                                  return item ? (
                                    <span key={id} className="missing-chip">{item.emoji} {item.name}</span>
                                  ) : null
                                })}
                                {missingCookware ? (
                                  <span className="missing-chip">🍳 cookware</span>
                                ) : null}
                              </div>
                              <RecipeCard
                                recipe={recipe}
                                selectedSet={selected}
                                onSelect={setActiveRecipe}
                                isFav={favs.has(recipe.id)}
                                onToggleFav={toggleFav}
                                index={i}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </section>
              )}
            </>
          )}

          <footer className="foot">
            made by <a href="https://lormaigai.github.io" target="_blank" rel="noreferrer">angela</a> ·
            your picks stay in your browser
          </footer>
        </main>
      </div>

      <RecipeModal
        recipe={activeRecipe}
        selectedSet={selected}
        onClose={() => setActiveRecipe(null)}
        isFav={activeRecipe ? favs.has(activeRecipe.id) : false}
        onToggleFav={toggleFav}
      />
    </div>
  )
}
