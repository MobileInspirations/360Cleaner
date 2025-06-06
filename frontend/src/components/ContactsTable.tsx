import { useEffect, useState } from 'react'

interface Contact {
  id: string
  email: string
  full_name: string
  company: string
  main_bucket_assignment: string
  personality_bucket_assignment: string
  tags: string[]
}

interface ContactsTableProps {
  page?: number
  limit?: number
  mainBucket?: string
  personalityBucket?: string
  search?: string
}

function ContactsTable({
  page = 1,
  limit = 10,
  mainBucket,
  personalityBucket,
  search: parentSearch = '',
}: ContactsTableProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState('')
  const [sortField, setSortField] = useState('email')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState(parentSearch)

  // Fetch all unique tags for the dropdown
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/contacts?limit=10000')
        const data = await response.json()
        if (response.ok) {
          const tags = Array.from(new Set(data.contacts.flatMap((c: Contact) => c.tags || []))) as string[];
          setAllTags(tags.sort())
        }
      } catch (e) {
        setAllTags([])
      }
    }
    fetchTags()
  }, [])

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          skip: String((page - 1) * limit),
          limit: String(limit),
          sort_field: sortField,
          sort_dir: sortDir,
        })
        if (mainBucket) params.append('main_bucket', mainBucket)
        if (personalityBucket) params.append('personality_bucket', personalityBucket)
        if (selectedTag) params.append('tag', selectedTag)
        if (search) params.append('search', search)
        const response = await fetch(`/api/contacts?${params}`)
        const data = await response.json()
        if (response.ok) {
          setContacts(data.contacts)
          setTotal(data.total)
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [page, limit, mainBucket, personalityBucket, selectedTag, sortField, sortDir, search])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4 cursor-pointer" onClick={() => handleSort('email')}>
              Email {sortField === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left p-4 cursor-pointer" onClick={() => handleSort('full_name')}>
              Name {sortField === 'full_name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left p-4 cursor-pointer" onClick={() => handleSort('company')}>
              Company {sortField === 'company' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left p-4 cursor-pointer" onClick={() => handleSort('main_bucket_assignment')}>
              Main Bucket {sortField === 'main_bucket_assignment' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left p-4 cursor-pointer" onClick={() => handleSort('personality_bucket_assignment')}>
              Personality Bucket {sortField === 'personality_bucket_assignment' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
            </th>
            <th className="text-left p-4">Tags</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="border-b">
              <td className="p-4">{contact.email}</td>
              <td className="p-4">{contact.full_name}</td>
              <td className="p-4">{contact.company}</td>
              <td className="p-4">{contact.main_bucket_assignment}</td>
              <td className="p-4">{contact.personality_bucket_assignment}</td>
              <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ContactsTable 