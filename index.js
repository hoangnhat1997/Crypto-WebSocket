const express = require("express");
const socketIO = require("socket.io");
const PORT = 3000;
const https = require("https");

const server = express().listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("crypto", "message hello world");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const options = {
  host: "data.messari.io",
  port: 443,
  path: "/api/v1/assets?fields=id,slug,symbol,metrics/market_data/price_usd",
  method: "GET",
  headers: {
    "x-messari-api-key": "ZVPpVe+M7KFwTLnOTXe66jfkXH86qk3bHQUpM-OHsci5RLfy",
  },
};

setInterval(() => {
  https
    .request(options, (response) => {
      let str = "";
      response.on("data", (chunk) => (str += chunk));
      response.on("end", () => {
        const prices = JSON.parse(str).data.map((item) => {
          return {
            id: item.id,
            name: item.symbol,
            price: item.metrics.market_data.price_usd,
          };
        });
        console.log(prices);
        io.emit("crypto", prices);
      });
    })
    .end();
}, 5000);
