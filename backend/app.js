const http = require("http");
const { Server } = require("socket.io");
const Player = require("./src/module/player");
// const log = require("./src/routers/log");
const url = require("url");
const Room = require("./src/module/room");
const database = require("./src/config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// const { google } = require("googleapis");
const dotenv = require("dotenv").config();

// تكوين المتغيرات العامة
let JWT_SECRET = "secretKeyLirsBar0451";

// دوال JWT
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
function refreshToken(req, res) {
  let body = "";
  req.on("data", (data) => {
    body += data;
  });

  req.on("end", async () => {
    try {
      body = JSON.parse(body);
      const oldToken = body.token;

      const decoded = verifyToken(oldToken);
      if (!decoded) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid token" }));
      }

      // إنشاء توكن جديد
      const newToken = signToken({
        id: decoded.id,
        name: decoded.name,
        image: decoded.image,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ token: newToken }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Server error" }));
    }
  });
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

      const token = signToken({
        id: findPlayer._id,
        name: findPlayer.name,
        image: findPlayer.image,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          token,
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
      const token = signToken({
        id: player._id,
        name: player.name,
        image: player.image,
      });

      res.writeHead(201, { "Content-Type": "application/json" });

      res.end(
        JSON.stringify({
          message: "Registration successful",
          token,
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

// module.exports = {
//   signin,
//   signup,
//   forgotPassword,
//   resetPassword,
//   googleSignIn,
//   googleCallback,
//   newPassword,
// };

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
    signup(req, res);
  } else if (req.method === "POST" && req.url === "/signin") {
    signin(req, res);
  } else if (req.method === "POST" && req.url === "/forgot") {
    forgotPassword(req, res);
  } else if (req.method === "POST" && req.url === "/reset") {
    resetPassword(req, res);
  } else if (req.method === "POST" && req.url === "/newPassword")
    newPassword(req, res);
  else if (req.method === "POST" && req.url === "/refreshToken") {
    refreshToken(req, res);
  } else if (req.method === "POST" && req.url === "/token") {
    let body = "";
    req.on("data", (data) => {
      body = JSON.parse(data);
    });
    req.on("end", () => {
      const token = verifyToken(body.token);
      if (!token) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid token" }));
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Token is valid" }));
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

const io = new Server(server);
io.on(
  "connection",
  async (socket) => {
    socket.on("userId", async (token) => {
      const decoded = verifyToken(token);
      await Player.findOne({ _id: decoded.id }).then(async (player) => {
        // player.socketId = socket.id;
        console.log(player._id.toString());
        socket.id = player._id.toString();
        player.status = "online";
        await player.save();
      });
    });
    io.fetchSockets().then((sockets) => {
      sockets.forEach((s) => {
        console.log(s.id);
      })
    });

    // socket.on("joinRoom", async (roomId) => {
    //   const room = await Room.findOne({ _id: roomId });
    // });

    socket.on("disconnect", async () => {
      console.log(socket.id)
      await Player.findOne({ socketId: socket.id }).then((player) => {
        player.status = "offline";
        // socket.leave(player.socketId);
        player.socketId = null;
        player.save();
      });
    });
  },
  {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  }
);

server.listen(4001, () => {
  console.log("Server running on http://localhost:4001");
});
