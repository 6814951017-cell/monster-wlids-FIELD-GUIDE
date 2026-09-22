import { useEffect, useMemo, useState } from 'react'
import AdminPanel from './AdminPanel'

const resources = [['monsters', 'Monsters'], ['weapons', 'Weapons'], ['armors', 'Armor'], ['quests', 'Quests'], ['items', 'Items']]
const titleCase = (value) => String(value || '—').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
const nameOf = (entry) => entry.name || entry.setName || entry.title || 'Untitled'
const kindOf = (entry) => entry.classification || entry.weaponType || entry.rank || entry.category || entry.questType || 'Entry'

function summary(entry, resource) {
  return {
    monsters: `${titleCase(entry.classification)} · ${entry.species || 'Unknown species'}`,
    weapons: `${titleCase(entry.weaponType)}`,
    armors: `${titleCase(entry.rank)} rank`,
    quests: `${titleCase(entry.rank)} rank · ${titleCase(entry.questType)}`,
    items: `${titleCase(entry.category)} · Rarity ${entry.rarity ?? '—'}`,
  }[resource] || ''
}

export default function Home({ onLogout }) {
  const [resource, setResource] = useState('monsters')
  const [game, setGame] = useState('')
  const [games, setGames] = useState([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState([])
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [status, setStatus] = useState('Loading field notes…')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  const params = useMemo(() => {
    const values = new URLSearchParams({ page: String(page), limit: '12' })
    if (game) values.set('game', game)
    if (query) values.set('q', query)
    return values
  }, [page, game, query])

  useEffect(() => {
    fetch('/api/games?limit=100').then((response) => response.ok ? response.json() : Promise.reject()).then(({ data }) => setGames(data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setError(''); setStatus(page > 1 ? 'Loading more entries…' : 'Loading field notes…')
    fetch(`/api/${resource}?${params}`).then(async (response) => {
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      return response.json()
    }).then(({ data, pagination: nextPagination }) => {
      if (!active) return
      setEntries((current) => page === 1 ? (data || []) : [...current, ...(data || [])])
      setPagination(nextPagination || { total: 0, pages: 1 }); setStatus(`${nextPagination?.total ?? 0} ${resource} found`)
    }).catch((requestError) => {
      if (!active) return
      setEntries([]); setError(requestError.message); setStatus('Could not reach the API')
    })
    return () => { active = false }
  }, [resource, params, page])

  const resetSearch = (nextResource) => { setResource(nextResource); setPage(1) }
  const detailFields = selected && Object.entries(selected).filter(([key, value]) => !['_id', '__v', 'createdAt', 'updatedAt', 'image', 'game', 'slug'].includes(key) && value !== undefined && value !== null && value !== '')
  const formatValue = (value) => Array.isArray(value) ? value.map((item) => typeof item === 'object' ? item.name || item.setName || item.element || JSON.stringify(item) : item).join(', ') : typeof value === 'object' ? value.name || value.setName || JSON.stringify(value) : String(value)

  return <div className="min-h-screen bg-[#0b0f0e] font-sans text-[#e6efe9]">
    <header className="sticky top-0 z-20 border-b border-[#0f1a16] bg-[#07100e] px-[7vw]"><div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between">
      <a href="#top" className="font-bold leading-3 tracking-wider" aria-label="Hunter's Field Guide home"><span className="mr-2 text-xl text-[#e95e31]">◆</span>HUNTER'S<br />FIELD GUIDE</a>
    <nav className="hidden gap-7 text-xs font-bold tracking-[.15em] md:flex" aria-label="Main navigation"><a href="#database" className="transition hover:text-[#e95e31]">DATABASE</a><a href="#about" className="transition hover:text-[#e95e31]">ABOUT</a><button onClick={onLogout} className="transition hover:text-[#e95e31]">LOG OUT</button><button onClick={() => setAdminOpen(true)} className="transition hover:text-[#e95e31]">ADMIN</button></nav>
      <button className="text-xl md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">☰</button>
    </div>{menuOpen && <nav className="flex flex-col gap-4 border-t border-[#0f1a16] py-4 text-xs font-bold tracking-[.15em] md:hidden"><a href="#database" onClick={() => setMenuOpen(false)}>DATABASE</a><a href="#about" onClick={() => setMenuOpen(false)}>ABOUT</a><button className="text-left" onClick={onLogout}>LOG OUT</button></nav>}</header>
    <main id="top">
      <section className="hero relative isolate flex min-h-[420px] items-center overflow-hidden bg-[#0f1a16] px-[8vw] py-16 text-[#e6efe9] md:px-[12vw]">
        {/* hero visuals simplified (green circle removed) */}
      </section>
      <section id="database" className="mx-auto max-w-7xl px-[7vw] py-20"><div className="flex flex-col gap-5 border-b-2 border-[#0f1a16] pb-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-3 text-xs font-bold tracking-[.2em] text-[#e95e31]">YOUR HUNTING COMPANION</p><h2 className="text-5xl font-black uppercase leading-none sm:text-6xl">Field database</h2></div><label className="text-xs font-bold uppercase tracking-wider">Game<select value={game} onChange={(event) => { setGame(event.target.value); setPage(1) }} className="mt-2 block min-w-48 border border-[#2b3a35] bg-[#07100e] text-[#e6efe9] px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#e95e31]"><option value="">All games</option>{games.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></label></div>
        <div className="my-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-2" role="tablist">{resources.map(([value, label]) => <button key={value} onClick={() => resetSearch(value)} className={`px-3 py-2 text-sm font-bold transition ${resource === value ? 'bg-[#0f1a16] text-[#e6efe9]' : 'text-[#e6efe9] hover:bg-[#071a15]'}`}>{label}</button>)}</div><label className="flex w-full max-w-xs border-b border-[#274033] px-2 py-2 md:w-64"><span className="mr-2">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} className="w-full bg-transparent text-sm outline-none" type="search" placeholder="Search the database" /></label></div>
        {/* Featured sections removed */}
      <p className="min-h-6 text-sm text-[#e6efe9]" aria-live="polite">{status}</p>{error ? <div className="mt-2 border border-dashed border-[#2b3a35] p-10 text-center text-[#e6efe9]"><b>Could not reach the API.</b><br />Start the server at <code>http://localhost:5000</code>, then refresh this page.</div> : <div><div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{!entries.length && <div className="col-span-full border border-dashed border-[#2b3a35] p-10 text-center text-[#e6efe9]">No entries found. Try a different game or search term.</div>}{entries.map((entry) => <button key={entry._id || nameOf(entry)} onClick={() => setSelected(entry)} className="relative min-h-52 overflow-hidden border border-[#21302a] bg-[#07100e] p-5 text-left transition hover:-translate-y-1 hover:shadow-[5px_5px_0_#0f1a16]">{entry.image && <img src={entry.image} alt="" className="-mx-5 -mt-5 mb-5 h-28 w-[calc(100%+2.5rem)] object-cover" />}<span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#e95e31]">{resource.slice(0, -1)}</span><span className="absolute right-4 top-4 border border-[#496b25] bg-[#07100e]/90 px-1.5 py-0.5 text-[10px] font-bold uppercase">{titleCase(kindOf(entry))}</span><h3 className="mt-10 text-3xl font-black uppercase leading-none">{nameOf(entry)}</h3><p className="mt-2 text-sm text-[#e6efe9]">{summary(entry, resource)}</p></button>)}</div><div className="mt-6 flex flex-wrap justify-center gap-3">{page > 1 && <button onClick={() => setPage(1)} className="border border-[#2b3a35] bg-[#07100e] px-5 py-2.5 text-sm font-bold uppercase tracking-[.15em] text-[#e6efe9] transition hover:border-[#e95e31] hover:text-[#e95e31]">Back to first 12</button>}{page < pagination.pages && <button onClick={() => setPage((current) => current + 1)} className="border border-[#2b3a35] bg-[#0f1a16] px-5 py-2.5 text-sm font-bold uppercase tracking-[.15em] text-[#e6efe9] transition hover:border-[#e95e31] hover:text-[#e95e31]">Load more</button>}</div></div>}
      </section>
      </main>
    {selected && <div className="fixed inset-0 z-30 grid place-items-center bg-[#000000]/70 p-4" role="dialog" aria-modal="true" aria-label="Entry detail" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto bg-[#07100e] p-8 shadow-2xl"><button onClick={() => setSelected(null)} className="absolute right-4 top-2 text-3xl leading-none" aria-label="Close">×</button><p className="text-xs font-bold uppercase tracking-[.2em] text-[#e95e31]">{resource.slice(0, -1)}</p><h2 className="mt-3 pr-8 text-4xl font-black uppercase leading-none">{nameOf(selected)}</h2><ul className="mt-6">{detailFields.map(([key, value]) => <li key={key} className="border-t border-[#21302a] py-2 text-sm"><b className="mr-3 inline-block min-w-28 capitalize text-[#9aa196]">{titleCase(key)}</b>{formatValue(value)}</li>)}</ul></div></div>}
    {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
  </div>
}
