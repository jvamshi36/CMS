import React from "react";
import "../../styles/Header.css";
import userAvatar from "../../components/assets/images/img.jpg";

const Header = () => {
  return (
    <div className="header">
      <input type="text" placeholder="Search" className="search-box" />
      <div className="header-right">
        <img src={userAvatar} alt="User" className="user-avatar" />
      </div>
    </div>
  );
};
export default Header;