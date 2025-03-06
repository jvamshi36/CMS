import React from "react";
import Sidebar from "../SideBar/SideBar";
import Header from "../Header/Header";
import "../../styles/Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};
export default Layout;