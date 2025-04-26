document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");
    const newConversationBtn = document.getElementById("newConversation");
    const historyBtn = document.getElementById("history");
    const logoutBtn = document.getElementById("logout");
    const username = sessionStorage.getItem("username");


    //partea asta trebuie comentata daca se testeaza individual pagina aceasta, fara logare
    // if (!username) {
    //     //window.location.href = "./../templates/client.html";
    //     window.location.href = "client.html";   //path!!!
    //     return;
    // }
    //pana aici



    //doar pentru testare

    // const mockConversations = [
    //     { conversationId: 1, firstQuestion: "How can I open a new bank account?", firstAnswer: "You can open an account online or visit a branch." },
    //     { conversationId: 2, firstQuestion: "What are the interest rates for savings accounts?", firstAnswer: "Currently, the savings interest rate is 2.5% per year." },
    //     { conversationId: 3, firstQuestion: "I forgot my online banking password, what do I do?", firstAnswer: "You can reset your password using the 'Forgot Password' option." },
    //     { conversationId: 4, firstQuestion: "Can I get a credit card with no annual fee?", firstAnswer: "Yes, we offer several cards with no annual fee." }
    // ];
    //
    // mockConversations.forEach(conversation => {
    //     const card = document.createElement("div");
    //     card.className = "conversation-card";
    //     card.innerHTML = `
    //         <h3>Conversation ${conversation.conversationId}</h3>
    //         <p><strong>Q:</strong> ${conversation.firstQuestion}</p>
    //         <p><strong>A:</strong> ${conversation.firstAnswer}</p>
    //     `;
    //
    //     card.addEventListener("click", () => {
    //         sessionStorage.setItem("conversationId", conversation.conversationId);
    //         window.location.href = "MainPage.html";    //path!!
    //     });
    //
    //     historyList.appendChild(card);
    // });

    //end doar pentru testare


    fetch('history', {
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
    //trebuie sa primim un array de conversatii de genul:
    // {
    //    conversationId: "id-ul conversatiei",
    //    firstQuestion: "prima intrebare",
    //    firstAnswer: "primul raspuns"
    // }

    data.forEach(conversation => {
        const card = document.createElement("div");
        card.className = "conversation-card";
        card.innerHTML = `
            <h3>Conversation ${conversation.conversationId}</h3>
            <p><strong>Q:</strong> ${conversation.firstQuestion}</p>
            <p><strong>A:</strong> ${conversation.firstAnswer}</p>
        `;

        card.addEventListener("click", () => {
            //salvam in sessionStorage id-ul conversatiei pe care vrem sa o reluam
            sessionStorage.setItem("conversationId", conversation.conversationId);
                window.location.href = "MainPage.html";       //path!!!
            });

            historyList.appendChild(card);
        });
    })
    .catch(error => {
        console.error("Error loading history:", error);
        historyList.innerHTML = "<p>Failed to load chat history.</p>";
    });




    newConversationBtn.addEventListener("click", () => {
        let currentId = parseInt(sessionStorage.getItem("conversationId") || "1");
        sessionStorage.setItem("conversationId", (currentId + 1).toString());
        window.location.href = "MainPage.html";                 //path!!
    });

    historyBtn.addEventListener("click", () => {
        window.location.href = "historyPage.html";            //path!!
    });

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("conversationId");
        //window.location.href = "./../templates/client.html";
        window.location.href = "client.html";                   //path!!!!!
    });
});