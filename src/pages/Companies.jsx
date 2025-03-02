import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Companies.css";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios"; // Ensure axios is installed: npm install axios

const Companies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const companiesPerPage = 9;


    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const token = localStorage.getItem("token"); // Retrieve token from localStorage
                if (!token) throw new Error("No authentication token found");

                const response = await axios.get("https://localhost:8081/api/new-org", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setCompanies(response.data);
            } catch (err) {
                console.error("Error fetching companies:", err);
                setError("Failed to load companies. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);
//sorting
 const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });

        const sortedCompanies = [...companies].sort((a, b) => {
            if (key === "createdAt") {
                return direction === "asc"
                    ? new Date(a.createdAt) - new Date(b.createdAt)
                    : new Date(b.createdAt) - new Date(a.createdAt);
            } else if (key === "status") {
                return direction === "asc"
                    ? a.status.localeCompare(b.status)
                    : b.status.localeCompare(a.status);
            }
            return 0;
        });

        setCompanies(sortedCompanies);
    };

    // Pagination Logic
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Format date from createdAt timestamp
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    if (loading) return <Layout><div className="loading">Loading...</div></Layout>;
    if (error) return <Layout><div className="error">{error}</div></Layout>;

    return (
        <Layout>
            <div className="companies-header">
                <h2 className="page-title">Companies</h2>
                <button className="add-company-button" onClick={() => navigate("/new-org")}>Add New Organization</button>
            </div>
            {companies.length === 0 ? (
                <div className="no-data">No companies found</div>
            ) : (
                <>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Address</th>
                               <th onClick={() => handleSort("createdAt")} className="sortable">
                                   Date {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▲▼"}
                               </th>
                               <th> GST </th>
                               <th onClick={() => handleSort("status")} className="sortable">
                                   Status {sortConfig.key === "status" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▲▼"}
                               </th>

                                <th>Details</th>
                                <th>Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCompanies.map((company) => (
                                <tr key={company.id}>
                                    <td>{company.id}</td>
                                    <td>{company.organizationName}</td>
                                    <td>{`${company.addressLine1}, ${company.city}, ${company.zip}`}</td>
                                    <td>{formatDate(company.createdAt)}</td>
                                    <td>{company.gstNumber || "N/A"}</td>
                                    <td><span className={`status ${company.status.toLowerCase()}`}>{company.status}</span></td>
                                    <td><NavLink to={`/companies/${company.id}/org-details`}>Details</NavLink></td>
                                    <td><NavLink to={`/companies/${company.id}/orders`}>Orders</NavLink></td>
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
                </>
            )}
        </Layout>
    );
};

export default Companies;
