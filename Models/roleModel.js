const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");

const roleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'user'
    },
    detail: {
      type: String,
      required: true,
    },
    delete: {
      type: Boolean,
      default: false
    },
  },
  modelOption("role")
);

module.exports =  model("Role", roleSchema);
