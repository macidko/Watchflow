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
    { 
      path: '/', 
      label: 'Ana Sayfa', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Ana Sayfa</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ) 
    },
    { 
      path: '/film', 
      label: 'Filmler', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Filmler</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
        </svg>
      ) 
    },
    { 
      path: '/dizi', 
      label: 'Diziler', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Diziler</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      path: '/anime', 
      label: 'Anime', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Anime</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ) 
    },
    { 
      path: '/ayarlar', 
      label: 'Ayarlar', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <title>Ayarlar</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ease-out ${
      isScrolled 
        ? 'backdrop-blur-xl bg-neutral-900/95 shadow-2xl border-b border-neutral-700/40 shadow-black/20' 
        : 'backdrop-blur-lg bg-neutral-900/85 shadow-xl border-b border-neutral-700/20'
    }`}>
      {/* Header */}
  <div className="w-full h-16 flex items-center justify-between px-4 sm:px-8 relative">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center transform transition-all duration-500 ease-out group-hover:scale-110 shadow-lg group-hover:shadow-lime-500/15 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-lime-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="w-6 h-6 text-neutral-200 relative z-10 group-hover:text-lime-100 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h4a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1h4a1 1 0 011 1v3m0 0h8M7 4H3" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white drop-shadow-lg group-hover:text-lime-50 transition-colors duration-300">
              WatchFlow
            </h1>
            <p className="text-xs text-neutral-400 -mt-1 font-medium group-hover:text-neutral-300 transition-colors duration-300">Media Tracker</p>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex gap-2">
          <button 
            onClick={handleMinimize}
            className="flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-xl transition-all duration-300 ease-out border border-neutral-600/30 hover:border-neutral-500/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={handleClose}
            className="flex items-center justify-center w-9 h-9 text-neutral-400 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 ease-out border border-neutral-600/30 hover:border-red-400/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full h-14 flex items-center justify-center px-2 sm:px-8 bg-gradient-to-r from-gray-800/30 via-gray-700/20 to-gray-800/30 border-t border-gray-600/20">
        <div className="flex gap-2 sm:gap-4 w-full max-w-3xl justify-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative px-4 sm:px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ease-out group border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/70 ${
                isActive 
                  ? 'text-black bg-lime-500 border-lime-400/70 shadow-xl ring-2 ring-lime-400/40 scale-105 z-10' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-700 border-neutral-600/30 hover:border-lime-400/40 hover:scale-103 focus-visible:ring-2 focus-visible:ring-lime-400/40'
              }`}
              style={{ minWidth: 96, marginLeft: 0, marginRight: 0 }}
            >
              <span className="flex items-center gap-3 relative z-10">
                <span className={`transition-all duration-300 group-hover:scale-105 ${isActive ? 'text-black' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                  {item.icon}
                </span>
                {item.label}
              </span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;