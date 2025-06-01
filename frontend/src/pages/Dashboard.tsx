import { useState, useEffect } from 'react'
import ContactUpload from '../components/ContactUpload'

function Dashboard() {
  const [mainBuckets, setMainBuckets] = useState([
    { label: 'Business Operations', description: '', count: 0, color: 'blue' },
    { label: 'Health', description: '', count: 0, color: 'green' },
    { label: 'Survivalist', description: '', count: 0, color: 'orange' },
    { label: 'Cannot Place', description: '', count: 0, color: 'gray' },
  ]);

  const customerCategories = [
    { label: 'Business Operations', description: 'Business-focused contacts and operations', count: 0, color: 'blue' },
    { label: 'Cannot Place', description: 'Contacts that do not match any specific category', count: 0, color: 'gray' },
    { label: 'Financial Services', description: 'Finance industry participants', count: 0, color: 'green' },
    { label: 'Health', description: 'Health and wellness related contacts', count: 0, color: 'green' },
    { label: 'Healthcare Professionals', description: 'Healthcare summit attendees', count: 0, color: 'red' },
    { label: 'Inactive Contacts', description: 'No activity in 12+ months', count: 0, color: 'gray' },
    { label: 'Industry Leaders', description: 'C-level executives', count: 0, color: 'orange' },
    { label: 'Marketing Professionals', description: 'Marketing summit attendees', count: 0, color: 'pink' },
    { label: 'Multi-Event Participants', description: 'Attended 3+ summits', count: 0, color: 'blue' },
    { label: 'New Prospects', description: 'Never attended events', count: 0, color: 'gray' },
    { label: 'Recent Registrants', description: 'Registered in last 6 months', count: 0, color: 'green' },
    { label: 'Survivalist', description: 'Emergency preparedness and survival contacts', count: 0, color: 'orange' },
    { label: 'Tech Enthusiasts', description: 'Technology-focused events', count: 0, color: 'cyan' },
    { label: 'VIP Attendees', description: 'High-value summit participants', count: 0, color: 'purple' },
  ]

  const personalityCategories = [
    { label: 'Digital Marketing & Content Creation Skills', description: 'Marketing and content creation', count: 0, color: 'blue' },
    { label: 'Entrepreneurship & Business Development', description: 'Business growth and entrepreneurship', count: 70, color: 'gray' },
    { label: 'Fitness, Nutrition & Weight Management', description: 'Fitness and nutrition focused', count: 0, color: 'gray' },
    { label: 'Holistic Wellness & Natural Living', description: 'Natural health and wellness enthusiasts', count: 30, color: 'gray' },
    { label: 'Investing, Finance & Wealth Creation', description: 'Financial education and investing', count: 0, color: 'green' },
    { label: 'Longevity & Regenerative Health', description: 'Anti-aging and regenerative medicine', count: 0, color: 'gray' },
    { label: 'Mental & Emotional Well-being', description: 'Mental health and emotional wellness', count: 0, color: 'gray' },
    { label: 'Self-Reliance & Preparedness', description: 'Self-sufficiency and preparedness', count: 0, color: 'gray' },
    { label: 'Targeted Health Solutions & Disease Management', description: 'Disease-specific health solutions', count: 0, color: 'gray' },
    { label: 'Women\'s Health & Community', description: 'Women-focused health topics', count: 0, color: 'gray' },
  ]

  const [selectedMainBucket, setSelectedMainBucket] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedPersonality, setSelectedPersonality] = useState<number[]>([])

  // New: State for real stats
  const [stats, setStats] = useState({
    total_contacts: 0,
    unique_categorized: 0,
    categories: 0,
    selected: 0,
    export_files: 0,
  })

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

  const summaryCards = [
    { label: 'Total Contacts', value: stats.total_contacts.toLocaleString(), description: 'All contacts in database' },
    { label: 'Unique Categorized', value: stats.unique_categorized.toLocaleString(), description: 'Unique contacts in buckets' },
    { label: 'Categories', value: stats.categories.toLocaleString(), description: '' },
    { label: 'Selected', value: stats.selected?.toLocaleString() || '0', description: '' },
    { label: 'Export Files', value: stats.export_files?.toLocaleString() || '0', description: '(max 25k per file)' },
  ]

  // Add a handler to refresh stats and main buckets after upload
  const handleUploadComplete = () => {
    fetch('/api/contacts/stats')
      .then(res => res.json())
      .then(data => setStats(data))
    fetch('/api/contacts/main-buckets')
      .then(res => res.json())
      .then(data => setMainBuckets(data))
  }

  return (
    <div className="min-h-screen bg-background px-8 py-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Customer Categories Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <ContactUpload onUploadComplete={handleUploadComplete} />
          <button className="border px-4 py-2 rounded flex items-center gap-2"><span>👥</span> View Contacts</button>
          <button className="bg-green-100 text-green-800 px-4 py-2 rounded flex items-center gap-2"><span>⚡</span> Auto Categorize</button>
          <button className="bg-purple-100 text-purple-800 px-4 py-2 rounded flex items-center gap-2"><span>🧠</span> AI Categorize</button>
          <button className="bg-orange-100 text-orange-800 px-4 py-2 rounded flex items-center gap-2"><span>⬇️</span> Export Selected (0)</button>
          <button className="border px-2 py-2 rounded flex items-center"><span>⋯</span></button>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">Manage and categorize your customer contacts</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-card rounded-lg p-4 flex flex-col items-start shadow">
            <span className="text-muted-foreground text-sm mb-1">{card.label}</span>
            <span className="text-2xl font-bold">{card.value}</span>
            {card.description && <span className="text-xs text-muted-foreground mt-1">{card.description}</span>}
          </div>
        ))}
      </div>

      {/* Main Buckets */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">Main Buckets</h2>
          <span className="text-muted-foreground text-sm">{`1 of 4 selected`}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {mainBuckets.map((bucket, i) => (
            <div
              key={i}
              className={`rounded-lg p-6 border cursor-pointer shadow flex flex-col gap-2 transition-all ${selectedMainBucket === i ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border hover:border-blue-300'}`}
              onClick={() => setSelectedMainBucket(i)}
            >
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${bucket.color === 'blue' ? 'bg-blue-500' : bucket.color === 'green' ? 'bg-green-500' : bucket.color === 'orange' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
                <span className="font-semibold">{bucket.label}</span>
                {selectedMainBucket === i && <span className="ml-auto text-blue-500">✔️</span>}
              </div>
              <span className="text-muted-foreground text-sm">{bucket.description}</span>
              <span className="text-lg font-bold mt-2">{bucket.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">Customer Categories</h2>
          <span className="text-muted-foreground text-sm">{`0 of 14 selected`}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {customerCategories.map((cat, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 border shadow flex flex-col gap-2 cursor-pointer transition-all ${selectedCategories.includes(i) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border hover:border-blue-300'}`}
              onClick={() => setSelectedCategories(selectedCategories.includes(i) ? selectedCategories.filter(idx => idx !== i) : [...selectedCategories, i])}
            >
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${cat.color === 'blue' ? 'bg-blue-500' : cat.color === 'green' ? 'bg-green-500' : cat.color === 'orange' ? 'bg-orange-500' : cat.color === 'red' ? 'bg-red-500' : cat.color === 'pink' ? 'bg-pink-400' : cat.color === 'cyan' ? 'bg-cyan-400' : cat.color === 'purple' ? 'bg-purple-500' : 'bg-gray-400'}`}></span>
                <span className="font-semibold">{cat.label}</span>
              </div>
              <span className="text-muted-foreground text-sm">{cat.description}</span>
              <span className="text-lg font-bold mt-2">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personality Categories */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">Personality Categories</h2>
          <span className="text-muted-foreground text-sm">{`0 of 10 selected`}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {personalityCategories.map((cat, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 border shadow flex flex-col gap-2 cursor-pointer transition-all ${selectedPersonality.includes(i) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border hover:border-blue-300'}`}
              onClick={() => setSelectedPersonality(selectedPersonality.includes(i) ? selectedPersonality.filter(idx => idx !== i) : [...selectedPersonality, i])}
            >
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${cat.color === 'blue' ? 'bg-blue-500' : cat.color === 'green' ? 'bg-green-500' : cat.color === 'orange' ? 'bg-orange-500' : cat.color === 'red' ? 'bg-red-500' : cat.color === 'pink' ? 'bg-pink-400' : cat.color === 'cyan' ? 'bg-cyan-400' : cat.color === 'purple' ? 'bg-purple-500' : 'bg-gray-400'}`}></span>
                <span className="font-semibold">{cat.label}</span>
              </div>
              <span className="text-muted-foreground text-sm">{cat.description}</span>
              <span className="text-lg font-bold mt-2">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 