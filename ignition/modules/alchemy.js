// Github: https://github.com/alchemyplatform/alchemy-sdk-js
const { Network, Alchemy } = require('alchemy-sdk');
require("dotenv").config();

const settings = {
  apiKey: process.env.APIKEY, // Replace with your Alchemy API key
  network: Network.MATIC_AMOY, // Set the network to the appropriate chain
};

const alchemy = new Alchemy(settings);

async function fetchCurrentPrices() {
//   const symbols = ["ETH", "USDC", "POL","MATIC"];
//   console.log("Fetching current token prices...");

  try {
    const prices = await alchemy.prices.getTokenPriceBySymbol(["POL"]);
    return prices.data[0].prices[0].value;
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

module.exports = {fetchCurrentPrices};