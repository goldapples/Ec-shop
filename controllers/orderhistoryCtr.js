const Orderhistory = require("../Models/orderModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const passport = require("passport");
const async = require("async");
exports.getOrderhistory = async (req, res) => {
  try {
    const guest = await Orderhistory.findOne({ _id: req.body._id });
    if (!guest)
    return res.status(500).send({ message: "Guest Order does not exists." });
      const OrderDb = await Orderhistory.aggregate([
        {
          $match: {
            delete: false,
            permission: false,
          }
        },
        {
          $lookup:
          {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
      ])
      console.log('==========result==========', OrderDb);
      res.status(200).json({type: "success", OrderDb})

} catch (error) {
  return res.json({type: "error", message: "error"})
}
};

