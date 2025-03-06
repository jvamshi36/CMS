// src/pages/OrgProfile.jsx
import React, { useState, useEffect } from "react";
import OrgLayout from "../components/Layout/OrgLayout";
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Button } from "@mui/material";
import apiService from "../utils/api";
import "../styles/Profile.css";

const OrgProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await apiService.get("/api/org/dashboard/profile");
                setProfile(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError(err.message || "Failed to load profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <OrgLayout>
                <Box className="profile-loading">
                    <CircularProgress />
                    <Typography variant="body1">Loading profile...</Typography>
                </Box>
            </OrgLayout>
        );
    }

    if (error) {
        return (
            <OrgLayout>
                <Box className="profile-error">
                    <Alert severity="error">{error}</Alert>
                    <Button 
                        variant="contained" 
                        className="retry-button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </Box>
            </OrgLayout>
        );
    }

    return (
        <OrgLayout>
            <Box className="profile-container">
                <Typography variant="h4" className="profile-title">
                    Organization Profile
                </Typography>

                <Grid container spacing={3} className="profile-grid">
                    <Grid item xs={12} md={6}>
                        <Paper className="profile-card">
                            <Typography variant="h6" className="card-title">
                                Organization Details
                            </Typography>
                            <Box className="card-content">
                                <div className="profile-row">
                                    <span className="profile-label">Name:</span>
                                    <span className="profile-value">{profile?.organizationName}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Constitution:</span>
                                    <span className="profile-value">{profile?.constitution}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Address:</span>
                                    <span className="profile-value">{profile?.addressLine1}, {profile?.city}, {profile?.zip}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">GST Number:</span>
                                    <span className="profile-value">{profile?.gstNumber || "N/A"}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">PAN Number:</span>
                                    <span className="profile-value">{profile?.panNumber || "N/A"}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Drug License 1:</span>
                                    <span className="profile-value">{profile?.drugLicense1 || "N/A"}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Drug License 2:</span>
                                    <span className="profile-value">{profile?.drugLicense2 || "N/A"}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Registration Date:</span>
                                    <span className="profile-value">{profile?.createdAt 
                                        ? new Date(profile.createdAt).toLocaleDateString() 
                                        : "N/A"}
                                    </span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Status:</span>
                                    <span className={`status-badge ${profile?.status?.toLowerCase() || "pending"}`}>
                                        {profile?.status || "Pending"}
                                    </span>
                                </div>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper className="profile-card">
                            <Typography variant="h6" className="card-title">
                                Representative Information
                            </Typography>
                            <Box className="card-content">
                                <div className="profile-row">
                                    <span className="profile-label">Representative Name:</span>
                                    <span className="profile-value">{profile?.representativeFirstName} {profile?.representativeLastName}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Email:</span>
                                    <span className="profile-value">{profile?.representativeEmail}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Contact Number:</span>
                                    <span className="profile-value">{profile?.representativeNumber}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Aadhar Number:</span>
                                    <span className="profile-value">{profile?.representativeAadhar ? 
                                        `XXXX-XXXX-${profile.representativeAadhar.substring(8)}` : "N/A"}
                                    </span>
                                </div>
                            </Box>
                        </Paper>

                        <Paper className="profile-card account-card">
                            <Typography variant="h6" className="card-title">
                                Account Information
                            </Typography>
                            <Box className="card-content">
                                <div className="profile-row">
                                    <span className="profile-label">Username:</span>
                                    <span className="profile-value">{profile?.websiteUsername}</span>
                                </div>
                                <div className="profile-row">
                                    <span className="profile-label">Password:</span>
                                    <span className="profile-value password-dots">••••••••</span>
                                </div>
                                <Button 
                                    variant="contained" 
                                    className="change-password-button"
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </OrgLayout>
    );
};

export default OrgProfile;