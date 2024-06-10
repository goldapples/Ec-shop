const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const categorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    idPath: { type: String },
    description: {
      type: String,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  modelOption("category")
);

module.exports = mongoose.model("Category", categorySchema);

const resetCategory = async () => {
  const CategoryModel = model("Category");
  var ancestorCategory = await CategoryModel.find({ title: "All" }, "");
  var ancestor = new CategoryModel({
    title: "All",
  });
  if (!ancestorCategory[0]) ancestor.save();
};

resetCategory();
