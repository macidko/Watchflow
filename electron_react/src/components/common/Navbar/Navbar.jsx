import React, { useEffect } from 'react';
import NavbarLogo from './NavbarLogo';
import NavbarLinks from './NavbarLinks';
import NavbarActions from './NavbarActions';
import NavbarSettings from './NavbarSettings';
import { useNavbarNotifications } from './useNavbarNotifications';
import { useNavbarWindowControls } from './useNavbarWindowControls';
import { useNavbarNavItems } from './useNavbarNavItems.jsx';
import styles from './Navbar.module.css';

const Navbar = () => {
  // Custom hooks
  const notificationsLogic = useNavbarNotifications();
  const windowControlsLogic = useNavbarWindowControls();
  const { navItems } = useNavbarNavItems();

  // Scroll effect (currently empty but can be extended)
  useEffect(() => {
    const handleScroll = () => {
      // Add scroll-based effects here if needed
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={styles.navbarMain}>
      {/* Header Section */}
      <div className={styles.header}>
        <NavbarLogo onDoubleClick={windowControlsLogic.handleMaximize} />
        
        <NavbarActions
          onMinimize={windowControlsLogic.handleMinimize}
          onMaximize={windowControlsLogic.handleMaximize}
          onClose={windowControlsLogic.handleClose}
          showNotifications={notificationsLogic.showNotifications}
          onNotificationClick={notificationsLogic.handleNotificationClick}
          notifications={notificationsLogic.notifications}
          hasUnread={notificationsLogic.hasUnread}
          onCloseNotifications={notificationsLogic.handleCloseNotifications}
        />
      </div>

      {/* Navigation Section */}
      <div className={styles.navContainer}>
        <NavbarLinks navItems={navItems} />
        <NavbarSettings />
      </div>
    </nav>
  );
};

export default Navbar;
