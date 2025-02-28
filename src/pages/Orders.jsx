import React, { useState } from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Orders.css";
import { orders } from "../data/dummy";
import { useNavigate, NavLink } from "react-router-dom";

const Orders = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 9;

    // Get current orders
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Layout>
            <div className="orders-header">
                <h2 className="page-title">Order Lists</h2>
                <button className="add-order-button" onClick={() => navigate("/new-order")}>New Order</button>
            </div>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>ID</th><th>Items</th><th>Address</th><th>Date</th><th>Type</th><th>Status</th><th>Order Details</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td><td>{order.item}</td><td>{order.address}</td>
                            <td>{order.date}</td><td>{order.type}</td>
                            <td><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></td>
                            <td><NavLink to={`/orders/${order.id}`}>View Details</NavLink></td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }).map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? 'active' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </Layout>
    );
};
export default Orders;
