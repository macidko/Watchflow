import React from 'react';
import PropTypes from 'prop-types';
import styles from './Navbar.module.css';

const NavbarLogo = ({ onDoubleClick }) => {
  return (
    <div 
      className={styles.logoContainer}
      onDoubleClick={onDoubleClick}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 40 40" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Watchflow Logo"
      >
        {/* Top shape: Bounce animation */}
        <path 
          fill="var(--accent-color)"
          d="M20 5 L5 20 L10 25 L20 15 L30 25 L35 20 L20 5"
        >
          {/* Vertical bounce effect */}
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
          fill="var(--accent-color)"
          d="M20 20 L10 30 L15 35 L20 30 L25 35 L30 30 L20 20"
        >
          {/* Delayed vertical bounce effect */}
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
      <span className={styles.logoText}>Watchflow</span>
    </div>
  );
};

NavbarLogo.propTypes = {
  onDoubleClick: PropTypes.func
};

NavbarLogo.defaultProps = {
  onDoubleClick: undefined
};

export default NavbarLogo;
