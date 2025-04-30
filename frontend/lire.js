// const { Socket } = require("socket.io");
const socket = io("http://localhost:4001", {
  transports: ["websocket"],
  autoConnect: true,
});
document.querySelector("header i").addEventListener("click", function () {
  document.querySelector(".black-overlay").classList.add("on");
  document.querySelector(".freinds").classList.add("on");
  document.querySelector(".close").addEventListener("click", function () {
    document.querySelector(".black-overlay").classList.remove("on");
    document.querySelector(".freinds").classList.remove("on");
  });
});

document.querySelector(".add").addEventListener("click", (el) => {
  document.querySelectorAll(".black-overlay")[1].classList.add("on");
  document.querySelectorAll(".close")[1].addEventListener("click", function () {
    document.querySelectorAll(".black-overlay")[1].classList.remove("on");
  });
});

// navigator.serviceWorker.addEventListener('message', (event) => {
//   if (event.data.type === 'GET_TOKEN') {
//     // إرسال التوكن للـ Service Worker
//     const token = localStorage.getItem('token');
//     event.source.postMessage({
//       type: 'TOKEN_RESPONSE',
//       token: token
//     });
//   } else if (event.data.type === 'NEW_TOKEN') {
//     // حفظ التوكن الجديد
//     localStorage.setItem('token', event.data.token);
//   }
// });

if (!localStorage.getItem("token")) {
  open("signin.html", "_self");
} else {
  fetch("http://localhost:4001/token", {
    body: JSON.stringify({ token: localStorage.getItem("token") }),
    method: "POST",
  }).then((res) => {
    if (!res.status == 200) {
      open("signin.html", "_self");
    }
  })
}

// إضافة مستمع للاتصال
socket.on("connect", (socket) => {
  console.log("Connected to server");
});
socket.emit("userId", localStorage.getItem("token"))

socket.on("token", (token) => {
  console.log(token);
})

// إضافة مستمع للأخطاء
socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});


// console.log(socket)
