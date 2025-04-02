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
    <div className="sidebar-content">
      <div className="logo-container">
        <HiOutlineCube size={28} className="logo-icon" />
        <h2 className="logo-text">Suraksha <span className="logo-highlight">Pharma</span></h2>
      </div>


      <nav className="sidebar-nav">
        <NavLink to="/org/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiHome className="nav-icon" /> 
          <div className="nav-text">Dashboard</div>
        </NavLink>

        <NavLink to="/org/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiUser className="nav-icon" /> 
          <div className="nav-text">Profile</div>
        </NavLink>

        <NavLink to="/org/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiPackage className="nav-icon" /> 
          <div className="nav-text">Orders</div>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/org/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiSettings className="nav-icon" /> 
          <div className="nav-text">Settings</div>
        </NavLink>

        <NavLink 
          to="/logout" 
          className="nav-item logout-item"
        >
          <FiLogOut className="nav-icon" /> 
          <div className="nav-text">Logout</div>
        </NavLink>
      </div>
    </div>
  );
};

export default OrgSidebar;