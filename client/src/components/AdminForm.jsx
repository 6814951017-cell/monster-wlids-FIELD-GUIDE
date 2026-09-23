import { useState, useEffect } from 'react'

export default function AdminForm({ resource, entry = null, onSaved, onClose }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setText(entry ? JSON.stringify(entry, null, 2) : '')
  }, [entry])

  const token = localStorage.getItem('token')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    let body
    try { body = JSON.parse(text) } catch (err) { return setError('Invalid JSON') }
    setLoading(true)
    try {
      const method = entry ? 'PATCH' : 'POST'
      const url = entry ? `/api/${resource}/${entry._id}` : `/api/${resource}`
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) })
      const data = await response.json().catch(() => ({}))
      if (response.ok) { onSaved && onSaved(data); onClose && onClose() }
      else setError(data.message || `Request failed (${response.status})`)
    } catch (err) { setError('Network error') } finally { setLoading(false) }
  }

  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4">
    <form onSubmit={submit} className="max-w-3xl w-full bg-white p-6 text-[#18231d]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">{entry ? 'Edit' : 'Create'} {resource.slice(0, -1)}</h3>
        <button type="button" onClick={onClose} className="text-sm">Close</button>
      </div>
      <p className="mb-2 text-sm text-gray-600">Edit the JSON document for the resource. Required fields depend on the model (e.g. `game`, `name`, `slug`).</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={18} className="w-full mb-3 border p-2 font-mono text-sm" />
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2">{loading ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onClose} className="px-4 py-2">Cancel</button>
      </div>
    </form>
  </div>
}
