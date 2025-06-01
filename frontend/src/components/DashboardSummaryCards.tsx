type DashboardSummaryCardsProps = {
  stats: {
    total_contacts: number
    unique_categorized: number
    categories: number
    selected: number
    export_files: number
  }
}

function DashboardSummaryCards({ stats }: DashboardSummaryCardsProps) {
  const summaryCards = [
    { label: 'Total Contacts', value: stats.total_contacts.toLocaleString(), description: 'All contacts in database' },
    { label: 'Unique Categorized', value: stats.unique_categorized.toLocaleString(), description: 'Unique contacts in buckets' },
    { label: 'Categories', value: stats.categories.toLocaleString(), description: '' },
    { label: 'Selected', value: stats.selected?.toLocaleString() || '0', description: '' },
    { label: 'Export Files', value: stats.export_files?.toLocaleString() || '0', description: '(max 25k per file)' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {summaryCards.map((card, i) => (
        <div key={i} className="bg-card rounded-lg p-4 flex flex-col items-start shadow">
          <span className="text-muted-foreground text-sm mb-1">{card.label}</span>
          <span className="text-2xl font-bold">{card.value}</span>
          {card.description && <span className="text-xs text-muted-foreground mt-1">{card.description}</span>}
        </div>
      ))}
    </div>
  )
}

export default DashboardSummaryCards 