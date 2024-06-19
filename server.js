const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const config = require("./config/config");
const { GlobSync } = require("glob");
const fs = require("fs");
const path = require("path");
const env = require("dotenv");
const ChatGroupModel = require("./Models/chatGroupModel");
const ChatPublicModel = require("./Models/chatPublicModel");
const ChatPrivateModel = require("./Models/chatPrivateModel");

const app = express();

//connect mongodb
const db = require("./config/config").MONGOURI;
mongoose
  .connect(db)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((error) => {
    console.log("err");
  });

//middlewares
app.use(cors(""));
env.config();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

//passport initialize
app.use(passport.initialize());

// fileUpload
app.use(fileUpload());
const PORT = process.env.PORT || 5000;

//require models
const models = new GlobSync("./Models/*Model.js");
models.found.forEach((model) => {
  require(model);
});

//require routers
const routes = new GlobSync("./routes/*Router.js");
routes.found.forEach((router) =>
  app.use(process.env.API_PREFIX, require(router))
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Connetting Socket
const io = require("socket.io")(7002);

io.on("connection", (socket) => {
  console.log("Socket server is running on 7002 port");
  // Private messages
  const id = socket.handshake.query.id;
  socket.join(id);
  // Private messages Save
  socket.on(
    "PRIVATE_SEND_MESSAGE",
    async ({ recipients, text, roomId1, roomId2 }) => {
      const roomFlag = await ChatPrivateModel.aggregate([
        {
          $match: {
            delete: false,
            $or: [{ roomId: roomId1 }, { roomId: roomId2 }],
          },
        },
      ]);
      if (roomFlag.length === 0) {
        const newMsg = new ChatPrivateModel({
          recipients: recipients,
          roomId: roomId1,
          messages: [
            {
              receiveId: text.receiveId,
              userId: text.userId,
              chatMsg: text.chatMsg,
              sentTime: text.sentTime,
              sendDate: text.sendDate,
            },
          ],
          private: text.private,
        });
        newMsg
          .save()
          .then((msg) => {
            recipients.forEach((recipient) => {
              socket.broadcast
                .to(recipient)
                .emit("PRIVATE_RECEIVE_MESSAGE", ...msg.messages);
            });
          })
          .catch((err) => console.log(err));
      } else if (roomFlag.length > 0) {
        // Private messages Update
        await ChatPrivateModel.findOneAndUpdate(
          { $or: [{ roomId: roomId1 }, { roomId: roomId2 }] },
          {
            $push: {
              messages: {
                receiveId: text.receiveId,
                userId: text.userId,
                chatMsg: text.chatMsg,
                sentTime: text.sentTime,
                sendDate: text.sendDate,
              },
            },
          }
        ).then((msg) => {
          recipients.forEach((recipient) => {
            socket.broadcast.to(recipient).emit("PRIVATE_RECEIVE_MESSAGE", {
              receiveId: text.receiveId,
              userId: text.userId,
              chatMsg: text.chatMsg,
              sentTime: text.sentTime,
              sendDate: text.sendDate,
            });
          });
        });
      }
    }
  );
  // Private messages Delete
  socket.on(
    "PRIVATE_DELETE_MESSAGE",
    async ({ recipients, delId, roomId1, roomId2 }) => {
      await ChatPrivateModel.findOneAndUpdate(
        {
          $and: [
            { $or: [{ roomId: roomId1 }, { roomId: roomId2 }] },
            {
              "messages._id": mongoose.Types.ObjectId(delId),
            },
          ],
        },
        {
          $set: {
            "messages.$.delete": true,
          },
        },
        { new: false }
      );

      recipients.forEach((recipient) => {
        socket.broadcast.to(recipient).emit("PRIVATE_DELETE_MESSAGE", {
          delId,
        });
      });
    }
  );

  // Private messages Edit
  socket.on(
    "PRIVATE_EDIT_MESSAGE",
    async ({ recipients, editId, editVal, roomId1, roomId2 }) => {
      console.log("okay");
      await ChatPrivateModel.findOneAndUpdate(
        {
          $and: [
            { $or: [{ roomId: roomId1 }, { roomId: roomId2 }] },
            {
              "messages._id": mongoose.Types.ObjectId(editId),
            },
          ],
        },
        {
          $set: {
            "messages.$.chatMsg": editVal,
          },
        },
        { new: false }
      ).then(async () => {
        recipients.forEach((recipient) => {
          socket.broadcast
            .to(recipient)
            .emit("PRIVATE_EDIT_MESSAGE", { editId, editVal });
        });
      });
    }
  );

  //  Products sales alret
  socket.on("SALES_ALERT", (data) => {
    console.log(data);
    socket.emit("SEND_SALES", data);
    socket.broadcast.emit("SEND_SALES", data);
  });
  // Public messages
  socket.on("SEND_MESSAGE", (data) => {
    const newMsg = new ChatPublicModel({
      userId: data.userId,
      chatMsg: data.chatMsg,
      roomId: data.roomId,
      private: data.private,
      sentTime: data.sentTime,
      sendDate: data.sendDate,
    });
    newMsg
      .save()
      .then((user) => {
        io.sockets.emit("RECEIVE_MESSAGE", user);
      })
      .catch((err) => console.log(err));
  });

  //Delete
  socket.on("DELETE_MESSAGE", async (data) => {
    console.log("data--.", data);
    await ChatPublicModel.findById({ _id: data.delId }).then(async (chat) => {
      if (!chat) {
        socket.emit("errors", { message: "There is no message" });
      } else {
        await chat.remove().then(() => {
          socket.emit("DELETE_MESSAGE", chat);
          socket.broadcast.emit("DELETE_MESSAGE", chat);
        });
      }
    });
  });

  //Edit
  socket.on("EDIT_MESSAGE", async (data) => {
    await ChatPublicModel.findById({ _id: data.editId }).then(async (chat) => {
      if (!chat) {
        socket.emit("errors", { message: "There is no message" });
      } else {
        chat.chatMsg = data.editVal;
        await chat.save().then((msg) => {
          socket.emit("EDIT_MESSAGE", msg);
          socket.broadcast.emit("EDIT_MESSAGE", msg);
          console.log(msg);
        });
      }
    });
  });

  // Create Group
  socket.on("CREATE_GROUP", ({ title, creator, users, recipients }) => {
    const newGroup = new ChatGroupModel({
      title: title,
      creator: creator,
      users: users,
    });
    newGroup
      .save()
      .then((msg) => {
        console.log("recipients-->", recipients);
        recipients.forEach((recipient) => {
          socket.broadcast.to(recipient).emit("ADD_NEW_GROUP", msg);
        });
        socket.emit("ADD_NEW_GROUP", msg);
      })
      .catch((err) => console.log(err));
  });

  // Group Chatting NEW Message
  socket.on("GROUP_SEND_MESSAGE", async ({ recipients, text, roomId }) => {
    const roomFlag = await ChatPrivateModel.aggregate([
      {
        $match: {
          delete: false,
          roomId: roomId,
        },
      },
    ]);
    if (roomFlag.length === 0) {
      const newMsg = new ChatPrivateModel({
        recipients: recipients,
        roomId: roomId,
        messages: [
          {
            userId: text.userId,
            chatMsg: text.chatMsg,
            sentTime: text.sentTime,
            sendDate: text.sendDate,
          },
        ],
        private: text.private,
      });
      newMsg
        .save()
        .then((msg) => {
          recipients.forEach((recipient) => {
            socket.broadcast
              .to(recipient)
              .emit("GROUP_RECEIVE_MESSAGE", ...msg.messages, roomId);
            socket.emit("GROUP_RECEIVE_MESSAGE", ...msg.messages, roomId);
          });
        })
        .catch((err) => console.log(err));
    } else if (roomFlag.length > 0) {
      // Private messages Update
      await ChatPrivateModel.findOneAndUpdate(
        { roomId: roomId },
        {
          $push: {
            messages: {
              userId: text.userId,
              chatMsg: text.chatMsg,
              sentTime: text.sentTime,
              sendDate: text.sendDate,
            },
          },
        }
      ).then(() => {
        let msg = {
          userId: text.userId,
          chatMsg: text.chatMsg,
          sentTime: text.sentTime,
          sendDate: text.sendDate,
        };
        recipients.forEach((recipient) => {
          socket.broadcast
            .to(recipient)
            .emit("GROUP_RECEIVE_MESSAGE", msg, roomId);
        });
        socket.emit("GROUP_RECEIVE_MESSAGE", msg, roomId);
      });
    }
  });
});
