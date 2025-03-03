import React, { useState } from "react";
import "./Header.css";
import userAvatar from "../../components/assets/images/img.jpg";
import { FaUser, FaLock, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      <div className="header-container" /> {/* Transparent container */}
      <input type="text" placeholder="Search" className="search-box" />
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