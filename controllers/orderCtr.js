const Order = require("../Models/orderModel");
const Sale = require("../Models/productSalesModel");

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
        const updatedOrder = await Order.findOneAndUpdate({ _id: req.params.id }, {
            $set: {
                permission: req.body.state
            }
        })
        if (req.body.state == -1) {
            const order = await Order.findById(req.params.id).populate({ path: "products.product" });
            order.products.map((item, key) => {
                const newSale = new Sale({
                    store: order.store,
                    person: order.user,
                    date: order.createdAt,
                    category:item.product.category,
                    product:item.product._id,
                    price:item.product.price,
                    sales_cnt:item.quantity,
                    delete:false
                })
                newSale.save()
            })
        }
        const orders = await Order.find().populate(
            { path: "user products.product store" }
        )
        res.status(200).json({ type: "success", message: "updated successfully!", orders: orders })
    } catch (err) {
        console.log(err.message)
    }
}