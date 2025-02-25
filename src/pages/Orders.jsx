// src/pages/Orders.jsx
import React from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Orders.css";
import { orders } from "../data/dummy";
import{ useNavigate, NavLink } from "react-router-dom";
const Orders = () => {
     const navigate = useNavigate();
  return (
    <Layout>
      <div className="orders-header">
        <h2 className="page-title">Order Lists</h2>
        <button className="add-order-button" onClick= {()=> navigate("/new-order")}>New Order</button>
      </div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>ID</th><th>Items</th><th>Address</th><th>Date</th><th>Type</th><th>Status</th><th>Order Details</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td><td>{order.item}</td><td>{order.address}</td>
              <td>{order.date}</td><td>{order.type}</td>
              <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
              <td><NavLink to={`/companies/${order.id}/orders`}>Edit Orders</NavLink></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};
export default Orders;
