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
  const [categorizeStatus, setCategorizeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle")
  const [categorizeMessage, setCategorizeMessage] = useState<string>("")

  const handleCategorize = async () => {
    setCategorizeStatus('loading');
    setCategorizeMessage('Categorizing contacts...');
    setCategorizeOpen(false);
    try {
      const res = await fetch('/api/contacts/categorize', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCategorizeStatus('success');
      setCategorizeMessage(data.message || 'Categorization complete!');
      if (onUploadComplete) onUploadComplete();
    } catch (e: any) {
      setCategorizeStatus('error');
      setCategorizeMessage(e.message || 'Categorization failed.');
    }
  };

  const closeCategorizeModal = () => {
    setCategorizeStatus('idle');
    setCategorizeMessage('');
  };

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
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleCategorize}>Auto Categorize</button>
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
        {/* Categorize Status Modal */}
        {categorizeStatus !== 'idle' && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg min-w-[300px] text-center">
              {categorizeStatus === 'loading' && <div>⏳ {categorizeMessage}</div>}
              {categorizeStatus === 'success' && <div>✅ {categorizeMessage}</div>}
              {categorizeStatus === 'error' && <div>❌ {categorizeMessage}</div>}
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={closeCategorizeModal}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardTopBar 