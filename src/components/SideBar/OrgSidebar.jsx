// src/components/SideBar/OrgSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { FiLogOut, FiSettings, FiHome, FiPackage, FiUser } from "react-icons/fi";
import { HiOutlineCube } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

const OrgSidebar = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <HiOutlineCube size={28} className="futuristic-icon" />
        <h2 className="logo">Suraksha <span>Pharma</span></h2>
      </div>

      <div className="user-profile">
        <div className="user-avatar">
          <FiUser size={22} className="futuristic-icon" />
        </div>
        <div className="user-info">
          <div className="user-name">Organization Portal</div>
          <div className="user-email">Welcome!</div>
        </div>
      </div>

      <nav>
        <NavLink to="/org/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiHome className="futuristic-icon" /> Dashboard
        </NavLink>

        <NavLink to="/org/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiUser className="futuristic-icon" /> Profile
        </NavLink>

        <NavLink to="/org/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiPackage className="futuristic-icon" /> Orders
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/org/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiSettings className="futuristic-icon" /> Settings
        </NavLink>

        <button onClick={handleLogout} className="nav-item logout-button">
          <FiLogOut className="futuristic-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default OrgSidebar;