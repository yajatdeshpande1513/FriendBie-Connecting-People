const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");

const port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const activeusers = {};

io.on("connection", (socket) => {
    socket.on("new user joined", (username) => {
        activeusers[socket.id] = username;
        socket.broadcast.emit("User-joined", username);
        io.emit("active-users", Object.keys(activeusers).length);
    });

    socket.on("send", (message) => {
        const username = activeusers[socket.id];
        if (username) {
            socket.broadcast.emit("receive", {
                message: message,
                username: username,
            });
        } else {
            socket.emit("request-rejoin");
        }
    });

    socket.on("disconnect", () => {
        if (activeusers[socket.id]) {
            const user = activeusers[socket.id];
            delete activeusers[socket.id];
            socket.broadcast.emit("User left", user);
            io.emit("active-users", Object.keys(activeusers).length);
        }
    });
});

http.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});