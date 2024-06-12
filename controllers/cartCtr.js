const Cart = require("../Models/cartModel");
const Order = require("../Models/orderModel");
const mongoose = require("mongoose")

exports.getAllCarts = async (req, res) => {
    try {
        const { pn, ps, searchWord } = req.body;
        const carts = await Cart.aggregate([
            {
                $match: {
                    user: mongoose.Types.ObjectId(req.params?.id)
                }
            },
            {
                $project: {
                    products: 1,
                }
            },
            {
                $unwind: {
                    path: "$products", preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "products.delete": false
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: "products.product",
                    foreignField: "_id",
                    as: "product",
                }
            },
            {
                $project: {
                    real_product: "$product",
                    quantity: "$products.quantity",
                }
            },
            {
                $unwind: {
                    path: "$real_product", preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'category',
                    localField: "real_product.category",
                    foreignField: "_id",
                    as: "category",
                }
            },
            {
                $project: {
                    title: "$real_product.title",
                    files: "$real_product.files",
                    price: "$real_product.price",
                    quantity: "$quantity",
                    category: "$category.title",
                    id: "$real_product._id"
                }
            },
            {
                $addFields: {
                    totalPrice: {
                        $sum: { $multiply: ["$price", "$quantity"] },
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { title: { $regex: searchWord, $options: "i" } },
                        { category: { $regex: searchWord, $options: "i" } }
                    ]
                }
            }
        ]);
        console.log(carts)
        let length = carts.length;
        if (length == 0) { return res.status(200).json({ type: "error", result: [], message: "No Products!" }) }
        let sendCart = carts.slice((pn - 1) * ps, pn * ps);
        let sum = 0;
        for (i = 0; i < length; i++) {
            sum += carts[i].totalPrice
        }
        return res.status(200).json({
            type: "success",
            message: "success",
            result: sendCart,
            length: length,
            totalPrice: sum
        })
    } catch (err) {
        res.status(400).json({ type: "error", message: err.message })
    }
};

exports.deleteACart = async (req, res) => {
    const result = await Cart.updateOne(
        { user: req.user._id, 'products.product': req.params?.id },
        {
            $set: {
                'products.$.delete': true,
            }
        }
    )
    res.status(200).json({ type: "success", message: "Removed successfully!" })
};

exports.addAProduct = async (req, res) => {
    try {
        const user = await Cart.findOne({ user: req.user._id });
        if (!user) {
            const newCart = new Cart({
                user: req.user._id,
                products: [{
                    product: req.body._id,
                    quantity: req.body.quantity || 1,
                }],
            })
            newCart.save()
                .then(res.status(200).json({ type: "success", message: "Success" }))
                .catch((err) => { res.status(500).json({ type: "error", message: err.message }) })
        } else {
            const product = await Cart.aggregate([
                { $match: { user: mongoose.Types.ObjectId(req.user._id) } },
                { $project: { products: 1 } }
            ])
            const products = product[0].products.filter((item) => String(item.product) === String(req.body._id)).filter((item => item.delete === true))
            if (products.length > 0) {
                const updatedProduct = await Cart.updateOne(
                    { user: req.user._id, 'products.product': req.body._id },
                    {
                        $set: {
                            'products.$.delete': false,
                        }
                    }
                )
                res.status(200).json({ type: "error", message: "Added successfully!" })
            } else {
                const product = await Cart.findOne({ user: mongoose.Types.ObjectId(req.user._id), "products.product": mongoose.Types.ObjectId(req.body._id), "products.delete": false })
                if (product) {
                    if (req.body.quantity >= 1) {
                        await Cart.updateOne(
                            { user: req.user._id, 'products.product': req.body._id },
                            {
                                $set: {
                                    'products.$.quantity': req.body.quantity,
                                }
                            }
                        )
                        res.status(200).json({ type: "success", message: "Amount changed successfully!" })
                    } else {
                        res.status(400).json({ type: "error", message: "Already exists in your Cart!" })
                    }

                } else {
                    const addedProduct = await Cart.updateOne(
                        { user: req.user._id },
                        {
                            $push: {
                                products: {
                                    product: req.body._id,
                                    quantity: req.body.quantity
                                }
                            }
                        }
                    )
                    console.log(addedProduct)
                    res.status(200).json({ type: "success", message: "Added successfully" })
                }
            }
        }
    } catch (error) {
        res.json({ type: "error", message: error.message });
    }
};

exports.addShipping = async (req, res) => {
    try {
        let receivedAdrs = req.body.defaultShippingAddress;
        const user = await Cart.findOne({ user: req.user._id });
        if (user) {
            const shipping = await Cart.updateOne(
                { user: req.user._id },
                { $set: { shipping: receivedAdrs } }
            )
        }
        res.status(200).json({ type: "success", message: "Shipping Address added successfully!" })
    }
    catch (error) {
        res.json({ type: "error", message: error.message })
    }
};

exports.addWallet = async (req, res) => {
    try {
        let receivedWallet = req.body.sendAddress;
        const user = await Cart.findOne({ user: req.user._id });
        if (user) {
            const wallet = await Cart.updateOne({ user: req.user._id }, { $set: { wallet: receivedWallet } })
        }
        const newOrder = await new Order({
            user: user.user,
            products: user.products,
            shipping: user.shipping,
            store: user.store,
            wallet: user.wallet
        })
        await newOrder.save()
            .then(res.json({ type: "success", message: "Success" }))
            .catch((err) => { res.status(500).json({ type: "error", message: err.message }) });
        await Cart.findOneAndDelete({ user: req.user._id })
    } catch (error) {
        res.json({ type: "error", message: error.message })
    }
};
