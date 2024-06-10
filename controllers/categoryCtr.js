const Category = require("../Models/categoryModel");
// const { default: message } = require("../../Admin/src/pages/messgae");

exports.createCategory = async (req, res) => {
  try {
    const firstCategory = {};
    firstCategory.title = req.body.firstCategory;
    const firstItem = new Category(firstCategory);
    firstItem.idPath = firstItem?._id + ".";

    await firstItem.save(async (err) => {
      if (err) throw err;
      else {
        res.status(201).json({
          mes: "The first category is created succesfully.",
          data: firstItem,
        });
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.newChildrenCategory = async (req, res) => {
  try {
    const { parentId, updateId } = req.body;
    if (updateId) {
      const uGroup = await Category.findByIdAndUpdate(updateId, req.body, {
        new: true,
        runValidators: true,
      });
      if (!uGroup)
        res.status(400).json({ message: `No group with id: ${updateId}` });
      else
        res.status(202).json({
          message: `Group with id: ${updateId} updated successfully.`,
          resulut: uGroup,
        });
    } else {
      const pGroup = await Category.findOne({ _id: parentId });
      if (!pGroup)
        return res.status(400).json({ message: "No selected parentid." });
      const nGroup = new Category(req.body);
      nGroup.idPath = pGroup?.idPath + `${nGroup._id}.`;
      await nGroup.save((err) => {
        if (err) throw err;
        else
          res.status(201).json({
            message: "Create a new group successfully.",
            resulut: nGroup,
          });
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ delete: false });
    res.status(200).json({
      message: "All categories are catched successfully",
      type: "success",
      data: categories,
    });
  } catch (err) {
    res.status(400).json({ message: res.message });
  }
};

exports.getACategory = async (req, res) => {
  console.log(req.params, "url");

  try {
    const { id: categoryId } = req.params;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).josn({
        message: `No category with id: ${categoryId}`,
      });
    } else {
      return res.status(200).json({
        message: "Get category successfully",
        category: category,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.editCategory = async (req, res) => {
  const { id: categoryId } = req.params;
  const category = await Category.findById(categoryId);
  try {
    if (!category) {
      return res.status(404).json({
        type: "error",
        message: `No category with id: ${categoryId} exist!`,
      });
    } else {
      await Category.findOne({ title: req.body.title }).then(
        async (matched) => {
          if (matched) {
            if (matched._id == categoryId) {
              await Category.findByIdAndUpdate(categoryId, {
                title: req.body.title,
                description: req.body.description,
              });
              return res.status(200).json({
                message: "Category updated successfully!",
              });
            } else {
              return res.json({
                message: "Same category already exist!",
                error: true,
              });
            }
          } else {
            await Category.findByIdAndUpdate(
              categoryId,
              {
                title: req.body.title,
                description: req.body.description,
              },
              {
                new: true,
                runValidators: true,
              }
            );
            return res.status(200).json({
              message: "Category updated successfully!",
            });
          }
        }
      );
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.query;

    await Category.updateMany({ _id: { $in: id } }, { $set: { delete: true } });

    res.status(200).send({
      tyep: "success",
      message: "Deleted",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.multiDeleteCategory = async (req, res) => {};
