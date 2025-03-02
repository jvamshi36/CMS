// src/pages/OrderDetails.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import Layout from "../components/Layout/Layout";
import "../styles/Details.css";

// Dummy order details (Replace with API data)
const OrderDetailsData = {
  id: "ORD12345",
  customerName: "John Doe",
  orderDate: "01 March 2024",
  deliveryDate: "05 March 2024",
  items: "Laptop, Mouse, Keyboard",
  totalAmount: "₹45,000",
  paymentMethod: "Credit Card",
  orderStatus: "Shipped",
  address: "123 Street, Hyderabad, India",
};

const OrderDetails = () => {
  const { orderId } = useParams(); // Get order ID from URL

  return (
    <Layout>
      <Box className="details-container">
        {/* Order Details */}
        <Typography variant="h6" className="section-title">
          Order Details
        </Typography>
        <Card className="details-card">
          <CardContent>
            <Grid container spacing={3}>
              {Object.entries(OrderDetailsData).map(([key, value]) => (
                <Grid item xs={12} sm={4} key={key}>
                  <Typography variant="body2" className="label">{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
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

export default OrderDetails;
