import React from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Team.css";
import { teamMembers } from "../components/data/dummy";
import { useNavigate } from "react-router-dom";
import image1 from "../components/assets/images/user1.jpg";
import image2 from "../components/assets/images/shyam.jpg";



const Team = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="team-header">
        <h2 className="page-title">Team</h2>
        <button className="add-member-button" onClick={() => navigate("/new-member")}>Add New Member</button>
      </div>
      <div className="team-grid">
        {teamMembers.map((member, index) => (
          <div key={index} className="team-card">
            <img src={image2} alt={member.name} className="team-image" />
            <h3>{member.name}</h3>
            <p>{member.role}</p>
            <p>{member.email}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Team;