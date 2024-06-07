
const Role = require("../Models/roleModel");


exports.createRole = async (req, res) => {
  await Role.findOne({ title: req.body.title }).then(async (matched) => {
    if (matched) {
      return res.json({
        message: "Same Role already exist!",
        type: 'success',
      });
    }
    const newRole = new Role({
      title: req.body.title,
      detail: req.body.detail,
    });
    await newRole.save((err) => {
      if (err) {
        return res.status(500).json({ type: 'error', message: err.message });
      } else {
        return res.status(200).json({
          type: 'success',
          message: "Create Role successfully!",
        });
      }
    });
  });
};

exports.getAllRole = async (req, res) => {
  try {
    const roles = await Role.find({ delete: false }).sort({ updatedAt: -1 });
    return res.status(200).json({
      type: 'success',
      message: "Get all roles successfully!",
      roles: roles,
    });
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};

exports.getARole = async (req, res) => {

  try {
    const { id: roleId } = req.params;
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).josn({
        type: 'error',
        message: `No role with id: ${roleId}`,
      });
    } else {
      return res.status(200).json({
        type: 'success',
        message: "Get role successfully",
        role: role,
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};

exports.editRole = async (req, res) => {

  const { id: roleId } = req.params;
  const role = await Role.findById(roleId);
  try {
    if (!role) {
      return res.status(404).json({
        type: 'error',
        message: `No Role with id: ${roleId} exist!`,
      });
    } else {
      await Role.findOne({ title: req.body.title }).then(
        async (matched) => {
          if (matched) {
            if (matched._id == roleId) {
              await Role.findByIdAndUpdate(
                roleId,
                {
                  description: req.body.description,
                },
              );
              return res.status(200).json({
                type: 'success',
                message: "Role updated successfully!",
              });
            } else {
              return res.json({
                type: 'error',
                message: "Same Role already exist!",
                error: true,
              });
            }
          } else {
            await Role.findByIdAndUpdate(
              roleId,
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
              message: "Role updated successfully!",
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

exports.deleteRole = async (req, res) => {
  console.log("params",req.params);
  try {
    let { id: roleId } = req.params;
    const role = await Role.findByIdAndUpdate(roleId, { delete: true });
    if (!role) {
      return res.status(404).json({
        type: 'error',
        message: `No role with id: ${roleId} exist!`,
      });
    } else {
      return res.status(200).json({
        type: 'success',
        message: "Delete a role successfully!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      type: 'error',
      message: error.message,
    });
  }
};