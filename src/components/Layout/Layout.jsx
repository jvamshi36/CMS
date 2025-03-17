import React, { useState, useEffect } from "react";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import { FiX } from "react-icons/fi";
import "./Layout.css";

const Layout = ({ children, title }) => {
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
          title={title}
          onMenuToggle={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div
          className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`}
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
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!isMobile && <Header />}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;