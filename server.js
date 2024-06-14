const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const config = require("./config/config");
const { GlobSync } = require("glob");
const fs = require("fs");
const path = require("path");
const env = require("dotenv");
const socket = require("./socket");

const app = express();

//connect mongodb
const db = require("./config/config").MONGOURI;
mongoose
  .connect(db)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.log("err");
  });

//middlewares
app.use(cors(""));
env.config();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

//passport initialize
app.use(passport.initialize());

// fileUpload
app.use(fileUpload());
const PORT = process.env.PORT || 5000;

//require models
const models = new GlobSync("./Models/*Model.js");
models.found.forEach((model) => 
{
require(model)}
);

//require routers
const routes = new GlobSync("./routes/*Router.js");
routes.found.forEach((router) =>
  app.use(process.env.API_PREFIX, require(router))
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// sockets;
const io = require("socket.io").listen(express().listen(7001));
// io.of("/socket").on("connection", (socket) => {
//   console.log("Socket server is running on 7001 port");
//   socket.on("SALES_ALERT", (data) => {
//     console.log(data);
//     socket.emit("SEND_SALES", data);
//     socket.broadcast.emit("SEND_SALES", data);
//   });
// });
socket(io);