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

  return (
    <div className="min-h-screen bg-background px-8 py-6">
      <DashboardTopBar 
        onUploadComplete={handleUploadComplete} 
        selectedMainBucket={selectedMainBucket}
        selectedPersonality={selectedPersonality}
        mainBuckets={mainBuckets}
        personalityCategories={personalityCategories}
      />
      <DashboardSummaryCards stats={stats} />
      <MainBuckets mainBuckets={mainBuckets} selected={selectedMainBucket} onSelect={setSelectedMainBucket} />
      <div className="mb-4 flex justify-end">
        <button
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          onClick={handleClearPersonalityBuckets}
        >
          Clear All Personality Buckets
        </button>
      </div>
      <PersonalityCategories categories={personalityCategories} selected={selectedPersonality} onSelect={setSelectedPersonality} />
    </div>
  )
}

export default Dashboard 