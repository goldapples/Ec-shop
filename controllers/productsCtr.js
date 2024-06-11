const Products = require("../Models/productsModel");
const Role = require("../Models/roleModel");
const File = require("../Models/fileModel");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const today = dayjs().$d;
const threeDay = dayjs().add(-3, "d").$d;

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
        updatedAt: -1,
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
  try {
    if (req.body.filterCondition.category != "All") {
      if (req.body.filterCondition.onlyNew == true) {
        const total = await Products.aggregate([
          {
            $match: {
              delete: false,
              category: mongoose.Types.ObjectId(
                req.body.filterCondition.category
              ),
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.uppperPrice,
              },
              date: {
                $gte: threeDay,
                $lte: today,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
            $count: "total",
          },
        ]);
        const allDb = await Products.aggregate([
          {
            $match: {
              delete: false,
              category: mongoose.Types.ObjectId(
                req.body.filterCondition.category
              ),
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              date: {
                $gte: threeDay,
                $lte: today,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
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
        res.status(200).json({ total, allDb });
      } else {
        console.log("req.body.filterCondition.category------->", req.body.filterCondition.category)
        const total = await Products.aggregate([
          {
            $match: {
              delete: false,
              category: mongoose.Types.ObjectId(
                req.body.filterCondition.category
              ),
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
            $count: "total",
          },
        ]);
        const allDb = await Products.aggregate([
          {
            $match: {
              delete: false,
              category: mongoose.Types.ObjectId(
                req.body.filterCondition.category
              ),
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
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
        res.status(200).json({ total, allDb });
      }
    } else {
      if (req.body.filterCondition.onlyNew == true) {
        const total = await Products.aggregate([
          {
            $match: {
              delete: false,
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              date: {
                $gte: threeDay,
                $lte: today,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
            $count: "total",
          },
        ]);
        const allDb = await Products.aggregate([
          {
            $match: {
              delete: false,
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              date: {
                $gte: threeDay,
                $lte: today,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
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

        res.status(200).json({ total, allDb });
      } else {
        const total = await Products.aggregate([
          {
            $match: {
              delete: false,
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },

              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
            $count: "total",
          },
        ]);
        const allDb = await Products.aggregate([
          {
            $match: {
              delete: false,
              // favourite:req.body.filterCondition.favourite,
              price: {
                $gte: 1 * req.body.filterCondition.lowerPrice,
                $lte: 1 * req.body.filterCondition.upperPrice,
              },
              title: {
                $regex: req.body.filterCondition.searchWord,
                $options: "i",
              },
              // rate: { $gte: 1*req.body.filterCondition.rate[1], $lte: 1*req.body.filterCondition.rate[0] },
            },
          },
          {
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

        res.status(200).json({ total, allDb });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getAProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    res.status(200).json({ type: "success", message: "Get A product data successfully!", product: product });
  } catch (err) {
    res.status(200).json({type:"error", message:err.message})
  }
}
