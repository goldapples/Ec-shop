const ChatPrivateModel = require("../Models/chatPrivateModel")
const GuestModel = require("../Models/guestModel")
const mongoose = require("mongoose");
const RoomChatting = require("../Models/guestChatting/RoomChattingModel");
const GeneralChatting = require("../Models/guestChatting/GeneralChattingModel");
const UserModel = require("../Models/guestModel");

let userList = {};
let loginUserList = [];
exports.getAllDmMessage = async (io, socket, data) => {
    try {
        const chatData = await ChatPrivateModel.find({
            $or: [{ sender: data.user, receiver: data.dmUser },
            { receiver: data.user, sender: data.dmUser }]
        }).populate({
            path: "sender receiver",
            select: "avartar name birthday phoneNumber"
        })
        socket.emit("C2S_GET_ALL_DM_MESSAGE", chatData);
    } catch (err) {
        console.log(err)
    }
}

exports.addDm = async (io, socket, data) => {
    try {
        const guest = await GuestModel.findById(data.user);
        const includes = guest.dmUsers.filter(item => String(item.user) === String(data.dmUser));
        if (includes.length === 0) {
            const added = await GuestModel.findOneAndUpdate({ _id: data.user }, {
                $push: {
                    dmUsers: { user: data.dmUser }
                }
            })
            const Hello = await new ChatPrivateModel({
                content: "Hello!",
                sender: data.user,
                receiver: data.dmUser
            })
            Hello.save()
        }
        const chatData = await ChatPrivateModel.find({
            $or: [{ sender: data.user, receiver: data.dmUser },
            { receiver: data.user, sender: data.dmUser }]
        }).populate({
            path: "sender receiver",
            select: "avartar name birthday phoneNumber"
        });
        const sender = await GuestModel.findOne({ _id: data.user }).populate({ path: "dmUsers.user" })
        const receiver = await GuestModel.findOne({ _id: data.dmUser }).populate({ path: "dmUsers.user" })
        let conUsersOfSender = sender.dmUsers
        let conUsersOfReceiver = receiver.dmUsers
        socket.emit("C2S_ADD_DM" + data.user, { chatData: chatData, conUsers: conUsersOfSender })
        for (key in loginUserList) {
            if (key === data.dmUser) {
                userList[key].emit("C2S_ADD_DM", { chatData: chatData, conUsers: conUsersOfReceiver, dmUser:data.dmUser })
            }
        }
    } catch (err) {
        console.log(err);
    }
}

exports.auth = async (io, socket, data) => {
    if (data.connect) {
        if (!loginUserList.includes(data.connect)) {
            loginUserList.push(data.connect)
        }
        userList[data.connect] = socket;
    } else if (data.disconnect) {
        loginUserList.map((item, key) => {
            if (item === data.disconnect) {
                loginUserList.splice(key, 1)
            }
        })
        userList[data.connect] = socket;
    }
    for (const key in userList) {
        userList[key].emit("S2C_LOGINED_USERS", loginUserList)
    }
}

exports.newDM = async (io, socket, data) => {
    try {
        const newMsg = await ChatPrivateModel({
            content: data.content,
            sender: data.sender,
            receiver: data.receiver,
            date: data.date
        })
        await newMsg.save()
        const newChat = await ChatPrivateModel.find({
            _id: newMsg._id
        }).populate({
            path: "sender receiver",
            select: "avartar name birthday phoneNumber"
        });
        for (let key in loginUserList) {
            if (key === data.receiver) {
                userList[key].emit("S2C_NEW_DM_MESSAGE", newChat)
            }
        }
        socket.emit("S2C_NEW_DM_MESSAGE" + newMsg.sender, newChat)
    } catch (err) {
        console.log(err)
    }
}

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
      socket.broadcast.emit("S2C_CREATE_NEW_GROUP", { res });
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
    }).sort({ name: -1 });

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
  const generalChatting = await new GeneralChatting({
    senderId: data.senderId,
    content: data.content,
  });
  await generalChatting.save();
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
        _id: generalChatting._id,
      },
    },
  ]);
  socket.broadcast.emit("S2C_NEW_MESSAGE", { res, roomId: "general" });
  socket.emit("S2C_NEW_MESSAGE", { res, roomId: "general" });
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
  socket.emit("S2C_ALL_PUBLIC_MESSAGE", { res, roomId: "general" });
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
  const mes = await RoomChatting.aggregate([
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
      $unwind: {
        path: "$messages",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        content: "$messages.content",
        senderId: "$messages.senderId",
        delete: "$messages.delete",
        date: "$messages.date",
      },
    },
    {
      $match : {
        senderId:mongoose.Types.ObjectId(senderId)
      }
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
  const res = [mes.pop()];
  socket.broadcast.emit("S2C_NEW_MESSAGE", { res, roomId: roomId });
  socket.emit("S2C_NEW_MESSAGE", { res, roomId: roomId });
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
    socket.emit("S2C_ALL_ROOM_MESSAGE", { res, roomId: roomId });
  } catch (error) {
    console.log(error);
  }
};

exports.addContact = async (io, socket, data) => {
  const userId = data.user;
  const friend = data.friend;
  try {
    const user = await UserModel.find({ _id: userId, friends: friend });
    if (user.length === 0) {
      const room = await UserModel.findOne({ _id: userId }).then(
        async (item) => {
          await item.update({
            $push: {
              friends: friend,
            },
          });
        }
      );
      const AllFriend = await UserModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "guest",
            localField: "friends",
            foreignField: "_id",
            as: "friends",
          },
        },
      ]);
      socket.emit("S2C_ADD_CONTACT", {
        succes: true,
        message: "You add succeefully!",
        AllFriend: AllFriend[0].friends,
      });
    } else {
      socket.emit("S2C_ADD_CONTACT", {
        succes: false,
        message: "Already exited!",
      });
    }
  } catch (err) {
    console.log(err);
  }
};
