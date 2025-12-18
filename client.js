document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    const usernameModal = document.getElementById("username-modal");
    const usernameForm = document.getElementById("username-form");
    const usernameInput = document.getElementById("username-input");
    const chatUI = document.getElementById("chat-ui");
    const form = document.getElementById("sendcont");
    const msgInput = document.getElementById("send_msg");
    const messageContainer = document.getElementById("messagebox");
    const userCountElement = document.getElementById("user-count");

    let messageSynth, joinLeaveSynth;

    function initAudio() {
        if (!messageSynth) {
            Tone.start();
            messageSynth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();
            joinLeaveSynth = new Tone.Synth({ oscillator: { type: "triangle" } }).toDestination();
        }
    }

    const append = (message, position) => {
        const messageElement = document.createElement("div");
        messageElement.innerText = message;
        // Apply centering and positioning classes
        messageElement.classList.add("message", position, "message-animated");
        messageContainer.appendChild(messageElement);
        
        // Ensure the scroll stays at the bottom
        messageContainer.scrollTo({
            top: messageContainer.scrollHeight,
            behavior: 'smooth'
        });
    };

    usernameForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            initAudio(); 
            socket.emit("new user joined", username);
            usernameModal.classList.add("hidden");
            chatUI.classList.replace("hidden", "flex");
            msgInput.focus();
            append("You joined the chat", "center");
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = msgInput.value.trim();
        if (message) {
            append(`You: ${message}`, "right");
            socket.emit("send", message);
            msgInput.value = "";
        }
    });

    socket.on("User-joined", (user) => {
        append(`${user} joined`, "center");
        if (joinLeaveSynth) joinLeaveSynth.triggerAttackRelease("C4", "8n");
    });

    socket.on("receive", (data) => {
        append(`${data.username}: ${data.message}`, "left");
        if (messageSynth) messageSynth.triggerAttackRelease("G4", "8n");
    });

    socket.on("User left", (user) => {
        append(`${user} left`, "center");
        if (joinLeaveSynth) joinLeaveSynth.triggerAttackRelease("C3", "8n");
    });

    socket.on("active-users", (count) => {
        userCountElement.textContent = `${count} Active`;
    });
});