import React from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Companies.css";
import { companies } from "../data/dummy";
import { NavLink, useNavigate } from "react-router-dom";

const Companies = () => {
    const navigate = useNavigate();
  return (
    <Layout>
      <div className="companies-header">
        <h2 className="page-title">Companies</h2>
        <button className="add-company-button" onClick= {()=> navigate("/new-org")}>Add New Organization</button>
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Address</th><th>Date</th><th>GST No.</th><th>Status</th><th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.id}</td><td>{company.name}</td><td>{company.address}</td>
              <td>{company.date}</td><td>{company.gst}</td><td><span className={`status ${company.status.toLowerCase()}`}>{company.status}</span></td>
              <td><NavLink to={`/companies/${company.id}/orders`}>View Orders</NavLink></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};
export default Companies;