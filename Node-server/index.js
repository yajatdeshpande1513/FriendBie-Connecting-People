let express=require("express");
let app=express();
const port=8000;

var http=require("http").Server(app);
var io=require("socket.io")(http);

const path=require("path");
const mainfile=path.join(__dirname,"../")
// console.log(__dirname);
app.use(express.static(mainfile));
app.get("/",function(req,res){
    res.sendFile(mainfile+"/index.html");
})
const activeusers={};

io.on("connection",(socket)=>{
    if(Object.keys(activeusers).length>=150){
        socket.emit("roomfull","Try again Later!")
        socket.disconnect();
        return ;
    }
    socket.on("new user joined",(username)=>{
        console.log("New user ", username);
        activeusers[socket.id]=username;
        socket.broadcast.emit("User-joined", username);

        io.emit("active-users", Object.keys(activeusers).length);

        socket.on("disconnect",()=>{
            console.log("user left",username);
            delete activeusers[socket.id];
            socket.broadcast.emit("User left",username);
            io.emit("active-users",Object.keys(activeusers).length);
        })
    })
    socket.on("send",(message)=>{
        console.log(message);
        socket.broadcast.emit("receive",{
            message :  message,
            username: activeusers[socket.id]
        })
    })
})
http.listen(port,function(){
    console.log("Server running at port",port)
})