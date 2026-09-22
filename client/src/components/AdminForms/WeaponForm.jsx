import { useEffect, useState } from 'react'

export default function WeaponForm({ entry = null, onSaved, onClose }) {
  const [games, setGames] = useState([])
  const [form, setForm] = useState({ game: '', name: '', slug: '', weaponType: '', image: '', attack: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/games?limit=200').then(r => r.ok ? r.json() : Promise.reject()).then(j => setGames(j.data || [])).catch(() => {}) }, [])
  useEffect(() => { if (entry) setForm({ game: entry.game || '', name: entry.name || '', slug: entry.slug || '', weaponType: entry.weaponType || '', image: entry.image || '', attack: entry.attack ?? 0 }) }, [entry])
  useEffect(() => {
    if (!entry && games.length === 1 && !form.game) setForm((s) => ({ ...s, game: games[0]._id }))
  }, [games, entry])

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const titleCase = (s) => String(s || '').replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const token = localStorage.getItem('token')
  const weaponTypes = [
    'great-sword', 'long-sword', 'sword-and-shield', 'dual-blades', 'hammer', 'hunting-horn', 'lance', 'gunlance', 'switch-axe', 'charge-blade', 'insect-glaive', 'light-bowgun', 'heavy-bowgun', 'bow'
  ]

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const method = entry ? 'PATCH' : 'POST'
      const url = entry ? `/api/weapons/${entry._id}` : '/api/weapons'
      const payload = { ...form }
      // omit game when not provided (allow creation without a Game)
      if (!payload.game) delete payload.game
      // ensure `name` exists (schema requires it) — derive from weaponType when necessary
      if (!payload.name && payload.weaponType) payload.name = titleCase(payload.weaponType)
      if (!payload.slug) payload.slug = (payload.weaponType || payload.name || '').toLowerCase().replaceAll(' ', '-').replace(/[^a-z0-9\-]/g, '')
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
      const body = await res.json().catch(() => ({}))
      if (res.ok) { onSaved && onSaved(body); onClose && onClose() } else setError(body.message || `Request failed (${res.status})`)
    } catch (err) { setError('Network error') } finally { setLoading(false) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <form onSubmit={submit} className="max-w-2xl w-full bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{entry ? 'Edit' : 'Create'} Weapon</h3>
        <button type="button" onClick={onClose} className="text-sm">Close</button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {games.length === 1 && <div className="text-sm"><b>Game:</b> {games[0].title}</div>}
        <label className="block"><span className="text-sm font-bold">Weapon Type</span>
          <select required value={form.weaponType} onChange={update('weaponType')} className="mt-1 w-full border px-2 py-2">
            <option value="">Select a weapon type</option>
            {weaponTypes.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-sm font-bold">Weapon Type URL</span><input placeholder="https://..." value={form.image} onChange={update('image')} className="mt-1 w-full border px-2 py-2" /></label>
      </div>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2"><button disabled={loading} className="bg-blue-600 text-white px-4 py-2">{loading ? 'Saving…' : 'Save'}</button><button type="button" onClick={onClose} className="px-4 py-2">Cancel</button></div>
    </form>
  </div>
}
