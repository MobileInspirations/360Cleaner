import { useState } from 'react'
import ContactUpload from '../components/ContactUpload'
import CategorizationProgress from '../components/CategorizationProgress'
import ContactsTable from '../components/ContactsTable'
import { toast } from 'sonner'

function Dashboard() {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)

  const handleUploadComplete = () => {
    toast.success('Contacts uploaded successfully')
  }

  const startCategorization = async () => {
    try {
      const response = await fetch('/api/contacts/categorize', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (response.ok) {
        setActiveTaskId(data.task_id)
        setShowProgress(true)
        toast.success('Categorization started')
      } else {
        toast.error(data.message || 'Failed to start categorization')
      }
    } catch (error) {
      toast.error('Failed to start categorization')
    }
  }

  const handleCategorizationComplete = () => {
    setShowProgress(false)
    setActiveTaskId(null)
    toast.success('Categorization completed')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Summit Customer Compass</h1>
      
      <div className="space-y-8">
        <section className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload Contacts</h2>
          <ContactUpload onUploadComplete={handleUploadComplete} />
        </section>

        {!showProgress && (
          <section className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Categorize Contacts</h2>
            <button
              onClick={startCategorization}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Start Categorization
            </button>
          </section>
        )}

        {showProgress && activeTaskId && (
          <section className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Categorization Progress</h2>
            <CategorizationProgress
              taskId={activeTaskId}
              onComplete={handleCategorizationComplete}
            />
          </section>
        )}

        <section className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contacts</h2>
          <ContactsTable />
        </section>
      </div>
    </div>
  )
}

export default Dashboard 