
const Store = require("../Models/storeModel");


exports.createStore = async (req, res) => {
  await Store.findOne({ title: req.body.title }).then(async (matched) => {
    if (matched) {
      return res.json({
        message: "Same Store already exist!",
        type: 'success',
      });
    }
    const newStore = new Store(req.body);
    await newStore.save((err) => {
      if (err) {
        return res.status(500).json({type: 'error', message: err.message });
      } else {
        return res.status(200).json({
          type: 'success',
          message: "Create Store successfully!",
        });
      }
    });
  });
};

exports.getAllStores = async (req, res) => {
  try {
    const stores = await Store.find({delete: false}).populate({path: "store", select:"title"}).sort({ updatedAt: -1 });
    return res.status(200).json({
      type: 'success',
      message: "Get all stores successfully!",
      stores: stores,
    });
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};

exports.getAStore = async (req, res) => {

  try {
    const { id: StoreId } = req.params;
    const Store = await Store.findById(StoreId).populate("manager");

    if (!Store) {
      return res.status(404).josn({
        type: 'error',
        message: `No Store with id: ${StoreId}`,
      });
    } else {
      return res.status(200).json({
        type: 'success',
        message: "Get Store successfully",
        Store: Store,
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};

exports.editStore = async (req, res) => {

  const { id: storeId } = req.params;
  const store = await Store.findById(storeId);
  try {
    if (!store) {
      return res.status(404).json({
        type: 'error',
        message: `No Store with id: ${storeId} exist!`,
      });
    } else {
      await Store.findOne({ title: req.body.title }).populate("manager").then(
        async (matched) => {
          if (matched) {
            if (matched._id == storeId) {
              await Store.findByIdAndUpdate(
                storeId,
                {
                  description: req.body.description,
                },
              );
              return res.status(200).json({
                type: 'success',  
                message: "Store updated successfully!",
              });
            } else {
              return res.json({
                type: 'error',
                message: "Same Store already exist!",
                error: true,
              });
            }
          } else {
            await Store.findByIdAndUpdate(
              storeId,
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
              type: 'success',
              message: "Store updated successfully!",
            });
          }
        }
      );
    }
  } catch (err) {
    return res.status(500).json({
      type: 'error',  
      message: err.message,
    });
  }
};

exports.deleteStore = async (req, res) => {
  const { id: storeId } = req.params;
  try {
    const store = await Store.findByIdAndUpdate(storeId, {delete: true});
    if (!store) {
      return res.status(404).json({
        type: 'error',
        message: `No Store with id: ${storeId} exist!`,
      });
    } else {
      return res.status(200).json({
        type: 'success',
        message: "Delete Store successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};

exports.multiDeleteStore = async (req, res) => {};
