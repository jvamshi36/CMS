import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Grid,
  InputAdornment
} from "@mui/material";
import { FilterAlt, RestartAlt } from "@mui/icons-material";

const HorizontalFilter = ({
  onFilter,
  onReset,
  statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "processing", label: "Processing" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" }
  ]
}) => {
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: "",
    endDate: "",
    minPrice: "",
    maxPrice: ""
  });

  const [loading, setLoading] = useState(false);
  const requestInProgressRef = useRef(false);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = useCallback(() => {
    if (requestInProgressRef.current) {
      return;
    }

    setLoading(true);
    requestInProgressRef.current = true;

    // Call the parent component's filter function
    onFilter(filters);

    // Direct fetch to ensure single-click functionality
    setTimeout(() => {
      setLoading(false);
      requestInProgressRef.current = false;
    }, 500);
  }, [filters, onFilter]);

  // Reset filters
  const resetFilters = useCallback(() => {
    if (requestInProgressRef.current) {
      return;
    }

    setLoading(true);
    requestInProgressRef.current = true;

    const defaultFilters = {
      status: 'all',
      startDate: "",
      endDate: "",
      minPrice: "",
      maxPrice: ""
    };

    setFilters(defaultFilters);

    if (onReset) {
      onReset();
    }

    setTimeout(() => {
      setLoading(false);
      requestInProgressRef.current = false;
    }, 500);
  }, [onReset]);

  return (
    <Box className="horizontal-filter-container">
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <FilterAlt color="primary" />
        </Grid>

        <Grid item xs={12} sm={2} md>
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={2} md>
          <TextField
            fullWidth
            label="From Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={2} md>
          <TextField
            fullWidth
            label="To Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={2} md>
          <TextField
            fullWidth
            label="Min Price"
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={2} md>
          <TextField
            fullWidth
            label="Max Price"
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={6} sm="auto">
          <Button
            variant="outlined"
            color="secondary"
            onClick={resetFilters}
            disabled={loading}
            startIcon={<RestartAlt />}
            className="reset-filter-button"
            fullWidth
          >
            Reset Filter
          </Button>
        </Grid>

        <Grid item xs={6} sm="auto">
          <Button
            variant="contained"
            color="primary"
            onClick={applyFilters}
            disabled={loading}
            className="apply-filter-button"
            fullWidth
          >
            Apply Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HorizontalFilter;