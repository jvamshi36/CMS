import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { HiOutlineCube } from "react-icons/hi";
import { LuCircuitBoard } from "react-icons/lu";  // Futuristic Dashboard Icon
import { FaBuilding } from "react-icons/fa"; // Futuristic Companies Icon
import { GiArtificialIntelligence } from "react-icons/gi"; // Futuristic Team Icon
import { FiClock } from "react-icons/fi"; // Pending Orders Icon
import { Badge } from "@mui/material";
import apiService from "../../utils/api";

const Sidebar = () => {
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrdersCount = async () => {
      try {
        const response = await apiService.get("/api/admin/orders/pending/count");
        setPendingOrdersCount(response.count || 0);
      } catch (error) {
        console.error("Error fetching pending orders count:", error);
        // Set a default value or keep the current value
      }
    };

    fetchPendingOrdersCount();

    // Set up interval to refresh the count every minute
    const intervalId = setInterval(fetchPendingOrdersCount, 60000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

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
        
        <NavLink to="/pending-orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <FiClock className="futuristic-icon" /> Pending Orders
          {pendingOrdersCount > 0 && (
            <Badge 
              badgeContent={pendingOrdersCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#ff4a4a',
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  fontSize: '12px'
                }
              }}
            />
          )}
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