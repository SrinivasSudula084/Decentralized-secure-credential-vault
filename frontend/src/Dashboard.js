import React from "react";
import { useNavigate } from "react-router-dom";

import "./Dashboard.css"; // New CSS for styling

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>Credential Vault</h1>
        <ul>
          <li><a href="/store-credentials">Store Credentials</a></li>
          <li><a href="/store-documents">Store Documents</a></li>
          <li><a href="/retrieve-credentials">Retrieve Credentials</a></li>
          <li><a href="/retrieve-documents">Retrieve Documents</a></li>
          <li><a href="/">Logout</a></li>
          
        </ul>
      </nav>
    
      {/* Main Content */}
      <div className="dashboard-content">
        <div className="card" onClick={() => navigate("/store-credentials")}>
          <h2>📂 Store Credentials</h2>
          <p>Securely store your credentials on the blockchain.</p>
        </div>
        <div className="card" onClick={() => navigate("/retrieve-credentials")}>
          <h2>🔍 Retrieve Credentials</h2>
          <p>View and access your stored credentials anytime.</p>
        </div>
        <div className="card" onClick={() => navigate("/store-documents")}>
          <h2>📝 Store Documents</h2>
          <p>Upload and securely store documents using IPFS.</p>
        </div>
        <div className="card" onClick={() => navigate("/retrieve-documents")}>
          <h2>📁 Retrieve Documents</h2>
          <p>View and download your securely stored documents.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
