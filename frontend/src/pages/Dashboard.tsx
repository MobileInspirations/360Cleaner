import { useState, useEffect } from 'react'
import ContactUpload from '../components/ContactUpload'
import DashboardTopBar from '../components/DashboardTopBar'
import DashboardSummaryCards from '../components/DashboardSummaryCards'
import MainBuckets from '../components/MainBuckets'
import CustomerCategories from '../components/CustomerCategories'
import PersonalityCategories from '../components/PersonalityCategories'

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
      <DashboardTopBar onUploadComplete={handleUploadComplete} />
      <DashboardSummaryCards stats={stats} />
      <MainBuckets mainBuckets={mainBuckets} selected={selectedMainBucket} onSelect={setSelectedMainBucket} />
      <CustomerCategories categories={customerCategories} selected={selectedCategories} onSelect={setSelectedCategories} />
      <PersonalityCategories categories={personalityCategories} selected={selectedPersonality} onSelect={setSelectedPersonality} />
    </div>
  )
}

export default Dashboard 