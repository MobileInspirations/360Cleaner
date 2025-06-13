import { useState, useEffect } from 'react'
import ContactUpload from '../components/ContactUpload'
import DashboardTopBar from '../components/DashboardTopBar'
import DashboardSummaryCards from '../components/DashboardSummaryCards'
import MainBuckets from '../components/MainBuckets'
import PersonalityCategories from '../components/PersonalityCategories'

function Dashboard() {
  const [mainBuckets, setMainBuckets] = useState([
    { label: 'Business Operations', description: '', count: 0, color: 'blue' },
    { label: 'Health', description: '', count: 0, color: 'green' },
    { label: 'Survivalist', description: '', count: 0, color: 'orange' },
    { label: 'Cannot Place', description: '', count: 0, color: 'gray' },
  ]);

  const initialPersonalityCategories = [
    { label: 'Digital Marketing & Content Creation Skills', description: 'Marketing and content creation', count: 0, color: 'blue' },
    { label: 'Entrepreneurship & Business Development', description: 'Business growth and entrepreneurship', count: 0, color: 'gray' },
    { label: 'Fitness, Nutrition & Weight Management', description: 'Fitness and nutrition focused', count: 0, color: 'gray' },
    { label: 'Holistic Wellness & Natural Living', description: 'Natural health and wellness enthusiasts', count: 0, color: 'gray' },
    { label: 'Investing, Finance & Wealth Creation', description: 'Financial education and investing', count: 0, color: 'green' },
    { label: 'Longevity & Regenerative Health', description: 'Anti-aging and regenerative medicine', count: 0, color: 'gray' },
    { label: 'Mental & Emotional Well-being', description: 'Mental health and emotional wellness', count: 0, color: 'gray' },
    { label: 'Self-Reliance & Preparedness', description: 'Self-sufficiency and preparedness', count: 0, color: 'gray' },
    { label: 'Targeted Health Solutions & Disease Management', description: 'Disease-specific health solutions', count: 0, color: 'gray' },
    { label: "Women's Health & Community", description: "Women-focused health topics", count: 0, color: 'gray' },
    { label: 'NED Health', description: 'Not enough data for Health', count: 0, color: 'green' },
    { label: 'NED Business', description: 'Not enough data for Business', count: 0, color: 'blue' },
    { label: 'NED Survivalist', description: 'Not enough data for Survivalist', count: 0, color: 'orange' },
  ]

  const [personalityCategories, setPersonalityCategories] = useState(initialPersonalityCategories);

  const [selectedMainBucket, setSelectedMainBucket] = useState(0)
  const [selectedPersonality, setSelectedPersonality] = useState<number[]>([])

  // New: State for real stats
  const [stats, setStats] = useState({
    total_contacts: 0,
    unique_categorized: 0,
    categories: 0,
    selected: 0,
    export_files: 0,
  })

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFields, setExportFields] = useState<string[]>([])
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/contacts/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats({
        total_contacts: 0,
        unique_categorized: 0,
        categories: 0,
        selected: 0,
        export_files: 0,
      }))
  }, [])

  useEffect(() => {
    fetch('/api/contacts/main-buckets')
      .then(res => res.json())
      .then(data => setMainBuckets(data));
  }, []);

  useEffect(() => {
    fetch('/api/contacts/personality-buckets')
      .then(res => res.json())
      .then(backendCounts => {
        setPersonalityCategories(prev =>
          prev.map(cat => {
            const found = backendCounts.find((b: any) => b.bucket === cat.label);
            return { ...cat, count: found ? found.count : 0 };
          })
        );
      });
  }, []);

  useEffect(() => {
    fetch('/api/contacts/export-fields')
      .then(res => res.json())
      .then(data => {
        setExportFields(data.fields || [])
        setSelectedExportFields(data.fields || [])
      })
  }, [])

  // Add a handler to refresh stats and main buckets after upload
  const handleUploadComplete = () => {
    fetch('/api/contacts/stats')
      .then(res => res.json())
      .then(data => setStats(data))
    fetch('/api/contacts/main-buckets')
      .then(res => res.json())
      .then(data => setMainBuckets(data))
  }

  // Add clear personality buckets handler
  const handleClearPersonalityBuckets = async () => {
    if (!window.confirm('Are you sure you want to clear all personality bucket assignments?')) return;
    await fetch('/api/contacts/clear-personality-buckets', { method: 'POST' });
    // Refresh personality categories
    fetch('/api/contacts/personality-buckets')
      .then(res => res.json())
      .then(backendCounts => {
        setPersonalityCategories(prev =>
          prev.map(cat => {
            const found = backendCounts.find((b: any) => b.bucket === cat.label);
            return { ...cat, count: found ? found.count : 0 };
          })
        );
      });
  };

  const handleExport = async () => {
    if (selectedExportFields.length === 0) {
      alert('Please select at least one field to export')
      return
    }

    const selectedBuckets = []
    if (selectedMainBucket >= 0) {
      selectedBuckets.push(mainBuckets[selectedMainBucket].label)
    }
    selectedPersonality.forEach(idx => {
      selectedBuckets.push(personalityCategories[idx].label)
    })

    if (selectedBuckets.length === 0) {
      alert('Please select at least one bucket to export')
      return
    }

    try {
      const res = await fetch('/api/contacts/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buckets: selectedBuckets, fields: selectedExportFields }),
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'selected_contacts.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Failed to export contacts')
    }
  }

  return (
    <div className="min-h-screen bg-background px-8 py-10 max-w-7xl mx-auto">
      <div className="space-y-8">
        <DashboardTopBar 
          onUploadComplete={handleUploadComplete}
          selectedMainBucket={selectedMainBucket}
          selectedPersonality={selectedPersonality}
          mainBuckets={mainBuckets}
          personalityCategories={personalityCategories}
        />
        <DashboardSummaryCards stats={stats} />
        <div className="bg-white rounded shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Main Buckets</h2>
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              disabled={selectedMainBucket < 0 && selectedPersonality.length === 0}
            >
              <span>⬇️</span> Export Selected
            </button>
          </div>
          <MainBuckets mainBuckets={mainBuckets} selected={selectedMainBucket} onSelect={setSelectedMainBucket} />
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            onClick={handleClearPersonalityBuckets}
          >
            Clear All Personality Buckets
          </button>
        </div>
        <div className="bg-white rounded shadow p-6">
          <PersonalityCategories categories={personalityCategories} selected={selectedPersonality} onSelect={setSelectedPersonality} />
        </div>
        <div className="bg-white rounded shadow p-6">
          <ContactUpload onUploadComplete={handleUploadComplete} />
        </div>
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

export default Dashboard 