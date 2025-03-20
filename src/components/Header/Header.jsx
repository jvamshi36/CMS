import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import userAvatar from "../../components/assets/images/1.png";
import { FaUser, FaLock, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isOrganization, logout } = useAuth();
  const searchTimeoutRef = useRef(null);
  const prevSearchRef = useRef("");

  // Get current path to determine search context
  const currentPath = location.pathname;

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
      navigate("/settings");
    } else if (isOrganization()) {
      navigate("/org/settings");
    }
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  // Handle search input change - adapted from AdvancedSearchFilter
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear previous timeout to prevent multiple searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't trigger search if emptying the field
    if (!value.trim()) {
      setIsSearching(false);
      return;
    }

    // Set a flag to indicate we're in search mode
    setIsSearching(true);
  };

  // Perform search based on current context - using logic from Advanced Search
  const performSearch = useCallback(() => {
    setLoading(true);

    // Prevent duplicate searches with the same term
    if (!searchTerm.trim() || searchTerm === prevSearchRef.current) {
      setLoading(false);
      return;
    }

    prevSearchRef.current = searchTerm;

    // Build the search query with context awareness
    if (isAdmin()) {
      // Admin context search
      if (currentPath.includes('/companies')) {
        // Companies search - include relevant fields
        navigate(`/companies?search=${encodeURIComponent(searchTerm)}&searchFields=name,gst,id`, { replace: true });
      } else if (currentPath.includes('/orders') || currentPath.match(/\/companies\/\d+\/orders/)) {
        // Extract company ID if in company-specific orders page
        const companyMatch = currentPath.match(/\/companies\/(\d+)\/orders/);
        const companyId = companyMatch ? companyMatch[1] : null;

        if (companyId) {
          navigate(`/companies/${companyId}/orders?search=${encodeURIComponent(searchTerm)}&searchFields=id,prn,date,product,type,batch,amount`, { replace: true });
        } else {
          navigate(`/orders?search=${encodeURIComponent(searchTerm)}&searchFields=id,prn,date,product,type,batch,amount`, { replace: true });
        }
      } else {
        // Default to companies search for admin
        navigate(`/companies?search=${encodeURIComponent(searchTerm)}&searchFields=name,gst,id`, { replace: true });
      }
    } else if (isOrganization()) {
      // Organization context search
      if (currentPath.includes('/orders')) {
        navigate(`/org/orders?search=${encodeURIComponent(searchTerm)}&searchFields=id,prn,date,product,type,batch,amount`, { replace: true });
      } else {
        // Default to orders search for organization
        navigate(`/org/orders?search=${encodeURIComponent(searchTerm)}&searchFields=id,prn,date,product,type,batch,amount`, { replace: true });
      }
    }

    // Using setTimeout as in the original AdvancedSearchFilter
    setTimeout(() => setLoading(false), 500);
  }, [searchTerm, currentPath, navigate, isAdmin, isOrganization]);

  // Handle search submit - from AdvancedSearchFilter
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();

    // Clear any pending debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    performSearch();
  };

  // Handle key press (Enter) - same as original
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Update search when location changes - adapted from both components
  useEffect(() => {
    // Only run this once per navigation, not on every search param change
    const searchParams = new URLSearchParams(location.search);
    const urlSearchTerm = searchParams.get('search');

    if (urlSearchTerm && !isSearching) {
      setSearchTerm(urlSearchTerm);
    }
  }, [location.pathname, isSearching]);

  // Effect for debounced search - from original Header
  useEffect(() => {
    if (searchTerm.trim() && isSearching) {
      // Create a debounced search with a longer delay
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 800); // Increased to 800ms to reduce API calls

      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    }
  }, [searchTerm, performSearch, isSearching]);

  // Get placeholder text based on context
  const getPlaceholderText = () => {
    if (isAdmin()) {
      if (currentPath.includes('/companies')) {
        return "Search by company name, GST number, ID...";
      } else if (currentPath.includes('/orders')) {
        return "Search by order ID, PRN NO, product name...";
      }
    } else if (isOrganization()) {
      if (currentPath.includes('/orders')) {
        return "Search by order ID, PRN NO, product name...";
      }
    }
    return "Search...";
  };

  return (
    <>
      <div className="header-container" /> {/* Transparent container */}
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder={getPlaceholderText()}
          className="search-box"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading}
        >
          <FaSearch className="search-icon" />
        </button>
      </form>
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