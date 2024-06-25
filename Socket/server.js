const express = require("express");
const mongoose = require("mongoose");
const chatInit = require("./chatInit");


const app = express();

//connect mongodb

const db = require("../config/config").MONGOURI;
mongoose
  .connect(db)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.log("err");
  });

const io = require("socket.io").listen(
  express().listen(7000, () => {
    console.log("Socket server is running on port 7000");
  })
);

io.of("/socket").on("connection", (socket) => {
  console.log('Socket is connected');
     chatInit(io, socket)
     socket.on("disconnect",()=>{
      console.log("Socket is disconnect")
     })
})

