import { useState } from 'react'

const MAIN_BUCKETS = [
  { label: 'Business Operations', value: 'biz', description: 'Business-focused contacts and operations', color: 'blue' },
  { label: 'Health', value: 'health', description: 'Health and wellness related contacts', color: 'green' },
  { label: 'Survivalist', value: 'survivalist', description: 'Emergency preparedness and survival contacts', color: 'orange' },
  { label: 'Cannot Place', value: 'none', description: 'Contacts that do not match any specific category', color: 'gray' },
]

type UploadCsvModalProps = {
  open: boolean
  onClose: () => void
  onUploadComplete: () => void
}

function UploadCsvModal({ open, onClose, onUploadComplete }: UploadCsvModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [mainBucket, setMainBucket] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !mainBucket) return
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('main_bucket', mainBucket)
    try {
      const response = await fetch('/api/contacts/upload-csv', {
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
        <h2 className="text-xl font-bold mb-2">Import CSV</h2>
        <p className="mb-4 text-sm text-muted-foreground">Upload a CSV file containing customer contacts.</p>
        <div className="mb-4">
          <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
          {file && <div className="text-sm">{file.name}</div>}
        </div>
        {file && (
          <>
            <h3 className="font-semibold mb-2">Main Buckets</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {MAIN_BUCKETS.map((bucket) => (
                <button
                  key={bucket.value}
                  className={`rounded-lg border p-4 flex flex-col items-start gap-1 transition-all ${mainBucket === bucket.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border hover:border-blue-300'}`}
                  onClick={() => setMainBucket(bucket.value)}
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${bucket.color === 'blue' ? 'bg-blue-500' : bucket.color === 'green' ? 'bg-green-500' : bucket.color === 'orange' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                    <span className="font-semibold">{bucket.label}</span>
                    {mainBucket === bucket.value && <span className="ml-auto text-blue-500">✔️</span>}
                  </div>
                  <span className="text-muted-foreground text-xs">{bucket.description}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded border" onClick={onClose} disabled={isUploading}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={handleUpload}
            disabled={!file || !mainBucket || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadCsvModal 