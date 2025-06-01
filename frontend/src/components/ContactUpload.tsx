import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface ContactUploadProps {
  onUploadComplete: () => void
}

function ContactUpload({ onUploadComplete }: ContactUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

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
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  })

  return (
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
  )
}

export default ContactUpload 