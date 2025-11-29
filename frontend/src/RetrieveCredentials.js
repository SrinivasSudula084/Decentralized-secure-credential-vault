import React, { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import axios from "axios";
import "./RetrieveCredentials.css"; // Import CSS
import { contractAddress,contractABI  } from "./config/contractConfig";

const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

const RetrieveCredentials = () => {
  const [userAddress, setUserAddress] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setUserAddress(address);
  };

  const fetchCredentials = async () => {
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const storedCredentials = await contract.getCredentials();

      const retrievedCredentials = await Promise.all(
        storedCredentials.map(async (cred) => {
          const ipfsURL = `${PINATA_GATEWAY}${cred.ipfsHash}`;
          const response = await axios.get(ipfsURL);
          const data = response.data;

          const decryptionKey = CryptoJS.SHA256(userAddress).toString();
          const decryptedPassword = CryptoJS.AES.decrypt(
            data.password,
            decryptionKey
          ).toString(CryptoJS.enc.Utf8);

          return {
            accountType: data.accountType,
            username: data.username,
            password: decryptedPassword,
            timestamp: cred.timestamp,
            ipfsHash: cred.ipfsHash,
          };
        })
      );

      setCredentials(retrievedCredentials);
    } catch (error) {
      console.error("Error retrieving credentials:", error);
      alert("Failed to fetch credentials.");
    }
    setLoading(false);
  };

  const deleteCredential = async (index) => {
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.deleteCredential(index);
      await tx.wait();

      alert("Credential deleted successfully!");
      fetchCredentials();
    } catch (error) {
      console.error("Error deleting credential:", error);
      alert("Failed to delete credential.");
    }
  };

  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch = cred.accountType.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Convert timestamp to YYYY-MM-DD format for comparison
    const formattedTimestamp = new Date(cred.timestamp * 1000).toISOString().split("T")[0];
    
    const matchesDate = searchDate ? formattedTimestamp === searchDate : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="retrieve-credentials-container">
      <nav className="navbar">
        <h1>Credential Vault</h1>
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/store-credentials">Store Credentials</a></li>
          <li><a href="/store-documents">Store Documents</a></li>
          <li><a href="/retrieve-credentials">Retrieve Credentials</a></li>
          <li><a href="/retrieve-documents">Retrieve Documents</a></li>
        </ul>
      </nav>
      
      <h2>Retrieve Credentials</h2>
      <button onClick={connectWallet}>
        {userAddress ? `Connected: ${userAddress}` : "Connect Wallet"}
      </button>
      <button onClick={fetchCredentials} disabled={loading}>
        {loading ? "Fetching..." : "Retrieve Credentials"}
      </button>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Account Type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="search-date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>

      <table className="credentials-table">
        <thead>
          <tr>
            <th>Account Type</th>
            <th>Username</th>
            <th>Password</th>
            <th>Timestamp</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCredentials.map((cred, index) => (
            <tr key={index}>
              <td>{cred.accountType}</td>
              <td>{cred.username}</td>
              <td>{cred.password}</td>
              <td>{new Date(cred.timestamp * 1000).toLocaleString()}</td>
              <td>
                <button onClick={() => deleteCredential(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RetrieveCredentials;
