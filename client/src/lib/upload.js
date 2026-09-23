// Files go straight from the browser into Vercel Blob; the API only signs the
// upload and confirms it. (A Vercel function cannot accept bodies over 4.5 MB.)

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function postJson(url, body) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`)
  return data
}

// XMLHttpRequest rather than fetch, because fetch cannot report upload progress.
function putFile(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress?.(Math.round((event.loaded / event.total) * 100))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = `Upload failed (${xhr.status})`
      try { message = JSON.parse(xhr.responseText)?.error?.message || message } catch {}
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error('Upload failed: the connection to storage was lost'))
    xhr.send(file)
  })
}

// Upload one file into a folder (monsters, weapons, armors, items); resolves to its public URL.
export async function uploadFile(folder, file, onProgress) {
  const { pathname, uploadUrl } = await postJson('/api/uploads', { folder, name: file.name, type: file.type })
  await putFile(uploadUrl, file, onProgress)
  const { url } = await postJson('/api/uploads/complete', { pathname })
  return url
}
