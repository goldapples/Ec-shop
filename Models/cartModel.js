const { Schema, model } = require("mongoose");
const { modelOption } = require("./config");
const cartSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "Guest"
        },
        products: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: "Products"
            },
            quantity: {
                type: Number,
            },
            delete:{
                type:Boolean,
                default:false
            }
        }],
        shipping: [{
            country: {
                type: String
            },
            prefecture: {
                type: String
            },
            city: {
                type: String
            },
            apartment:{
                type:String
            },
            roomNumber: {
                type: Number
            }
        }],
        store:{
            type: Schema.Types.ObjectId,
            ref: "Store"
        },
        wallet: {
            type: String
        },
        delete: {
            type: Boolean,
            default: false
        }
    },
    modelOption("cart")
);

module.exports = model("Cart", cartSchema);
