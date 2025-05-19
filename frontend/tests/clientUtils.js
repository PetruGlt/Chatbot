// clientUtils.js

// === 1. Session flag utils ===
function setUserSentMessage(value) {
  sessionStorage.setItem("hasSentFirstMessage", value ? "true" : "false");
}

function hasUserSentMessage() {
  return sessionStorage.getItem("hasSentFirstMessage") === "true";
}

// === 2. Scroll ===
function scrollToBottom() {
  const conversation = document.querySelector('.conversation');
  if (conversation) {
    conversation.scrollTop = conversation.scrollHeight;
  }
}

// === 3. Message DOM creation ===
function buildMessageElement(questionText, conversationId) {
  const questionEl = document.createElement("article");
  questionEl.className = "message question";
  questionEl.textContent = `Q: ${questionText}`;

  const answerEl = document.createElement("article");
  answerEl.className = "message answer";
  answerEl.textContent = "Waiting for response...";
  answerEl.dataset.validation = "0";
  answerEl.dataset.question = questionText;

  const message = document.createElement("div");
  message.classList.add("message");
  message.dataset.conversationId = conversationId;
  message.appendChild(questionEl);
  message.appendChild(answerEl);

  return { message, answerEl };
}

// === 4. Chat API ===
function getAnswer({ username, conversationId, question }, answerEl, messageDiv) {
  return fetch('/chatbot/ask', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, conversationId, question })
  })
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      answerEl.textContent = `A: ${data.answer}`;
      answerEl.dataset.validation = "0";
      answerEl.dataset.question = question;

      if (messageDiv && messageValidationMap.has(messageDiv)) {
        messageValidationMap.get(messageDiv).validation = "0";
      }
    })
    .catch(error => {
      console.error("Error fetching answer:", error);
      answerEl.textContent = "A: Eroare la obtinerea raspunsului.";
      answerEl.dataset.validation = "0";
    });
}

// === 5. Message validation map (simulat pentru testabilitate)
let messageValidationMap = new Map();
function setValidationMap(map) {
  messageValidationMap = map;
}

// Export
module.exports = {
  setUserSentMessage,
  hasUserSentMessage,
  scrollToBottom,
  buildMessageElement,
  getAnswer,
  setValidationMap,
  _messageValidationMap: messageValidationMap // doar pt testare
};
