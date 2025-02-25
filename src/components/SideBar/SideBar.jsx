import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/Sidebar.css";
import { BiBuildings, } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import { AiOutlineDashboard, AiOutlinePoweroff, AiOutlineTeam } from "react-icons/ai";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="logo">Suraksha<span> Pharma</span></h2>
      <nav>
        <NavLink to="/dashboard" className="nav-item">< AiOutlineDashboard/> Dashboard</NavLink>
        <NavLink to="/companies" className="nav-item"><BiBuildings /> Companies</NavLink>
        <NavLink to ="/team" className = "nav-item"><AiOutlineTeam/> Team</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/settings" className="nav-item"><FiSettings /> Settings</NavLink>
        <NavLink to="/login" className="nav-item"><AiOutlinePoweroff /> Logout</NavLink>
      </div>
    </div>
  );
};
export default Sidebar;