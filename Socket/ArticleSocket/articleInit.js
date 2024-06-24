const articleEvent = require("./articleEvent")

module.exports = function (io, socket) {
    socket.on("C2S_ADDLIKE", data => articleEvent.addLike(io, socket, data))
    socket.on("C2S_UNLIKE", data => articleEvent.addUnLike(io, socket, data))
    socket.on("C2S_GET", id => articleEvent.get(io, socket, id))
}