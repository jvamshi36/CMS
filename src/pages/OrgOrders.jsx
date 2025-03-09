// src/pages/OrgOrders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrgLayout from "../components/Layout/OrgLayout";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import apiService from "../utils/api";
import "../styles/Orders.css";

const OrgOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await apiService.get("/api/org/orders");
        // Ensure orders is always an array
        setOrders(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Filter orders based on status and search term
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         (order.items && order.items.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  }) : [];

  // Get current page orders
  const currentOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <OrgLayout>
        <Box className="orders-loading">
          <CircularProgress />
          <Typography variant="body1">Loading orders...</Typography>
        </Box>
      </OrgLayout>
    );
  }

  if (error) {
    return (
      <OrgLayout>
        <Box className="orders-error">
          <Typography variant="h6" color="error">Something went wrong</Typography>
          <Typography variant="body1">{error}</Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry
          </Button>
        </Box>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <div className="orders-container">
        <Box className="orders-header">
          <Typography variant="h4" className="page-title">
            Your Orders
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/org/new-order")}
            className="new-order-button"
          >
            Place New Order
          </Button>
        </Box>

        <Paper className="orders-filters">
          <TextField
            label="Search Orders"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-field"
            placeholder="Search by order ID or items"
            size="small"
          />
          <FormControl variant="outlined" className="status-filter" size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Orders</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        <Paper className="orders-table-container">
          {Array.isArray(currentOrders) && currentOrders.length > 0 ? (
            <>
              <TableContainer>
                <Table aria-label="orders table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                       <TableCell>PRN NO.</TableCell>
                      <TableCell>Date Of Order</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Batch Size</TableCell>
                       <TableCell>Total Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id || 'N/A'}</TableCell>
                        <TableCell>{order.prnNo|| 'N/A'}</TableCell>
                        <TableCell>{order.date?
                            new Date(order.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                                })
                            : 'N/A'
                        }</TableCell>
                        <TableCell>{order.productName || 'N/A'}</TableCell>
                        <TableCell>{order.type || 'N/A'}</TableCell>
                        <TableCell>{order.batchSizeStrips || 'N/A'}</TableCell>
                        <TableCell>₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                         <TableCell><span className={`status ${(order.status || '').toLowerCase()}`}>
                                                            {order.status || 'Processing'}
                                                        </span> </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(`/org/orders/${order.id}`)}
                            className="view-order-button"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Box className="no-orders">
              <Typography variant="h6">No orders found</Typography>
              <Typography variant="body1">
                {searchTerm || statusFilter !== 'all'
                  ? "Try adjusting your search or filter criteria."
                  : "You haven't placed any orders yet."}
              </Typography>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  variant="contained"
                  onClick={() => navigate("/org/new-order")}
                  className="first-order-button"
                >
                  Place Your First Order
                </Button>
              )}
            </Box>
          )}
        </Paper>
      </div>
    </OrgLayout>
  );
};

export default OrgOrders;