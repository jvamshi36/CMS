import React, { useState, useEffect } from "react";
import "./Header.css";
import userAvatar from "../../components/assets/images/1.png";
import { FaUser, FaLock, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.user-avatar') && !event.target.closest('.user-menu')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  return (
    <>
      <div className="header-container" /> {/* Transparent container */}
      <input
        type="text"
        placeholder={isMobile ? "Search..." : "Search"}
        className="search-box"
      />
      <div className="header-right">
        <img
          src={userAvatar}
          alt="User"
          className="user-avatar"
          onClick={toggleMenu}
        />
        {showMenu && (
          <div className="user-menu">
            <div className="menu-item"><FaUser /> Manage Account</div>
            <div className="menu-item"><FaLock /> Change Password</div>
            <div className="menu-item"><FaSignOutAlt /> Log out</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;