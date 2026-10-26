
const chat = document.getElementById("chat");
const question = document.getElementById("question");
const send = document.getElementById("send");
const status = document.getElementById("status");

const API_URL = "https://jarvis-ai-tr3x.onrender.com/chat";

send.addEventListener("click", async () => {
  const message = question.value.trim();
  if (!message) return;

  chat.textContent += "\n\nYou: " + message;
  question.value = "";
  send.disabled = true;
  status.textContent = "JARVIS is thinking...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    chat.textContent += "\n\nJARVIS: " + data.reply;
    status.textContent = "Online";
  } catch (error) {
    chat.textContent += "\n\nJARVIS: Connection failed. Please try again.";
    status.textContent = "Connection error";
  } finally {
    send.disabled = false;
  }
});
