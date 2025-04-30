// self.addEventListener("install", (event) => {
//   console.log("Service Worker installed");
//   self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   console.log("Service Worker activated");
//   event.waitUntil(clients.claim());
// });

// // تعديل دالة getToken للتعامل مع localStorage بشكل صحيح
// async function getToken() {
//   try {
//     const allClients = await clients.matchAll({
//       includeUncontrolled: true,
//       type: 'window'
//     });
    
//     if (allClients.length > 0) {
//       // إرسال رسالة للحصول على التوكن
//       const client = allClients[0];
//       return new Promise((resolve) => {
//         client.postMessage({ type: 'GET_TOKEN' });
        
//         self.addEventListener('message', function listener(event) {
//           if (event.data.type === 'TOKEN_RESPONSE') {
//             self.removeEventListener('message', listener);
//             resolve(event.data.token);
//           }
//         });
//       });
//     }
//     return null;
//   } catch (error) {
//     console.error("Error getting token:", error);
//     return null;
//   }
// }

// async function refreshToken() {
//   try {
//     const token = await getToken();
//     console.log("Got token:", token ? "Yes" : "No");
    
//     if (!token) {
//       clients.openWindow('/signin.html');
//       return;
//     }

//     const response = await fetch("http://localhost:4001/refreshToken", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ token }),
//     });

//     const data = await response.json();
//     if (data.token) {
//       const allClients = await clients.matchAll({
//         includeUncontrolled: true,
//         type: 'window'
//       });
      
//       // إرسال التوكن الجديد لجميع النوافذ
//       allClients.forEach(client => {
//         client.postMessage({
//           type: 'NEW_TOKEN',
//           token: data.token
//         });
//       });
//     }
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//   }
// }

// // تشغيل refreshToken كل ساعة
// setInterval(refreshToken, 60 * 60 * 1000);

// // الاستماع للرسائل من الصفحة
// self.addEventListener('message', (event) => {
//   console.log('Received message in SW:', event.data);
// });