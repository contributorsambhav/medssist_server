const hre = require("hardhat");
const { ethers } = require("hardhat");
require("dotenv").config();
const fs = require("fs");

let POLbyUSD = 0;
const { fetchCurrentPrices } = require("./alchemy");

fetchCurrentPrices().then(price => {
  POLbyUSD = price;
  console.log("POL price in USD:", POLbyUSD);
});


const contractJsonPath = "./artifacts/contracts/request.sol/Request.json";
const registeredJsonPath =
  "./artifacts/contracts/registered.sol/Registered.json";
const medicineJsonPath = "./artifacts/contracts/medicine.sol/Medicine.json";

const contractABI = JSON.parse(fs.readFileSync(contractJsonPath)).abi;
const registeredABI = JSON.parse(fs.readFileSync(registeredJsonPath)).abi;
const medicineABI = JSON.parse(fs.readFileSync(medicineJsonPath)).abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("Wallet Address:", wallet.address);

const contractAddress = process.env.CONTRACT_ADDRESS;
const registeredAddress = process.env.REGISTERED_CONTRACT_ADDRESS;
const medicineAddress = process.env.MEDICINE_CONTRACT_ADDRESS;
console.log("Using existing contract at:", contractAddress);

const requestContract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);
const registeredContract = new ethers.Contract(
  registeredAddress,
  registeredABI,
  wallet
);
const medicineContract = new ethers.Contract(
  medicineAddress,
  medicineABI,
  wallet
);

getEntityNameController = async (req, res) => {
  const entityname = await registeredContract.getName(req.query.id);
  res.send(entityname.toString());
};

setEntityNameController = async (req, res) => {
  console.log(req.body);
  await registeredContract.setName(req.body.name);
  res.send("Name Saved Successfully");
};

requestCountController = async (req, res) => {
  const requestCount = await requestContract.requestCount();
  res.send(requestCount.toString());
};
activeRequestCountController = async (req, res) => {
  const activeRequestCount = await requestContract.activeRequestCount();
  res.send(activeRequestCount.toString());
};

createRequestController = async (req, res) => {
  const tx = await requestContract.createRequest(
    req.body.bloodGroup,
    req.body.units
  );
  await tx.wait();
  res.send("Request created");
};

fulfilRequestController = async (req, res) => {
  const tx = await requestContract.fulfilRequest(req.body.id);
  await tx.wait();
  res.send("Request fulfilled");
};

reserveRequestController = async (req, res) => {
  const tx = await requestContract.reserveRequest(req.body.id);
  await tx.wait();
  res.send("Request reserved");
};

showActiveRequestsController = async (req, res) => {
  const fetchActiveRequests = await requestContract.showActiveRequests();

  const activeRequests = fetchActiveRequests.map((request) => {
    return {
      id: request.id.toString(),
      bloodGroup: request.bloodGroup.toString(),
      units: request.units.toString(),
      requester: request.requester.toString(),
    };
  });
  res.send(activeRequests);
};

showAllRequestsController = async (req, res) => {
  const fetchAllRequests = await requestContract.showAllRequests();

  const allRequests = fetchAllRequests.map((request) => {
    return {
      id: request.id.toString(),
      bloodGroup: request.bloodGroup.toString(),
      units: request.units.toString(),
      requester: request.requester.toString(),
    };
  });
  res.send(allRequests);
};

showCurrentReservationsController = async (req, res) => {
  const fetchCurrentReservations =
    await requestContract.showCurrentReservations();

  const currentReservations = fetchCurrentReservations.map((request) => {
    return {
      id: request.id.toString(),
      bloodGroup: request.bloodGroup.toString(),
      units: request.units.toString(),
      requester: request.requester.toString(),
      reserver: request.reserver.toString(),
    };
  });
  res.send(currentReservations);
};

const addMedicineController = async (req, res) => {
  try {
    const { name, genericName, pricePerUnit, quantity } = req.body;

    const tx = await medicineContract.addMedicine(
      name,
      genericName,
      pricePerUnit,
      quantity
    );
    await tx.wait();

    res.send("Medicine added successfully");
  } catch (error) {
    console.error("Error adding medicine:", error);
    res.status(500).send("Failed to add medicine");
  }
};

const reserveMedicineController = async (req, res) => {
  try {
      const { medicineId, quantity } = req.body;
      
      // Fetch medicine details
      const medicine = await medicineContract.medicines(medicineId);
      const pricePerUnit = BigInt(medicine.pricePerUnit); // ✅ Convert to BigInt

      // Compute total cost
      const totalCost = pricePerUnit * BigInt(quantity) ; // ✅ Ensure both are BigInt

      // Convert BigInt to string before passing to ethers
      const tx = await medicineContract.reserveMedicine(medicineId, quantity, { value: totalCost.toString() });
      await tx.wait();

      res.send("Medicine reserved successfully");
  } catch (error) {
      console.error("Error reserving medicine:", error);
      res.status(500).send("Failed to reserve medicine");
  }
};


const fulfillReservationController = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const tx = await medicineContract.fulfillReservation(reservationId);
    await tx.wait();

    res.send("Reservation fulfilled successfully");
  } catch (error) {
    console.error("Error fulfilling reservation:", error);
    res.status(500).send("Failed to fulfill reservation");
  }
};

const getAllMedicinesController = async (req, res) => {
  try {
      const medicines = await medicineContract.getAllMedicines();
      const formattedMedicines = medicines.map(med => ({
          name: med.name,
          genericName: med.genericName,
          pricePerUnit: med.pricePerUnit.toString(),
          quantity: med.quantity.toString(),
          seller: med.seller
      }));
      res.send(formattedMedicines);
  } catch (error) {
      console.error("Error fetching medicines:", error);
      res.status(500).send("Failed to fetch medicines");
  }
};


const getAllReservationsController = async (req, res) => {
  try {
      const reservations = await medicineContract.getAllReservations();
      const formattedReservations = reservations.map(resv => ({
          medicineId: resv.medicineId.toString(),
          quantity: resv.quantity.toString(),
          reserver: resv.reserver,
          totalAmount: resv.totalAmount.toString(),
          fulfilled: resv.fulfilled
      }));
      res.send(formattedReservations);
  } catch (error) {
      console.error("Error fetching reservations:", error);
      res.status(500).send("Failed to fetch reservations");
  }
};


const getContractBalanceController = async (req, res) => {
  try {
    const balance = await medicineContract.getContractBalance();
    res.send({ balance: balance.toString() });
  } catch (error) {
    console.error("Error fetching contract balance:", error);
    res.status(500).send("Failed to fetch contract balance");
  }
};


module.exports = {

  addMedicineController,
  reserveMedicineController,
  fulfillReservationController,
  getContractBalanceController,
  getAllMedicinesController,
  getAllReservationsController,

  activeRequestCountController,
  createRequestController,
  fulfilRequestController,
  reserveRequestController,
  showActiveRequestsController,
  showAllRequestsController,
  showCurrentReservationsController,
  requestCountController,

  getEntityNameController,
  setEntityNameController,
};
