//am pus un comentariu in dreptul liniilor unde path ul ar trebui schimbat!

document.addEventListener("DOMContentLoaded", () => {

    if (!sessionStorage.getItem("conversationId")) {
        sessionStorage.setItem("conversationId", "1");
    }



    const questionInput = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");

    const username = sessionStorage.getItem("username");

    if (!username) {
        window.location.href = "/login";
        return;
    }

    const sendBtn = document.getElementById("sendBtn");
    const logoutBtn = document.getElementById("logout");
    const newConversationBtn = document.getElementById("newConversation");
    const historyBtn = document.getElementById("history");

    let hasSentFirstMessage = false;

    function handleSend() {
        const question = questionInput.value.trim();
        if (!question) return;

        if (!hasSentFirstMessage) {
            const welcomeEl = document.getElementById("welcome");
            if (welcomeEl) welcomeEl.classList.add("hidden");
            hasSentFirstMessage = true;
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
        window.location.href = "/login"; //aici trebuie schimbat pathul!!
    })

    newConversationBtn.addEventListener("click", () => {
        let currentId = parseInt(sessionStorage.getItem("conversationId") || "1");
        sessionStorage.setItem("conversationId", (currentId + 1).toString());

        window.location.href = "/mainPageClient";  //aici trebuie schimbat pathul!!
    })

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
                .then(response => response.json())
                .then(data => {
                    data.forEach(validatedMessage => {
                        document.querySelectorAll('.message .answer').forEach(answerEl => {
                            if (answerEl.dataset.validation === "0" && validatedMessage.validation === "1") {
                                answerEl.textContent = `A (validated): ${validatedMessage.answer}`;
                                answerEl.dataset.validation = "1";
                                answerEl.classList.add("validated answer");
                                
                                const messageDiv = answerEl.closest('.message');
                                if (messageValidationMap.has(messageDiv)) {
                                    messageValidationMap.get(messageDiv).validation = "1";
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

    function scrollToBottom() {
        const conversation = document.querySelector('.conversation');
        conversation.scrollTop = conversation.scrollHeight;
    }

    //asta e doar de test
    //     console.log(question);
    //     console.log("\n" + username);
    //     console.log("\n" + conversationId);
    //     setTimeout(() => {
    //         //For now, just a mock response
    //         const mockResponse = question;
    //         answerEl.textContent = `A: ${mockResponse}`;
    //     }, 1000);
    // }
});