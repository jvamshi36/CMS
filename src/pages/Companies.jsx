import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Companies.css";
import { companies } from "../data/dummy";
import { NavLink, useNavigate } from "react-router-dom";

const Companies = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const companiesPerPage = 9;

    // Get current companies
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Layout>
            <div className="companies-header">
                <h2 className="page-title">Companies</h2>
                <button className="add-company-button" onClick={() => navigate("/new-org")}>Add New Organization</button>
            </div>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Name</th><th>Address</th><th>Date</th><th>GST No.</th><th>Status</th><th>Orders</th>
                    </tr>
                </thead>
                <tbody>
                    {currentCompanies.map((company) => (
                        <tr key={company.id}>
                            <td>{company.id}</td><td>{company.name}</td><td>{company.address}</td>
                            <td>{company.date}</td><td>{company.gst}</td><td><span className={`status ${company.status.toLowerCase()}`}>{company.status}</span></td>
                            <td><NavLink to={`/companies/${company.id}/orders`}>View Orders</NavLink></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: Math.ceil(companies.length / companiesPerPage) }).map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </Layout>
    );
};
export default Companies;