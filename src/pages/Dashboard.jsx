import React from "react";
import { Grid, Typography, Card, Box } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, ShoppingCart, BarChart, Clock } from "lucide-react";
import "../styles/Dashboard.css";
import Layout from "../components/Layout/Layout";

const data = [
  { name: "5k", value: 20 },
  { name: "10k", value: 40 },
  { name: "15k", value: 50 },
  { name: "20k", value: 90 },
  { name: "25k", value: 45 },
  { name: "30k", value: 60 },
  { name: "35k", value: 30 },
  { name: "40k", value: 80 },
  { name: "45k", value: 70 },
  { name: "50k", value: 65 },
  { name: "55k", value: 85 },
  { name: "60k", value: 75 },
];

const stats = [
  { title: "Total User", value: "40,689", trend: "8.5% Up from yesterday", icon: <TrendingUp size={24} />, color: "#8B5CF6" },
  { title: "Total Order", value: "10,293", trend: "1.3% Up from past week", icon: <ShoppingCart size={24} />, color: "#FACC15" },
  { title: "Total Sales", value: "$89,000", trend: "4.3% Down from yesterday", icon: <BarChart size={24} />, color: "#22C55E" },
  { title: "Total Pending", value: "2040", trend: "1.8% Up from yesterday", icon: <Clock size={24} />, color: "#FB923C" },
];

const Dashboard = () => {
  return (
    <Layout>
      <div className="dashboard-container">
       <h2 className="page-title">Dashboard</h2>

        <div className="dashboard-stats-container">
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.title}>
                <div className="dashboard-card">
                  <div className={`dashboard-icon ${stat.title.toLowerCase().replace(" ", "-")}`}>
                    {stat.icon}
                  </div>
                  <div className="dashboard-content">
                    <div className="dashboard-text">{stat.title}</div>
                    <div className="value-trend-container">
                      <div className="dashboard-value">{stat.value}</div>
                      <div className="dashboard-trend positive">
                        {stat.trend.split(" ")[0]} <span>↑</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
        <div className="dashboard-chart-container">
          <Typography variant="h6" className="chart-title">
            Sales Details
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="#8884d8" />
              <YAxis stroke="#8884d8" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
