// src/pages/OrgDetails.jsx
import React from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import "../styles/Details.css";
import Layout from "../components/Layout/Layout";

const OrganizationDetails = {
  "Organization Name": "Suraksha Pharma",
  "Constitution": "Proprietory",
  "Address": "KPHB",
  "City": "Hyderabad",
  "Zip": "506001",
  "GST No.": "GSTIN0001",
  "PAN No.": "KKUPVER1453",
  "Drug License No. 1": "DF3457DF5467",
  "Drug License No. 2": "HJG457689DFG",
  "Status": "Processing",
};

const RepresentativeDetails = {
  "Representative FirstName": "Aryan",
  "Representative LastName": "G",
  "Representative Email": "sample@gmail.com",
  "Representative Number": "123456789",
  "Web Username": "admin1",
  "Web Password": "admin",
};

const OrgDetails = () => {
  return (
    <Layout>
      <Box className="details-container">
        {/* Organization Details */}
        <Typography variant="h6" className="section-title">
          Organization Details
        </Typography>
        <Card className="details-card">
          <CardContent>
            <Grid container spacing={3}>
              {Object.entries(OrganizationDetails).map(([key, value]) => (
                <Grid item xs={12} sm={4} key={key}>
                  <Typography variant="body2" className="label">{key}</Typography>
                  <Typography variant="h6" className="value">{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Representative Details */}
        <Typography variant="h6" className="section-title">
          Representative Details
        </Typography>
        <Card className="details-card">
          <CardContent>
            <Grid container spacing={3}>
              {Object.entries(RepresentativeDetails).map(([key, value]) => (
                <Grid item xs={12} sm={4} key={key}>
                  <Typography variant="body2" className="label">{key}</Typography>
                  <Typography variant="h6" className="value">{value}</Typography>
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
