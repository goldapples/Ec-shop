const Orderhistory = require("../Models/orderModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const passport = require("passport");
const async = require("async");

exports.delete = async (req, res) => {
  try {
    let { id } = req.params;
    Orderhistory.findByIdAndDelete(id, (err) => {
    if (err) res.status(500).json({ message: "err" });
    else res.json({ message: "success" });
  });
  } catch (error) {
    
  }
};

exports.getOrderhistory = async (req, res) => {
  try {
      const OrderDb = await Orderhistory.aggregate([
        {
          $match: {
            delete: false,
            permission: true,
            user: req.user._id,
          }
        },
        {
          $unwind: {
            path: "$products",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "products.product",
            foreignField: "_id",
            as: "products_info"
          }
        },
        {
					$unwind: {
						path: "$products_info"
					}
				},
        {
					$project: {
						_id: 1,
						products: 1,
						shipping: 1,
						updatedAt: 1,
						products_info: 1,
						total: {
								$multiply: ["$products.quantity", "$products_info.saleprice"]
						}
					}
				},
      ])
      res.status(200).json({type: "success", OrderDb})

} catch (error) {
  return res.json({type: "error", message: "error"})
}
};

