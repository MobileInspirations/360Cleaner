import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface ContactUploadProps {
  onUploadComplete: () => void
}

const MAIN_BUCKETS = [
  { label: 'Business Operations', value: 'biz' },
  { label: 'Health', value: 'health' },
  { label: 'Survivalist', value: 'survivalist' },
]

function ContactUpload({ onUploadComplete }: ContactUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [mainBucket, setMainBucket] = useState(MAIN_BUCKETS[0].value)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('main_bucket', mainBucket)

    try {
      const response = await fetch('/api/contacts/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('File uploaded successfully')
        onUploadComplete()
      } else {
        const data = await response.json()
        console.error('Upload failed:', data)
        toast.error(data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete, mainBucket])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  return (
    <div>
      <div className="mb-2">
        <label htmlFor="main-bucket-select" className="block text-sm font-medium mb-1">Select Main Bucket for Upload:</label>
        <select
          id="main-bucket-select"
          value={mainBucket}
          onChange={e => setMainBucket(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {MAIN_BUCKETS.map(bucket => (
            <option key={bucket.value} value={bucket.value}>{bucket.label}</option>
          ))}
        </select>
      </div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <p>Drag and drop a CSV file here, or click to select one</p>
        )}
      </div>
    </div>
  )
}

export default ContactUpload 