const socket=io();
const form=document.getElementById("sendcont");
const msgInput=document.getElementById("send_msg");
const messageContainer=document.getElementById("messagebox");
let audio=new Audio("Sounds/16403.mp3")
let audio2=new Audio("Sounds/JoiningLeaving.mp3")

const append=(message,position)=>{
    const messageElement=document.createElement("div");
    messageElement.innerText=message;
    messageElement.classList.add("message");
    messageElement.classList.add(position);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop=messageContainer.scrollHeight;
}
socket.on("connect",()=>{
    let username="";
    while (!username || username.trim() === ""){
    username=prompt("Enter your username");
}
socket.emit("new user joined",username);
});

form.addEventListener("submit",(event)=>{
    event.preventDefault();
    const message=msgInput.value;
    append(`You:${message}`,"right")
    socket.emit( "send",message)
    msgInput.value="";
})
socket.on("User-joined",(username)=>{
    append(`${username} joined the party`,"center");
    audio2.play();
})
socket.on("receive",(data)=>{
    append(`${data.username}: ${data.message}`,"left")
    audio.play();
})
socket.on("roomfull",(msg)=>{
    alert(msg);
})
socket.on("User left",(username)=>{
    append(`${username} left the party`,"center");
    audio2.play();
})
socket.on("active-users",(count)=>{
    append(`Active users:${count}`,"center");
})