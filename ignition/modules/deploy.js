const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("Deploying from wallet:", wallet.address);

  const ContractFactory = await ethers.getContractFactory("Request", wallet);
  const contract = await ContractFactory.deploy();
  const RegisteredContractFactory = await ethers.getContractFactory("Registered", wallet);
  const registeredContract = await RegisteredContractFactory.deploy();
  const medicineContractFactory = await ethers.getContractFactory("Medicine", wallet);
  const medicineContract = await medicineContractFactory.deploy();
  console.log("Request Contract deployed at:", contract.target);
  console.log("Registered contract deployed at ", registeredContract.target);
  console.log("Medicine contract deployed at ", medicineContract.target);
}

main();
