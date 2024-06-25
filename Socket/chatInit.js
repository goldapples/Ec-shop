const chatEvents = require("./chatEvent");

module.exports = function (io, socket) {
  socket.on("C2S_MY_USER_INFO", (data) => chatEvents.setUser(io, socket, data));
  socket.on("C2S_NEW_NOTIFICATION", (data) =>
    chatEvents.newNotification(io, socket, data)
  );
  socket.on("C2S_CREATE_NEW_ROOM", (data) =>
    chatEvents.newCreateRoom(io, socket, data)
  );
  socket.on("C2S_DELETE_GROUP", (data) =>
    chatEvents.deleteCreateRoom(io, socket, data)
  );
  socket.on("C2S_GET_ALL_ROOMS", (data) =>
    chatEvents.getAllRooms(io, socket, data)
  );
  socket.on("C2S_NEW_PUBLIC_MESSAGE", (data) =>
    chatEvents.newPublicMessage(io, socket, data)
  );
  socket.on("C2S_NEW_DIRECT_MESSAGE", (data) =>
    chatEvents.newDirectMessage(io, socket, data)
  );
  socket.on("C2S_NEW_ROOM_MESSAGE", (data) =>
    chatEvents.newRoomMessage(io, socket, data)
  );
  socket.on("C2S_GET_ALL_PUBLIC_MESSAGE", (data) =>
    chatEvents.getAllPublicMessage(io, socket, data)
  );
  socket.on("C2S_GET_ALL_DIRECT_MESSAGE", (data) =>
  chatEvents.getAllDirectMessage(io, socket, data)
);
  socket.on("C2S_NEW_CHARGEOFCOIN", (data) =>
    chatEvents.newCoinCharge(io, socket, data)
  );
  socket.on("C2S_ADD_GROUP", (data) =>
  chatEvents.addGroup(io, socket, data)
);
socket.on("C2S_GET_ALL_CHAT_USER", (data) =>
  chatEvents.getAllChatUser(io, socket, data)
);
socket.on("C2S_GET_ALL_ROOM_CHAT_USER", (data) =>
  chatEvents.getAllRoomChatUser(io, socket, data)
);
socket.on("C2S_GET_ALL_ROOM_MESSAGE", (data) =>
  chatEvents.getAllRoomMessage(io, socket, data)
);
};
