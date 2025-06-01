import { useState } from 'react'

type UploadZipModalProps = {
  open: boolean
  onClose: () => void
  onUploadComplete: () => void
}

function UploadZipModal({ open, onClose, onUploadComplete }: UploadZipModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [useFolders, setUseFolders] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('use_folders', useFolders ? '1' : '0')
    try {
      const response = await fetch('/api/contacts/upload-zip', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        onUploadComplete()
        onClose()
      } else {
        alert('Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">Import ZIP</h2>
        <p className="mb-4 text-sm text-muted-foreground">Upload a ZIP file containing multiple CSVs. Optionally use folder names as main buckets or tags.</p>
        <div className="mb-4">
          <input type="file" accept=".zip" onChange={handleFileChange} className="mb-2" />
          {file && <div className="text-sm">{file.name}</div>}
        </div>
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={useFolders} onChange={e => setUseFolders(e.target.checked)} />
            Use folder names for main bucket assignment
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded border" onClick={onClose} disabled={isUploading}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadZipModal 