import React from "react";
import Layout from "../components/Layout/Layout";
import { useParams } from "react-router-dom";
import { companies } from "../data/dummy";

const Details = () => {
  const { id } = useParams();
  const company = companies.find((company) => company.id === id);

  if (!company) {
    return (
      <Layout>
        <h2>Company not found</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="details-container">
        <h2 className="page-title">{company.name} - Details</h2>
        <p><strong>Address:</strong> {company.address}</p>
        <p><strong>Date Registered:</strong> {company.date}</p>
        <p><strong>GST Number:</strong> {company.gst}</p>
        <p><strong>Status:</strong> {company.status}</p>
      </div>
    </Layout>
  );
};

export default Details;
