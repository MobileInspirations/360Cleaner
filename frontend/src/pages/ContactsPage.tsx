import { useState } from 'react'
import ContactsTable from '../components/ContactsTable'

function ContactsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen bg-background px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">All Contacts</h1>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-80"
        />
      </div>
      <ContactsTable search={search} />
    </div>
  )
}

export default ContactsPage 