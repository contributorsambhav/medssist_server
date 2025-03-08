const express = require("express");
const {
    activeRequestCountController,
    createRequestController,
    fulfilRequestController,
    reserveRequestController,
    showActiveRequestsController,
    showAllRequestsController,
    showCurrentReservationsController,
    requestCountController,
    getEntityNameController,
    setEntityNameController
} = require("./ignition/modules/oracle");

const medicineroutes = require("./ignition/modules/medicine_routes");

const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.use("/medicine", medicineroutes);
app.get("/activeRequestCount", activeRequestCountController);
app.post("/createRequest", createRequestController);
app.post("/fulfilRequest", fulfilRequestController);
app.post("/reserveRequest", reserveRequestController);
app.get("/showActiveRequests", showActiveRequestsController);
app.get("/showAllRequests", showAllRequestsController);
app.get("/showCurrentReservations", showCurrentReservationsController);
app.get("/requestCount", requestCountController);
app.get("/getEntityName", getEntityNameController);
app.post("/setEntityName", setEntityNameController);

app.listen(port, () => { 
    console.log(`Server running on port ${port}`);
});