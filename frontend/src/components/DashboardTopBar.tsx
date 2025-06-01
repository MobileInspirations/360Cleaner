import { useState } from 'react'
import UploadCsvModal from './UploadCsvModal'
import UploadZipModal from './UploadZipModal'

type DashboardTopBarProps = {
  onUploadComplete: () => void
}

function DashboardTopBar({ onUploadComplete }: DashboardTopBarProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [categorizeOpen, setCategorizeOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [uploadCsvModalOpen, setUploadCsvModalOpen] = useState(false)
  const [uploadZipModalOpen, setUploadZipModalOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h1 className="text-3xl font-bold">Customer Categories Dashboard</h1>
      <div className="flex flex-wrap gap-2 items-center">
        {/* Import/Export Dropdown */}
        <div className="relative">
          <button
            className="border px-4 py-2 rounded flex items-center gap-2 bg-white hover:bg-gray-50"
            onClick={() => setImportOpen(v => !v)}
            type="button"
          >
            <span>⬆️</span> Import/Export <span>▼</span>
          </button>
          {importOpen && (
            <div className="absolute z-10 mt-2 w-56 bg-white border rounded shadow-lg">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setUploadCsvModalOpen(true); setImportOpen(false); }}>Import CSV</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setUploadZipModalOpen(true); setImportOpen(false); }}>Import ZIP</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">⬇️ Export Selected (0)</button>
            </div>
          )}
        </div>
        {/* Categorize Dropdown */}
        <div className="relative">
          <button
            className="border px-4 py-2 rounded flex items-center gap-2 bg-white hover:bg-gray-50"
            onClick={() => setCategorizeOpen(v => !v)}
            type="button"
          >
            <span>⚡</span> Categorize <span>▼</span>
          </button>
          {categorizeOpen && (
            <div className="absolute z-10 mt-2 w-44 bg-white border rounded shadow-lg">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Auto Categorize</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">AI Categorize</button>
            </div>
          )}
        </div>
        {/* View Contacts */}
        <a href="/contacts" className="border px-4 py-2 rounded flex items-center gap-2 bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200"><span>👥</span> View Contacts</a>
        {/* More Dropdown */}
        <div className="relative">
          <button
            className="border px-2 py-2 rounded flex items-center bg-white hover:bg-gray-50"
            onClick={() => setMoreOpen(v => !v)}
            type="button"
          >
            <span>⋯</span>
          </button>
          {moreOpen && (
            <div className="absolute z-10 mt-2 w-32 bg-white border rounded shadow-lg">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Help</button>
            </div>
          )}
        </div>
        <UploadCsvModal open={uploadCsvModalOpen} onClose={() => setUploadCsvModalOpen(false)} onUploadComplete={onUploadComplete} />
        <UploadZipModal open={uploadZipModalOpen} onClose={() => setUploadZipModalOpen(false)} onUploadComplete={onUploadComplete} />
      </div>
    </div>
  )
}

export default DashboardTopBar 