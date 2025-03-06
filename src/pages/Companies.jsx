import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Companies.css";
import { NavLink, useNavigate } from "react-router-dom";
import { Alert, Snackbar, CircularProgress, Box, Button } from "@mui/material";
import apiService from "../utils/api";

const Companies = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info"
    });
    const companiesPerPage = 9;

    const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

    // Fetch companies - wrapped in useCallback to prevent infinite loops
    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.get("/api/new-org");
            setCompanies(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching companies:", err);
            setError(err.message || "Failed to load companies. Please try again later.");
            setSnackbar({
                open: true,
                message: err.message || "Failed to load companies",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Load companies on component mount
    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    // Handle sorting
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
                    ? a.status?.localeCompare(b.status || "")
                    : b.status?.localeCompare(a.status || "");
            } else if (key === "organizationName") {
                return direction === "asc"
                    ? a.organizationName?.localeCompare(b.organizationName || "")
                    : b.organizationName?.localeCompare(a.organizationName || "");
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
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            console.error("Date parsing error:", e);
            return "Invalid date";
        }
    };

    // Snackbar close handler
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Retry fetching data if there was an error
    const handleRetry = () => {
        fetchCompanies();
    };

    // Loading state
    if (loading) {
        return (
            <Layout>
                <Box className="loading-container">
                    <CircularProgress size={60} thickness={4} sx={{ color: '#2563EB' }} />
                    <p>Loading companies...</p>
                </Box>
            </Layout>
        );
    }

    // Error state with retry button
    if (error) {
        return (
            <Layout>
                <Box className="error-container">
                    <h3>Something went wrong</h3>
                    <p>{error}</p>
                    <Button 
                        variant="contained" 
                        onClick={handleRetry}
                        sx={{ mt: 2 }}
                    >
                        Retry
                    </Button>
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="companies-header">
                <h2 className="page-title">Companies</h2>
                <button className="add-company-button" onClick={() => navigate("/new-org")}>
                    Add New Organization
                </button>
            </div>
            {companies.length === 0 ? (
                <div className="no-data">
                    <p>No companies found</p>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/new-org")}
                        sx={{ mt: 2 }}
                    >
                        Add Your First Organization
                    </Button>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th 
                                        onClick={() => handleSort("organizationName")} 
                                        className="sortable"
                                    >
                                        Name {sortConfig.key === "organizationName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▲▼"}
                                    </th>
                                    <th>Address</th>
                                    <th onClick={() => handleSort("createdAt")} className="sortable">
                                        Date {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▲▼"}
                                    </th>
                                    <th>GST</th>
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
                                        <td>
                                            <span className={`status ${company.status ? company.status.toLowerCase() : "processing"}`}>
                                                {company.status || 'Processing'}
                                            </span>
                                        </td>
                                        <td>
                                            <NavLink 
                                                to={`/companies/${company.id}/org-details`}
                                                className="table-link"
                                            >
                                                Details
                                            </NavLink>
                                        </td>
                                        <td>
                                            <NavLink 
                                                to={`/companies/${company.id}/orders`}
                                                className="table-link"
                                            >
                                                Orders
                                            </NavLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
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

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Layout>
    );
};

export default Companies;