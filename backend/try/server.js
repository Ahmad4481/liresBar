const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer((req,res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
});


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = {}; // تخزين البريد الإلكتروني مع معرف socket.id

io.on("connection", (socket) => {
    console.log("مستخدم متصل:", socket.id);

    // عند تسجيل المستخدم، نقوم بحفظ البريد الإلكتروني ومعرف socket.id
    socket.on("register", (email) => {
        users[email] = socket.id;  // نربط البريد بمعرف المستخدم
        console.log(`تم تسجيل المستخدم ${email} بمعرف: ${socket.id}`);
    });

    // عند إرسال رسالة لمستخدم معين
    socket.on("send-private-message", ({ email, message }) => {
        const recipientSocketId = users[email]; // نحصل على معرف المستخدم
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive-message", { from: socket.id, message });
        } else {
            console.log(`المستخدم ذو البريد ${email} غير متصل حاليًا.`);
        }
    });

    // عند قطع الاتصال، نحذف المستخدم من القائمة
    socket.on("disconnect", () => {
        for (let email in users) {
            if (users[email] === socket.id) {
                delete users[email];
                break;
            }
        }
        console.log("مستخدم قطع الاتصال:", socket.id);
    });
});
server.listen(3000, () => console.log("3000"));
