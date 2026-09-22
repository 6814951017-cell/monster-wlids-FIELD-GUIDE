import { useEffect, useState } from 'react'

export default function ArmorForm({ entry = null, onSaved, onClose }) {
  const [games, setGames] = useState([])
  const [form, setForm] = useState({ game: '', setName: '', slug: '', rank: 'low', rarity: 1, image: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/games?limit=200').then(r => r.ok ? r.json() : Promise.reject()).then(j => setGames(j.data || [])).catch(() => {}) }, [])
  useEffect(() => { if (entry) setForm({ game: entry.game || '', setName: entry.setName || entry.name || '', slug: entry.slug || '', rank: entry.rank || 'low', rarity: entry.rarity ?? 1, image: entry.image || '' }) }, [entry])
  useEffect(() => {
    if (!entry && games.length === 1 && !form.game) setForm((s) => ({ ...s, game: games[0]._id }))
  }, [games, entry])

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const token = localStorage.getItem('token')

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const method = entry ? 'PATCH' : 'POST'
      const url = entry ? `/api/armors/${entry._id}` : '/api/armors'
      const payload = { ...form }
      // backend schema uses setName, not name
      if (payload.setName && !payload.name) payload.name = payload.setName
      if (!payload.setName && payload.name) payload.setName = payload.name
      // omit game when not provided (allow creation without a Game)
      if (!payload.game) delete payload.game
      delete payload.name
      if (!payload.slug && payload.setName) payload.slug = (payload.setName || '').toLowerCase().replaceAll(' ', '-').replace(/[^a-z0-9\-]/g, '')
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
      const body = await res.json().catch(() => ({}))
      if (res.ok) { onSaved && onSaved(body); onClose && onClose() } else setError(body.message || `Request failed (${res.status})`)
    } catch (err) { setError('Network error') } finally { setLoading(false) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <form onSubmit={submit} className="max-w-2xl w-full bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{entry ? 'Edit' : 'Create'} Armor</h3>
        <button type="button" onClick={onClose} className="text-sm">Close</button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {games.length === 1 && <div className="text-sm"><b>Game:</b> {games[0].title}</div>}
        <label className="block"><span className="text-sm font-bold">Name</span><input required value={form.setName} onChange={update('setName')} className="mt-1 w-full border px-2 py-2" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-sm font-bold">Rank</span>
            <select value={form.rank} onChange={update('rank')} className="mt-1 w-full border px-2 py-2">
              <option value="low">low</option>
              <option value="high">high</option>
              <option value="master">master</option>
            </select>
          </label>
          <label className="block"><span className="text-sm font-bold">Rarity</span><input type="number" min="1" max="12" value={form.rarity} onChange={update('rarity')} className="mt-1 w-full border px-2 py-2" /></label>
        </div>
        <label className="block"><span className="text-sm font-bold">Image URL</span><input value={form.image} onChange={update('image')} className="mt-1 w-full border px-2 py-2" /></label>
      </div>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2"><button disabled={loading} className="bg-blue-600 text-white px-4 py-2">{loading ? 'Saving…' : 'Save'}</button><button type="button" onClick={onClose} className="px-4 py-2">Cancel</button></div>
    </form>
  </div>
}
