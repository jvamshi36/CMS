import React from "react";
import "../../styles/Header.css";
import { IoNotificationsOutline } from "react-icons/io5";

const Header = () => {
  return (
    <div className="header">
      <input type="text" placeholder="Search" className="search-box" />
      <div className="header-right">
        <IoNotificationsOutline className="icon" />
        <img src="./user.png" alt="User" className="user-avatar" />
      </div>
    </div>
  );
};
export default Header;