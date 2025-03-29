import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiService from "../utils/api";
import "../styles/PendingOrders.css";

const PendingOrders = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      setLoading(true);
      try {
        const response = await apiService.get("/api/admin/orders/pending");
        setPendingOrders(Array.isArray(response) ? response : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching pending orders:", err);
        setError(err.message || "Failed to load pending orders. Please try again later.");
        setPendingOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/pending-orders/${orderId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate time since order was placed
  const getTimeSinceOrder = (dateString) => {
    if (!dateString) return "Unknown";
    
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - orderDate;
    
    // Less than a minute
    if (diffMs < 60000) {
      return "Just now";
    }
    
    // Less than an hour
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // More than a day
    const days = Math.floor(diffMs / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Layout>
        <Box className="pending-orders-loading">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1">Loading pending orders...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pending-orders-container">
        <div className="pending-orders-header">
          <Typography variant="h4" className="page-title">
            Pending Orders
          </Typography>
          <div className="header-actions">
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              className="refresh-button"
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper className="pending-orders-table-container">
          {pendingOrders.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Time Submitted</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingOrders
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((order) => {
                        const waitTime = getTimeSinceOrder(order.date);
                        let priority = "normal";
                        
                        // Set priority based on wait time
                        if (waitTime.includes("day")) {
                          priority = "high";
                        } else if (waitTime.includes("hour") && parseInt(waitTime) > 4) {
                          priority = "medium";
                        }

                        return (
                          <TableRow key={order.id} className={`priority-${priority}`}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.organizationName}</TableCell>
                            <TableCell>{order.productName}</TableCell>
                            <TableCell>
                              <Tooltip title={formatDate(order.date)}>
                                <span>{waitTime}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={priority.toUpperCase()} 
                                className={`priority-chip ${priority}`} 
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleViewOrder(order.id)}
                                className="view-order-button"
                              >
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pendingOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          ) : (
            <Box className="no-pending-orders">
              <Typography variant="h6">No Pending Orders</Typography>
              <Typography variant="body1">
                There are currently no orders pending approval.
              </Typography>
            </Box>
          )}
        </Paper>
      </div>
    </Layout>
  );
};

export default PendingOrders;