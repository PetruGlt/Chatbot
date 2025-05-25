document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");
    const newConversationBtn = document.getElementById("newConversation");
    const historyBtn = document.getElementById("history");
    const logoutBtn = document.getElementById("logout");
    const username = sessionStorage.getItem("username");


    if (!username) {
        window.location.href = "/login";
        return;
    }


    if (sessionStorage.getItem("hasSentFirstMessage") === null) {
        setUserSentMessage(false);
    }

    function setUserSentMessage(value) {
        sessionStorage.setItem("hasSentFirstMessage", value ? "true" : "false");
    }

    function hasUserSentMessage() {
        return sessionStorage.getItem("hasSentFirstMessage") === "true";
    }

    fetch('chatHistory', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username
        })
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch history.");
            return response.json();
        })
        .then(data => {
            data.forEach(conversation => {
                const card = document.createElement("div");
                card.className = "conversation-card";
                card.innerHTML = `
            <h3>Conversation ${conversation.conversationId}</h3>
            <p><strong>Q:</strong> ${conversation.firstQuestion}</p>
            <p><strong>A:</strong> ${conversation.firstAnswer}</p>
        `;

                card.addEventListener("click", () => {
                    sessionStorage.setItem("conversationId", conversation.conversationId);
                    window.location.href = "/mainPageClient";       //path!!!
                });

                historyList.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading history:", error);
            historyList.innerHTML = "<p>Failed to load chat history.</p>";
        });


    newConversationBtn.addEventListener("click", async() => {
        window.location.href = "/mainPageClient";
    });



    historyBtn.addEventListener("click", () => {
        window.location.href = "/showHistory";           //path!!
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("conversationId");
        window.location.href = "/login";
    });
});