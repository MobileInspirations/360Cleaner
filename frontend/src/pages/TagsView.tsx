import { useEffect, useState } from 'react';

interface TagCount {
  tag: string;
  count: number;
}

function TagsView() {
  const [tags, setTags] = useState<TagCount[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/contacts/tags-with-counts');
        const data = await res.json();
        setTags(data.tags || []);
      } catch {
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const filteredTags = tags.filter(t => t.tag.toLowerCase().includes(search.toLowerCase()));

  const handleExport = () => {
    const csvContent = [
      ['Tag', 'Count'],
      ...filteredTags.map(tag => [tag.tag, tag.count])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tags_with_counts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Tags</h1>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>⬇️</span> Export Tags
          </button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-80"
          />
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map(tag => (
              <div key={tag.tag} className="flex items-center justify-between bg-white rounded shadow p-4 border hover:bg-blue-50 transition">
                <span className="font-semibold text-blue-800">{tag.tag}</span>
                <span className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-bold">{tag.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TagsView; 