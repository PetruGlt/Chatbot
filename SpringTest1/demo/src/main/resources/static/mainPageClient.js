document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("sendBtn");
    const questionInput = document.getElementById("questionInput");
    const chatBox = document.getElementById("chatBox");
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

    logoutBtn.addEventListener("click", ()=>{
        window.location.href = "./../templates/client.html"; //aici trebuie schimbat pathul!!
    })

    newConversationBtn.addEventListener("click", ()=>{
        window.location.href ="./MainPage.html";  //aici trebuie schimbat pathul!!
    })

    historyBtn.addEventListener("click", ()=>{
        window.location.href ="./historyPage.html";  //aici trebuie schimbat pathul!!
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

        //Simulate async answer
        getAnswer(questionText, answerEl);
    }

    function getAnswer(question, answerEl) {
        //aici ar trebui sa fie trimis un json  cu intrebarea si sa primesca un raspuns tot printr un json


        // fetch('/ask', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ question: question })
        // })
        //     .then(response => {
        //         if (!response.ok) throw new Error("Network response was not ok");
        //         return response.json(); // Expecting a JSON response
        //     })
        //     .then(data => {
        //         // Assuming response from server looks like: { answer: "..." }
        //         answerEl.textContent = `A: ${data.answer}`;
        //     })
        //     .catch(error => {
        //         console.error("Error fetching answer:", error);
        //         answerEl.textContent = "A: Sorry, there was an error getting the response.";
        //     });


        //Simulate backend delay -> asta e doar pentru test local, ar trebui stearsa
        setTimeout(() => {
            //For now, just a mock response
            const mockResponse = question;
            answerEl.textContent = `A: ${mockResponse}`;
        }, 1000);
    }
});
