// src/components/Layout/OrgLayout.jsx
import React from "react";
import OrgSidebar from "../SideBar/OrgSidebar";
import Header from "../Header/Header";
import "./Layout.css";

const OrgLayout = ({ children }) => {
  return (
    <div className="layout">
      <OrgSidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default OrgLayout;