// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Medicine {
    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }

    modifier isOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    struct MedicineData {
        string name;
        string genericName;
        uint256 pricePerUnit;
        uint256 quantity;
        address payable seller;
    }

    struct Reservation {
        uint256 medicineId;
        uint256 quantity;
        address reserver;
        uint256 totalAmount;
        bool fulfilled;
    }

    mapping(uint256 => MedicineData) public medicines;
    uint256 public medicineCount;
    mapping(uint256 => Reservation) public reservations;
    uint256 public reservationCount;

    event MedicineAdded(uint256 indexed medicineId, string name, uint256 price, uint256 quantity);
    event MedicineReserved(uint256 indexed reservationId, uint256 medicineId, address reserver, uint256 quantity);
    event ReservationFulfilled(uint256 indexed reservationId, uint256 medicineId, address reserver, address seller);

    // 🏥 **Add Medicine** (Only Owner)
   // 🏥 **Add Medicine (If Exists, Increase Quantity)**
function addMedicine(
    string memory name,
    string memory genericName,
    uint256 pricePerUnit,
    uint256 quantity
) public isOwner {
    require(quantity > 0, "Quantity must be greater than zero");
    require(pricePerUnit > 0, "Price must be greater than zero");

    // Check if the medicine already exists
    bool exists = false;
    for (uint i = 0; i < medicineCount; i++) {
        if (keccak256(abi.encodePacked(medicines[i].name)) == keccak256(abi.encodePacked(name))) {
            medicines[i].quantity += quantity; // ✅ Increase quantity
            exists = true;
            break;
        }
    }

    // If medicine does not exist, add it as new
    if (!exists) {
        medicines[medicineCount] = MedicineData(
            name,
            genericName,
            pricePerUnit,
            quantity,
            payable(msg.sender)
        );

        emit MedicineAdded(medicineCount, name, pricePerUnit, quantity);
        medicineCount++;
    }
}


  
function reserveMedicine(uint256 medicineId, uint256 quantity) public payable {
    require(medicineId < medicineCount, "Invalid medicine ID");
    require(quantity > 0, "Quantity must be greater than zero");
    require(medicines[medicineId].quantity >= quantity, "Not enough stock available");

    uint256 totalCost = medicines[medicineId].pricePerUnit * quantity;
    require(msg.value >= totalCost, "Insufficient payment");

    medicines[medicineId].quantity -= quantity;

    if (medicines[medicineId].quantity == 0) {
        delete medicines[medicineId]; // ✅ Removes medicine from mapping
    }

    // Store reservation
    reservations[reservationCount] = Reservation(
        medicineId,
        quantity,
        msg.sender,
        totalCost,
        false
    );

    emit MedicineReserved(reservationCount, medicineId, msg.sender, quantity);
    reservationCount++;
}


    // ✅ **Fulfill Reservation & Pay Seller**
  function fulfillReservation(uint256 reservationId) public {
    require(reservationId < reservationCount, "Invalid reservation ID");
    Reservation storage reservation = reservations[reservationId];
    require(!reservation.fulfilled, "Already fulfilled");

    MedicineData storage medicine = medicines[reservation.medicineId];
    
    // ✅ Remove this redundant deduction (already done in reserveMedicine)
    // require(medicine.quantity >= reservation.quantity, "Not enough stock available");
    // medicine.quantity -= reservation.quantity;

    // Pay seller from contract balance
    medicine.seller.transfer(reservation.totalAmount);
    reservation.fulfilled = true;

    emit ReservationFulfilled(reservationId, reservation.medicineId, reservation.reserver, medicine.seller);
}

function getAllMedicines() public view returns (MedicineData[] memory) {
    uint validCount = 0;

    for (uint i = 0; i < medicineCount; i++) {
        if (medicines[i].quantity > 0) { // ✅ Count only valid medicines
            validCount++;
        }
    }

    MedicineData[] memory allMedicines = new MedicineData[](validCount);
    uint index = 0;

    for (uint i = 0; i < medicineCount; i++) {
        if (medicines[i].quantity > 0) {
            allMedicines[index] = medicines[i];
            index++;
        }
    }

    return allMedicines;
}

// 📦 **Get All Reservations (Without Empty Entries)**
function getAllReservations() public view returns (Reservation[] memory) {
    uint validCount = 0;

    for (uint i = 0; i < reservationCount; i++) {
        if (!reservations[i].fulfilled) { // ✅ Count only pending reservations
            validCount++;
        }
    }

    Reservation[] memory allReservations = new Reservation[](validCount);
    uint index = 0;

    for (uint i = 0; i < reservationCount; i++) {
        if (!reservations[i].fulfilled) {
            allReservations[index] = reservations[i];
            index++;
        }
    }

    return allReservations;
}

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
