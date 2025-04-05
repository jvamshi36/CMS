import React, { useState, useEffect } from "react";
import { Typography, Paper, Box, Grid, Button, Divider, Alert, FormControl, InputLabel, Select, MenuItem, TextField, CircularProgress, Snackbar, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Download, FileDownload, Business, ShoppingCart, AttachMoney, Description, CloudDownload, Dashboard as DashboardIcon } from "@mui/icons-material";
import apiService from "../../utils/api";
import "./ExportCenter.css"

// Utility to format date for exports
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Export Center component
const ExportCenter = () => {
  // Export configuration state
  const [exportConfig, setExportConfig] = useState({
    dataType: "companies",
    format: "csv",
    dateRange: "all",
    customStartDate: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    customEndDate: formatDate(new Date()),
    filters: {
      status: "all",
      minAmount: "",
      maxAmount: ""
    }
  });

  // Export status
  const [exportStatus, setExportStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  // Available companies for filtering orders
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("all");

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  // Load available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiService.get("/api/new-org");

        // Extract companies data based on response structure
        let extractedCompanies = [];

        if (Array.isArray(response)) {
          extractedCompanies = response;
        } else if (response && Array.isArray(response.data)) {
          extractedCompanies = response.data;
        } else if (response && Array.isArray(response.content)) {
          extractedCompanies = response.content;
        } else if (response && typeof response === 'object' && !Array.isArray(response)) {
          extractedCompanies = [response];
        }

        if (extractedCompanies.length > 0) {
          setCompanies(extractedCompanies);
        } else {
          setCompanies([]);
        }
      } catch (error) {
        setCompanies([]);
        setNotification({
          open: true,
          message: "Failed to fetch companies data. Please try again.",
          severity: "error"
        });
      }
    };

    fetchCompanies();
  }, []);

  // Handle export configuration changes
  const handleExportConfigChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('filters.')) {
      const filterName = name.split('.')[1];
      setExportConfig(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [filterName]: value
        }
      }));
    } else {
      setExportConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  // Client-side export implementation with real data fetching
  const exportToClientSide = async (dataType, format) => {
    let dataToExport = [];
    let filename = `${dataType}_export_${formatDate(new Date())}`;

    setExportStatus({ loading: true, error: null, success: false });

    try {
      // Use real data for all export types
      if (dataType === "companies") {
        if (companies && companies.length > 0) {
          dataToExport = [...companies]; // Use real company data from state
        } else {
          // Try to fetch companies if not available in state
          const response = await apiService.get("/api/new-org");
          let extractedCompanies = [];

          if (Array.isArray(response)) {
            extractedCompanies = response;
          } else if (response && Array.isArray(response.data)) {
            extractedCompanies = response.data;
          } else if (response && Array.isArray(response.content)) {
            extractedCompanies = response.content;
          } else if (response && typeof response === 'object' && !Array.isArray(response)) {
            extractedCompanies = [response];
          }

          dataToExport = extractedCompanies;
        }
      } else if (dataType === "orders") {
        // Build query parameters for filtering
        const queryParams = new URLSearchParams();

        if (exportConfig.dateRange === "custom") {
          queryParams.append('startDate', exportConfig.customStartDate);
          queryParams.append('endDate', exportConfig.customEndDate);
        } else if (exportConfig.dateRange === "last30days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          queryParams.append('startDate', formatDate(thirtyDaysAgo));
          queryParams.append('endDate', formatDate(new Date()));
        } else if (exportConfig.dateRange === "last90days") {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          queryParams.append('startDate', formatDate(ninetyDaysAgo));
          queryParams.append('endDate', formatDate(new Date()));
        }

        // Status filter
        if (exportConfig.filters.status && exportConfig.filters.status !== 'all') {
          queryParams.append('status', exportConfig.filters.status);
        }

        // Amount range filters
        if (exportConfig.filters.minAmount) {
          queryParams.append('minPrice', exportConfig.filters.minAmount);
        }

        if (exportConfig.filters.maxAmount) {
          queryParams.append('maxPrice', exportConfig.filters.maxAmount);
        }

        // Set page size to a large number to get all orders
        queryParams.append('size', '1000');

        // Use the admin orders endpoint to get all orders across all companies
        const endpoint = `/api/admin/orders?${queryParams.toString()}`;

        let response;
        try {
          response = await apiService.get(endpoint);
        } catch (error) {
          // Try the dashboard recent orders endpoint as fallback
          response = await apiService.get("/api/admin/dashboard/recent-orders");
        }

        // Extract orders data depending on response structure
        if (response && response.data && response.data.content) {
          dataToExport = response.data.content;
        } else if (Array.isArray(response.data)) {
          dataToExport = response.data;
        } else if (Array.isArray(response)) {
          dataToExport = response;
        } else if (response && response.content) {
          dataToExport = response.content;
        }
      } else if (dataType === "sales") {
        // Fetch sales data from the dashboard endpoint
        const period = exportConfig.dateRange === "last30days" ? "monthly" :
                      exportConfig.dateRange === "last90days" ? "quarterly" : "yearly";

        // Try to get sales data from dashboard endpoint
        let response;
        try {
          response = await apiService.get(`/api/admin/dashboard/sales-data?period=${period}`);
        } catch (error) {
          // Try the dashboard summary endpoint as fallback
          response = await apiService.get("/api/admin/dashboard/summary");
        }

        if (Array.isArray(response)) {
          dataToExport = response;
        } else if (response && Array.isArray(response.data)) {
          dataToExport = response.data;
        } else if (response && response.salesData && Array.isArray(response.salesData)) {
          dataToExport = response.salesData;
        } else if (response && typeof response === 'object') {
          // If we get back a summary object, transform it for export
          if (response.totalSales !== undefined) {
            dataToExport = [{
              totalSales: response.totalSales || 0,
              totalOrders: response.totalOrders || 0,
              totalUsers: response.totalUsers || 0,
              pendingOrders: response.pendingOrders || 0,
              exportDate: formatDate(new Date())
            }];
          } else {
            // If we get back another type of object, transform it into an array for export
            dataToExport = Object.entries(response).map(([key, value]) => ({
              period: key,
              value: value
            }));
          }
        }
      } else if (dataType === "products") {
        // For products, we'll fetch all orders and extract products from them
        // Get all orders to extract products from
        const ordersResponse = await apiService.get("/api/admin/orders?size=1000");

        let ordersData = [];

        if (ordersResponse && ordersResponse.data && ordersResponse.data.content) {
          ordersData = ordersResponse.data.content;
        } else if (Array.isArray(ordersResponse.data)) {
          ordersData = ordersResponse.data;
        } else if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse && ordersResponse.content) {
          ordersData = ordersResponse.content;
        }

        // If no orders found, try dashboard recent orders
        if (ordersData.length === 0) {
          try {
            const dashboardOrdersResponse = await apiService.get("/api/admin/dashboard/recent-orders");

            if (Array.isArray(dashboardOrdersResponse)) {
              ordersData = dashboardOrdersResponse;
            } else if (dashboardOrdersResponse && Array.isArray(dashboardOrdersResponse.data)) {
              ordersData = dashboardOrdersResponse.data;
            }
          } catch (error) {
            // Fallback to empty array if dashboard orders also fails
            ordersData = [];
          }
        }

        // Extract unique products from orders
        const uniqueProducts = new Map();

        ordersData.forEach(order => {
          if (order.productName) {
            // Use productName as a unique key
            if (!uniqueProducts.has(order.productName)) {
              uniqueProducts.set(order.productName, {
                productName: order.productName,
                productId: order.productId || `PROD-${uniqueProducts.size + 1}`,
                type: order.type || 'N/A',
                unitPrice: order.unitPrice || 0,
                lastOrdered: order.date || new Date().toISOString(),
                status: 'active'
              });
            }
          }
        });

        dataToExport = Array.from(uniqueProducts.values());
      } else if (dataType === "dashboard") {
        // Export dashboard data - combines summary stats and recent activity

        // Get dashboard summary
        const summaryResponse = await apiService.get("/api/admin/dashboard/summary");

        // Get recent orders
        const recentOrdersResponse = await apiService.get("/api/admin/dashboard/recent-orders");

        // Get sales data
        const salesDataResponse = await apiService.get("/api/admin/dashboard/sales-data?period=monthly");

        // Create a comprehensive dashboard export
        let dashboardSummary = {};

        if (summaryResponse && typeof summaryResponse === 'object') {
          dashboardSummary = {
            totalSales: summaryResponse.totalSales || 0,
            totalOrders: summaryResponse.totalOrders || 0,
            totalUsers: summaryResponse.totalUsers || 0,
            pendingOrders: summaryResponse.pendingOrders || 0,
            exportDate: formatDate(new Date()),
          };
        }

        // Extract recent orders
        let recentOrders = [];
        if (Array.isArray(recentOrdersResponse)) {
          recentOrders = recentOrdersResponse;
        } else if (recentOrdersResponse && Array.isArray(recentOrdersResponse.data)) {
          recentOrders = recentOrdersResponse.data;
        }

        // Extract sales data
        let salesData = [];
        if (Array.isArray(salesDataResponse)) {
          salesData = salesDataResponse;
        } else if (salesDataResponse && Array.isArray(salesDataResponse.data)) {
          salesData = salesDataResponse.data;
        }

        // Combine all data for export - use the summary as the first record
        dataToExport = [
          {
            ...dashboardSummary,
            type: 'summary',
            recentOrdersCount: recentOrders.length,
            salesDataPoints: salesData.length
          }
        ];

        // Add recent orders with a type identifier
        recentOrders.forEach(order => {
          dataToExport.push({
            ...order,
            type: 'recentOrder'
          });
        });

        // Add sales data with a type identifier
        salesData.forEach(data => {
          dataToExport.push({
            ...data,
            type: 'salesData'
          });
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to fetch ${dataType} data. Using available data instead.`,
        severity: "warning"
      });

      return false; // Return false to indicate no data
    }

    // Check if we have data to export
    if (!dataToExport || dataToExport.length === 0) {
      setNotification({
        open: true,
        message: "No data available to export.",
        severity: "warning"
      });
      return false; // Return false to indicate no data
    }

    // Clean up data for export - ensure all values are exportable
    dataToExport = dataToExport.map(item => {
      const cleanedItem = {};

      // For each property in the item
      Object.keys(item).forEach(key => {
        const value = item[key];

        // Skip functions and undefined values
        if (typeof value === 'function' || value === undefined) {
          return;
        }

        // Convert Date objects to strings
        if (value instanceof Date) {
          cleanedItem[key] = value.toISOString();
        }
        // Convert objects to JSON strings to avoid losing information
        else if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
          try {
            cleanedItem[key] = JSON.stringify(value);
          } catch (e) {
            cleanedItem[key] = 'Complex Object';
          }
        }
        // Keep arrays, strings, numbers, booleans as is
        else {
          cleanedItem[key] = value;
        }
      });

      return cleanedItem;
    });

    // Proceed with export if we have data
    if (format === 'csv') {
      exportToCSV(dataToExport, filename);
    } else if (format === 'excel') {
      exportToExcel(dataToExport, filename);
    } else if (format === 'pdf') {
      exportToPDF(dataToExport, filename);
    }

    return true; // Return true to indicate successful export
  };

  // Handle export process
  const handleExport = async () => {
    setExportStatus({ loading: true, error: null, success: false });

    try {
      // Build API endpoint based on data type and filters
      let endpoint = "";
      let queryParams = new URLSearchParams();

      // Add date range params if needed
      if (exportConfig.dateRange === "custom") {
        queryParams.append('startDate', exportConfig.customStartDate);
        queryParams.append('endDate', exportConfig.customEndDate);
      } else if (exportConfig.dateRange === "last30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        queryParams.append('startDate', formatDate(thirtyDaysAgo));
        queryParams.append('endDate', formatDate(new Date()));
      } else if (exportConfig.dateRange === "last90days") {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        queryParams.append('startDate', formatDate(ninetyDaysAgo));
        queryParams.append('endDate', formatDate(new Date()));
      }

      // Status filter
      if (exportConfig.filters.status && exportConfig.filters.status !== 'all') {
        queryParams.append('status', exportConfig.filters.status);
      }

      // Amount range filters for certain data types
      if ((exportConfig.dataType === "orders" || exportConfig.dataType === "sales") &&
          exportConfig.filters.minAmount) {
        queryParams.append('minAmount', exportConfig.filters.minAmount);
      }

      if ((exportConfig.dataType === "orders" || exportConfig.dataType === "sales") &&
          exportConfig.filters.maxAmount) {
        queryParams.append('maxAmount', exportConfig.filters.maxAmount);
      }

      // Determine endpoint based on data type
      switch(exportConfig.dataType) {
        case "companies":
          endpoint = "/api/new-org/export";
          break;
        case "orders":
          endpoint = selectedCompany !== "all"
            ? `/api/admin/company/${selectedCompany}/orders/export`
            : "/api/admin/orders/export";
          break;
        case "sales":
          endpoint = "/api/admin/dashboard/sales-data/export";
          break;
        case "products":
          endpoint = "/api/admin/products/export";
          break;
        default:
          endpoint = "/api/admin/export";
      }

      // Add format to query parameters
      queryParams.append('format', exportConfig.format);

      // Add query params to endpoint
      if (queryParams.toString()) {
        endpoint = `${endpoint}?${queryParams.toString()}`;
      }

      // For now, skip API endpoint and use client-side export with real data
      const success = await exportToClientSide(exportConfig.dataType, exportConfig.format);

      if (success) {
        setExportStatus({ loading: false, error: null, success: true });

        // Show success notification
        setNotification({
          open: true,
          message: `${exportConfig.dataType} data exported successfully to ${exportConfig.format.toUpperCase()}`,
          severity: "success"
        });
      } else {
        setExportStatus({
          loading: false,
          error: "Export failed - no data to export",
          success: false
        });
      }
    } catch (error) {
      setExportStatus({
        loading: false,
        error: error.message || "Export failed. Please try again.",
        success: false
      });

      setNotification({
        open: true,
        message: error.message || "Export failed. Please try again.",
        severity: "error"
      });
    }
  };

  // CSV Export
  const exportToCSV = (data, filename) => {
    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export");
      }

      // Get all possible keys from all objects to ensure all fields are included
      const allKeys = new Set();
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      const headers = Array.from(allKeys).join(',');

      // For each row, ensure all fields are included even if missing in some objects
      const csvRows = data.map(row => {
        return Array.from(allKeys).map(key => {
          const value = row[key];
          // Handle different value types and ensure proper CSV escaping
          if (value === null || value === undefined) {
            return '';
          } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          } else {
            return value;
          }
        }).join(',');
      });

      const csvContent = [headers, ...csvRows].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Failed to export as CSV",
        severity: "error"
      });
    }
  };

  // Excel Export (Simplified as CSV with XLS extension)
  const exportToExcel = (data, filename) => {
    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export");
      }

      // Get all possible keys from all objects to ensure all fields are included
      const allKeys = new Set();
      data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
      });

      const headers = Array.from(allKeys).join(',');

      // Format data for Excel (adding quotes around strings with commas)
      const csvRows = data.map(row => {
        return Array.from(allKeys).map(key => {
          const value = row[key];
          if (value === null || value === undefined) {
            return '';
          } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          } else {
            return value;
          }
        }).join(',');
      });

      const csvContent = [headers, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      // Use .xls extension to prompt Excel to open it
      link.setAttribute('download', `${filename}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Failed to export as Excel",
        severity: "error"
      });
    }
  };

  // PDF Export via Print Dialog
  const exportToPDF = (data, filename) => {
    try {
      if (!data || data.length === 0) {
        throw new Error("No data available to export");
      }

      // Create a print-friendly HTML representation
      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        throw new Error("Please allow pop-ups to export as PDF");
      }

      // Get table headers and rows
      const tableHeaders = Object.keys(data[0]);
      const tableRows = data.map(item => Object.values(item));

      // Create HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563EB; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th { background-color: #2563EB; color: white; text-align: left; padding: 8px; }
            td { border: 1px solid #ddd; padding: 8px; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .export-date { color: #666; margin-bottom: 20px; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <div class="export-date">Generated on: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                ${tableHeaders.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px;">
            <button onclick="window.print()">Print as PDF</button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Auto-print in some browsers
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          // Manual printing required
        }
      }, 500);
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || "Failed to export as PDF",
        severity: "error"
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <div className="export-center-container">
      <Grid container spacing={3}>
        {/* Export Configuration Card */}
        <Grid item xs={12} md={8}>
          <Paper className="export-card">
            <Box className="export-header">
              <CloudDownload className="export-icon" />
              <Typography variant="h6">Export Data</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Data Type Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Data Type</InputLabel>
                  <Select name="dataType" value={exportConfig.dataType} onChange={handleExportConfigChange} label="Data Type">
                    <MenuItem value="companies">Companies</MenuItem>
                    <MenuItem value="orders">Orders</MenuItem>
                    <MenuItem value="sales">Sales Data</MenuItem>
                    <MenuItem value="products">Products</MenuItem>
                    <MenuItem value="dashboard">Dashboard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Export Format */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select name="format" value={exportConfig.format} onChange={handleExportConfigChange} label="Export Format">
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="excel">Excel (CSV format)</MenuItem>
                    <MenuItem value="pdf">PDF (Print view)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select name="dateRange" value={exportConfig.dateRange} onChange={handleExportConfigChange} label="Date Range">
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="last30days">Last 30 Days</MenuItem>
                    <MenuItem value="last90days">Last 90 Days</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Company filter for orders */}
              {exportConfig.dataType === "orders" && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Company</InputLabel>
                    <Select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} label="Company">
                      <MenuItem value="all">All Companies</MenuItem>
                      {companies.map(company => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.organizationName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Custom Date Range */}
              {exportConfig.dateRange === "custom" && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      name="customStartDate"
                      value={exportConfig.customStartDate}
                      onChange={handleExportConfigChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      name="customEndDate"
                      value={exportConfig.customEndDate}
                      onChange={handleExportConfigChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              {/* Status Filter */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select name="filters.status" value={exportConfig.filters.status} onChange={handleExportConfigChange} label="Status">
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount Range for orders and sales */}
              {(exportConfig.dataType === "orders" || exportConfig.dataType === "sales") && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Min Amount"
                      type="number"
                      name="filters.minAmount"
                      value={exportConfig.filters.minAmount}
                      onChange={handleExportConfigChange}
                      InputProps={{ startAdornment: "₹" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max Amount"
                      type="number"
                      name="filters.maxAmount"
                      value={exportConfig.filters.maxAmount}
                      onChange={handleExportConfigChange}
                      InputProps={{ startAdornment: "₹" }}
                    />
                  </Grid>
                </>
              )}
            </Grid>

 {/* Export Button */}
 <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
   <Button variant="contained" color="primary" startIcon={exportStatus.loading ? <CircularProgress size={20} color="inherit" /> : <FileDownload />} onClick={handleExport} disabled={exportStatus.loading} className="export-button">{exportStatus.loading ? "Exporting..." : "Export Data"}</Button>
 </Box>

 {/* Status Messages */}
 {exportStatus.error && <Alert severity="error" sx={{ mt: 2 }}>{exportStatus.error}</Alert>}
 {exportStatus.success && <Alert severity="success" sx={{ mt: 2 }}>Export completed successfully!</Alert>}
 </Paper>
 </Grid>

 {/* Export Overview Card */}
 <Grid item xs={12}>
   <Paper className="export-card">
     <Box className="export-header">
       <Description className="export-icon" />
       <Typography variant="h6">Export Types Overview</Typography>
     </Box>
     <Divider sx={{ mb: 3 }} />

     <Grid container spacing={3}>
       <Grid item xs={12} sm={6} md={3}>
         <Card className="data-type-card companies">
           <CardContent>
             <Business className="data-type-icon" />
             <Typography variant="h6">Companies</Typography>
             <Typography variant="body2">Export company information including contact details and status.</Typography>
             <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => { setExportConfig(prev => ({...prev, dataType: "companies"})); setTimeout(() => handleExport(), 100); }}>Quick Export</Button>
           </CardContent>
         </Card>
       </Grid>

       <Grid item xs={12} sm={6} md={3}>
         <Card className="data-type-card orders">
           <CardContent>
             <ShoppingCart className="data-type-icon" />
             <Typography variant="h6">Orders</Typography>
             <Typography variant="body2">Export order data including customer details, amounts, and status.</Typography>
             <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => { setExportConfig(prev => ({...prev, dataType: "orders"})); setTimeout(() => handleExport(), 100); }}>Quick Export</Button>
           </CardContent>
         </Card>
       </Grid>

       <Grid item xs={12} sm={6} md={3}>
         <Card className="data-type-card sales">
           <CardContent>
             <AttachMoney className="data-type-icon" />
             <Typography variant="h6">Sales Data</Typography>
             <Typography variant="body2">Export sales data including revenue, expenses and profit by period.</Typography>
             <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => { setExportConfig(prev => ({...prev, dataType: "sales"})); setTimeout(() => handleExport(), 100); }}>Quick Export</Button>
           </CardContent>
         </Card>
       </Grid>

       <Grid item xs={12} sm={6} md={3}>
         <Card className="data-type-card products">
           <CardContent>
             <Description className="data-type-icon" />
             <Typography variant="h6">Products</Typography>
             <Typography variant="body2">Export product catalog including pricing, inventory and status.</Typography>
             <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => { setExportConfig(prev => ({...prev, dataType: "products"})); setTimeout(() => handleExport(), 100); }}>Quick Export</Button>
           </CardContent>
         </Card>
       </Grid>

       <Grid item xs={12} sm={6} md={3}>
         <Card className="data-type-card dashboard">
           <CardContent>
             <DashboardIcon className="data-type-icon" />
             <Typography variant="h6">Dashboard</Typography>
             <Typography variant="body2">Export complete dashboard data including stats, orders and sales.</Typography>
             <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => { setExportConfig(prev => ({...prev, dataType: "dashboard"})); setTimeout(() => handleExport(), 100); }}>Quick Export</Button>
           </CardContent>
         </Card>
       </Grid>
     </Grid>
   </Paper>
 </Grid>
 </Grid>

 {/* Notification Snackbar */}
 <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
   <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">{notification.message}</Alert>
 </Snackbar>
 </div>
 );
 };

 export default ExportCenter;