const Products = require("../Models/productsModel");
const Role = require("../Models/roleModel");
const File = require("../Models/fileModel");

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
    console.log("errr");
    return await res
      .status(500)
      .json({ type: "error", message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
      const allDb = await Products.aggregate([
        {
          $match: {
            delete: false
          }
        },
        {
          $sort: {
            date: -1
          }
        },
        {
          $limit: 3
        }
        
      ])

      res.status(200).json({ type: "success", allDb });
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
