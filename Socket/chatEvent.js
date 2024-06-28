const ChatPrivateModel = require("../Models/chatPrivateModel")
const GuestModel = require("../Models/guestModel")
const mongoose = require("mongoose");

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