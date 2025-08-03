import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'shadow-xl' : 'shadow-lg'
    }`}>
      {/* Brand Header */}
      <div className="navbar-top w-full h-14 flex items-center justify-between px-6 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800/50 relative">
        <div className="logo flex items-center gap-3 cursor-pointer p-1.5 rounded-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="relative overflow-hidden">
            <svg 
              width="30" 
              height="30" 
              viewBox="0 0 40 40" 
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300 hover:scale-110 hover:-rotate-2 logo-svg"
              style={{
                filter: 'drop-shadow(0 0 3px rgba(255, 69, 0, 0.2))',
                animation: 'logoFloat 3s ease-in-out infinite'
              }}
            >
              {/* Top shape: Bounce animation */}
              <path 
                fill="#ff4500"
                d="M20 5 L5 20 L10 25 L20 15 L30 25 L35 20 L20 5"
              >
                <animateTransform 
                  attributeName="transform" 
                  type="translate"
                  values="0,0; 0,4; 0,0" 
                  dur="1.5s" 
                  repeatCount="indefinite"
                />
              </path>
            
              {/* Bottom shape: Delayed bounce animation */}
              <path 
                fill="#ff4500"
                d="M20 20 L10 30 L15 35 L20 30 L25 35 L30 30 L20 20"
              >
                <animateTransform 
                  attributeName="transform" 
                  type="translate"
                  values="0,0; 0,4; 0,0" 
                  dur="1.5s" 
                  begin="0.5s" 
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </div>
          <span className="logo-text text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-wide transition-all duration-300 group-hover:from-white group-hover:via-orange-400 group-hover:to-orange-500">
            Watchflow
          </span>
        </div>
        
        {/* Window Controls */}
        <div className="window-controls flex gap-2">
          <button 
            onClick={handleMinimize}
            className="window-control-btn minimize-btn flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white hover:bg-white/15 rounded-sm transition-all duration-200 text-xl"
          >
            -
          </button>
          <button 
            onClick={handleClose}
            className="window-control-btn close-btn flex items-center justify-center w-9 h-9 text-gray-400 hover:text-white hover:bg-red-600 rounded-sm transition-all duration-200 text-xl"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="navbar-bottom w-full h-12 flex items-center justify-center gap-8 bg-zinc-800/95 backdrop-blur-xl border-b border-zinc-700/50 shadow-lg">
        <NavTab to="/" label="Ana Sayfa" />
        <NavTab to="/film" label="Filmler" />
        <NavTab to="/dizi" label="Diziler" />
        <NavTab to="/anime" label="Anime" />
        <NavTab to="/ayarlar" label="Ayarlar" />
      </div>
    </nav>
  );
};

function NavTab({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`nav-tab relative px-5 py-1.5 text-sm font-medium transition-all duration-200 group flex items-center h-full ${
        isActive
          ? 'text-orange-400 font-semibold bg-orange-400/8 rounded-sm'
          : 'text-gray-300 hover:text-white'
      }`}
    >
      {label}
      {/* Active underline */}
      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 transition-all duration-300 ${
        isActive 
          ? 'opacity-100 scale-x-100 h-0.5 shadow-lg shadow-orange-400/50' 
          : 'opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-75'
      }`} />
      
      {/* Click effect */}
      <div className="absolute inset-0 rounded-sm opacity-0 transition-opacity duration-200 group-active:opacity-20 bg-white" />
    </Link>
  );
}

export default Navbar;
