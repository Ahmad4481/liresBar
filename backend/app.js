const http = require("http");
const { Server } = require("socket.io");
const Player = require("./src/module/player");
const io = new Server();
const log = require("./src/routers/log");
const url = require("url");

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
  } 
  else if (req.method === "POST" && req.url === "/signin") {
    log.signin(req, res);
  } 
  else if (req.method === "POST" && req.url === "/forgot") {
    log.forgotPassword(req, res);
  } 
  else if (req.method === "POST" && req.url === "/reset") {
    log.resetPassword(req, res);
  }else if (req.method === "POST" && req.url === "/newPassword") log.newPassword(req, res);
  // إضافة مسارات Google
  else if (req.method === "GET" && parsedUrl.pathname === "/auth/google") {
    log.googleSignIn(req, res);
  }
  else if (req.method === "GET" && parsedUrl.pathname === "/auth/google/callback") {
    const query = parsedUrl.query;
    req.query = query; // إضافة query parameters إلى req object
    log.googleCallback(req, res);
  }
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(4001, () => {
  console.log("Server running on http://localhost:4001");
});