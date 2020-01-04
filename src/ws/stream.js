const stream = (socket)=>{
    socket.on('subscribe', (data, fn)=>{
        //subscribe/join a room
        socket.join(data.room);
        socket.join(data.username);

        //inform user if there are already people in the room
        fn(socket.adapter.rooms[data.room].length > 1);

        socket.broadcast.emit('new user', `${data.username} joined`);
    });


    socket.on('sdp', (data)=>{
        socket.to(data.room).emit('sdp', {description: data.description, sender:data.sender});
    });


    socket.on('ice candidates', (data)=>{
        socket.to(data.room).emit('ice candidates', {candidate:data.candidate});
    });
}

module.exports = stream;