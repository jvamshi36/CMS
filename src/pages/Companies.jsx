import React, { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout/Layout";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  Snackbar,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  TablePagination,
} from "@mui/material";
import { FilterList, Clear, ArrowDownward, ArrowUpward } from '@mui/icons-material';
import apiService from "../utils/api";

const Companies = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const requestInProgressRef = useRef(false);
  const hasRunUrlParsing = useRef(false);
  const isMountedRef = useRef(true);

  const [filters, setFilters] = useState({
    status: 'all',
    constitution: 'all',
    createdAtStart: null,
    createdAtEnd: null
  });
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      apiService.clearPendingRequests();
    };
  }, []);

  useEffect(() => {
    if (hasRunUrlParsing.current) return;
    hasRunUrlParsing.current = true;
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status) setFilters(prev => ({ ...prev, status }));
    const constitution = params.get('constitution');
    if (constitution) setFilters(prev => ({ ...prev, constitution }));
    const sortKey = params.get('sortKey');
    const sortDirection = params.get('sortDirection');
    if (sortKey && sortDirection) setSortConfig({ key: sortKey, direction: sortDirection });
  }, [location.search]);

  const fetchCompanies = useCallback(async () => {
    if (requestInProgressRef.current) return;
    if (!isMountedRef.current) return;
    requestInProgressRef.current = true;
    setLoading(true);
    try {
      const response = await apiService.get("/api/new-org");
      if (!isMountedRef.current) return;
      let filteredCompanies = [...response];
      if (filters.status && filters.status !== 'all') {
        filteredCompanies = filteredCompanies.filter(company => {
          const companyStatus = company.status ? company.status.toLowerCase() : "⚙️ processing";
          return companyStatus === filters.status.toLowerCase();
        });
      }
      if (filters.constitution && filters.constitution !== 'all') {
        filteredCompanies = filteredCompanies.filter(company =>
          company.constitution?.toLowerCase() === filters.constitution.toLowerCase()
        );
      }
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
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err.message || "Failed to load companies. Please try again later.");
      setSnackbar({
        open: true,
        message: err.message || "Failed to load companies",
        severity: "error"
      });
    } finally {
      if (isMountedRef.current) setLoading(false);
      requestInProgressRef.current = false;
    }
  }, [filters, sortConfig]);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeFilters.length > 0 || sortConfig.key !== "createdAt" || sortConfig.direction !== "desc") {
      requestInProgressRef.current = false;
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const newActiveFilters = [];
    if (filters.status && filters.status !== 'all') {
      newActiveFilters.push({ key: 'status', label: `Status: ${filters.status}`, value: filters.status });
    }
    if (filters.constitution && filters.constitution !== 'all') {
      newActiveFilters.push({ key: 'constitution', label: `Constitution: ${filters.constitution}`, value: filters.constitution });
    }
    if (filters.createdAtStart) {
      newActiveFilters.push({ key: 'createdAtStart', label: `From: ${new Date(filters.createdAtStart).toLocaleDateString()}`, value: filters.createdAtStart });
    }
    if (filters.createdAtEnd) {
      newActiveFilters.push({ key: 'createdAtEnd', label: `To: ${new Date(filters.createdAtEnd).toLocaleDateString()}`, value: filters.createdAtEnd });
    }
    setActiveFilters(newActiveFilters);
    setPage(0);
  };

  const resetFilters = () => {
    const defaultFilters = {
      status: 'all',
      constitution: 'all',
      createdAtStart: null,
      createdAtEnd: null
    };
    setFilters(defaultFilters);
    setActiveFilters([]);
    setPage(0);
    requestInProgressRef.current = false;
    const fetchWithDefaults = async () => {
      try {
        setLoading(true);
        const response = await apiService.get("/api/new-org");
        if (!isMountedRef.current) return;
        const sortedData = [...response].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setCompanies(sortedData);
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err.message || "Failed to reset companies. Please try again.");
        setSnackbar({
          open: true,
          message: err.message || "Failed to reset companies",
          severity: "error"
        });
      } finally {
        if (isMountedRef.current) setLoading(false);
        requestInProgressRef.current = false;
      }
    };
    fetchWithDefaults();
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: key.includes('createdAt') ? null : 'all' }));
    setActiveFilters(prev => prev.filter(filter => filter.key !== key));
    requestInProgressRef.current = false;
    setPage(0);
  };

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
      return "Invalid date";
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  const handleRetry = () => {
    requestInProgressRef.current = false;
    fetchCompanies();
  };
  const toggleFilters = () => setShowFilters(!showFilters);

  const getCurrentCompanies = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return companies.slice(startIndex, endIndex);
  };

  if (loading && !companies.length) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <CircularProgress size={60} thickness={4} sx={{ color: '#2563EB' }} />
          <p className="mt-4 text-lg text-blue-700">Loading companies...</p>
        </div>
      </Layout>
    );
  }

  if (error && !companies.length) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h3>
          <p className="text-gray-700">{error}</p>
          <Button variant="contained" onClick={handleRetry} className="mt-4">
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  const currentCompanies = getCurrentCompanies();

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Companies</h2>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transition"
          onClick={() => navigate("/new-org")}
        >
          Add New Organization
        </button>
      </div>
      <div className="relative mb-6 font-sans">
        <div className="flex items-center justify-end gap-4 mb-4">
          <Button
            variant={showFilters ? "contained" : "outlined"}
            color="primary"
            startIcon={<FilterList />}
            onClick={toggleFilters}
            className="rounded-xl px-6 py-2 font-semibold shadow-md backdrop-blur-md border border-white/30 transition"
          >
            Filters {activeFilters.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center bg-cyan-500 text-white rounded-full w-6 h-6 text-xs font-bold shadow">{activeFilters.length}</span>
            )}
          </Button>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-gradient-to-tr from-white/40 to-white/10 border border-white/20 shadow backdrop-blur">
            {activeFilters.map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onDelete={() => removeFilter(filter.key)}
                color="primary"
                variant="outlined"
                size="small"
                className="rounded-full"
              />
            ))}
            <Chip
              label="Clear All"
              onClick={resetFilters}
              color="secondary"
              size="small"
              className="rounded-full bg-purple-100 font-semibold"
              disabled={loading}
            />
          </div>
        )}
        <div className={`${showFilters ? "max-h-[500px] py-6" : "max-h-0 py-0"} overflow-hidden transition-all duration-500 mb-4`}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 shadow-lg border border-white/20 backdrop-blur-xl relative">
            <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400 opacity-80 rounded-t-2xl"></span>
            <h3 className="mb-4 text-lg font-bold text-gray-800">Advanced Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  name="status"
                  onChange={handleFilterChange}
                  className="rounded-lg bg-white/60"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">⚙️ Processing</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Constitution</InputLabel>
                <Select
                  value={filters.constitution}
                  label="Constitution"
                  name="constitution"
                  onChange={handleFilterChange}
                  className="rounded-lg bg-white/60"
                >
                  <MenuItem value="all">All Constitutions</MenuItem>
                  <MenuItem value="Private">Private</MenuItem>
                  <MenuItem value="Public">Public</MenuItem>
                  <MenuItem value="Non-Profit">Non-Profit</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="From Date"
                type="date"
                name="createdAtStart"
                value={filters.createdAtStart || ""}
                onChange={handleDateChange}
                fullWidth
                size="small"
                className="rounded-lg bg-white/60"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To Date"
                type="date"
                name="createdAtEnd"
                value={filters.createdAtEnd || ""}
                onChange={handleDateChange}
                fullWidth
                size="small"
                className="rounded-lg bg-white/60"
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outlined"
                onClick={resetFilters}
                startIcon={<Clear />}
                disabled={loading}
                className="rounded-xl px-5 py-2 font-semibold"
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={applyFilters}
                startIcon={<FilterList />}
                className="rounded-xl px-5 py-2 font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      {companies.length === 0 ? (
        <div className="text-center py-20 bg-white/70 rounded-xl shadow-xl backdrop-blur-md my-8">
          <p className="text-lg text-gray-600">No companies found</p>
          <Button
            variant="outlined"
            onClick={() => navigate("/new-org")}
            className="mt-4"
          >
            Add Your First Organization
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white/70 backdrop-blur-md mb-8">
          <table className="min-w-full divide-y divide-blue-100">
            <thead>
              <tr>
                <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">ID</th>
                <th
                  onClick={() => handleSort("organizationName")}
                  className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                >
                  Name {sortConfig.key === "organizationName" ? (
                    sortConfig.direction === "asc" ?
                      <ArrowUpward fontSize="small" /> :
                      <ArrowDownward fontSize="small" />
                  ) : null}
                </th>
                <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Address</th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                >
                  Date {sortConfig.key === "createdAt" ? (
                    sortConfig.direction === "asc" ?
                      <ArrowUpward fontSize="small" /> :
                      <ArrowDownward fontSize="small" />
                  ) : null}
                </th>
                <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">GST</th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50 cursor-pointer select-none hover:bg-blue-100 transition"
                >
                  Status {sortConfig.key === "status" ? (
                    sortConfig.direction === "asc" ?
                      <ArrowUpward fontSize="small" /> :
                      <ArrowDownward fontSize="small" />
                  ) : null}
                </th>
                <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Details</th>
                <th className="px-5 py-4 text-left font-bold text-blue-700 bg-blue-50">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {currentCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-blue-50 transition">
                  <td className="px-5 py-4">{company.id}</td>
                  <td className="px-5 py-4">{company.organizationName}</td>
                  <td className="px-5 py-4">{`${company.addressLine1 || ''}, ${company.city || ''}, ${company.zip || ''}`}</td>
                  <td className="px-5 py-4">{formatDate(company.createdAt)}</td>
                  <td className="px-5 py-4">{company.gstNumber || "N/A"}</td>
                  <td className="px-5 py-4">
                    <span className={
                      "inline-block px-4 py-1 rounded-full text-white font-semibold shadow " +
                      (company.status === "completed"
                        ? "bg-gradient-to-r from-green-500 to-green-700"
                        : company.status === "rejected"
                        ? "bg-gradient-to-r from-red-500 to-red-700"
                        : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900")
                    }>
                      {company.status || 'Processing'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <NavLink
                      to={`/companies/${company.id}/org-details`}
                      className="text-blue-600 hover:underline px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition"
                    >
                      Details
                    </NavLink>
                  </td>
                  <td className="px-5 py-4">
                    <NavLink
                      to={`/companies/${company.id}/orders`}
                      className="text-blue-600 hover:underline px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition"
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
