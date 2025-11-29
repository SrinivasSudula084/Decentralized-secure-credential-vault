import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import vaultImage from "./vault-image.jpeg";
import securityImage from "./security1.jpeg";
import encryptionImage from "./security2.jpeg";
import "./Login.css";

const contractAddress = "0x84EB872BEE4d2323643A848B5De1f17aB43C69d0";
const contractABI = [
  {
    "inputs": [],
    "name": "generateNonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCredentials",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "fileType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct CredentialVault.Credential[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNonce",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_fileType",
        "type": "string"
      }
    ],
    "name": "storeCredential",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


function Login() {
  
  const [address, setAddress] = useState(null);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install Metamask.");
      window.location.href = "https://metamask.io/download.html";
      return;
    }

    

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const nonce = await contract.getNonce();
      const message = `Sign this message to log in. Nonce: ${nonce}`;
      const signature = await signer.signMessage(message);

      navigate("/dashboard", { state: {address: userAddress, signature } });
    } catch (error) {
      alert("Error connecting to MetaMask.");
    }
  };

  return (
    <div className="neon-background">
      <div className="navbar">🔐 Secure Credential Vault</div>
      
      <div className="hero-section">
        <div className="hero-text">
          <h2>Decentralized Secure Credential vault using Blockchain</h2>
          <p>Credential Vault ensures secure storage and verification of your digital credentials using decentralized blockchain technology.</p>
        </div>
        <div className="hero-image">
          <img src={vaultImage} alt="Vault Security" />
        </div>
      </div>
      
      <div className="security-info">
        <div className="info-card">
          <img src={securityImage} alt="Security" />
          <h3>End-to-End Encryption</h3>
          <p>Your credentials are stored securely with blockchain-based encryption, ensuring maximum protection against unauthorized access.</p>
        </div>
        <div className="login-container glassmorphism">
        <h3>Login</h3>
        
        {address ? (
          <p className="connected-text">Connected: {address}</p>
        ) : (
          <button onClick={connectWallet} className="neon-button">Login with MetaMask</button>
        )}
      </div>

        <div className="info-card">
          <img src={encryptionImage} alt="Encryption" />
          <h3>Decentralized Storage</h3>
          <p>Unlike centralized systems, our platform stores credentials on a decentralized network, eliminating single points of failure.</p>
        </div>
      </div>

      
      <div className="footer">© 2025 Decentralized Vault. All Rights Reserved.</div>
     
    </div>
  );
}

export default Login;
