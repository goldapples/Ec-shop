const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const passport = require("passport");
const Category = require("../Models/categoryModel");
// const { default: message } = require("../../Admin/src/pages/messgae");



exports.createCategory = async (req, res) => {
  await Category.findOne({ title: req.body.title }).then(async (matched) => {
    if (matched) {
      return res.json({
        message: "Same category already exist!",
        type: 'success',
      });
    }
    const newCategory = new Category(req.body);
    await newCategory.save((err) => {
      if (err) {
        return res.status(500).json({type: 'error', message: err.message });
      } else {
        return res.status(200).json({
          type: 'success',
          message: "Create category successfully!",
        });
      }
    });
  });
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({delete: false}).sort({ updatedAt: -1 });
    return res.status(200).json({
      type: 'success',
      message: "Get all categories successfully!",
      categories: categories,
    });
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
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
        type: 'error',
        message: `No category with id: ${categoryId} exist!`,
      });
    } else {
      await Category.findOne({ title: req.body.title }).then(
        async (matched) => {
          if (matched) {
            if (matched._id == categoryId) {
              await Category.findByIdAndUpdate(
                categoryId,
                {
                  title: req.body.title,
                  description: req.body.description,
                },
              );
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

  const { id: categoryId } = req.params;
  try {
    const category = await Category.findByIdAndUpdate(categoryId, {delete: true});
    if (!category) {
      return res.status(404).json({
        type: 'error',
        message: `No category with id: ${categoryId} exist!`,
      });
    } else {
      return res.status(200).json({
        type: 'success',
        message: "Delete category successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};

exports.multiDeleteCategory = async (req, res) => {};
