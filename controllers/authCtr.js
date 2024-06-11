const User = require("../Models/userModel");
const Guest = require("../Models/guestModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const passport = require("passport");

exports.register = async (req, res) => {
  console.log('test')
  try {
    if (req.body.guest) {
      await Guest.findOne({ email: req.body.email }).then(async (user) => {
        if (user) {
          return await res
            .status(500)
            .json({ type: "error", message: "You have already registered" });
        }
        const newUser = new Guest({
          email: req.body.email,
          name: req.body.name,
          password: req.body.password,
          avartar: req.body?.files || [],
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(req.body.password, salt);
        newUser
          .save()
          .then((user) => res.json({ type: "success", message: "Success" }))
          .catch((err) =>
            res.status(500).json({ type: "error", message: err.message })
          );
      });
    } else {
      await User.findOne({ email: req.body.email }).then(async (user) => {
        if (user) {
          return await res
            .status(500)
            .json({ type: "error", message: "You have already registered" });
        }
        const newUser = new User({
          email: req.body.email,
          name: req.body.name,
          password: req.body.password,
          avartar: req.body?.files || [],
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(req.body.password, salt);
        newUser
          .save()
          .then((user) => res.json({ type: "success", message: "Success" }))
          .catch((err) =>
            res.status(500).json({ type: "error", message: err.message })
          );
      });
    }
  } catch (error) {
    return await res
      .status(500)
      .json({ type: "error", message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    if (req.body.guest) {
      await Guest.findOne({ email: req.body.email }).then(async (user) => {
        if (!user) {
          return await res
            .status(400)
            .json({ type: "error", message: "You are not registered" });
        }
        //password hash
        bcrypt
          .compare(req.body.password, user.password)
          .then(async (matched) => {
            if (!matched) {
              return res
                .status(500)
                .json({ type: "error", message: "Password incorrect" });
            }
            const payload = {
              id: user._id,
              email: user.email,
              name: user.name,
              password: user.password,
              avatar: user.avatar,
              guest:true
            };
            jwt.sign(
              payload,
              config.secretOrKey,
              { expiresIn: config.expireIn },
              (err, token) => {
                if (err)
                  return res
                    .json(500)
                    .json({ type: "error", message: err.message });
                res.status(200).json({
                  type: "success",
                  message: "Success",
                  token: "Bearer " + token,
                  user: user,
                });
              }
            );
          });
      });
    } else {
      await User.findOne({ email: req.body.email })
        .populate("role")
        .then(async (user) => {
          if (!user) {
            return await res
              .status(400)
              .json({ type: "error", message: "You are not registered" });
          }
          if (!user.allow) {
            return res
              .status(500)
              .json({ type: "error", message: "You are not allowed!" });
          }

          // find categories and stores with role

          //password hash
          bcrypt
            .compare(req.body.password, user.password)
            .then(async (matched) => {
              if (!matched) {
                return res
                  .status(500)
                  .json({ type: "error", message: "Password incorrect" });
              }
              const payload = {
                id: user._id,
                email: user.email,
                name: user.name,
                password: user.password,
                avatar: user.avatar,
                role: user?.role?.title,
              };
              jwt.sign(
                payload,
                config.secretOrKey,
                { expiresIn: config.expireIn },
                (err, token) => {
                  if (err)
                    return res
                      .json(500)
                      .json({ type: "error", message: err.message });
                  res.status(200).json({
                    type: "success",
                    message: "Success",
                    token: "Bearer " + token,
                    user: user,
                  });
                }
              );
            });
        });
    }
  } catch (error) {
    return await res
      .status(500)
      .json({ type: "error", message: error.message });
  }
};
exports.tokenlogin = async (req, res) => {
  try {
    
    // guset mothod
    if (req.user.guest) {
      await Guest.findById({ _id: req.user.id })
    .then(async (user) => {
      if (!user) {
        return res
          .status(400)
          .json({ type: "error", message: "You are not registered" });
      }
      const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        password: user.password,
        avatar: user?.avatar,
        guest: true
      };
      jwt.sign(
        payload,
        config.secretOrKey,
        { expiresIn: config.expireIn },
        (err, token) => {
          if (err) return res.status(500).json({type: 'error', message: err.message });
          return res.json({
            type: 'success',
            message: "Success",
            token: "Bearer " + token,
            user: user,
          });
        }
      );
    });
    } 
    //manager method
    else {
      await User.findById({ _id: req.user.id })
    .populate({ path: "role store", select: "title" })
    .then(async (user) => {
      if (!user) {
        return res
          .status(400)
          .json({ type: "error", message: "You are not registered" });
      }
      if (!user.allow) {
        return res
          .status(400)
          .json({ type: "error", message: "You are not allowed" });
      }
      const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        password: user.password,
        avatar: user?.avatar,
        role: user?.role?.title,
      };
      jwt.sign(
        payload,
        config.secretOrKey,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) return res.status(500).json({type: 'error', message: err.message });
          return res.json({
            type: 'success',
            message: "Success",
            token: "Bearer " + token,
            user: user,
          });
        }
      );
    });
    }
  } catch (error) {
    return res.json({type: 'error', message: error.message})
  }
};
// exports.tokenlogin = async (req, res) => {
//   await User.findById({ _id: req.user.id })
//     .populate("role")
//     .then(async (user) => {
//       if (!user) {
//         return res
//           .status(400)
//           .json({ type: "error", message: "You are not registered" });
//       }
//       if (!user.allow) {
//         return res
//           .status(400)
//           .json({ type: "error", message: "You are not allowed" });
//       }
//       const payload = {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         password: user.password,
//         avatar: user?.avatar,
//         role: user?.role?.title,
//       };
//       jwt.sign(
//         payload,
//         config.secretOrKey,
//         { expiresIn: 3600 },
//         (err, token) => {
//           if (err) return res.json(500).json({ message: err.message });
//           return res.json({
//             message: "Success",
//             token: "Bearer " + token,
//             user: user,
//           });
//         }
//       );
//     });
// };
exports.getAll = async (req, res) => {
  try {
    const users = await User.find({ delete: false }).populate("role store");
    return res
      .status(200)
      .json({ type: "success", message: "Success!", users: users });
  } catch (error) {
    return res.json({ type: "error", message: error.message });
  }
};
exports.delete = async (req, res) => {
  try {
    let { id } = req.params;
    await User.findByIdAndUpdate(
      { _id, id },
      { $set: { delete: true } },
      (error, result) => {
        if (error) throw error;
        res.status(200).json({ message: error.message, result });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.update = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body._id });
    if (!user)
      return res.status(500).send({ message: "User does not exists." });

    if (req.body.newPassword !== "") {
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch)
        return res.status(500).json({ message: "Password is not correct!" });

      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.newPassword, salt);
    } else {
      req.body.password = user.password;

      await User.findByIdAndUpdate({ _id: req.body._id }, { ...req.body });
      const newUser = await User.findOne({ _id: req.body._id });
      return res.status(200).json({ message: "Successful!", data: newUser });
    }
  } catch (error) {
    return res.json({ message: error.message });
  }
};

exports.updateput = async (req, res) => {
  try {
    // const user = await User.findByIdAndUpdate({ _id: req.body._id }, req.body);
    // return res.status(200).json({ type: 'success', message: "Success!", user: user });

    const user = await User.findById({ _id: req.body._id }).then((db) => {
      db.role = req.body.role;
      db.store = req.body.stores;
      db.save().then(() => {
        return res
          .status(200)
          .json({ type: "success", message: "Success!", user: user });
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.allowCtrl = async (req, res) => {
  try {
    const { _id, status } = req.body;
    await User.updateOne({ _id }, { allow: status });
    res.status(200).json({ type: "success", message: "Allow Success" });
  } catch (err) {
    res.status(400).json({ type: "error", message: err.message });
  }
};

// logout for chatting online status
exports.logout = async (req, res) => {
  await User.findOne({ email: req.body.email }).then(async (user) => {
    await user?.updateOne({
      $set: { status: false },
    });

    const payload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      email: user.email,
      status: user.status,
    };
    res.json({
      success: "true",
      message: "Success",
      user: user,
    });
  });
};


exports.favourite = async (req, res) => {
  console.log(req.body, req.user)
  try {
    const favourite = await Guest.findOne({
      _id: req.user._id,
      favourite: { $elemMatch: { $eq: req.body.productId } },
    });
    if (favourite) {
      await Guest.update(
        { _id: req.user._id },
        { $pull: { favourite: req.body.productId } }
      );
      const favouriteList = await Guest.findOne({ _id: req.user._id,})
      res.status(200).json({
        message: `remove favourite successfully.`,favouriteList
      });
    } else {
      await Guest.update(
        { _id: req.user._id },
        { $push: { favourite: req.body.productId } }
      );
      const favouriteList = await Guest.findOne({ _id: req.user._id,})
      res.status(200).json({
        message: `add favourite product successfully.`, favouriteList
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};