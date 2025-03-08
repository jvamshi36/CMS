import React, { useState } from "react";
import "./Header.css";
import userAvatar from "../../components/assets/images/1.png";
import { FaUser, FaLock, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isOrganization, logout } = useAuth();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleManageAccount = () => {
    setShowMenu(false);
    if (isAdmin()) {
      navigate("/settings");
    } else if (isOrganization()) {
      navigate("/org/settings");
    }
  };

  const handleChangePassword = () => {
    setShowMenu(false);
    if (isAdmin()) {
      navigate("/settings"); // Navigate to the password section of settings
    } else if (isOrganization()) {
      navigate("/org/settings"); // Navigate to the password section of settings
    }
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout(); // This will handle the redirection to login page
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
            <div className="menu-item" onClick={handleManageAccount}>
              <FaUser /> Manage Account
            </div>
            <div className="menu-item" onClick={handleChangePassword}>
              <FaLock /> Change Password
            </div>
            <div className="menu-item" onClick={handleLogout}>
              <FaSignOutAlt /> Log out
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;