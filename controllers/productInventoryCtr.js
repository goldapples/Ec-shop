const ProductSales = require("../Models/productSalesModel");
const Products = require("../Models/productsModel");
const Store = require("../Models/storeModel");
const moment = require("moment");
const curMoment = moment();
const yDate = moment(new Date()).add(-1, "days").format("YYYY-MM-DD");
const Role = require("../Models/roleModel");

exports.create = async (req, res) => {
  try {
    await Products.findOne({ _id: req.body.product }).then((db) => {
      const num = db.cnt;
      if (num < Number(req.body.sales_cnt)) {
        return res.json({ type: "error", message: "Select Number Error" });
      } else {
        db.cnt = num - Number(req.body.sales_cnt);
        db.save();
      }
    });
    const newInventory = new ProductSales({
      date: req.body.date,
      store: req.body.store,
      person: req.body.person,
      category: req.body.category,
      product: req.body.product,
      price: req.body.price,
      sales_cnt: req.body.sales_cnt,
    });
    newInventory
      .save()
      .then((user) => res.json({ type: "success", message: "Success" }))
      .catch((err) =>
        res.status(500).json({ type: "error", message: err.message })
      );
  } catch (error) {
    console.log("error-->", error.message);
    res.json({ type: "error", message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    yesterdayDate = new Date(yDate);
    const role = await Role.findOne({ _id: req.user.role });
    if (role.title === "admin") {
      const result = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            date: yesterdayDate,
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  title: 1,
                  files: 1,
                  category: 1,
                  store: 1,
                },
              },
            ],
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$product",
            sales_cnt: { $sum: "$sales_cnt" },
            totalPrice: { $sum: { $multiply: ["$price", "$sales_cnt"] } },
          },
        },
      ]);
      res.status(200).json({ allDb: result });
    } else if (role.title === "manager") {
      const result = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            date: yesterdayDate,
            store: req.user.store,
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  title: 1,
                  files: 1,
                  category: 1,
                  store: 1,
                },
              },
            ],
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$product",
            sales_cnt: { $sum: "$sales_cnt" },
            totalPrice: { $sum: { $multiply: ["$price", "$sales_cnt"] } },
          },
        },
      ]);
      res.status(200).json({ allDb: result });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.sales = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.user.role });
    if (role.title === "admin") {
      const result = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  title: 1,
                  files: 1,
                  priceoff: 1,
                },
              },
            ],
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "user",
            localField: "person",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  avartar: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]);
      console.log(result)
      res.status(200).json({ allDb: result });
    } else if (role.title === "manager" || role.title === "user") {
      const result = await ProductSales.aggregate([
        {
          $match: {
            delete: false,
            store: req.user.store,
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "product",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  title: 1,
                  files: 1,
                  priceoff: 1,
                },
              },
            ],
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "user",
            localField: "person",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  name: 1,
                  avartar: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]);
      res.status(200).json({ allDb: result });
    }
  } catch (error) {
    console.log(error);
  }
};
