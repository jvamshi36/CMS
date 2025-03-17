import React, { useState, useEffect } from "react";
import OrgSidebar from "../SideBar/OrgSidebar";
import Header from "../Header/Header";
import { FiX, FiMenu } from "react-icons/fi";
import "./Layout.css";

// Mobile Header Component
const MobileHeader = ({ title, onMenuToggle }) => {
  return (
    <div className="mobile-header">
      <button className="hamburger-menu" onClick={onMenuToggle}>
        <FiMenu size={24} />
      </button>
      <div className="mobile-header-title">{title || "Organization Portal"}</div>
    </div>
  );
};

const OrgLayout = ({ children, title }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader
          title={title || "Organization Portal"}
          onMenuToggle={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar - conditional classes for mobile */}
      <div className={`sidebar ${mobileMenuOpen && isMobile ? 'mobile-open' : ''}`}>
        {isMobile && mobileMenuOpen && (
          <button className="mobile-close-button" onClick={toggleMobileMenu}>
            <FiX />
          </button>
        )}
        <OrgSidebar />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!isMobile && <Header />}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default OrgLayout;