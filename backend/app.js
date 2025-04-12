const http = require("http");
const { Server } = require("socket.io");
const Player = require("./src/module/player");
const log = require("./src/routers/log");
const url = require("url");
const Room = require("../module/room");
const database = require("./src/config/db");
const player = require("./src/module/player");

const server = http.createServer((req, res) => {
  // إضافة CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end();
    return;
  }

  // تحليل URL والquery parameters
  const parsedUrl = url.parse(req.url, true);
  // التحقق من نوع الطلب والمسار
  if (req.method === "POST" && req.url === "/signup") {
    log.signup(req, res);
  } else if (req.method === "POST" && req.url === "/signin") {
    log.signin(req, res);
  } else if (req.method === "POST" && req.url === "/forgot") {
    log.forgotPassword(req, res);
  } else if (req.method === "POST" && req.url === "/reset") {
    log.resetPassword(req, res);
  } else if (req.method === "POST" && req.url === "/newPassword")
    log.newPassword(req, res);
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

const io = new Server(server);

io.on("connection", async (socket) => {
  socket.on("userId", (userId) => {
    Player.findOne({ _id: userId }).then(async (player) => {
      player.socketId = await socket.id;
      player.status = await "online";
      await player.save();
    });
  });

  socket.on("joinRoom", async (roomId) => {
    const room = await Room.findOne({ _id: roomId });
    
  });

  socket.on("disconnect", () => {
    Player.findOne({ socketId: socket.id }).then((player) => {
      player.status = "offline";
      player.save();
    });
  });
});

server.listen(4001, () => {
  console.log("Server running on http://localhost:4001");
});
