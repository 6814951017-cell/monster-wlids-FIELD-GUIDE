import { useEffect, useState } from 'react'

export default function QuestForm({ entry = null, onSaved, onClose }) {
  const [games, setGames] = useState([])
  const [locations, setLocations] = useState([])
  const [locationsError, setLocationsError] = useState('')
  const [locationsLoaded, setLocationsLoaded] = useState(false)
  const [form, setForm] = useState({ game: '', title: '', slug: '', rank: 'low', questType: 'investigation', stars: 1, location: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/games?limit=200').then(r => r.ok ? r.json() : Promise.reject()).then(j => setGames(j.data || [])).catch(() => {}) }, [])
  useEffect(() => {
    fetch('/api/locations?limit=200')
      .then(async (r) => {
        const body = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(body.message || `Request failed (${r.status})`)
        setLocations(body.data || [])
      })
      .catch((err) => setLocationsError(`Could not load locations: ${err.message}`))
      .finally(() => setLocationsLoaded(true))
  }, [])
  useEffect(() => { if (entry) setForm({ game: entry.game?._id || entry.game || '', title: entry.name || entry.title || '', slug: entry.slug || '', rank: entry.rank || 'low', questType: entry.questType || 'investigation', stars: entry.stars ?? 1, location: entry.location?._id || entry.location || '' }) }, [entry])
  useEffect(() => {
    if (!entry && games.length === 1 && !form.game) setForm((s) => ({ ...s, game: games[0]._id }))
  }, [games, entry])

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const token = localStorage.getItem('token')

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const method = entry ? 'PATCH' : 'POST'
      const url = entry ? `/api/quests/${entry._id}` : '/api/quests'
      const { title, location, ...rest } = form
      const payload = { ...rest, name: title }
      // omit game when not provided (allow creation without a Game)
      if (!payload.game) delete payload.game
      if (location) payload.location = location
      if (!payload.slug && payload.name) payload.slug = payload.name.toLowerCase().replaceAll(' ', '-').replace(/[^a-z0-9\-]/g, '')
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
      const body = await res.json().catch(() => ({}))
      if (res.ok) { onSaved && onSaved(body); onClose && onClose() } else setError(body.message || `Request failed (${res.status})`)
    } catch (err) { setError('Network error') } finally { setLoading(false) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <form onSubmit={submit} className="max-w-2xl w-full bg-white p-6 text-[#18231d]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{entry ? 'Edit' : 'Create'} Quest</h3>
        <button type="button" onClick={onClose} className="text-sm">Close</button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {games.length === 1 && <div className="text-sm"><b>Game:</b> {games[0].title}</div>}
        <label className="block"><span className="text-sm font-bold">Title</span><input required value={form.title} onChange={update('title')} className="mt-1 w-full border px-2 py-2" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-sm font-bold">Rank</span>
            <select value={form.rank} onChange={update('rank')} className="mt-1 w-full border px-2 py-2">
              <option value="low">low</option>
              <option value="high">high</option>
              <option value="master">master</option>
            </select>
          </label>
          <label className="block"><span className="text-sm font-bold">Quest Type</span>
            <select value={form.questType} onChange={update('questType')} className="mt-1 w-full border px-2 py-2">
              <option value="assigned">assigned</option>
              <option value="optional">optional</option>
              <option value="event">event</option>
              <option value="investigation">investigation</option>
              <option value="arena">arena</option>
              <option value="expedition">expedition</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-sm font-bold">Stars</span><input type="number" min="1" max="10" value={form.stars} onChange={update('stars')} className="mt-1 w-full border px-2 py-2" /></label>
          <label className="block"><span className="text-sm font-bold">Location</span>
            <select value={form.location} onChange={update('location')} className="mt-1 w-full border px-2 py-2">
              <option value="">Select a location</option>
              {locations.map(l => <option key={l._id} value={l._id}>{l.name || l.title || l.slug}</option>)}
            </select>
            {locationsError && <span className="mt-1 block text-sm text-red-600">{locationsError}</span>}
            {!locationsError && locationsLoaded && locations.length === 0 && <span className="mt-1 block text-sm text-amber-700">No locations found. The database has not been seeded yet.</span>}
          </label>
        </div>
      </div>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2"><button disabled={loading} className="bg-blue-600 text-white px-4 py-2">{loading ? 'Saving…' : 'Save'}</button><button type="button" onClick={onClose} className="px-4 py-2">Cancel</button></div>
    </form>
  </div>
}
