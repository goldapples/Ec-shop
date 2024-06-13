const Products = require("../Models/productsModel");
const Role = require("../Models/roleModel");
const mongoose = require("mongoose");
const categoryModel = require("../Models/categoryModel");
const guestModel = require("../Models/guestModel");

exports.create = async (req, res) => {
  try {
    await Products.findOne({ title: req.body.title }).then((user) => {
      if (user) {
        if (String(user.store) === String(req.body.store)) {
          return res.json({
            type: "error",
            message: "Your Store has already this Product",
          });
        }
      }
      const newProducts = new Products({
        date: req.body.date,
        title: req.body.title,
        cnt: req.body.cnt,
        price: req.body.price,
        priceoff: req.body.price,
        category: req.body.category,
        tags: req.body.tags,
        description: req.body.description,
        store: req.body.store,
        files: req.body?.files || [],
      });
      newProducts
        .save()
        .then((user) => res.json({ type: "success", message: "Success" }))
        .catch((err) =>
          res.status(500).json({ type: "error", message: err.message })
        );
    });
  } catch (error) {
    return await res
      .status(500)
      .json({ type: "error", message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.user.role });
    if (role?.title === "admin") {
      const allDb = await Products.find({
        delete: false,
      }).sort({
        date: -1,
      });
      res.status(200).json({ allDb });
    } else {
      const allDb = await Products.find({
        delete: false,
        store: req.user.store,
      }).sort({
        updatedAt: -1,
      });
      res.status(200).json({ allDb });
    }
  } catch (error) {
    console.log(error);
  }
};
exports.images = async (req, res) => {
  try {
    const imgs = await Products.aggregate([
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $project: {
          files: 1,
          title: 1,
          price: 1,
          priceoff: 1,
          description: 1,
          date: 1,
          cnt: 1,
        },
      },
    ]);
    if (!imgs) {
      return res.status(500).json({ type: "error", message: error.message });
    } else {
      res.status(200).json(imgs);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.delete = async (req, res) => {
  try {
    let { id } = req.params;
    await Products.findByIdAndUpdate(id, { delete: true }).then((db) => {
      res.json({ message: "Success" });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const product = await Products.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: `No product with id: ${productId}` });
    } else {
      res.status(200).json({
        message: `Product with id: ${productId} updated successfully.`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllByGuest = async (req, res) => {
  const byOrder = req.body.filterCondition.order;
  const favourite = req.body.filterCondition.favourite;
  try {
    const favouriteProductId = await guestModel.findOne({
      _id: req.body.filterCondition.userId,
    });
    const idPath = await categoryModel.aggregate([
      {
        $match: {
          delete: false,
          idPath: {
            $regex: req.body.filterCondition.category,
            $options: "i",
          },
        },
      },
    ]);
    const total = await Products.aggregate([
      {
        $addFields: {
          rate: { $avg: "$review.rate" },
        },
      },
      {
        $addFields: {
          rate: {
            $ifNull: ["$rate", 0],
          },
        },
      },
      {
        $match: {
          $and: [
            { delete: false },
            {
              category: {
                $in:
                  idPath &&
                  idPath.map((item) => mongoose.Types.ObjectId(item._id)),
              },
            },
            // favourite:req.body.filterCondition.favourite,
            {
              priceoff: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
            },
            {
              date: {
                $gte: new Date(req.body.filterCondition.sDate),
                $lte: new Date(req.body.filterCondition.today),
              },
            },
            {
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
            },
            favourite == true
              ? {
                  _id: {
                    $in: favouriteProductId?.favourite.map((item) =>
                      mongoose.Types.ObjectId(item)
                    ),
                  },
                }
              : {},
            {
              rate: {
                $gte: 1 * req.body.filterCondition.rate[0],
                $lte: 1 * req.body.filterCondition.rate[1],
              },
            },
          ],
        },
      },
      {
        $count: "total",
      },
    ]);

    const allDb = await Products.aggregate([
      {
        $addFields: {
          rate: { $avg: "$review.rate" },
        },
      },
      {
        $addFields: {
          rate: {
            $ifNull: ["$rate", 0],
          },
        },
      },
      {
        $match: {
          $and: [
            { delete: false },
            {
              category: {
                $in:
                  idPath &&
                  idPath.map((item) => mongoose.Types.ObjectId(item._id)),
              },
            },
            {
              priceoff: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
            },
            {
              date: {
                $gte: new Date(req.body.filterCondition.sDate),
                $lte: new Date(req.body.filterCondition.today),
              },
            },
            {
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
            },
            favourite == true
              ? {
                  _id: {
                    $in: favouriteProductId?.favourite.map((item) =>
                      mongoose.Types.ObjectId(item)
                    ),
                  },
                }
              : {},
            {
              rate: {
                $gte: 1 * req.body.filterCondition.rate[0],
                $lte: 1 * req.body.filterCondition.rate[1],
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "productSales",
          localField: "_id",
          foreignField: "product",
          as: "history",
          pipeline: [{ $count: "totla" }],
        },
      },
      byOrder == "price"
        ? {
            $sort: {
              priceoff: -1,
            },
          }
        : byOrder == "popular"
        ? {
            $sort: {
              history: -1,
            },
          }
        : {
            $sort: {
              date: -1,
            },
          },
      {
        $skip: req.body.filterCondition.currentPage,
      },
      {
        $limit: req.body.filterCondition.perpage,
      },
    ]);
    res
      .status(200)
      .json({ message: "Success get all products!", total, allDb });
  } catch (error) {
    console.log(error);
  }
};

exports.getAProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    res.status(200).json({
      type: "success",
      message: "Get A product data successfully!",
      product: product,
    });
  } catch (err) {
    res.status(200).json({ type: "error", message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id).then(
      async (item) => {
        const userId = await item.review.filter((value) => {
          return toString(value.user) == toString(req.user._id);
        });
        if (userId.length)
          await item.update({
            $pull: {
              review: {
                user: req.user._id,
              },
            },
          });
        await item.update({
          $push: {
            review: {
              user: req.user._id,
              rate: req.body.rate,
              comment: req.body.comment,
            },
          },
        });
        res.status(200).json({
          type: "success",
          message: userId.length
            ? "Update review successfully!"
            : "Create review successfully!",
          product: await Products.findById(req.params.id),
        });
      }
    );
  } catch (err) {
    res.status(200).json({ type: "error", message: err.message });
  }
};
