const ChatPublicModel = require("../Models/chatPublicModel");
const ChatPrivateModel = require("../Models/chatPrivateModel");
const ChatGroupModel = require("../Models/chatGroupModel");
const GuestModel = require("../Models/guestModel");
const mongoose = require("mongoose");

exports.all = async (req, res) => {
  const PAGE_SIZE = 10;
  const totalCount = await ChatPublicModel.count(false);

  const pages = Math.ceil(totalCount / PAGE_SIZE);
  if (req.body?.page <= pages - 1 || req.body?.page === undefined) {
    ChatPublicModel.find()
      // .sort({ id: 1 })
      .skip(
        PAGE_SIZE *
        (pages - req.body?.page - 1 <= 0 || req.body?.page === undefined
          ? pages < 2
            ? 0
            : pages - 2
          : pages - req.body?.page - 2)
      )
      .limit(
        req.body?.page === undefined
          ? PAGE_SIZE + (totalCount % PAGE_SIZE)
          : PAGE_SIZE
      )
      .then((all) => {
        res.json({ all });
      });
  } else {
    res.json({ all: [] });
  }
};
exports.private = async (req, res) => {
  const PAGE_SIZE = 10;
  const num = await ChatPrivateModel.aggregate([
    {
      $match: {
        $or: [{ roomId: req.body.roomId1 }, { roomId: req.body.roomId2 }],
      },
    },
    {
      $project: {
        messages: 1,
      },
    },
    {
      $unwind: "$messages",
    },
    {
      $count: "totalCount",
    },
  ]);
  let totalCount = 10;
  num.length ? (totalCount = num[0]?.totalCount) : "";
  const pages = Math.ceil(totalCount / PAGE_SIZE);
  if (req.body?.page <= pages - 1 || req.body?.page === undefined) {
    try {
      const db = await ChatPrivateModel.aggregate([
        {
          $match: {
            $or: [{ roomId: req.body.roomId1 }, { roomId: req.body.roomId2 }],
          },
        },
        {
          $project: {
            messages: 1,
          },
        },
        {
          $unwind: "$messages",
        },
        {
          $match: {
            "messages.delete": false,
          },
        },
      ]);

      res.json({ all: db });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({ all: [] });
  }
};
// Get all groups
exports.group = async (req, res) => {
  await ChatGroupModel.find({
    $or: [
      { creator: req.body.groupId },
      { users: { $in: [req.body.groupId] } },
    ],
  }).then((group) =>
    // await ChatGroupModel.find({ creator: req.body.groupId }).then((group) =>
    res.json({ type: "success", message: "Success!", group: group })
  );
};
exports.groupChat = async (req, res) => {
  try {
    const db = await ChatPrivateModel.aggregate([
      {
        $match: {
          roomId: req.body.roomId,
        },
      },
      {
        $project: {
          messages: 1,
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $match: {
          "messages.delete": false,
        },
      },
    ]);

    res.json({ all: db });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await GuestModel.find({ _id: { $ne: req.user._id } });
    res.status(200).json({ type: "success", message: "Get all users successfully!", users: users })
  } catch (err) {
    console.log(err)
  }
};
exports.getAllConUsers = async (req, res) => {
  try {
    const user = await GuestModel.findOne({ _id: req.user._id }).populate({ path: "dmUsers.user" })
    let conUsers = user.dmUsers
    res.status(200).json({ type: "success", message: "Get all connected users successfully!", conUsers: conUsers })
  } catch (err) {
    console.log(err)
  }
}
