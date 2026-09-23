import { useState } from 'react'
import { uploadFile } from '../lib/upload'

// Image field for the admin forms: pick a file (uploaded to Vercel Blob) or paste a URL.
export default function ImageUpload({ label = 'Image', folder, value, onChange, onBusyChange }) {
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  const pick = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(''); setProgress(0); onBusyChange?.(true)
    try { onChange(await uploadFile(folder, file, setProgress)) } catch (err) { setError(err.message) } finally { setProgress(null); onBusyChange?.(false) }
  }

  return <div className="block">
    <span className="text-sm font-bold">{label}</span>
    <div className="mt-1 flex items-start gap-3">
      {value && <img src={value} alt="" className="h-16 w-16 shrink-0 border object-cover" />}
      <div className="min-w-0 flex-1 space-y-2">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image URL or upload a file" className="w-full border px-2 py-2" />
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className={`cursor-pointer border border-[#18231d] px-3 py-1.5 font-bold ${progress !== null ? 'pointer-events-none opacity-60' : 'hover:bg-[#18231d] hover:text-white'}`}>
            {progress !== null ? `Uploading… ${progress}%` : 'Upload image'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={pick} className="sr-only" />
          </label>
          {value && progress === null && <button type="button" onClick={() => onChange('')} className="underline">Remove</button>}
          <span className="text-gray-600">JPG, PNG, WebP, GIF or AVIF · up to 10 MB</span>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  </div>
}
