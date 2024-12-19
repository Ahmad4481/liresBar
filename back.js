const http = require('http');

const server = http.createServer((req, res) => {
    // إضافة رؤوس CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // السماح لجميع المصادر
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST'); // السماح بالـ GET والـ POST
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // السماح بالـ Content-Type
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
