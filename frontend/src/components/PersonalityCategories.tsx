type PersonalityCategoriesProps = {
  categories: { label: string; description: string; count: number; color: string }[]
  selected: number[]
  onSelect: (selected: number[]) => void
}

function PersonalityCategories({ categories, selected, onSelect }: PersonalityCategoriesProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Personality Categories</h2>
        <span className="text-muted-foreground text-sm">{`0 of 10 selected`}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`rounded-lg p-4 border shadow flex flex-col gap-2 cursor-pointer transition-all ${selected.includes(i) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border hover:border-blue-300'}`}
            onClick={() => onSelect(selected.includes(i) ? selected.filter(idx => idx !== i) : [...selected, i])}
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
  )
}

export default PersonalityCategories 