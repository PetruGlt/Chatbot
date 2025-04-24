
//am pus un comentariu in dreptul liniilor unde path ul ar trebui schimbat!

document.addEventListener("DOMContentLoaded", () => {

    if (!sessionStorage.getItem("conversationId")) {
        sessionStorage.setItem("conversationId", "1");
    }

    const questionInput = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");

    const username = sessionStorage.getItem("username");

    const sendBtn = document.getElementById("sendBtn");
    const logoutBtn = document.getElementById("logout");
    const newConversationBtn = document.getElementById("newConversation");
    const historyBtn = document.getElementById("history");

    let hasSentFirstMessage = false;

    sendBtn.addEventListener("click", () => {
        const question = questionInput.value.trim();
        if (!question) return;

        if (!hasSentFirstMessage) {
            const welcomeEl = document.getElementById("welcome");
            if (welcomeEl) welcomeEl.classList.add("hidden");
            hasSentFirstMessage = true;
        }

        sendQuestion(question);
        questionInput.value = "";
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("conversationId");
        window.location.href = "./../templates/client.html"; //aici trebuie schimbat pathul!!
    })

    newConversationBtn.addEventListener("click", () => {
        let currentId = parseInt(sessionStorage.getItem("conversationId") || "1");
        sessionStorage.setItem("conversationId", (currentId + 1).toString());

        window.location.href = "./MainPage.html";  //aici trebuie schimbat pathul!!
    })

    historyBtn.addEventListener("click", () => {
        window.location.href = "./historyPage.html";  //aici trebuie schimbat pathul!!
    })

    function sendQuestion(questionText) {

        const questionEl = document.createElement("article");
        questionEl.className = "message question";
        questionEl.textContent = `Q: ${questionText}`;

        const answerEl = document.createElement("article");
        answerEl.className = "message answer";
        answerEl.textContent = "Waiting for response...";

        const message = document.createElement("div");
        message.classList.add("message");

        message.appendChild(questionEl);
        message.appendChild(answerEl);
        chatBox.appendChild(message);

        getAnswer(questionText, answerEl);
    }

    function getAnswer(question, answerEl) {
        const conversationId = sessionStorage.getItem("conversationId");

        //se trimit username-ul, conversationId si question
        //asteptam un answer
        //trimitem un json
        //asteptam un json

        fetch('/ask', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                conversationId: conversationId,
                question: question,

            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                answerEl.textContent = `A: ${data.answer}`;
            })
            .catch(error => {
                console.error("Error fetching answer:", error);
                answerEl.textContent = "A: Sorry, there was an error getting the response.";
            });
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
