// src/pages/OrgDetails.jsx
import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Grid, CircularProgress } from "@mui/material";
import "../styles/Details.css";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import {  useParams } from "react-router-dom";

const OrgDetails = () => {
  const [organizationData, setOrganizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const { companyId } = useParams();

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        // Replace with your actual API endpoint
                const token = localStorage.getItem("token"); // Retrieve token from localStorage
                if (!token) throw new Error("No authentication token found");
        const response = await axios.get(`https://localhost:8081/api/new-org/${companyId}`, {
                                                                                         headers: {
                                                                                             Authorization: `Bearer ${token}`
                                                                                         }
                                                                                     });
        setOrganizationData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching organization data:", err);
        setError("Failed to load organization data. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  // Format organization details from API response
  const getOrganizationDetails = () => {
    if (!organizationData) return {};

    return {
      "Organization Name": organizationData.organizationName,
      "Constitution": organizationData.constitution,
      "Address": organizationData.addressLine1,
      "City": organizationData.city,
      "Zip": organizationData.zip,
      "GST No.": organizationData.gstNumber || "Not provided",
      "PAN No.": organizationData.panNumber || "Not provided",
      "Drug License No. 1": organizationData.drugLicense1 || "Not provided",
      "Drug License No. 2": organizationData.drugLicense2 || "Not provided",
      "Status": organizationData.status || "Processing",
    };
  };

  // Format representative details from API response
  const getRepresentativeDetails = () => {
    if (!organizationData) return {};

    return {
      "Representative FirstName": organizationData.representativeFirstName,
      "Representative LastName": organizationData.representativeLastName,
      "Representative Email": organizationData.representativeEmail,
      "Representative Number": organizationData.representativeNumber,
      "Representative Aadhar": organizationData.representativeAadhar,
      "Web Username": organizationData.websiteUsername,
      "Web Password": "********", // For security, don't display actual password
    };
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography color="error">{error}</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box className="details-container">
        <Card className="details-card">
          <CardContent>
            {/* Organization Details */}
            <Typography variant="h5" className="section-title">
              Organization Details
            </Typography>
            <Grid container spacing={2} className="details-grid">
              {Object.entries(getOrganizationDetails()).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box className="detail-item">
                    <Typography variant="subtitle1" className="detail-label">
                      {key}
                    </Typography>
                    <Typography variant="body1" className="detail-value">
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card className="details-card">
          <CardContent>
            {/* Representative Details */}
            <Typography variant="h5" className="section-title">
              Representative Details
            </Typography>
            <Grid container spacing={2} className="details-grid">
              {Object.entries(getRepresentativeDetails()).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box className="detail-item">
                    <Typography variant="subtitle1" className="detail-label">
                      {key}
                    </Typography>
                    <Typography variant="body1" className="detail-value">
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default OrgDetails;