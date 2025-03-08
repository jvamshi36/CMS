import React, { useState, useEffect } from "react";
import OrgSidebar from "../SideBar/OrgSidebar";
import Header from "../Header/Header";
import "./Layout.css";

const OrgLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout">
      {/* Sidebar toggle button (mobile only) */}
      {isMobile && (
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
      )}

      {/* Overlay when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar with open state */}
      <OrgSidebar className={isSidebarOpen ? 'open' : ''} />

      {/* Main content */}
      <div className="main-content">
        <Header />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default OrgLayout;