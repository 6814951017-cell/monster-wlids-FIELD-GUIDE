import { useEffect, useState } from 'react'
import AdminForm from './AdminForm'
import ItemForm from './AdminForms/ItemForm'
import MonsterForm from './AdminForms/MonsterForm'
import WeaponForm from './AdminForms/WeaponForm'
import ArmorForm from './AdminForms/ArmorForm'
import QuestForm from './AdminForms/QuestForm'

const resources = ['monsters', 'weapons', 'armors', 'quests', 'items']

export default function AdminPanel({ onClose }) {
  const [resource, setResource] = useState('monsters')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => { fetchList() }, [resource])

  const fetchList = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/${resource}?limit=200`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (!res.ok) throw new Error('Request failed')
      const body = await res.json()
      setEntries(body.data || [])
    } catch (err) { setError('Could not load entries') } finally { setLoading(false) }
  }

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit = (entry) => { setEditing(entry); setShowForm(true) }
  const onSaved = (saved) => { fetchList() }

  return <div className="fixed inset-0 z-50 grid place-items-start overflow-auto bg-black/40 p-6">
    <div className="w-full max-w-5xl bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Admin — Resources</h2>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-3 py-1">Close</button>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        {resources.map((r) => <button key={r} onClick={() => setResource(r)} className={`px-3 py-1 ${r===resource? 'bg-gray-800 text-white':''}`}>{r}</button>)}
        <div className="ml-auto"><button onClick={openCreate} className="bg-blue-600 text-white px-3 py-1">Add {resource.slice(0,-1)}</button></div>
      </div>
      <div className="mb-4">
        {loading ? <p>Loading…</p> : error ? <p className="text-red-600">{error}</p> : <div className="grid grid-cols-1 gap-2">
            {entries.map((e) => <div key={e._id} className="flex items-center justify-between border p-2"><div className="truncate"><b className="mr-2">{e.name || e.title || e.setName || e.slug}</b><span className="text-sm text-gray-600">{e._id}</span></div><div className="flex gap-2"><button onClick={() => openEdit(e)} className="px-2 py-1">Edit</button><button onClick={async () => {
                  if (!window.confirm(`Delete ${e.name || e.title || e.slug}? This action cannot be undone.`)) return
                  try {
                    const res = await fetch(`/api/${resource}/${e._id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} })
                    if (res.ok) fetchList()
                    else {
                      const body = await res.json().catch(() => ({}))
                      alert(body.message || `Delete failed (${res.status})`)
                    }
                  } catch (err) { alert('Network error') }
                }} className="px-2 py-1">Delete</button></div></div>)}
          </div>}
      </div>
    </div>
    {showForm && (resource === 'items' ? <ItemForm entry={editing} onSaved={onSaved} onClose={() => setShowForm(false)} /> : resource === 'monsters' ? <MonsterForm entry={editing} onSaved={onSaved} onClose={() => setShowForm(false)} /> : resource === 'weapons' ? <WeaponForm entry={editing} onSaved={onSaved} onClose={() => setShowForm(false)} /> : resource === 'armors' ? <ArmorForm entry={editing} onSaved={onSaved} onClose={() => setShowForm(false)} /> : resource === 'quests' ? <QuestForm entry={editing} onSaved={onSaved} onClose={() => setShowForm(false)} /> : <AdminForm resource={resource} entry={editing} onSaved={onSaved} onClose={() => setShowForm(false)} />)}
  </div>
}
