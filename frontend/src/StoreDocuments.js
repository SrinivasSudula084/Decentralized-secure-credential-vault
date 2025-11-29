import React, { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import "./StoreDocuments.css";


// Pinata API Credentials
const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;

const contractAddress = "0x84EB872BEE4d2323643A848B5De1f17aB43C69d0";
const contractABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_ipfsHash", "type": "string" },
      { "internalType": "string", "name": "_fileName", "type": "string" },
      { "internalType": "string", "name": "_fileType", "type": "string" }
    ],
    "name": "storeDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const uploadToPinata = async (file) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "pinata_api_key": PINATA_API_KEY,
      "pinata_secret_api_key": PINATA_SECRET_API_KEY
    },
    body: formData
  });

  const result = await response.json();
  return result.IpfsHash;
};

// 🔐 Function to encrypt file using AES
const encryptFile = (file, secretKey) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // Convert file to Base64
    reader.onload = () => {
      const base64File = reader.result.split(",")[1]; // Remove the "data:mime/type;base64," prefix
      const encrypted = CryptoJS.AES.encrypt(base64File, secretKey).toString();
      const encryptedBlob = new Blob([encrypted], { type: "text/plain" }); // Convert back to Blob
      resolve(encryptedBlob);
    };
    reader.onerror = (error) => reject(error);
  });
};

const StoreDocuments = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [userAddress, setUserAddress] = useState(null);

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

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleStoreDocument = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      // 🔑 Generate encryption key using user address
      const encryptionKey = CryptoJS.SHA256(userAddress).toString();

      // 🔐 Encrypt the file
      const encryptedFile = await encryptFile(selectedFile, encryptionKey);

      // 📤 Upload encrypted file to IPFS
      const ipfsHash = await uploadToPinata(encryptedFile);
      console.log("Stored on IPFS:", ipfsHash);

      // 📌 Store IPFS hash on the blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.storeDocument(ipfsHash, selectedFile.name, selectedFile.type);
      await tx.wait();

      alert("Document stored successfully on IPFS & Blockchain!");
    } catch (error) {
      console.error("Error storing document:", error);
      alert("Error storing document.");
    }
  };

  return (
    <div className="store-documents-container">
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
      <h2>Store Documents</h2>
      <button onClick={connectWallet}>
        {userAddress ? `Connected: ${userAddress}` : "Connect Wallet"}
      </button>

      <label>Select Document:</label>
      <input type="file" onChange={handleFileUpload} />

      <button onClick={handleStoreDocument}>Store Document</button>
    </div>
  );
};

export default StoreDocuments;
