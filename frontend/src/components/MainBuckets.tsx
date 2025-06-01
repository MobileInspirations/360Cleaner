type MainBucketsProps = {
  mainBuckets: { label: string; description: string; count: number; color: string }[]
  selected: number
  onSelect: (idx: number) => void
}

function MainBuckets({ mainBuckets, selected, onSelect }: MainBucketsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Main Buckets</h2>
        <span className="text-muted-foreground text-sm">{`1 of 4 selected`}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mainBuckets.map((bucket, i) => (
          <div
            key={i}
            className={`rounded-lg p-6 border cursor-pointer shadow flex flex-col gap-2 transition-all ${selected === i ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border hover:border-blue-300'}`}
            onClick={() => onSelect(i)}
          >
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${bucket.color === 'blue' ? 'bg-blue-500' : bucket.color === 'green' ? 'bg-green-500' : bucket.color === 'orange' ? 'bg-orange-500' : 'bg-gray-400'}`}></span>
              <span className="font-semibold">{bucket.label}</span>
              {selected === i && <span className="ml-auto text-blue-500">✔️</span>}
            </div>
            <span className="text-muted-foreground text-sm">{bucket.description}</span>
            <span className="text-lg font-bold mt-2">{bucket.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MainBuckets 