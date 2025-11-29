import React, { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import "./StoreCredentials.css";

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;

const contractAddress = "0x84EB872BEE4d2323643A848B5De1f17aB43C69d0";
const contractABI = [
  {
    inputs: [],
    name: "generateNonce",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCredentials",
    outputs: [
      {
        components: [
          { internalType: "string", name: "ipfsHash", type: "string" },
          { internalType: "string", name: "fileType", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct CredentialVault.Credential[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_ipfsHash", type: "string" },
      { internalType: "string", name: "_fileType", type: "string" },
    ],
    name: "storeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const uploadToPinata = async (data) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
    body: JSON.stringify({ pinataContent: data }),
  });

  const result = await response.json();
  return result.IpfsHash;
};

const StoreCredentials = () => {
  const [accountType, setAccountType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const encryptPassword = (password, secretKey) => {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
  };

  const handleStoreCredentials = async () => {
    if (!accountType || !username || !password) {
      alert("Please fill in all fields.");
      return;
    }
    if (!userAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const encryptionKey = CryptoJS.SHA256(userAddress).toString();
      const encryptedPassword = encryptPassword(password, encryptionKey);

      const credentialData = { accountType, username, password: encryptedPassword };

      const ipfsHash = await uploadToPinata(credentialData);
      console.log("Stored on IPFS:", ipfsHash);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.storeCredential(ipfsHash, "json");
      await tx.wait();

      alert("Credentials stored successfully on IPFS & Blockchain!");
    } catch (error) {
      console.error("Error storing credentials:", error);
      alert("Error storing credentials.");
    }
  };

  return (
    <div className="store-credentials-page">
      {/* ✅ Navbar */}
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

      {/* ✅ Store Credentials Form */}
      <div className="store-credentials-container">
        <h2>Store Credentials</h2>
        <button onClick={connectWallet}>
          {userAddress ? `Connected: ${userAddress}` : "Connect Wallet"}
        </button>

        <label>Account Type:</label>
        <input type="text" value={accountType} onChange={(e) => setAccountType(e.target.value)} />

        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleStoreCredentials}>Store Credentials</button>
      </div>
    </div>
  );
};

export default StoreCredentials;
