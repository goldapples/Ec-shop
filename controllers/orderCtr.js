const Order = require("../Models/orderModel");

exports.getAll = async (req, res) => {
    try {
        const orders = await Order.find().populate(
            { path: "user products.product store" }
        )
        res.status(200).json({ type: "success", message: "Get all orders successfully!", orders: orders })
    } catch (err) {
        res.status(400).json({ type: "error", message: err.message });
    }
}

exports.setState = async (req, res) => {
    try {
        console.log(req.body.state, req.params.id)
        const updatedOrder = await Order.findOneAndUpdate({ _id: req.params.id }, {
            $set: {
                permission: req.body.state
            }
        })
        const orders = await Order.find().populate(
            { path: "user products.product store" }
        )
        res.status(200).json({ type: "success", message: "updated successfully!", orders:orders})
    } catch (err) {
        console.log(err.message)
    }
}