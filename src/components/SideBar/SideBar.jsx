import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { HiOutlineCube } from "react-icons/hi";
import { LuCircuitBoard } from "react-icons/lu";  // Futuristic Dashboard Icon
import { FaBuilding } from "react-icons/fa"; // Futuristic Companies Icon
import { GiArtificialIntelligence } from "react-icons/gi"; // Futuristic Team Icon

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <HiOutlineCube size={28} className="futuristic-icon" />
        <h2 className="logo">Suraksha <span>Pharma</span></h2>
      </div>

      <div className="user-profile">
        <div className="user-avatar">
          <GiArtificialIntelligence size={22} className="futuristic-icon" />
        </div>
        <div className="user-info">
          <div className="user-name">Admin User</div>
          <div className="user-email">admin@suraksha.com</div>
        </div>
      </div>

      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <LuCircuitBoard className="futuristic-icon" /> Dashboard
        </NavLink>

        <NavLink to="/companies" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FaBuilding className="futuristic-icon" /> Companies
          <span className="notification-badge">3</span>
        </NavLink>

        <NavLink to="/team" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <GiArtificialIntelligence className="futuristic-icon" /> Team
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiSettings className="futuristic-icon" /> Settings
        </NavLink>

        <NavLink to="/logout" className="nav-item">
          <FiLogOut className="futuristic-icon" /> Logout
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
