import { useEffect, useState } from 'react'
import ImageUpload from '../ImageUpload'

export default function MonsterForm({ entry = null, onSaved, onClose }) {
  const [games, setGames] = useState([])
  const [form, setForm] = useState({ game: '', name: '', slug: '', species: '', classification: 'large', threatLevel: 5, description: '', image: '' })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/games?limit=200').then(r => r.ok ? r.json() : Promise.reject()).then(j => setGames(j.data || [])).catch(() => {}) }, [])
  useEffect(() => { if (entry) setForm({ game: entry.game || '', name: entry.name || '', slug: entry.slug || '', species: entry.species || '', classification: entry.classification || 'large', threatLevel: entry.threatLevel ?? 5, description: entry.description || '', image: entry.image || '' }) }, [entry])
  useEffect(() => {
    if (!entry && games.length === 1 && !form.game) setForm((s) => ({ ...s, game: games[0]._id }))
  }, [games, entry])

  const update = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const token = localStorage.getItem('token')

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const method = entry ? 'PATCH' : 'POST'
      const url = entry ? `/api/monsters/${entry._id}` : '/api/monsters'
      const payload = { ...form }
      // omit game when not provided (allow creation without a Game)
      if (!payload.game) delete payload.game
      if (!payload.slug) payload.slug = (payload.name || '').toLowerCase().replaceAll(' ', '-').replace(/[^a-z0-9\-]/g, '')
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(payload) })
      const body = await res.json().catch(() => ({}))
      if (res.ok) { onSaved && onSaved(body); onClose && onClose() } else setError(body.message || `Request failed (${res.status})`)
    } catch (err) { setError('Network error') } finally { setLoading(false) }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
    <form onSubmit={submit} className="max-w-2xl w-full bg-white p-6 text-[#18231d]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{entry ? 'Edit' : 'Create'} Monster</h3>
        <button type="button" onClick={onClose} className="text-sm">Close</button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {games.length === 1 && <div className="text-sm"><b>Game:</b> {games[0].title}</div>}
        <label className="block"><span className="text-sm font-bold">Name</span><input required value={form.name} onChange={update('name')} className="mt-1 w-full border px-2 py-2" /></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-sm font-bold">Classification</span>
            <select value={form.classification} onChange={update('classification')} className="mt-1 w-full border px-2 py-2">
              <option value="small">small</option>
              <option value="large">large</option>
            </select>
          </label>
          <label className="block"><span className="text-sm font-bold">Threat Level</span><input type="number" min="1" max="10" value={form.threatLevel} onChange={update('threatLevel')} className="mt-1 w-full border px-2 py-2" /></label>
        </div>
        <label className="block"><span className="text-sm font-bold">Species</span><input value={form.species} onChange={update('species')} className="mt-1 w-full border px-2 py-2" /></label>
        <ImageUpload label="Image" folder="monsters" value={form.image} onChange={(url) => setForm((s) => ({ ...s, image: url }))} onBusyChange={setUploading} />
        <label className="block"><span className="text-sm font-bold">Description</span><textarea value={form.description} onChange={update('description')} className="mt-1 w-full border px-2 py-2" /></label>
      </div>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="mt-4 flex gap-2"><button disabled={loading || uploading} className="bg-blue-600 text-white px-4 py-2 disabled:opacity-60">{loading ? 'Saving…' : 'Save'}</button><button type="button" onClick={onClose} className="px-4 py-2">Cancel</button></div>
    </form>
  </div>
}
