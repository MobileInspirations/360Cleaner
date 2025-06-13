import { useState, useEffect } from 'react'
import ContactsTable from '../components/ContactsTable'

function ContactsPage() {
  const [search, setSearch] = useState('')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFields, setExportFields] = useState<string[]>([])
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/contacts/export-fields')
      .then(res => res.json())
      .then(data => {
        setExportFields(data.fields || [])
        setSelectedExportFields(data.fields || [])
      })
  }, [])

  const handleExport = async () => {
    if (selectedExportFields.length === 0) {
      alert('Please select at least one field to export')
      return
    }

    try {
      const res = await fetch('/api/contacts/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: selectedExportFields }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'contacts.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to export contacts')
    }
  }

  return (
    <div className="min-h-screen bg-background px-8 py-10 max-w-7xl mx-auto">
      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-80"
            />
          </div>
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>⬇️</span> Export Contacts
          </button>
        </div>
        <ContactsTable search={search} />
      </div>

      {/* Export Fields Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[350px] text-center">
            <h2 className="text-xl font-bold mb-4">Select Fields to Export</h2>
            <div className="grid grid-cols-2 gap-2 mb-4 text-left max-h-[60vh] overflow-y-auto">
              {exportFields.map(field => (
                <label key={field} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedExportFields.includes(field)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedExportFields(prev => [...prev, field])
                      } else {
                        setSelectedExportFields(prev => prev.filter(f => f !== field))
                      }
                    }}
                  />
                  {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button 
                className="px-4 py-2 rounded border hover:bg-gray-100" 
                onClick={() => setExportModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" 
                onClick={() => {
                  setExportModalOpen(false)
                  handleExport()
                }}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactsPage 