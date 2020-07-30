"use strict";

let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server);
//let stream = require( './ws/stream' );
let path = require("path");
let favicon = require("serve-favicon");

let globalCache = {};
globalCache["rooms"] = [];
globalCache["users"] = [];
globalCache["userSocketIds"] = [];

let addRoomIfUnique = (room) => {
    if (globalCache["rooms"].indexOf(room) === -1) {
      globalCache["rooms"].push(room);
    }
};
let addUser = (username) => {
    globalCache["users"].push(username);
}
let addUserSocket = (socketId) => {
    globalCache["userSocketIds"].push(socketId);
};

app.use(favicon(path.join(__dirname, "favicon.ico")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/getallrooms", (req, res) => {
  res.json(globalCache["rooms"]);
});

app.get("/getallusers", (req, res) => {
  res.json(globalCache["users"]);
});

app.get("/getallusersocketids", (req, res) => {
  res.json(globalCache["userSockerIds"]);
});

// TODO: Restructure and move out of app.js while maintaining use of global cache?
const stream = (socket) => {
  socket.on("subscribe", (data) => {
    console.log("Received 'subscribe': "+JSON.stringify(data));

    //subscribe/join a room
    //TODO: What exactly does socket.join() do and why do we need to do that for room?
    socket.join(data.room);
    socket.join(data.socketId);

    //TODO: Structure cache with relational data
    //a user HAS 1+ socketIds (diff tabs &|| refreshing gives diff socketId)
    //     TODO: Figure out what to do if a user connects with a new socketId?
    //a room HAS 1+ users (though might change when we allow users to log in first without being in a room)
    addRoomIfUnique(data.room);
    addUser(data.username);
    addUserSocket(data.socketId);

    //Inform other members in the room of new user's arrival
    if (socket.adapter.rooms[data.room].length > 1) {
      let newUserData = { socketId: data.socketId };
      console.log(data.room+" - Emitting 'new user': "+JSON.stringify(newUserData));
      socket.to(data.room)
            .emit("new user", newUserData);
    }
  });

  socket.on("newUserStart", (data) => {
    let newUserStartData = { sender: data.sender };
    console.log(data.to+" - Emitting 'newUserStart': "+JSON.stringify(newUserStartData));
    socket.to(data.to)
          .emit("newUserStart", newUserStartData);
  });

  socket.on("sdp", (data) => {
    console.log(data.to+" - Emitting 'sdp'");
    socket.to(data.to)
          .emit("sdp", { description: data.description, sender: data.sender });
  });

  socket.on("ice candidates", (data) => {
    let candidateData = {
      candidate: data.candidate,
      sender: data.sender,
    };
    socket.to(data.to).emit("ice candidates", candidateData);
  });

  socket.on("chat", (data) => {
    let chatData = { sender: data.sender, msg: data.msg }
    console.log(data.room+" - Emitting 'chat': "+JSON.stringify(chatData));
    socket.to(data.room)
          .emit("chat", chatData);
  });
};

io.of("/stream").on("connection", stream);

server.listen(3000, function () {
  console.log("Express server listening on port 3000");
});
