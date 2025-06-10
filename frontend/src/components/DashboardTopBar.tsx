import { useState, useEffect } from 'react'
import UploadCsvModal from './UploadCsvModal'
import UploadZipModal from './UploadZipModal'

type DashboardTopBarProps = {
  onUploadComplete: () => void
  selectedMainBucket: number
  selectedPersonality: number[]
  mainBuckets: { label: string; count: number }[]
  personalityCategories: { label: string; count: number }[]
}

function DashboardTopBar({ onUploadComplete, selectedMainBucket, selectedPersonality, mainBuckets, personalityCategories }: DashboardTopBarProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [categorizeOpen, setCategorizeOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [uploadCsvModalOpen, setUploadCsvModalOpen] = useState(false)
  const [uploadZipModalOpen, setUploadZipModalOpen] = useState(false)
  const [categorizeStatus, setCategorizeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>("idle")
  const [categorizeMessage, setCategorizeMessage] = useState<string>("")
  const [exportFields, setExportFields] = useState<string[]>([])
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([])
  const [exportModalOpen, setExportModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/contacts/export-fields')
      .then(res => res.json())
      .then(data => {
        setExportFields(data.fields || [])
        setSelectedExportFields(data.fields || [])
      })
  }, [])

  const handleCategorize = async () => {
    setCategorizeStatus('loading');
    setCategorizeMessage('Categorizing contacts...');
    setCategorizeOpen(false);
    try {
      const res = await fetch('/api/contacts/auto-categorize', { method: 'POST' });
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

  const handleExportTags = async () => {
    const res = await fetch('/api/contacts/tags');
    const data = await res.json();
    const tags = data.tags || [];
    const csv = tags.join(',\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unique_tags.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSelected = async () => {
    if (selectedExportFields.length === 0) {
      alert('Please select at least one field to export');
      return;
    }
    const selectedBuckets = [];
    if (selectedMainBucket >= 0) {
      selectedBuckets.push(mainBuckets[selectedMainBucket].label);
    }
    selectedPersonality.forEach(idx => {
      selectedBuckets.push(personalityCategories[idx].label);
    });
    if (selectedBuckets.length === 0) {
      alert('Please select at least one bucket to export');
      return;
    }
    try {
      const res = await fetch('/api/contacts/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buckets: selectedBuckets, fields: selectedExportFields }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected_contacts.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export contacts');
    }
  };

  const selectedCount = (selectedMainBucket >= 0 ? 1 : 0) + selectedPersonality.length;

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
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setExportModalOpen(true); setImportOpen(false); }}>⬇️ Export Selected ({selectedCount})</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleExportTags}>⬇️ Export All Tags</button>
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
        {/* Export Fields Modal */}
        {exportModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-6 rounded shadow-lg min-w-[350px] text-center">
              <h2 className="text-xl font-bold mb-2">Select Fields to Export</h2>
              <div className="grid grid-cols-2 gap-2 mb-4 text-left">
                {exportFields.map(field => (
                  <label key={field} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedExportFields.includes(field)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedExportFields(prev => [...prev, field]);
                        } else {
                          setSelectedExportFields(prev => prev.filter(f => f !== field));
                        }
                      }}
                    />
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-2 rounded border" onClick={() => setExportModalOpen(false)}>Cancel</button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" onClick={() => { setExportModalOpen(false); handleExportSelected(); }}>Export</button>
              </div>
            </div>
          </div>
        )}
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