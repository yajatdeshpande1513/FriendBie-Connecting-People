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

    let currentUsername = ""; 
    let messageSynth, joinLeaveSynth;

    function initAudio() {
        if (!messageSynth) {
            Tone.start();
            messageSynth = new Tone.Synth({ oscillator: { type: "sine" } }).toDestination();
            joinLeaveSynth = new Tone.Synth({ oscillator: { type: "triangle" } }).toDestination();
        }
    }

    const scrollToBottom = () => {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    const append = (message, position) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", position);

        // Content
        const textSpan = document.createElement("span");
        textSpan.innerText = message;
        messageElement.appendChild(textSpan);

        // Timestamp (only for left and right messages)
        if (position !== "center") {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timeSpan = document.createElement("span");
            timeSpan.classList.add("timestamp");
            timeSpan.innerText = time;
            messageElement.appendChild(timeSpan);
        }

        messageContainer.appendChild(messageElement);
        scrollToBottom();
    };

    msgInput.addEventListener('focus', () => {
        setTimeout(scrollToBottom, 300); 
    });
    window.addEventListener('resize', scrollToBottom);

    usernameForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            currentUsername = username;
            initAudio(); 
            socket.emit("new user joined", username);
            usernameModal.classList.add("hidden");
            chatUI.style.display = 'flex';
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

    socket.on("request-rejoin", () => {
        if (currentUsername) socket.emit("new user joined", currentUsername);
    });

    socket.on("connect", () => {
        if (currentUsername) socket.emit("new user joined", currentUsername);
    });

    socket.on("User-joined", (user) => {
        append(`${user} joined the chat`, "center");
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