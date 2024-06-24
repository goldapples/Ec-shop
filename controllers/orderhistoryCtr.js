const Orderhistory = require("../Models/orderModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const passport = require("passport");
const async = require("async");
const mongoose = require('mongoose')

exports.delete = async (req, res) => {
  try {
    let { orderId, productId } = req.query;
    const res = await  Orderhistory.updateOne({_id : mongoose.Types.ObjectId(orderId)}, {$pull: {products: {_id : mongoose.Types.ObjectId(productId)}}})
    console.log(res)
  } catch (error) {
    console.log(error)
  }
};

exports.getOrderhistory = async (req, res) => {
  try {
      const OrderDb = await Orderhistory.aggregate([
        {
          $match: {
            delete: false,
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
            permission: 1,
						total: {
								$multiply: ["$products.quantity", "$products_info.price"]
						}
					}
				},
        {
					$unwind: {
            path: "$shipping",
            preserveNullAndEmptyArrays: true,
          }

				}
      ])
      res.status(200).json({type: "success", OrderDb})

} catch (error) {
  return res.json({type: "error", message: "error"})
}
};



