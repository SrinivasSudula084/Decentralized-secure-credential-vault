const hre = require("hardhat");

async function main() {
    const ContractFactory = await hre.ethers.getContractFactory("CredentialVault"); // Replace with your contract name
    const contract = await ContractFactory.deploy();

    await contract.waitForDeployment(); // Use waitForDeployment() instead of deployed()
    
    console.log(`Contract deployed to: ${await contract.getAddress()}`); // Get contract address
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
