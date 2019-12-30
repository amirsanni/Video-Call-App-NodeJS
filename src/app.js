let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let chat = require('./ws/chat');
let stream = require('./ws/stream')


app.get('/', (req, res)=>{
    res.sendFile(__dirname+'/index.html');
});

io.of('/chat').on('connection', chat);
io.of('/stream').on('connection', stream);

server.listen(3000);