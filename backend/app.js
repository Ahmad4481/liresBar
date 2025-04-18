const http = require("http");
const { Server } = require("socket.io");
const Player = require("./src/module/player");
const log = require("./src/routers/log");
const url = require("url");
const Room = require("../module/room");
const database = require("./src/config/db");
const player = require("./src/module/player");
const Player = require("./../module/player");
const database = require("./../config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// const { google } = require("googleapis");
const dotenv = require("dotenv").config();


// تكوين المتغيرات العامة
let JWT_SECRET = crypto.randomBytes(64).toString("hex");
const REFRESH_INTERVAL = 24 * 60 * 1000 * 60;

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}


// تحديث المفتاح السري
function refreshJWTSecret() {
  JWT_SECRET = crypto.randomBytes(64).toString("hex");
}

setInterval(refreshJWTSecret, REFRESH_INTERVAL);

// دوال JWT
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// دالة تسجيل الدخول
async function signin(req, res) {
  let body = "";
  req.on("data", (data) => {
    body += data;
  });

  req.on("end", async () => {
    try {
      body = JSON.parse(body);

      if (!body.email || !body.password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Email and password required" })
        );
      }

      const findPlayer = await Player.findOne({
        email: body.email.toLowerCase(),
      });

      if (!findPlayer) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Email not found" }));
      }

      const isValidPassword = await bcrypt.compare(
        body.password,
        findPlayer.password
      );

      if (!isValidPassword) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid password" }));
      }

      const token = signToken({ id: findPlayer._id, email: findPlayer.email });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Login successful",
          token,
          player: {
            id: findPlayer._id,
            name: findPlayer.name,
            email: findPlayer.email,
            gameCount: findPlayer.gameCount,
            image: findPlayer.image,
          },
        })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
}

// دالة التسجيل
async function signup(req, res) {
  let body = "";
  req.on("data", (data) => {
    body += data;
  });

  req.on("end", async () => {
    try {
      body = JSON.parse(body);

      if (!body.name || !body.email || !body.password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "All fields required" }));
      }

      const existingPlayer = await Player.findOne({
        email: body.email.toLowerCase(),
      });
      if (existingPlayer) {
        res.writeHead(409, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Email already registered" }));
      }

      const player = new Player({
        name: body.name.trim(),
        email: body.email.toLowerCase(),
        password: body.password,
        gameCount: 0,
        image: body.image || "default.png",
      });

      await player.save();

      const token = signToken({ id: player._id, email: player.email });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Registration successful",
          token,
          player: {
            id: player._id,
            name: player.name,
            email: player.email,
            gameCount: player.gameCount,
            image: player.image,
          },
        })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
}

// دالة نسيان كلمة المرور
function forgotPassword(req, res) {
  let body = "";
  req.on("data", (data) => {
    body += data;
  });

  function generateResetCode() {
    return Math.random().toString().substr(2, 6);
  }

  req.on("end", async () => {
    try {
      body = JSON.parse(body);

      if (!body.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(body.email)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid email format" }));
      }

      const player = await Player.findOne({ email: body.email.toLowerCase() });

      if (!player) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Email not found" }));
      }

      const resetCode = generateResetCode();

      try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "ahmdalfhd222@gmail.com",
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });

        const mailOptions = {
          from: "ahmdalfhd222@gmail.com",
          to: body.email,
          subject: "Change password in liarsbar game",
          text: `Your reset code is: ${resetCode}`,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent:", result);
      } catch (error) {
        console.error("Error sending email:", error);
      }

      player.tokenToReset = resetCode;
      player.date = Date.now();
      await player.save();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Reset code sent successfully" }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to process request" }));
    }
  });
}

// دالة إعادة تعيين كلمة المرور
function resetPassword(req, res) {
  let body = "";
  req.on("data", (data) => {
    body += data;
  });

  req.on("end", async () => {
    try {
      body = JSON.parse(body);

      const player = await Player.findOne({ email: body.email.toLowerCase() });

      if (!player) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "User not found" }));
      }

      const isValidToken =
        player.tokenToReset === body.token && player.date + 600000 > Date.now();

      if (!isValidToken) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Invalid or expired reset code" })
        );
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Password reset successful" }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
}

function newPassword(req, res) {
  let body = "";

  // قراءة البيانات من الجسم (body) عبر events
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      // تحويل البيانات إلى JSON
      const { email, password } = JSON.parse(body);

      // البحث عن اللاعب باستخدام البريد الإلكتروني
      const player = await Player.findOne({ email: email.toLowerCase() });

      // إذا لم يتم العثور على اللاعب
      if (!player) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Player not found" }));
      }

      // تحديث كلمة المرور
      player.password = password;

      // حفظ التغييرات في قاعدة البيانات
      await player.save();

      // إرسال استجابة ناجحة
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `Password updated successfully ${player.password}`,
        })
      );
    } catch (error) {
      // إرسال استجابة في حالة حدوث خطأ
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
}

// Google Auth

async function googleSignIn(req, res) {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });

    res.writeHead(302, { Location: authUrl });
    res.end();
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Authentication failed" }));
  }
}

async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    let player = await Player.findOne({ email: data.email });

    if (!player) {
      player = new Player({
        name: data.name,
        email: data.email,
        image: data.picture,
        googleId: data.id,
        gameCount: 0,
      });
      await player.save();
    }

    const token = signToken({ id: player._id, email: player.email });
    res.writeHead(302, {
      Location: `http://localhost:3000/auth/callback?token=${token}`,
    });
    res.end();
  } catch (error) {
    console.error("Google Callback Error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Authentication failed" }));
  }
}

module.exports = {
  signin,
  signup,
  forgotPassword,
  resetPassword,
  googleSignIn,
  googleCallback,
  newPassword,
};



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
