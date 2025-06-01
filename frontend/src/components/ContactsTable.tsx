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
  search = '',
}: ContactsTableProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          skip: String((page - 1) * limit),
          limit: String(limit),
        })

        if (mainBucket) params.append('main_bucket', mainBucket)
        if (personalityBucket) params.append('personality_bucket', personalityBucket)

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
  }, [page, limit, mainBucket, personalityBucket])

  // Filter contacts by search string (email or full_name)
  const filteredContacts = search
    ? contacts.filter(
        c =>
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          (c.full_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : contacts

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Company</th>
            <th className="text-left p-4">Main Bucket</th>
            <th className="text-left p-4">Personality Bucket</th>
            <th className="text-left p-4">Tags</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.map((contact) => (
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