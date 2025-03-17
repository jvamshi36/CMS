import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Search, FilterList, Clear } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AdvancedSearchFilter = ({
  onSearch,
  onFilter,
  onReset,
  filterOptions = {
    status: true,
    dateRange: true,
    price: true,
    custom: []
  },
  statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ]
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    startDate: null,
    endDate: null,
    minPrice: '',
    maxPrice: '',
    // Add additional custom filters as needed
    ...filterOptions.custom?.reduce((acc, filter) => {
      acc[filter.name] = filter.defaultValue || '';
      return acc;
    }, {})
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    onSearch(searchTerm);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      startDate: null,
      endDate: null,
      minPrice: '',
      maxPrice: '',
      ...filterOptions.custom?.reduce((acc, filter) => {
        acc[filter.name] = filter.defaultValue || '';
        return acc;
      }, {})
    });

    setSearchTerm('');

    if (onReset) {
      onReset();
    }
  };

  return (
    <Box className="advanced-search-filter" sx={{ mb: 3 }}>
      {/* Search Bar */}
      <Box
        sx={{
          display: 'flex',
          mb: 2,
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, ID, or keywords..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
          }}
          size="small"
        />

        <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchSubmit}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Search
          </Button>

          <Button
            variant={expanded ? "contained" : "outlined"}
            color={expanded ? "primary" : "secondary"}
            startIcon={<FilterList />}
            onClick={() => setExpanded(!expanded)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Advanced Filters */}
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        elevation={0}
        sx={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '8px',
          '&:before': { display: 'none' }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ display: { sm: 'none' } }} // Only show on mobile
        >
          <Typography>Advanced Filters</Typography>
        </AccordionSummary>

        <AccordionDetails>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              {/* Status Filter */}
              {filterOptions.status && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    size="small"
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {/* Date Range Filters */}
              {filterOptions.dateRange && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      renderInput={(params) => <TextField size="small" fullWidth {...params} />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      renderInput={(params) => <TextField size="small" fullWidth {...params} />}
                    />
                  </Grid>
                </>
              )}

              {/* Price Range Filters */}
              {filterOptions.price && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Min Price"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Max Price"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      size="small"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </>
              )}

              {/* Custom Filters */}
              {filterOptions.custom?.map((filter) => (
                <Grid item xs={12} sm={6} md={3} key={filter.name}>
                  {filter.type === 'select' ? (
                    <TextField
                      select
                      fullWidth
                      label={filter.label}
                      value={filters[filter.name]}
                      onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                      size="small"
                    >
                      {filter.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      label={filter.label}
                      type={filter.type || 'text'}
                      value={filters[filter.name]}
                      onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                      size="small"
                    />
                  )}
                </Grid>
              ))}

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleResetFilters}
                    startIcon={<Clear />}
                  >
                    Reset
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyFilters}
                    startIcon={<FilterList />}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default AdvancedSearchFilter;