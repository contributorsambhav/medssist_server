const express = require("express");
const medicineroutes = express.Router(); 

const {
  addMedicineController,
  reserveMedicineController,
  fulfillReservationController,
  getContractBalanceController,
  getAllMedicinesController,
  getAllReservationsController
} = require("./oracle");

medicineroutes.use(express.json()); 

medicineroutes.post("/addMedicine", addMedicineController);
medicineroutes.post("/reserveMedicine", reserveMedicineController);
medicineroutes.post("/fulfillReservation", fulfillReservationController);
medicineroutes.get("/getContractBalance", getContractBalanceController);
medicineroutes.get("/getAllMedicines", getAllMedicinesController);
medicineroutes.get("/getAllReservations", getAllReservationsController);

module.exports = medicineroutes;
