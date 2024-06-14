const ChatPublicModel = require("../Models/chatPublicModel");
const ChatPrivateModel = require("../Models/chatPrivateModel");

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
              ? pages - 1
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
  console.log("okay");
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
  console.log("num-->", num);
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
      ]);

      console.log("db-->", db);
      console.log("dblength-->", db.length);
      res.json({ all: db });
    } catch (error) {
      console.log(error);
    }
  } else {
    res.json({ all: [] });
  }
};
