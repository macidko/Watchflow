import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.close();
    }
  };

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: '🏠' },
    { path: '/film', label: 'Filmler', icon: '🎬' },
    { path: '/dizi', label: 'Diziler', icon: '📺' },
    { path: '/anime', label: 'Anime', icon: '🎌' },
    { path: '/ayarlar', label: 'Ayarlar', icon: '⚙️' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      isScrolled ? 'backdrop-blur-xl bg-white/10 shadow-2xl' : 'backdrop-blur-lg bg-white/5 shadow-xl'
    }`}>
      {/* Header */}
      <div className="w-full h-16 flex items-center justify-between px-8 border-b border-white/10 relative">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              WatchFlow
            </h1>
            <p className="text-xs text-gray-400 -mt-1">Media Tracker</p>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex gap-2">
          <button 
            onClick={handleMinimize}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all duration-200 group"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full h-14 flex items-center justify-center gap-2 px-8 border-b border-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-6 py-2 rounded-xl font-medium text-sm transition-all duration-300 group ${
                isActive 
                  ? 'text-white bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-xl blur-sm"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;