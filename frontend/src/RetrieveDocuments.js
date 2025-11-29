import React, { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import "./RetrieveDocuments.css";

const contractAddress = "0x84EB872BEE4d2323643A848B5De1f17aB43C69d0";
const contractABI = [
  {
    "inputs": [],
    "name": "getDocuments",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "string", "name": "fileName", "type": "string" },
          { "internalType": "string", "name": "fileType", "type": "string" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct SecureVault.Document[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "deleteDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const RetrieveDocuments = () => {
  const [userAddress, setUserAddress] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchDocuments = async () => {
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const docs = await contract.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("Error fetching documents.");
    }
    setLoading(false);
  };

  const handleDelete = async (index) => {
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this document?");
    if (!confirmDelete) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.deleteDocument(index);
      await tx.wait();

      alert("Document deleted successfully!");
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete the document.");
    }
  };

  const decryptFile = async (encryptedText, secretKey) => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey).toString(CryptoJS.enc.Utf8);
      if (!decrypted) throw new Error("Decryption failed");
      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      alert("Failed to decrypt the document.");
      return null;
    }
  };

  const handleDownload = async (ipfsHash, fileName, fileType) => {
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const response = await fetch( `${PINATA_GATEWAY}${ipfsHash}`);
      const encryptedText = await response.text();

      const decryptionKey = CryptoJS.SHA256(userAddress).toString();
      const decryptedBase64 = await decryptFile(encryptedText, decryptionKey);
      if (!decryptedBase64) return;

      const byteCharacters = atob(decryptedBase64);
      const byteArray = new Uint8Array([...byteCharacters].map((char) => char.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: fileType });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download the document.");
    }
  };

  const handleView = async (ipfsHash, fileType) => {
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      const encryptedText = await response.text();

      const decryptionKey = CryptoJS.SHA256(userAddress).toString();
      const decryptedBase64 = await decryptFile(encryptedText, decryptionKey);
      if (!decryptedBase64) return;

      const byteCharacters = atob(decryptedBase64);
      const byteArray = new Uint8Array([...byteCharacters].map((char) => char.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: fileType });

      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (error) {
      console.error("View error:", error);
      alert("Failed to view the document.");
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesName = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = searchDate
      ? new Date(doc.timestamp * 1000).toISOString().split("T")[0] === searchDate
      : true;
    return matchesName && matchesDate;
  });

  return (
    <div className="retrieve-documents-container">
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

      <h2>Retrieve Documents</h2>
      <button onClick={connectWallet}>
        {userAddress ? `Connected: ${userAddress}` : "Connect Wallet"}
      </button>

      <button onClick={fetchDocuments} disabled={loading}>
        {loading ? "Fetching..." : "Retrieve Documents"}
      </button>

      <input
        type="text"
        className="search-input"
        placeholder="Search by file name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <input
        type="date"
        className="timestamp-input"
        value={searchDate}
        onChange={(e) => setSearchDate(e.target.value)}
      />

      {filteredDocuments.length > 0 ? (
        <table className="documents-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>File Type</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, index) => (
              <tr key={index}>
                <td>{doc.fileName}</td>
                <td>{doc.fileType}</td>
                <td>{new Date(doc.timestamp * 1000).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleView(doc.ipfsHash, doc.fileType)}>View</button>
                  <button onClick={() => handleDownload(doc.ipfsHash, doc.fileName, doc.fileType)}>Download</button>
                  <button onClick={() => handleDelete(index)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No documents found.</p>
      )}
    </div>
  );
};

export default RetrieveDocuments;
