// Wait for the DOM to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    
    // --- Initialize Socket.io ---
    const socket = io();

    // --- DOM Element References ---
    // Modal Elements
    const usernameModal = document.getElementById("username-modal");
    const usernameForm = document.getElementById("username-form");
    const usernameInput = document.getElementById("username-input");
    const usernameError = document.getElementById("username-error");
    const joinBtn = document.getElementById("join-btn");

    // Chat UI Elements
    const chatUI = document.getElementById("chat-ui");
    const form = document.getElementById("sendcont");
    const msgInput = document.getElementById("send_msg");
    const messageContainer = document.getElementById("messagebox");
    const userCountElement = document.getElementById("user-count");

    // --- Audio Synthesis (Replaces local files) ---
    // Using Tone.js for modern, browser-based audio feedback
    let messageSynth, joinLeaveSynth;
    
    // Initialize synths only after the first user interaction (e.g., joining)
    // to comply with browser autoplay policies.
    function initAudio() {
        if (!messageSynth) {
            Tone.start(); // Start audio context
            messageSynth = new Tone.Synth({
                oscillator: { type: "sine" },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 }
            }).toDestination();
            
            joinLeaveSynth = new Tone.Synth({
                oscillator: { type: "triangle" },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }
            }).toDestination();
        }
    }

    // --- Core Functions ---

    /**
     * Appends a message to the chat container.
     * @param {string} message - The message content.
     * @param {string} position - 'left', 'right', or 'center'.
     */
    const append = (message, position) => {
        const messageElement = document.createElement("div");
        messageElement.innerText = message;
        messageElement.classList.add("message", position); // Uses classes from <style> tag
        messageContainer.appendChild(messageElement);
        
        // Auto-scroll to the latest message
        messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    /**
     * Shows a non-blocking notification toast.
     * This replaces the old `alert()`.
     * @param {string} message - The notification text.
     */
    const showNotification = (message) => {
        const toast = document.createElement("div");
        toast.innerText = message;
        toast.className = "notification-toast"; // Uses class from <style> tag
        document.body.appendChild(toast);

        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.style.transform = "translateX(150%)"; // Slide out
            setTimeout(() => toast.remove(), 300); // Remove from DOM
        }, 3000);
    };

    // --- Event Listeners ---

    // 1. Handle Username Submission (Replaces `prompt()`)
    usernameForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form from reloading the page
        const username = usernameInput.value.trim();

        if (username) {
            // Initialize audio context on user action
            initAudio(); 
            
            // Emit the new user event
            socket.emit("new user joined", username);
            
            // Transition from modal to chat UI
            usernameModal.classList.add("hidden");
            chatUI.classList.remove("hidden"); // Show the main chat
            chatUI.classList.add("flex"); // Add flex display
            msgInput.focus(); // Focus the message input field
            
            // Add a "You joined" message locally
            append("You joined the party", "center");

        } else {
            // Show an error in the modal
            usernameError.textContent = "Please enter a valid username.";
            usernameError.classList.remove("hidden");
        }
    });

    // 2. Handle Message Sending
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = msgInput.value.trim();
        
        if (message) {
            append(`You: ${message}`, "right"); // Append your own message
            socket.emit("send", message);     // Send message to server
            msgInput.value = "";              // Clear input field
        }
    });

    // --- Socket.io Event Handlers ---

    // Note: "connect" event is implicitly handled by the username modal
    // No need for socket.on("connect", ...) as the modal serves the same purpose

    socket.on("User-joined", (username) => {
        append(`${username} joined the party`, "center");
        // Play join sound
        if (joinLeaveSynth) {
            joinLeaveSynth.triggerAttackRelease("C4", "8n", Tone.now());
        }
    });

    socket.on("receive", (data) => {
        append(`${data.username}: ${data.message}`, "left");
        // Play message sound
        if (messageSynth) {
            messageSynth.triggerAttackRelease("G4", "8n", Tone.now());
        }
    });

    socket.on("roomfull", (msg) => {
        // Use the new non-blocking notification
        showNotification(msg);
        // You could also disable the chat input here
        msgInput.disabled = true;
        msgInput.placeholder = "Chat is full. Please try again later.";
        document.getElementById("sendbtn").disabled = true;
    });

    socket.on("User left", (username) => {
        append(`${username} left the party`, "center");
        // Play leave sound
        if (joinLeaveSynth) {
            joinLeaveSynth.triggerAttackRelease("C3", "8n", Tone.now());
        }
    });

    socket.on("active-users", (count) => {
        // Update the active user count in the header
        userCountElement.textContent = `${count} Active`;
    });

});
