const Cart = require("../Models/cartModel");
const Order = require("../Models/orderModel");

exports.getAllCarts = async (req, res) => {
    try {
        const { pn, ps, searchWord } = req.query.sendData;
        if (searchWord !== "") {
            const carts = await Cart.aggregate([
                {
                    $match: {
                        user: ObjectId(req.user._id)
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
                        quantity: "$products.quantity"
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
                    $unwind: {
                        path: "$category", preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        title: "$real_product.title",
                        files: "$real_product.files",
                        price: "$real_product.price",
                        quantity: "$quantity",
                        category: "$category.title"
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
                },
            ]);
            const length = carts.length;
            if (length === 0) { return res.status(404).json({ type: "error", message: "No products" }) }

            return res.status(200).json({
                type: "success",
                message: "success",
                result: carts.slice((pn - 1) * ps, pn * ps),
                length: length
            })
        }
        if (searchWord === "") {
        const carts = await Cart.aggregate([
            { $match: { user: ObjectId(req.user._id) } },
            { $project: { products: 1, } },
            { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },
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
                    quantity: "$products.quantity"
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
                $unwind: {
                    path: "$category", preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    title: "$real_product.title",
                    files: "$real_product.files",
                    price: "$real_product.price",
                    quantity: "$quantity",
                    category: "$category.title"
                }
            },
            {
                $addFields: {
                    totalPrice: {
                        $sum: { $multiply: ["$price", "$quantity"] },
                    }
                }
            },
        ]);
        const length = carts.length;
        if (length === 0) { return res.status(404).json({ type: "error", message: "No products" }) }

        return res.status(200).json({
            type: "success",
            message: "success",
            result: carts.slice((pn - 1) * ps, pn * ps),
            length: length
        })
        }
    } catch (err) {
        res.status(400).json({ type: "error", message: err.message })
    }
};

exports.deleteACart = async (req, res) => {
    const result = await Cart.findOneAndUpdate(
        { _id: ObjectId(req.user._id), 'products.product': ObjectId(req.params) },
        {
            $set: {
                'products.$.delete': true,
            }
        }
    )
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
                .then(res.json({ type: "success", message: "Success" }))
                .catch((err) => { res.status(500).json({ type: "error", message: err.message }) })
        } else {
            let result = await Cart.aggregate([
                {
                    $project: {
                        products: 1,

                    },
                },
                {
                    $unwind: {
                        path: "$products", preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        products_id: "$products._id",
                        products_product: "$products.product",
                        products_category: "$products.category",
                        products_price: "$products.price",
                        procucts_quaitity: "$products.quantity"
                    }
                }

            ])
            const result_one = result.filter((item) => {
                String(item.products_product) === String(req.body._id)
            })
            if (result_one.length = 0) {
                await Cart.updateOne(
                    { user: req.user._id },
                    {
                        $push: {
                            products: {
                                product: req.body._id,
                                quantity: req.body.quantity || 1,
                            }
                        }
                    }
                )
            } else {
                res.status(400).json({ type: "error", message: "Already exists in your Cart!" })
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
        await Cart.updateOne({ user: req.user._id }, { $set: { delete: true } })
    } catch (error) {
        res.json({ type: "error", message: error.message })
    }
};
