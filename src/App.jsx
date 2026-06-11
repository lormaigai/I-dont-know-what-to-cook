import { useState, useMemo, useEffect } from 'react'
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

  return {
    recipe,
    totalMissing,
    missingRequired,
    missingCookware,
    bonusMatches,
    canMake: totalMissing === 0,
  }
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

function RecipeCard({ recipe, selectedSet, onSelect, isFav, onToggleFav }) {
  const required = recipe.required || []
  const optional = recipe.optional || []
  const cookware = recipe.cookware || []

  return (
    <div className="recipe-card" onClick={() => onSelect(recipe)}>
      <button
        className={`fav-btn ${isFav ? 'on' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleFav(recipe.id) }}
        title={isFav ? 'Remove from favourites' : 'Save to favourites'}
      >
        {isFav ? '★' : '☆'}
      </button>
      <div className="recipe-header">
        <span className="recipe-emoji">{recipe.emoji}</span>
        <div>
          <h3 className="recipe-name">{recipe.name}</h3>
          <div className="recipe-meta">
            <span className="badge badge-time">⏱ {recipe.time}</span>
            <span className="badge badge-diff">{recipe.difficulty}</span>
          </div>
        </div>
      </div>
      <p className="recipe-desc">{recipe.description}</p>
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
    </div>
  )
}

function RecipeModal({ recipe, onClose, isFav, onToggleFav }) {
  if (!recipe) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <button
          className={`fav-btn modal-fav ${isFav ? 'on' : ''}`}
          onClick={() => onToggleFav(recipe.id)}
        >
          {isFav ? '★' : '☆'}
        </button>
        <div className="modal-emoji">{recipe.emoji}</div>
        <h2>{recipe.name}</h2>
        <div className="recipe-meta" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
          <span className="badge badge-time">⏱ {recipe.time}</span>
          <span className="badge badge-diff">{recipe.difficulty}</span>
        </div>
        <p className="modal-desc">{recipe.description}</p>

        <div className="modal-section">
          <h4>Ingredients</h4>
          <div className="recipe-ingredients">
            {(recipe.required || []).map(id => {
              const item = findItem(id)
              return item ? <span key={id} className="ing-chip have">{item.emoji} {item.name}</span> : null
            })}
            {(recipe.optional || []).map(id => {
              const item = findItem(id)
              return item ? <span key={id} className="ing-chip optional">{item.emoji} {item.name} <em>(optional)</em></span> : null
            })}
          </div>
        </div>

        <div className="modal-section">
          <h4>Steps</h4>
          <ol className="steps-list">
            {(recipe.steps || []).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [selected, setSelected] = useState(() => loadSet(LS_SELECTED))
  const [favs, setFavs] = useState(() => loadSet(LS_FAVS))
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [showAlmost, setShowAlmost] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('results') // results | favourites
  const [pickerSearch, setPickerSearch] = useState('')

  useEffect(() => saveSet(LS_SELECTED, selected), [selected])
  useEffect(() => saveSet(LS_FAVS, favs), [favs])

  const toggle = id => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFav = id => {
    setFavs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return RECIPES
    const q = search.toLowerCase()
    return RECIPES.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    )
  }, [search])

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

  const visibleGroups = useMemo(() => {
    if (!pickerSearch.trim()) return INGREDIENT_GROUPS
    const q = pickerSearch.toLowerCase()
    return INGREDIENT_GROUPS.map(g => ({
      ...g,
      items: g.items.filter(i => i.name.toLowerCase().includes(q))
    })).filter(g => g.items.length > 0)
  }, [pickerSearch])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-title">
            <h1>🍳 What Can I Cook?</h1>
            <p className="subtitle">Pick what you have — find what to make. {RECIPES.length} recipes.</p>
          </div>
          <div className="header-actions">
            <input
              className="search-input"
              placeholder="🔍 Search recipes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="header-btn"
              onClick={surpriseMe}
              title="Pick a random recipe from your matches"
            >🎲 Surprise me</button>
            <button
              className={`header-btn ${tab === 'favourites' ? 'active' : ''}`}
              onClick={() => setTab(tab === 'favourites' ? 'results' : 'favourites')}
            >★ Favourites ({favs.size})</button>
          </div>
        </div>
      </header>

      <div className="content">
        {/* Ingredient picker */}
        <aside className="picker">
          <div className="picker-header">
            <span>{selected.size} selected</span>
            {selected.size > 0 && (
              <button className="clear-btn" onClick={clearAll}>Clear all</button>
            )}
          </div>

          <input
            className="picker-search"
            placeholder="Filter ingredients…"
            value={pickerSearch}
            onChange={e => setPickerSearch(e.target.value)}
          />

          {visibleGroups.map(group => (
            <div key={group.label} className="group">
              <div className="group-label">
                {group.label}
                {group.hint && <span className="group-hint">{group.hint}</span>}
              </div>
              <div className="group-items">
                {group.items.map(item => (
                  <button
                    key={item.id}
                    className={`ing-btn ${selected.has(item.id) ? 'selected' : ''}`}
                    onClick={() => toggle(item.id)}
                  >
                    <span className="ing-emoji">{item.emoji}</span>
                    <span className="ing-name">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="results">
          {tab === 'favourites' ? (
            <section className="result-section">
              <div className="section-header" style={{ '--accent-color': '#e8622a' }}>
                <span className="section-emoji">★</span>
                <h2 className="section-title">Your Favourites</h2>
                <span className="section-count">{favRecipes.length}</span>
              </div>
              {favRecipes.length === 0 ? (
                <p className="no-results-hint">No favourites yet. Tap the star on any recipe to save it.</p>
              ) : (
                <div className="recipe-grid">
                  {favRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      selectedSet={selected}
                      onSelect={setActiveRecipe}
                      isFav={favs.has(recipe.id)}
                      onToggleFav={toggleFav}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : selected.size === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">👈</div>
              <h2>Select ingredients to get started</h2>
              <p>
                Start with your <strong>cookware</strong> (top of the sidebar), then pick anything you have.
                Even one ingredient can find recipes — try 🥑 alone.
              </p>
            </div>
          ) : (
            <>
              <section className="result-section">
                <div className="section-header" style={{ '--accent-color': '#2a7a4b' }}>
                  <span className="section-emoji">✅</span>
                  <h2 className="section-title">Can Make Now</h2>
                  <span className="section-count">{canMake.length}</span>
                </div>
                {canMake.length === 0 ? (
                  <p className="no-results-hint">
                    Nothing complete yet — check Almost There below, or add more ingredients.
                  </p>
                ) : (
                  <div className="recipe-grid">
                    {canMake.map(({ recipe }) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        selectedSet={selected}
                        onSelect={setActiveRecipe}
                        isFav={favs.has(recipe.id)}
                        onToggleFav={toggleFav}
                      />
                    ))}
                  </div>
                )}
              </section>

              {almost.length > 0 && (
                <section className="result-section almost-section">
                  <button
                    className="section-header collapsible"
                    style={{ '--accent-color': '#b85c1a' }}
                    onClick={() => setShowAlmost(v => !v)}
                  >
                    <span className="section-emoji">🛒</span>
                    <h2 className="section-title">Almost There</h2>
                    <span className="section-count">{almost.length}</span>
                    <span className="collapse-icon">{showAlmost ? '▲' : '▼'}</span>
                  </button>

                  {showAlmost && [1, 2, 3].map(n => {
                    const group = almostByGroup[n]
                    if (!group || group.length === 0) return null
                    return (
                      <div key={n} className="almost-group">
                        <div className="almost-group-label">
                          Missing {n} ingredient{n > 1 ? 's' : ''} ({group.length})
                        </div>
                        <div className="recipe-grid">
                          {group.map(({ recipe, missingRequired, missingCookware }) => (
                            <div key={recipe.id} className="almost-card-wrapper">
                              <div className="missing-badge">
                                {missingRequired.map(id => {
                                  const item = findItem(id)
                                  return item ? <span key={id} title={item.name}>{item.emoji}</span> : null
                                })}
                                {missingCookware ? <span title="Need cookware">🍳</span> : null}
                                <span className="missing-label">need {n} more</span>
                              </div>
                              <RecipeCard
                                recipe={recipe}
                                selectedSet={selected}
                                onSelect={setActiveRecipe}
                                isFav={favs.has(recipe.id)}
                                onToggleFav={toggleFav}
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
        </main>
      </div>

      <RecipeModal
        recipe={activeRecipe}
        onClose={() => setActiveRecipe(null)}
        isFav={activeRecipe ? favs.has(activeRecipe.id) : false}
        onToggleFav={toggleFav}
      />
    </div>
  )
}
