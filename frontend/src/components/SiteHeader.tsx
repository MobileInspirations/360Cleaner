import { NavLink } from 'react-router-dom';

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow border-b mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-blue-700 tracking-tight">Contact Cleaner</span>
        </div>
        <nav className="flex gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/contacts"
            className={({ isActive }) =>
              `px-3 py-2 rounded font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Contacts
          </NavLink>
          <NavLink
            to="/tags"
            className={({ isActive }) =>
              `px-3 py-2 rounded font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Tags
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default SiteHeader; 