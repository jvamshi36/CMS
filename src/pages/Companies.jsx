import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Companies.css";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Snackbar,
  CircularProgress,
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Chip,
  Typography,
  TablePagination,
} from "@mui/material";
import { FilterList, Clear, ArrowDownward, ArrowUpward } from '@mui/icons-material';
import apiService from "../utils/api";


const Companies = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for companies data and pagination
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    // Add missing pagination state variables
    const [currentPage, setCurrentPage] = useState(1);
    const [companiesPerPage, setCompaniesPerPage] = useState(10);

    // Reference to track if a request is in progress
    const requestInProgressRef = useRef(false);

    // Ref to ensure URL parsing only runs once
    const hasRunUrlParsing = useRef(false);

    // Ref to track if component is mounted
    const isMountedRef = useRef(true);

    // State for filters
    const [filters, setFilters] = useState({
        status: 'all',
        constitution: 'all',
        createdAtStart: null,
        createdAtEnd: null
    });
    const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info"
    });

    // Clean up on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Completely ignore location.search changes to prevent infinite loops with header search
    // Parse URL query parameters on component mount - ONE TIME ONLY
    useEffect(() => {
        // Skip if already run
        if (hasRunUrlParsing.current) return;

        hasRunUrlParsing.current = true;

        const params = new URLSearchParams(location.search);

        // Extract filters from URL
        const status = params.get('status');
        if (status) {
            setFilters(prev => ({ ...prev, status }));
        }

        const constitution = params.get('constitution');
        if (constitution) {
            setFilters(prev => ({ ...prev, constitution }));
        }

        // Extract sort config from URL
        const sortKey = params.get('sortKey');
        const sortDirection = params.get('sortDirection');
        if (sortKey && sortDirection) {
            setSortConfig({ key: sortKey, direction: sortDirection });
        }
    }, []);

    // Fetch companies with robust protection against duplicate calls
    const fetchCompanies = useCallback(async () => {
        // Prevent duplicate calls
        if (requestInProgressRef.current) {
            console.log("Request already in progress, skipping duplicate call");
            return;
        }

        // Skip if component unmounted
        if (!isMountedRef.current) return;

        // Track the request
        requestInProgressRef.current = true;
        setLoading(true);

        try {
            // In a real implementation, you would pass filter parameters to your API
            const response = await apiService.get("/api/new-org");

            // Skip if component unmounted during API call
            if (!isMountedRef.current) return;

            // Apply client-side filtering if needed
            let filteredCompanies = response;

            // Apply status filter
            if (filters.status && filters.status !== 'all') {
                filteredCompanies = filteredCompanies.filter(company => {
                    // Handle case where status is null or undefined by treating it as "processing"
                    const companyStatus = company.status ? company.status.toLowerCase() : "processing";
                    return companyStatus === filters.status.toLowerCase();
                });
            }

            // Apply constitution filter
            if (filters.constitution && filters.constitution !== 'all') {
                filteredCompanies = filteredCompanies.filter(company =>
                    company.constitution?.toLowerCase() === filters.constitution.toLowerCase()
                );
            }

            // Apply date range filters
            if (filters.createdAtStart) {
                const startDate = new Date(filters.createdAtStart);
                filteredCompanies = filteredCompanies.filter(company => {
                    if (!company.createdAt) return true;
                    return new Date(company.createdAt) >= startDate;
                });
            }

            if (filters.createdAtEnd) {
                const endDate = new Date(filters.createdAtEnd);
                filteredCompanies = filteredCompanies.filter(company => {
                    if (!company.createdAt) return true;
                    return new Date(company.createdAt) <= endDate;
                });
            }

            // Sort the data
            const sortedData = [...filteredCompanies].sort((a, b) => {
                if (sortConfig.key === "createdAt") {
                    return sortConfig.direction === "asc"
                        ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
                        : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                } else if (sortConfig.key === "status") {
                    return sortConfig.direction === "asc"
                        ? (a.status || "").localeCompare(b.status || "")
                        : (b.status || "").localeCompare(a.status || "");
                } else if (sortConfig.key === "organizationName") {
                    return sortConfig.direction === "asc"
                        ? (a.organizationName || "").localeCompare(b.organizationName || "")
                        : (b.organizationName || "").localeCompare(a.organizationName || "");
                }
                return 0;
            });

            setCompanies(sortedData);
            setError(null);

            // Don't update URL params - this prevents conflicts with header search

        } catch (err) {
            // Skip if component unmounted during API call
            if (!isMountedRef.current) return;

            console.error("Error fetching companies:", err);
            setError(err.message || "Failed to load companies. Please try again later.");
            setSnackbar({
                open: true,
                message: err.message || "Failed to load companies",
                severity: "error"
            });
        } finally {
            // Skip if component unmounted during API call
            if (isMountedRef.current) {
                setLoading(false);
            }
            requestInProgressRef.current = false;
        }
    }, [filters, sortConfig, isMountedRef]);

    // Don't update URLs to prevent conflicts with header search
    const updateUrlParams = useCallback(() => {
        return; // Do nothing
    }, []);

    // Use a single effect to fetch companies only when needed
    useEffect(() => {
        // Only fetch once on initial load
        fetchCompanies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only runs once

    // Separate effect to handle filter changes
    useEffect(() => {
        // Skip the initial render
        if (activeFilters.length > 0 || sortConfig.key !== "createdAt" || sortConfig.direction !== "desc") {
            // Reset the request tracking flag to ensure we can make a new request
            requestInProgressRef.current = false;
            fetchCompanies();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilters, sortConfig]); // Only depend on filters and sort

    // Handle sorting
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Pagination Logic
    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = companies.slice(indexOfFirstCompany, indexOfLastCompany);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle MUI pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handle date filter change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        // Build active filters array for display
        const newActiveFilters = [];

        if (filters.status && filters.status !== 'all') {
            newActiveFilters.push({
                key: 'status',
                label: `Status: ${filters.status}`,
                value: filters.status
            });
        }

        if (filters.constitution && filters.constitution !== 'all') {
            newActiveFilters.push({
                key: 'constitution',
                label: `Constitution: ${filters.constitution}`,
                value: filters.constitution
            });
        }

        if (filters.createdAtStart) {
            newActiveFilters.push({
                key: 'createdAtStart',
                label: `From: ${new Date(filters.createdAtStart).toLocaleDateString()}`,
                value: filters.createdAtStart
            });
        }

        if (filters.createdAtEnd) {
            newActiveFilters.push({
                key: 'createdAtEnd',
                label: `To: ${new Date(filters.createdAtEnd).toLocaleDateString()}`,
                value: filters.createdAtEnd
            });
        }

        setActiveFilters(newActiveFilters);
        setCurrentPage(1); // Reset to first page on filter apply

        // Reset the request flag to allow a new fetch
        requestInProgressRef.current = false;

        // Wait a tick before fetching to avoid race conditions
        setTimeout(() => {
            fetchCompanies();
        }, 0);
    };

    // Reset filters with a single click
    const resetFilters = () => {
        // Reset everything in a single operation to prevent delays
        const defaultFilters = {
            status: 'all',
            constitution: 'all',
            createdAtStart: null,
            createdAtEnd: null
        };

        // Update all states at once before fetching
        setFilters(defaultFilters);
        setActiveFilters([]);
        setCurrentPage(1);

        // Reset the request flag
        requestInProgressRef.current = false;

        // Directly fetch companies with the default filters rather than waiting for state updates
        const fetchWithDefaults = async () => {
            try {
                setLoading(true);

                // Make API call with no filters
                const response = await apiService.get("/api/new-org");

                if (!isMountedRef.current) return;

                // Just sort by default and don't filter anything
                const sortedData = [...response].sort((a, b) => {
                    // Default sort by createdAt desc
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                });

                setCompanies(sortedData);
                setError(null);
            } catch (err) {
                if (!isMountedRef.current) return;

                console.error("Error resetting companies:", err);
                setError(err.message || "Failed to reset companies. Please try again.");
                setSnackbar({
                    open: true,
                    message: err.message || "Failed to reset companies",
                    severity: "error"
                });
            } finally {
                if (isMountedRef.current) {
                    setLoading(false);
                }
                requestInProgressRef.current = false;
            }
        };

        // Execute the fetch immediately
        fetchWithDefaults();
    };

    // Remove specific filter
    const removeFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: key.includes('createdAt') ? null : 'all' }));
        setActiveFilters(prev => prev.filter(filter => filter.key !== key));

        // Reset the request flag to allow a new fetch
        requestInProgressRef.current = false;

        // Wait a tick before fetching to avoid race conditions
        setTimeout(() => {
            fetchCompanies();
        }, 0);
    };

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
        requestInProgressRef.current = false; // Reset the flag
        fetchCompanies();
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Loading state
    if (loading && !companies.length) {
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
    if (error && !companies.length) {
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
 <div className="filter-component">
      {/* Filter Bar */}
      <div className="search-filter-container">
        <div className="filter-section">
          <Button
            variant={showFilters ? "contained" : "outlined"}
            color="primary"
            startIcon={<FilterList />}
            onClick={toggleFilters}
            className="filter-button"
          >
            Filters {activeFilters.length > 0 && (
              <span className="filter-count">{activeFilters.length}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              label={filter.label}
              onDelete={() => removeFilter(filter.key)}
              color="primary"
              variant="outlined"
              size="small"
              className="filter-chip"
            />
          ))}

          <Chip
            label="Clear All"
            onClick={resetFilters}
            color="secondary"
            size="small"
            className="filter-chip clear-all"
            disabled={loading}
          />
        </div>
      )}

      {/* Filters Panel */}
      <div className={`filters-collapse ${showFilters ? 'expanded' : 'collapsed'}`}>
        <div className="filters-panel">
          <Typography variant="h6" className="filters-title">
            Advanced Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" className="filter-control">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  name="status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" className="filter-control">
                <InputLabel>Constitution</InputLabel>
                <Select
                  value={filters.constitution}
                  label="Constitution"
                  name="constitution"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Constitutions</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Public">Public</MenuItem>
                  <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="From Date"
                type="date"
                name="createdAtStart"
                value={filters.createdAtStart || ""}
                onChange={handleDateChange}
                fullWidth
                size="small"
                className="filter-date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="To Date"
                type="date"
                name="createdAtEnd"
                value={filters.createdAtEnd || ""}
                onChange={handleDateChange}
                fullWidth
                size="small"
                className="filter-date"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>

          <Box className="filter-actions">
            <Button
              variant="outlined"
              onClick={resetFilters}
              startIcon={<Clear />}
              disabled={loading}
              className="reset-button"
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              startIcon={<FilterList />}
              className="apply-button"
            >
              Apply Filters
            </Button>
          </Box>
        </div>
      </div>
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
                                        Name {sortConfig.key === "organizationName" ? (
                                            sortConfig.direction === "asc" ?
                                                <ArrowUpward fontSize="small" /> :
                                                <ArrowDownward fontSize="small" />
                                        ) : null}
                                    </th>
                                    <th>Address</th>
                                    <th onClick={() => handleSort("createdAt")} className="sortable">
                                        Date {sortConfig.key === "createdAt" ? (
                                            sortConfig.direction === "asc" ?
                                                <ArrowUpward fontSize="small" /> :
                                                <ArrowDownward fontSize="small" />
                                        ) : null}
                                    </th>
                                    <th>GST</th>
                                    <th onClick={() => handleSort("status")} className="sortable">
                                        Status {sortConfig.key === "status" ? (
                                            sortConfig.direction === "asc" ?
                                                <ArrowUpward fontSize="small" /> :
                                                <ArrowDownward fontSize="small" />
                                        ) : null}
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
                        <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={companies.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
                    </div>

                    {/* Pagination */}
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