function scrollToBottom() {
    const conversation = document.querySelector('.conversation');
    conversation.scrollTop = conversation.scrollHeight;
}

const loadMessages = async (container, conversationId, username) => {
    return new Promise(async (resolve, reject) => {
        if (conversationId != null) {
            try {
                const data = await fetch(`/get-messages?conversationId=${conversationId}&username=${username}`, {});
                const messages = await data.json();
                if (messages.length > 0) {
                    document.getElementById("welcome")?.remove();
                }

                messages.forEach(msg => {
                    const questionText = msg.question;
                    let answerText = msg.validatedAnswer ?? msg.answer;

                    const questionEl = document.createElement("article");
                    questionEl.className = "message question";
                    questionEl.textContent = `Q: ${questionText}`;

                    const answerEl = document.createElement("article");
                    answerEl.dataset.validation = msg.checked == 1 ? "1" : "0";
                    answerEl.className = msg.checked == 1 ? "message validated answer" : "message answer";
                    answerEl.textContent = msg.checked == 1
                        ? `A (validated): ${answerText}`
                        : `A: ${answerText}`;
                    answerEl.dataset.question = questionText;

                    const message = document.createElement("div");
                    message.classList.add("message");
                    message.dataset.conversationId = sessionStorage.getItem("conversationId");

                    message.appendChild(questionEl);
                    message.appendChild(answerEl);
                    container.appendChild(message);
                    sessionStorage.setItem("hasSentFirstMessage", "true");
                });

                scrollToBottom();
                resolve();
            } catch (e) {
                console.warn(e);
                reject(e);
            }
        } else {
            resolve();
        }
    });
};

document.addEventListener("DOMContentLoaded", () => {

    const exists = sessionStorage.getItem("conversationId") !== null;

    if (!exists) {
        fetch('/get-latest-conversationID', {  //aici trebuie facut un controller
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: sessionStorage.getItem("username") })
        })
            .then(res => res.json())
            .then(data => {
                const nextId = (parseInt(data.lastConversationId || "0") + 1).toString();
                sessionStorage.setItem("conversationId", nextId);
            })
            .catch(err => {
                console.error("Error fetching conversation ID:", err);
                sessionStorage.setItem("conversationId", "1");
            });
    }

    const questionInput = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");
    const conversationId = sessionStorage.getItem("conversationId")
    const username = sessionStorage.getItem("username");
    loadMessages(chatBox, conversationId, username).then(() => {
        const hasMessages = document.querySelectorAll('.message .answer').length > 0;
        if (hasMessages && !window.validationInterval) {
            startValidationPolling();
        }
    });

    // const username = sessionStorage.getItem("username");

    if (!username) {
        window.location.href = "/login";
        return;
    }

    const userIdDisplay = document.getElementById("userIdDisplay");

    if (userIdDisplay && username) {
        userIdDisplay.textContent = `User ID: ${username}`;
    }

    const sendBtn = document.getElementById("sendBtn");
    const logoutBtn = document.getElementById("logout");
    const newConversationBtn = document.getElementById("newConversation");
    const historyBtn = document.getElementById("history");

    let hasSentFirstMessage = false;

    if (sessionStorage.getItem("hasSentFirstMessage") === null) {
        setUserSentMessage(false);
    }


    function setUserSentMessage(value) {
        sessionStorage.setItem("hasSentFirstMessage", value ? "true" : "false");
    }

    function hasUserSentMessage() {
        return sessionStorage.getItem("hasSentFirstMessage") === "true";
    }



    function handleSend() {
        const question = questionInput.value.trim();
        if (!question) return;

        if (!hasUserSentMessage()) {
            const welcomeEl = document.getElementById("welcome");
            if (welcomeEl) welcomeEl.classList.add("hidden");
            setUserSentMessage(true);
        }

        sendQuestion(question);
        questionInput.value = "";
    }


    sendBtn.addEventListener("click", handleSend);

    questionInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("conversationId");
        sessionStorage.removeItem("hasSentFirstMessage");
        window.location.href = "/login"; //aici trebuie schimbat pathul!!
    })

    newConversationBtn.addEventListener("click", () => {
        fetch('/get-latest-conversationID', {  //aici trebuie facut un controller
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: sessionStorage.getItem("username") })
        })
            .then(res => res.json())
            .then(data => {
                if (hasUserSentMessage()) {
                    const nextId = (parseInt(data.lastConversationId || "0") + 1).toString();
                    sessionStorage.setItem("conversationId", nextId);
                    setUserSentMessage(false);
                }
                window.location.href = "/mainPageClient";
            })
            .catch(err => {
                console.error("Error fetching conversation ID:", err);
                sessionStorage.setItem("conversationId", "1");
            });
        // let currentId = (parseInt(data.lastConversationId || "0") + 1).toString();

        // sessionStorage.setItem("conversationId", (currentId + 1).toString());
        //
        // setUserSentMessage(false);
    });

    historyBtn.addEventListener("click", () => {
        window.location.href = "/showHistory";
    })

    const VALIDATION_INTERVAL = 10000;
    let messageValidationMap = new Map();

    function sendQuestion(questionText) {
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
        message.dataset.conversationId = sessionStorage.getItem("conversationId");

        message.appendChild(questionEl);
        message.appendChild(answerEl);
        chatBox.appendChild(message);

        messageValidationMap.set(message, {
            answerElement: answerEl,
            validation: "0"
        });

        getAnswer(questionText, answerEl, message);
        scrollToBottom();

        if (!window.validationInterval) {
            startValidationPolling();
        }
    }

    function getAnswer(question, answerEl, messageDiv) {
        const conversationId = sessionStorage.getItem("conversationId");

        //se trimit username-ul, conversationId si question
        //asteptam un answer
        //trimitem un json
        //asteptam un json

        fetch('/chatbot/ask', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                conversationId: conversationId,
                question: question
            })
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
                answerEl.textContent = "A: Sorry, there was an error getting the response.";
                answerEl.dataset.validation = "0";
            });
    }

    function startValidationPolling() {
        window.validationInterval = setInterval(() => {
            const conversationId = sessionStorage.getItem("conversationId");
            const username = sessionStorage.getItem("username");

            fetch('/checkValidatedMessages', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    conversationId: conversationId
                })
            })
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (!Array.isArray(data)) {
                        throw new Error("Invalid data format received");
                    }

                    data.forEach(validatedMessage => {
                        document.querySelectorAll('.message .answer').forEach(answerEl => {
                            const matchingQuestion = answerEl.dataset.question === validatedMessage.question;
                            const needsValidation = answerEl.dataset.validation === "0";
                            const isNowValidated = validatedMessage.validation === "1";

                            if (matchingQuestion && needsValidation && isNowValidated) {
                                if (validatedMessage.validatedAnswer==null) {
                                    answerEl.textContent = `A (validated): ${validatedMessage.answer}`;
                                }
                                else {
                                    answerEl.textContent = `A (validated): ${validatedMessage.validatedAnswer}`;
                                }
                                answerEl.dataset.validation = "1";
                                answerEl.className = "message validated answer";

                                const messageDiv = answerEl.closest('.message');
                                if (messageDiv && messageValidationMap.has(messageDiv)) {
                                    messageValidationMap.get(messageDiv).validation = "1";
                                    messageValidationMap.get(messageDiv).answer = validatedMessage.answer;
                                }
                            }
                        });
                    });
                })
                .catch(error => console.error("Validation polling error:", error));
        }, VALIDATION_INTERVAL);
    }

    window.addEventListener('beforeunload', () => {
        clearInterval(window.validationInterval);
    });

});