import React from 'react';
import { Link } from 'react-router-dom';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navigation */}
      <header className="bg-black text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AUDORA</h1>
        <nav className="flex gap-6 text-sm">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/Search" className="hover:underline">Browse</Link>
          {/* <Link to="/library" className="hover:underline">Library</Link>*/}
          <Link to="/podcasts" className="hover:underline">Podcasts</Link>
          <Link to="/playlists" className="hover:underline">Playlists</Link>
          <Link to="/admin" className="hover:underline">Admin Panel</Link>


        </nav>
      </header>

      {/* Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (hidden on small screens) */}
        <aside className="hidden lg:block w-64 bg-gray-900 text-white p-4 overflow-y-auto">
          <ul className="space-y-4 text-sm">
            <li>
              <Link to="/" className="hover:underline flex items-center gap-2">🏠 Home</Link>
            </li>
            <li>
              <Link to="/podcasts" className="hover:underline flex items-center gap-2">🎧 Podcasts</Link>
            </li>
            <li>
              <Link to="/search" className="hover:underline flex items-center gap-2">🔍 Search</Link>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
