import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const NavbarLinks = ({ navItems }) => {
  const location = useLocation();

  return (
    <div className={styles.navLinksContainer}>
      {navItems.map((item) => { 
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.navLinkText}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

NavbarLinks.propTypes = {
  navItems: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.element
  })).isRequired
};

export default NavbarLinks;
