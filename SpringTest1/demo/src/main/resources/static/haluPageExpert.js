document.addEventListener("DOMContentLoaded", () => {
    const haluList = document.getElementById("haluList");
    const username = sessionStorage.getItem("username");
    const logoutBtn = document.getElementById("logout");
    const expertBtn = document.getElementById("hexpert");
    const userIdDisplay = document.getElementById("userIdDisplay");

    if (userIdDisplay && username) {
        const numericId = username.replace(/\D/g, '');
        userIdDisplay.textContent = `Expert ID: #${numericId}`;
    }

    if (!username) {
        window.location.href = "/login";
        return;
    }

    logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("username");
        window.location.href = "/login";
    });

    expertBtn.addEventListener("click", () => {
        window.location.href = "mainPageExpert.html";
    });

    //test local in loc de fetch(functioneaza, am testat-o iar cu static)
    // const mockedData = [
    //     {
    //         id: 101,
    //         user: "Ion Popescu",
    //         question: "Care e capitala Angliei?",
    //         answer: "Rusia",
    //         updated_response: "Londra"
    //     },
    //     {
    //         id: 102,
    //         user: "Maria Ionescu",
    //         question: "Cât e 2+2?",
    //         answer: "5",
    //         updated_response: "4"
    //     }
    // ];
    //
    // setTimeout(() => {
    //     mockedData.forEach(halu => {
    //         const card = document.createElement("div");
    //         card.className = "halu-card";
    //         card.innerHTML = `
    //                     <h3>Q&A ${halu.id}</h3>
    //                     <p><strong>User:</strong> ${halu.user}</p>
    //                     <p><strong>Question:</strong> ${halu.question}</p>
    //                     <p><strong>Original Answer:</strong> ${halu.answer}</p>
    //                     <p><strong>Modified by Expert:</strong> ${halu.updated_response}</p>
    //                 `;
    //         haluList.appendChild(card);
    fetch("/chatHistory", { // alt path/controller aici
        method: "POST",
        headers: {
            "Accept" : "application/json",
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(username)
    })
    .then(res => res.json())
    .then(data => {
        data.forEach(halu => {
            //daca formatarea nu e in regula, lmk
            const card = document.createElement("div");
            card.className = "halu-card";
            card.innerHTML = `
            <h3>Q&A ${halu.id}</h3>
            <p><strong>User:</strong> ${halu.user}</p>
            <p><strong>Question:</strong> ${halu.question}</p>
            <p><strong>Original Answer:</strong> ${halu.answer}</p>
            <p><strong>Modified by Expert:</strong> ${halu.updated_response}</p>
        `;
            haluList.appendChild(card);
        });
    })
    .catch(err => {
        console.error("Error loading hallucination data:", err);
        haluList.innerHTML = "<p>Failed to load hallucination report.</p>";
    });
});
