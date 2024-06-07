const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");

const productSaleSchema = new Schema(
  {
    
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store"
    },
    person: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    date: {
      type: Date,
      required: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category"
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Products"
    },
    price: {
      type: Number
    },
    sales_cnt: {
      type: Number,
      required: true,
    },
    delete: {
      type: Boolean,
      default: false
    },
  },
  modelOption("productSales")
);

module.exports =  model("ProductSales", productSaleSchema);
