import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { HiOutlineCube } from "react-icons/hi";
import { LuCircuitBoard } from "react-icons/lu";
import { FaBuilding } from "react-icons/fa";
import { GiArtificialIntelligence } from "react-icons/gi";
import { FiClock } from "react-icons/fi";
import apiService from "../../utils/api";

const Sidebar = ({ forceVisible }) => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        const response = await apiService.get("/api/admin/orders/pending/count");
        setPendingOrdersCount(response.count || 0);
      } catch (error) {
        console.error("Error fetching pending orders count:", error);
      }
    };

    fetchPendingOrdersCount();
//     const intervalId = setInterval(fetchPendingOrdersCount, 60000);
//     return () ;
  }, []);

  return (
    <div className="sidebar-content">
      <div className="logo-container">
        <HiOutlineCube className="logo-icon" />
        <h2 className="logo-text">
          Suraksha <span className="logo-highlight">Pharma</span>
        </h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <LuCircuitBoard className="nav-icon" /> 
          <div className="nav-text">Dashboard</div>
        </NavLink>

        <NavLink 
          to="/companies" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <FaBuilding className="nav-icon" /> 
          <div className="nav-text">Companies</div>
          <span className="badge">3</span>
        </NavLink>
        
        <NavLink 
          to="/pending-orders" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <FiClock className="nav-icon" /> 
          <div className="nav-text">Pending Orders</div>
          {pendingOrdersCount > 0 && (
            <span className="badge">{pendingOrdersCount}</span>
          )}
        </NavLink>

        <NavLink 
          to="/team" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
          <GiArtificialIntelligence className="nav-icon" /> 
          <div className="nav-text">Team</div>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
        >
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

export default Sidebar;