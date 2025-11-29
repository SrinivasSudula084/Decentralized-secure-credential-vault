// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialVault {
    struct Credential {
        string ipfsHash;   // IPFS CID of encrypted credentials
        string fileType;   // File type (json)
        uint256 timestamp; // Timestamp when stored
    }
    struct Document {
        string ipfsHash;  // IPFS CID of the document
        string fileName;  // Name of the file
        string fileType;  // Type of the file (e.g., pdf, jpg, png)
        uint256 timestamp;
    }

    mapping(address => Credential[]) private userCredentials;
    mapping(address => Document[]) private userDocuments;
    mapping(address => uint256) private nonces;  // Nonce storage for login

    // Generate a new nonce for authentication
    function generateNonce() public returns (uint256) {
        nonces[msg.sender] = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return nonces[msg.sender];
    }

    // Retrieve nonce
    function getNonce() public view returns (uint256) {
        return nonces[msg.sender];
    }

    // Events for logging actions
    event CredentialStored(address indexed user, string ipfsHash, string fileType, uint256 timestamp);
    event DocumentStored(address indexed user, string ipfsHash, string fileName, string fileType, uint256 timestamp);
    event DocumentDeleted(address indexed user, string ipfsHash, string fileName);
    event CredentialDeleted(address indexed user, string ipfsHash, string fileType);

    function storeCredential(string memory _ipfsHash, string memory _fileType) external {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        require(bytes(_fileType).length > 0, "Invalid file type");

        userCredentials[msg.sender].push(Credential({
            ipfsHash: _ipfsHash,
            fileType: _fileType,
            timestamp: block.timestamp
        }));

        emit CredentialStored(msg.sender, _ipfsHash, _fileType, block.timestamp);
    }

    /// @notice Retrieve all credentials stored by the sender
    function getCredentials() external view returns (Credential[] memory) {
        return userCredentials[msg.sender];
    }
    
    function storeDocument(string memory _ipfsHash, string memory _fileName, string memory _fileType) external {
        require(bytes(_ipfsHash).length > 0, "Invalid IPFS hash");
        require(bytes(_fileName).length > 0, "Invalid file name");
        require(bytes(_fileType).length > 0, "Invalid file type");

        userDocuments[msg.sender].push(Document({
            ipfsHash: _ipfsHash,
            fileName: _fileName,
            fileType: _fileType,
            timestamp: block.timestamp
        }));

        emit DocumentStored(msg.sender, _ipfsHash, _fileName, _fileType, block.timestamp);
    }

    /// @notice Retrieve all document metadata stored by the sender
    function getDocuments() external view returns (Document[] memory) {
        return userDocuments[msg.sender];
    }

    /// @notice Delete a document by index
    function deleteDocument(uint256 index) external {
        require(index < userDocuments[msg.sender].length, "Invalid index");

        // Store the details before deleting for logging purposes
        Document memory doc = userDocuments[msg.sender][index];

        // Move the last document to the deleted position to maintain array integrity
        userDocuments[msg.sender][index] = userDocuments[msg.sender][userDocuments[msg.sender].length - 1];

        // Remove the last element
        userDocuments[msg.sender].pop();

        emit DocumentDeleted(msg.sender, doc.ipfsHash, doc.fileName);
    }

    /// @notice Delete a credential by index
    function deleteCredential(uint256 index) external {
        require(index < userCredentials[msg.sender].length, "Invalid index");

        // Store the details before deleting for logging purposes
        Credential memory cred = userCredentials[msg.sender][index];

        // Move the last credential to the deleted position to maintain array integrity
        userCredentials[msg.sender][index] = userCredentials[msg.sender][userCredentials[msg.sender].length - 1];

        // Remove the last element
        userCredentials[msg.sender].pop();

        emit CredentialDeleted(msg.sender, cred.ipfsHash, cred.fileType);
    }
}
