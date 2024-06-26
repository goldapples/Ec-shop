const mongoose = require("mongoose");
const RoomChatting = require("../Models/guestChatting/RoomChattingModel");
const GeneralChatting = require("../Models/guestChatting/GeneralChattingModel");
const UserModel = require("../Models/guestModel");

exports.getAllRooms = async (io, socket, data) => {
  const res = await RoomChatting.find({ delete: false });
  socket.emit("S2C_GET_ALL_GROUP", { res });
};

exports.newCreateRoom = async (io, socket, data) => {
  try {
    const room = await RoomChatting.find({
      delete: false,
      title: data.title,
    });

    if (room.length) {
      const res = { succes: false, message: "Already same title exited!" };
      socket.emit("S2C_CREATE_NEW_GROUP", { res });
    } else {
      const roomChatting = await new RoomChatting({
        title: data.title,
        description: data.description,
        creator: data.creator,
        date: data.date,
      });
      await roomChatting.save();
      const rooms = await RoomChatting.find({ delete: false });
      const res = { succes: true, message: "Success!", rooms };
      socket.emit("S2C_CREATE_NEW_GROUP", { res });
    }
  } catch (error) {
    console.log(error);
  }
};

exports.editeRoom = async (io, socket, data) => {
  try {
    const room = await RoomChatting.findOne({
      delete: false,
      _id: data.editGroupID,
    }).then(async (item) => {
      await item.update({
        title: data.title,
        description: data.description,
        creator: data.creator,
        date: data.date,
      });
    });
    const rooms = await RoomChatting.find({ delete: false });
    const res = { succes: true, message: "Success!", rooms };
    socket.emit("S2C_EDITE_GROUP", { res });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteRoom = async (io, socket, data) => {
  await RoomChatting.findOne({ _id: data.id }).then(async (item) => {
    await item.update({ delete: true });
  });
  const rooms = await RoomChatting.find({ delete: false });
  const res = { succes: true, message: "Success!", rooms };
  socket.emit("S2C_DELETE_GROUP", { res });
};

exports.getAllChatUser = async (io, socket, data) => {
  const { id: id } = data;
  try {
    const allUser = await UserModel.find({
      delete: false,
      _id: { $ne: id },
    }).sort({ firstName: -1 });

    socket.emit("S2C_GET_ALL_CHAT_USER", {
      message: "Get all users successfully!",
      users: allUser,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllRoomChatUser = async (io, socket, data) => {
  const { id: id } = data;
  try {
    const roomAllUser = await RoomChatting.aggregate([
      {
        $lookup: {
          from: "guest",
          localField: "users",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $lookup: {
          from: "guest",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId(id),
        },
      },
      {
        $project: {
          users: 1,
          creator: 1,
          title: 1,
          _id: 0,
        },
      },
    ]);
    socket.emit("S2C_GET_ALL_ROOM_CHAT_USER", {
      message: "Get all users successfully!",
      users: roomAllUser,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.addGroup = async (io, socket, data) => {
  const userId = data.user;
  const roomId = data.id;

  try {
    const user = await RoomChatting.find({ users: userId, _id: roomId });
    if (user.length === 0) {
      const room = await RoomChatting.findOne({ _id: roomId }).then(
        async (item) => {
          await item.update({
            $push: {
              users: userId,
            },
          });
        }
      );
      const roomAllUser = await RoomChatting.aggregate([
        {
          $lookup: {
            from: "guest",
            localField: "users",
            foreignField: "_id",
            as: "users",
          },
        },
        {
          $lookup: {
            from: "guest",
            localField: "creator",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $match: {
            _id: mongoose.Types.ObjectId(roomId),
          },
        },
        {
          $project: {
            users: 1,
            creator: 1,
            title: 1,
            _id: 0,
          },
        },
      ]);
      socket.emit("S2C_ADD_GROUP", {
        succes: true,
        message: "You are entered succeefully!",
        roomAllUser: roomAllUser,
      });
    } else {
      socket.emit("S2C_ADD_GROUP", {
        succes: false,
        message: "You are already entered!",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.newPublicMessage = async (io, socket, data) => {
  const generalChatting = new GeneralChatting({
    senderId: data.senderId,
    content: data.content,
  });
  generalChatting.save();
  const res = await GeneralChatting.aggregate([
    {
      $lookup: {
        from: "guest",
        localField: "senderId",
        foreignField: "_id",
        as: "senderId",
      },
    },
    {
      $match: {
        delete: false,
      },
    },
  ]);

  socket.broadcast.emit("S2C_NEW_PUBLIC_MESSAGE", { res });
  socket.emit("S2C_NEW_PUBLIC_MESSAGE", { res });
};

exports.getAllPublicMessage = async (io, socket, data) => {
  const res = await GeneralChatting.aggregate([
    {
      $lookup: {
        from: "guest",
        localField: "senderId",
        foreignField: "_id",
        as: "senderId",
      },
    },
    {
      $match: {
        delete: false,
      },
    },
  ]);

  socket.emit("S2C_NEW_PUBLIC_MESSAGE", { res });
};

exports.newRoomMessage = async (io, socket, data) => {
  const { content, senderId, roomId } = data;
  const roomChatting = await RoomChatting.findOne({ _id: roomId }).then(
    async (item) => {
      await item.update({
        $push: {
          messages: {
            content: content,
            senderId: senderId,
          },
        },
      });
    }
  );
  const res = await RoomChatting.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(roomId),
      },
    },
    {
      $project: {
        messages: 1,
      },
    },
    {
      $match: {
        "messages.delete": false,
      },
    },
    {
      $unwind: {
        path: "$messages",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        content: "$messages.content",
        senderId: "$messages.senderId",
        date: "$messages.date",
      },
    },
    {
      $lookup: {
        from: "guest",
        localField: "senderId",
        foreignField: "_id",
        as: "senderId",
      },
    },
  ]);

  socket.broadcast.emit("S2C_NEW_ROOM_MESSAGE", { res });
  socket.emit("S2C_NEW_ROOM_MESSAGE", { res });
};


exports.getAllRoomMessage = async (io, socket, data) => {
  const { selectRoom: roomId } = data;
  try {
    const res = await RoomChatting.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(roomId),
        },
      },
      {
        $project: {
          messages: 1,
        },
      },
      {
        $match: {
          "messages.delete": false,
        },
      },
      {
        $unwind: {
          path: "$messages",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          content: "$messages.content",
          senderId: "$messages.senderId",
          date: "$messages.date",
        },
      },
      {
        $lookup: {
          from: "guest",
          localField: "senderId",
          foreignField: "_id",
          as: "senderId",
        },
      },
    ]);

    socket.broadcast.emit("S2C_NEW_ROOM_MESSAGE", { res });
    socket.emit("S2C_NEW_ROOM_MESSAGE", { res });
  } catch (error) {
    console.log(error);
  }
};