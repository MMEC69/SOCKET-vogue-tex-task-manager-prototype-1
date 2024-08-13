const dotenv = require("dotenv").config();
const io = require("socket.io")(process.env.socketServer, {
    cors: {
        origin: process.env.originURL
    }
});

let users = []; 

// =======================================
const addUser = (userId, socketId) => {
    //check is user is already available and if not push else don't push
    !users.some((user) => user.userId === userId ) &&
        users.push({userId, socketId});
} 
// =======================================
const removeUser = (socketId) => {
    users = users.filter((user) => {
        return user.socketId !== socketId;
    });
}
// =======================================
const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}
// =======================================
io.on("connection", (socket) => {
    //when connect
    console.log("> A user connected");
    const socketId = socket.id;
    //take the user id and the socket id
    socket.on("addUser", (userId) => {
        addUser(userId, socketId);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({senderId, receiverId, text}) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            senderId,
            text
        });
    });
//--------------------------------------------------
    //when disconnect
    //if user disconnects they are removed from users
    socket.on("disconnect", () => {
        console.log("> User disconnected");
        removeUser(socketId);
        io.emit("getUsers", users);
    });
}) ;
//------------------------------------------------------
//delete this if something goes wrong
io.on('disconnect', function(){
    socketCleanup(); // this is a function to cleanup all listeners, just in case, so you can restart fresh
    socket.on('connect', function(){
        socketConnect();
    });
});